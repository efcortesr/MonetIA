from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from core.models import Category, Expense, Project, ProjectRole
from modules.recommendations.services import GeminiRecommendationService
from .serializers import CategorySerializer, ExpenseSerializer, ProjectRoleSerializer, ProjectSerializer


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

        User = get_user_model()
        demo_user, _ = User.objects.get_or_create(
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
            deviation = "Leve"
        elif consumed_pct <= 90:
            deviation = "Moderada"
        else:
            deviation = "Crítica"
            
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

    @action(detail=True, methods=["get"], url_path="financial-dashboard")
    def financial_dashboard(self, request, pk=None):
        from django.db.models import Sum
        project = self.get_object()
        
        # Global Summary (Total Project)
        total_spent = project.total_spent
        total_budget = project.budget
        total_remaining = max(0, total_budget - total_spent)
        total_over_budget = max(0, total_spent - total_budget)
        total_consumed_pct = (total_spent / total_budget * 100) if total_budget > 0 else 0
        total_deviation = total_spent - total_budget
        
        def get_deviation_level(pct):
            if pct < 70: return "Leve"
            if pct <= 90: return "Moderada"
            return "Crítica"

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
            expenses.values("category__id", "category__name", "category__color")
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


class CategoriesViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("id")
    serializer_class = CategorySerializer


class AlertsViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response({"results": []})


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
        all_results.sort(key=lambda x: priority_order.get(x.get("priority", "Media"), 4))
        
        return Response({"results": all_results})
