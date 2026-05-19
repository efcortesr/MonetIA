from datetime import date

from rest_framework import serializers

from core.models import Alert, Category, Expense, Project, ProjectRole, Recommendation


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = ("id", "project", "title", "body", "priority", "status", "created_at")


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
    approved_recommendations = serializers.SerializerMethodField()

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
            "approved_recommendations",
        )

    def get_approved_recommendations(self, obj):
        recs = obj.recommendations_list.filter(status="approved")
        return RecommendationSerializer(recs, many=True).data

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(
            self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(
            self.instance, "end_date", None))
        budget = attrs.get("budget", getattr(self.instance, "budget", None))

        if budget is not None and budget <= 0:
            raise serializers.ValidationError(
                {"budget": "El presupuesto debe ser mayor que 0."})

        # Solo valida en creación (instance es None), no en edición
        if self.instance is None and start_date and start_date < date.today():
            raise serializers.ValidationError(
                {"start_date": "La fecha de inicio no puede ser anterior al día actual."}
            )

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

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "El monto del gasto debe ser mayor que 0."
            )
        return value

    def validate(self, attrs):
        project = attrs.get("project", getattr(self.instance, "project", None))
        expense_date = attrs.get("date", getattr(self.instance, "date", None))

        if project and expense_date:
            if project.start_date and expense_date < project.start_date:
                raise serializers.ValidationError(
                    {"date": (
                        f"La fecha del gasto ({expense_date}) no puede ser anterior "
                        f"a la fecha de inicio del proyecto ({project.start_date})."
                    )}
                )
            if project.end_date and expense_date > project.end_date:
                raise serializers.ValidationError(
                    {"date": (
                        f"La fecha del gasto ({expense_date}) no puede ser posterior "
                        f"a la fecha de fin del proyecto ({project.end_date})."
                    )}
                )
        return attrs


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = (
            "id",
            "project",
            "type",
            "message",
            "severity",
            "is_read",
            "created_at",
        )
