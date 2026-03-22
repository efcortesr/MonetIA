from django.utils import timezone
from rest_framework import viewsets
from rest_framework.response import Response
from core.models import Category, Expense, Project, ProjectRole
from core.recommendations import build_recommendations_for_project
from .serializers import CategorySerializer, ExpenseSerializer, ProjectRoleSerializer, ProjectSerializer


class ProjectsViewSet(viewsets.ModelViewSet):
  queryset = Project.objects.select_related("owner").all().order_by("id")
  serializer_class = ProjectSerializer


class ProjectRolesViewSet(viewsets.ModelViewSet):
  queryset = ProjectRole.objects.select_related("project").all().order_by("id")
  serializer_class = ProjectRoleSerializer


class ExpensesViewSet(viewsets.ModelViewSet):
  queryset = Expense.objects.select_related("project", "category", "user").all().order_by("id")
  serializer_class = ExpenseSerializer


class CategoriesViewSet(viewsets.ModelViewSet):
  queryset = Category.objects.all().order_by("id")
  serializer_class = CategorySerializer


class AlertsViewSet(viewsets.ViewSet):
  def list(self, request):
    return Response({"results": []})


class RecommendationsViewSet(viewsets.ViewSet):
  def list(self, request):
    today = timezone.now().date()
    categories = {category.id: category.name for category in Category.objects.all()}
    project_param = request.query_params.get("project")

    if project_param is not None:
      try:
        project_id = int(project_param)
      except (TypeError, ValueError):
        project_id = None
      if project_id is None:
        return Response({"results": []})
      projects = (
        Project.objects.prefetch_related("expenses", "roles").filter(pk=project_id)
      )
    else:
      projects = Project.objects.prefetch_related("expenses", "roles").all()

    recommendations = []
    for project in projects:
      recommendations.extend(build_recommendations_for_project(project, categories, today))

    ordered = sorted(
      recommendations,
      key=lambda item: {"Alta": 0, "Media": 1, "Baja": 2}.get(item["priority"], 3),
    )
    return Response({"results": ordered})