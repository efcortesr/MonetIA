from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from core.models import Category, Expense, Project, ProjectRole
from modules.recommendations.services import GeminiRecommendationService
from .serializers import CategorySerializer, ExpenseSerializer, ProjectRoleSerializer, ProjectSerializer


class ProjectsViewSet(viewsets.ModelViewSet):
  queryset = Project.objects.select_related("owner").all().order_by("id")
  serializer_class = ProjectSerializer

  @action(detail=True, methods=["get"])
  def recommendations(self, request, pk=None):
    try:
      if request.user.is_authenticated:
        project = self.get_queryset().get(pk=pk, owner=request.user)
      else:
        project = self.get_queryset().get(pk=pk)
    except Project.DoesNotExist:
      raise NotFound("Proyecto no encontrado.")
      
    service = GeminiRecommendationService()
    recommendations_data = service.get_recommendations_for_project(project)
    return Response(recommendations_data)


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
    if request.user.is_authenticated:
      projects = Project.objects.filter(owner=request.user)
    else:
      projects = Project.objects.all()
      
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
    all_results.sort(key=lambda x: priority_order.get(x.get("priority", "Media"), 4))
    
    return Response({"results": all_results})