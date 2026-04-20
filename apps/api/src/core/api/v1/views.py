from decimal import Decimal
from datetime import date

from django.db.models import Sum
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from core.models import Alert, Category, Expense, Project, ProjectRole
from modules.recommendations.services import GeminiRecommendationService
from .serializers import AlertSerializer, CategorySerializer, ExpenseSerializer, ProjectRoleSerializer, ProjectSerializer

BUDGET_ALERT_THRESHOLD = Decimal("0.80")
SEVERITY_CRITICAL = "Crítica"
SEVERITY_WARNING = "Moderada"
SEVERITY_LOW = "Leve"


def sync_budget_alert(project):
    budget = project.budget or Decimal("0.00")
    if budget <= 0:
        return

    spent = project.total_spent
    threshold_amount = budget * BUDGET_ALERT_THRESHOLD
    consumed_pct = (spent / budget) * 100

    if spent >= threshold_amount:
        severity = SEVERITY_CRITICAL if spent >= budget else SEVERITY_WARNING
        message = (
            f"Gasto {consumed_pct:.1f}% del presupuesto. "
            "Revisa gastos antes de exceder el límite."
        )
        Alert.objects.update_or_create(
            project=project,
            type="budget_threshold",
            defaults={
                "message": message,
                "severity": severity,
            },
        )
    else:
        Alert.objects.filter(project=project, type="budget_threshold").delete()


def add_months(source_date, months):
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, 28)
    return date(year, month, day)


def month_label(d):
    return d.strftime("%b")


def get_risk_severity(consumed_pct, predicted_total, budget):
    if budget <= 0:
        return SEVERITY_LOW
    if consumed_pct >= 90 or predicted_total > budget:
        return SEVERITY_CRITICAL
    if consumed_pct >= 80:
        return SEVERITY_WARNING
    return SEVERITY_LOW


def generate_projection(project, horizon=10):
    today = timezone.now().date()
    start_month = add_months(date(today.year, today.month, 1), -5)
    labels = [month_label(add_months(start_month, i)) for i in range(horizon)]
    month_dates = [add_months(start_month, i) for i in range(horizon)]

    expenses_queryset = project.expenses.filter(date__lte=today)
    expenses = (
        expenses_queryset.values("date__year", "date__month")
        .annotate(total=Sum("amount"))
        .order_by("date__year", "date__month")
    )
    monthly = {
        (item["date__year"], item["date__month"]): Decimal(str(item["total"]))
        for item in expenses
    }

    initial_cumulative = Decimal(
        str(expenses_queryset.filter(date__lt=start_month).aggregate(
            total=Sum("amount"))["total"] or 0)
    )
    roles_cost = project.total_roles_cost

    actual = []
    cumulative = initial_cumulative
    today_index = 0
    for idx, month_start in enumerate(month_dates):
        if (month_start.year, month_start.month) == (today.year, today.month):
            today_index = idx
        cumulative += monthly.get((month_start.year,
                                  month_start.month), Decimal("0.00"))
        actual.append(float(cumulative + roles_cost))

    # Align today's point with total_spent for accuracy
    if 0 <= today_index < len(actual):
        actual[today_index] = float(project.total_spent)

    budget = project.budget or Decimal("0.00")
    elapsed_days = max(
        1, (today - project.start_date).days) if project.start_date else 1
    total_days = max(1, (project.end_date - project.start_date)
                     .days) if project.start_date and project.end_date else 1
    daily_burn = (project.total_spent / Decimal(elapsed_days)
                  ) if elapsed_days > 0 else Decimal("0.00")
    predicted_total = min(project.total_spent + daily_burn * Decimal(
        total_days - elapsed_days), project.total_spent * Decimal("2.5"))

    def linearly_project(final_value):
        if today_index >= horizon - 1:
            return actual
        start_val = actual[today_index]
        steps = horizon - today_index - 1
        return [
            actual[i] if i <= today_index else float(
                start_val + (final_value - start_val) * (i - today_index) / steps)
            for i in range(horizon)
        ]

    optimistic = linearly_project(float(predicted_total * Decimal("0.9")))
    expected = linearly_project(float(predicted_total))
    pessimistic = linearly_project(float(predicted_total * Decimal("1.1")))

    return {
        "labels": labels,
        "today_index": today_index,
        "actual": actual,
        "optimistic": optimistic,
        "expected": expected,
        "pessimistic": pessimistic,
        "predicted_total": float(predicted_total),
        "budget": float(budget),
    }


class ProjectsViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related("owner").all().order_by("id")
    serializer_class = ProjectSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated:
            return queryset.filter(owner=self.request.user)
        return queryset

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(owner=self.request.user)
            return

        user_model = get_user_model()
        demo_user, _ = user_model.objects.get_or_create(
            username="demo",
            defaults={"email": "demo@example.com"},
        )
        serializer.save(owner=demo_user)

    @action(detail=True, methods=["get"])
    def recommendations(self, request, pk=None):
        project = self.get_object()
        service = GeminiRecommendationService()
        recommendations_data = service.get_existing_recommendations(project)
        return Response(recommendations_data)

    @action(detail=True, methods=["post"], url_path="generate-recommendations")
    def generate_recommendations(self, request, pk=None):
        project = self.get_object()
        service = GeminiRecommendationService()
        recommendations_data = service.generate_recommendations(project)
        return Response(recommendations_data)

    @action(detail=True, methods=["get"], url_path="budget-analysis")
    def budget_analysis(self, request, pk=None):
        project = self.get_object()
        budget = project.budget
        spent = project.total_spent
        remaining = max(0, budget - spent)
        over_budget = max(0, spent - budget)

        consumed_pct = (spent / budget * 100) if budget > 0 else 0
        if consumed_pct < 70:
            deviation = SEVERITY_LOW
        elif consumed_pct <= 90:
            deviation = SEVERITY_WARNING
        else:
            deviation = SEVERITY_CRITICAL
        return Response({
            "budget": budget,
            "spent": spent,
            "remaining": remaining,
            "over_budget": over_budget,
            "deviation_level": deviation,
            "consumed_pct": float(consumed_pct),
            "execution_percentage": float(consumed_pct),
            "budget_deviation": spent - budget
        })

    @action(detail=True, methods=["get"], url_path="alerts")
    def alerts(self, request, pk=None):
        project = self.get_object()
        alerts = project.alerts.all().order_by("-created_at")
        return Response(AlertSerializer(alerts, many=True).data)

    @action(detail=True, methods=["get"], url_path="financial-dashboard")
    def financial_dashboard(self, request, pk=None):
        from django.db.models import Sum
        project = self.get_object()
        # Global Summary (Total Project)
        total_spent = project.total_spent
        total_budget = project.budget
        total_remaining = max(0, total_budget - total_spent)
        total_over_budget = max(0, total_spent - total_budget)
        total_consumed_pct = (total_spent / total_budget *
                              100) if total_budget > 0 else 0
        total_deviation = total_spent - total_budget

        def get_deviation_level(pct):
            if pct < 70:
                return SEVERITY_LOW
            if pct <= 90:
                return SEVERITY_WARNING
            return SEVERITY_CRITICAL

        # Filtering
        expenses = project.expenses.all().select_related("category").order_by("-date")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        category_id = request.query_params.get("category")
        if start_date:
            expenses = expenses.filter(date__gte=start_date)
        if end_date:
            expenses = expenses.filter(date__lte=end_date)
        if category_id:
            expenses = expenses.filter(category_id=category_id)

        # Filtered Stats
        filtered_spent = expenses.aggregate(total=Sum("amount"))["total"] or 0

        # Chart Data
        by_category = (
            expenses.values("category__id", "category__name",
                            "category__color")
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )
        by_date = (
            expenses.values("date")
            .annotate(total=Sum("amount"))
            .order_by("date")
        )
        return Response({
            "summary": {
                "budget": total_budget,
                "total_spent": total_spent,
                "total_remaining": total_remaining,
                "total_over_budget": total_over_budget,
                "total_execution_percentage": float(total_consumed_pct),
                "total_budget_deviation": total_deviation,
                "total_deviation_level": get_deviation_level(total_consumed_pct),
                "filtered_spent": filtered_spent,
            },
            "charts": {
                "by_category": [
                    {
                        "id": item["category__id"],
                        "name": item["category__name"],
                        "color": item["category__color"],
                        "value": float(item["total"])
                    }
                    for item in by_category
                ],
                "by_date": [
                    {
                        "date": str(item["date"]),
                        "value": float(item["total"])
                    }
                    for item in by_date
                ]
            },
            "expenses": ExpenseSerializer(expenses, many=True).data
        })


class ProjectRolesViewSet(viewsets.ModelViewSet):
    queryset = ProjectRole.objects.select_related(
        "project").all().order_by("id")
    serializer_class = ProjectRoleSerializer


class ExpensesViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related(
        "project", "category", "user").all().order_by("id")
    serializer_class = ExpenseSerializer

    def _save_and_sync(self, serializer):
        expense = serializer.save()
        sync_budget_alert(expense.project)
        return expense

    def perform_create(self, serializer):
        self._save_and_sync(serializer)

    def perform_update(self, serializer):
        self._save_and_sync(serializer)

    def perform_destroy(self, instance):
        project = instance.project
        instance.delete()
        sync_budget_alert(project)


class CategoriesViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("id")
    serializer_class = CategorySerializer


class AlertsViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.select_related(
        "project").all().order_by("-created_at")
    serializer_class = AlertSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if self.request.user.is_authenticated:
            return queryset.filter(project__owner=self.request.user)
        return queryset


class RecommendationsViewSet(viewsets.ViewSet):
    def list(self, request):
        projects_queryset = Project.objects.select_related("owner").prefetch_related(
            "expenses__category", "roles"
        )
        if request.user.is_authenticated:
            projects = projects_queryset.filter(owner=request.user)
        else:
            projects = projects_queryset.all()

        if not projects.exists():
            return Response({"results": []})

        service = GeminiRecommendationService()
        all_results = []
        for project in projects:
            data = service.get_existing_recommendations(project)
            if "results" in data:
                all_results.extend(data["results"])

        # Sort primarily by priority (Alta > Media > Baja) just for better UX
        priority_order = {"Alta": 1, "Media": 2, "Baja": 3}
        all_results.sort(key=lambda x: priority_order.get(
            x.get("priority", "Media"), 4))

        return Response({"results": all_results})


class PredictionsViewSet(viewsets.ViewSet):
    def list(self, request):
        projects_queryset = Project.objects.select_related("owner").prefetch_related(
            "expenses", "roles"
        )
        project_id = request.query_params.get("project_id")
        if project_id:
            projects_queryset = projects_queryset.filter(id=project_id)
        if request.user.is_authenticated:
            projects = projects_queryset.filter(owner=request.user)
        else:
            projects = projects_queryset.all()

        if not projects.exists():
            return Response({
                "summary": None,
                "projection": None,
                "risk_factors": [],
            })

        insights = []
        for project in projects:
            projection = generate_projection(project)
            budget = projection["budget"]
            predicted_total = projection["predicted_total"]
            consumed_pct = (project.total_spent / project.budget *
                            100) if project.budget else Decimal("0.00")
            severity = get_risk_severity(consumed_pct, Decimal(
                str(predicted_total)), project.budget)

            ratio = Decimal(str(predicted_total)) / \
                project.budget if project.budget else Decimal("0.00")
            probability = float(min(Decimal("99.0"), Decimal(
                "20.0") + max(Decimal("0.0"), (ratio - 1) * 80)))

            insights.append({
                "project_id": project.id,
                "project_name": project.name,
                "severity": severity,
                "predicted_total": predicted_total,
                "budget": budget,
                "confidence": probability,
                "projection": projection,
                "consumed_pct": float(consumed_pct),
            })

        insights.sort(key=lambda item: (
            item["severity"] != SEVERITY_CRITICAL, -item["confidence"]))
        top = insights[0]

        risk_factors = []
        roles_cost = float(projects.aggregate(
            total=Sum("roles__salary"))["total"] or 0)
        expenses_cost = float(projects.aggregate(
            total=Sum("expenses__amount"))["total"] or 0)
        total_cost = roles_cost + expenses_cost
        labor_ratio = (roles_cost / total_cost) if total_cost else 0

        if labor_ratio > 0.5:
            risk_factors.append({
                "id": "labor",
                "title": "Labor",
                "tone": "danger",
                "message": "La mayor parte del gasto se concentra en personal. Revisa cargas y tarifas.",
                "action": "Redistribuir carga",
            })
        else:
            risk_factors.append({
                "id": "labor",
                "title": "Labor",
                "tone": "info",
                "message": "El gasto de personal esta dentro de lo esperado para el periodo.",
                "action": "Monitorear",
            })

        risk_factors.append({
            "id": "providers",
            "title": "Proveedores",
            "tone": "warning" if expenses_cost > roles_cost else "info",
            "message": "Gastos de proveedores con variaciones recientes. Valida incrementos de tarifa.",
            "action": "Renegociar contrato",
        })

        risk_factors.append({
            "id": "timeline",
            "title": "Timeline",
            "tone": "info",
            "message": "Seguimiento de hitos dentro del margen esperado.",
            "action": "Monitorear",
        })

        return Response({
            "summary": {
                "project_id": top["project_id"],
                "project_name": top["project_name"],
                "severity": top["severity"],
                "predicted_total": top["predicted_total"],
                "budget": top["budget"],
                "confidence": top["confidence"],
                "consumed_pct": top["consumed_pct"],
                "generated_at": timezone.now().isoformat(),
            },
            "projection": top["projection"],
            "risk_factors": risk_factors,
        })
