from rest_framework import serializers

from core.models import Category, Expense, Project, ProjectRole


class ProjectRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectRole
        fields = ("id", "project", "name", "salary")


class ProjectSerializer(serializers.ModelSerializer):
    total_expenses = serializers.DecimalField(
        max_digits=14, decimal_places=2, read_only=True)
    total_roles_cost = serializers.DecimalField(
        max_digits=14, decimal_places=2, read_only=True)
    total_spent = serializers.DecimalField(
        max_digits=14, decimal_places=2, read_only=True)
    remaining_budget = serializers.DecimalField(
        max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Project
        read_only_fields = ("owner",)
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

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(
            self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(
            self.instance, "end_date", None))
        budget = attrs.get("budget", getattr(self.instance, "budget", None))

        if budget is not None and budget <= 0:
            raise serializers.ValidationError(
                {"budget": "El presupuesto debe ser mayor que 0."})

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {"end_date": "La fecha de fin no puede ser anterior a la fecha de inicio."}
            )

        return attrs


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
