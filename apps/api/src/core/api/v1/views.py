from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from core.models import Category, Expense, Project, ProjectRole
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
    return Response({"results": []})