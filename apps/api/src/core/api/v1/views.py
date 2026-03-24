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
        recommendations_data = service.get_recommendations_for_project(project)
        return Response(recommendations_data)


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
            data = service.get_recommendations_for_project(project)
            if "results" in data:
                all_results.extend(data["results"])

        # Sort primarily by priority (Alta > Media > Baja) just for better UX
        priority_order = {"Alta": 1, "Media": 2, "Baja": 3}
        all_results.sort(key=lambda x: priority_order.get(
            x.get("priority", "Media"), 4))

        return Response({"results": all_results})
