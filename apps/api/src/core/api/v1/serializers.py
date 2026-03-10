from rest_framework import serializers

from core.models import Category, Expense, Project, ProjectRole


class ProjectRoleSerializer(serializers.ModelSerializer):
  class Meta:
    model = ProjectRole
    fields = ("id", "project", "name", "salary")


class ProjectSerializer(serializers.ModelSerializer):
  total_expenses = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
  total_roles_cost = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
  total_spent = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
  remaining_budget = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

  class Meta:
    model = Project
    fields = (
      "id",
      "owner",
      "name",
      "description",
      "budget",
      "start_date",
      "end_date",
      "status",
      "total_expenses",
      "total_roles_cost",
      "total_spent",
      "remaining_budget",
    )


class CategorySerializer(serializers.ModelSerializer):
  class Meta:
    model = Category
    fields = ("id", "name", "color", "icon")


class ExpenseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Expense
    fields = (
      "id",
      "project",
      "category",
      "user",
      "amount",
      "description",
      "date",
      "receipt_url",
      "status",
    )