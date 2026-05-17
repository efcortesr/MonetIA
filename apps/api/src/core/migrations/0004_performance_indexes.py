"""
Migration 0004: Composite DB indexes for financial dashboard performance.

Targets queries with < 3 second SLA:
  - expenses filtered by project + date range  (financial dashboard)
  - expenses filtered by project + category     (pie chart aggregation)
  - alerts filtered by project + type           (sync_budget_alert lookup)
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0003_recommendation"),
    ]

    operations = [
        # Most frequent query: expenses for a project filtered by date range
        migrations.AddIndex(
            model_name="expense",
            index=models.Index(
                fields=["project", "date"],
                name="expense_project_date_idx",
            ),
        ),
        # Category aggregation: GROUP BY category WHERE project=X
        migrations.AddIndex(
            model_name="expense",
            index=models.Index(
                fields=["project", "category"],
                name="expense_project_category_idx",
            ),
        ),
        # Alert upsert: WHERE project=X AND type=Y
        migrations.AddIndex(
            model_name="alert",
            index=models.Index(
                fields=["project", "type"],
                name="alert_project_type_idx",
            ),
        ),
    ]
