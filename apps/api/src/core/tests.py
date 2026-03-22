from decimal import Decimal
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import Category, Project


class ProjectManagementTests(APITestCase):
  def setUp(self):
    self.user = get_user_model().objects.create_user(username="owner", password="123")
    self.category = Category.objects.create(name="Infra", color="#000")

  def test_create_and_update_project_budget(self):
    payload = {
      "owner": self.user.id,
      "name": "Proyecto ERP",
      "description": "Implementación",
      "budget": "100000.00",
      "start_date": "2026-01-01",
      "end_date": "2026-12-31",
      "status": "activo",
    }
    response = self.client.post(reverse("projects-list"), payload, format="json")
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    self.assertEqual(response.data["budget"], "100000.00")

    project_id = response.data["id"]
    update = self.client.patch(reverse("projects-detail", args=[project_id]), {"budget": "120000.00"}, format="json")
    self.assertEqual(update.status_code, status.HTTP_200_OK)
    self.assertEqual(update.data["budget"], "120000.00")

  def test_roles_crud_and_budget_calculation(self):
    project = Project.objects.create(
      owner=self.user,
      name="Proyecto App",
      description="",
      budget=Decimal("10000.00"),
      start_date="2026-01-01",
      end_date="2026-06-01",
      status="activo",
    )

    role_response = self.client.post(
      reverse("project-roles-list"),
      {"project": project.id, "name": "QA", "salary": "2500.00"},
      format="json",
    )
    self.assertEqual(role_response.status_code, status.HTTP_201_CREATED)

    role_id = role_response.data["id"]
    role_update = self.client.patch(reverse("project-roles-detail", args=[role_id]), {"salary": "3000.00"}, format="json")
    self.assertEqual(role_update.status_code, status.HTTP_200_OK)

    expense_response = self.client.post(
      reverse("expenses-list"),
      {
        "project": project.id,
        "category": self.category.id,
        "user": self.user.id,
        "amount": "500.00",
        "description": "Licencia",
        "date": "2026-02-01",
        "receipt_url": "",
        "status": "registrado",
      },
      format="json",
    )
    self.assertEqual(expense_response.status_code, status.HTTP_201_CREATED)

    project_data = self.client.get(reverse("projects-detail", args=[project.id]), format="json")
    self.assertEqual(project_data.status_code, status.HTTP_200_OK)
    self.assertEqual(project_data.data["total_roles_cost"], "3000.00")
    self.assertEqual(project_data.data["total_expenses"], "500.00")
    self.assertEqual(project_data.data["total_spent"], "3500.00")
    self.assertEqual(project_data.data["remaining_budget"], "6500.00")

    role_delete = self.client.delete(reverse("project-roles-detail", args=[role_id]))
    self.assertEqual(role_delete.status_code, status.HTTP_204_NO_CONTENT)

  def test_recommendations_are_generated_from_spending_patterns(self):
    today = timezone.now().date()
    recent_date = (today - timedelta(days=5)).isoformat()
    previous_date = (today - timedelta(days=35)).isoformat()

    project = Project.objects.create(
      owner=self.user,
      name="Proyecto Analitica",
      description="",
      budget=Decimal("10000.00"),
      start_date="2026-01-01",
      end_date="2026-12-31",
      status="activo",
    )
    marketing = Category.objects.create(name="Marketing", color="#111")

    self.client.post(
      reverse("project-roles-list"),
      {"project": project.id, "name": "Dev", "salary": "7800.00"},
      format="json",
    )

    self.client.post(
      reverse("expenses-list"),
      {
        "project": project.id,
        "category": marketing.id,
        "user": self.user.id,
        "amount": "1200.00",
        "description": "Campana reciente",
        "date": recent_date,
        "receipt_url": "",
        "status": "registrado",
      },
      format="json",
    )
    self.client.post(
      reverse("expenses-list"),
      {
        "project": project.id,
        "category": marketing.id,
        "user": self.user.id,
        "amount": "600.00",
        "description": "Campana anterior",
        "date": previous_date,
        "receipt_url": "",
        "status": "registrado",
      },
      format="json",
    )

    response = self.client.get(reverse("recommendations-list"), format="json")
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertGreaterEqual(len(response.data["results"]), 2)

    patterns = [item["pattern"] for item in response.data["results"]]
    self.assertIn("Alto consumo de presupuesto", patterns)
    self.assertIn("Alta concentración en categoría", patterns)
    self.assertIn("Gasto concentrado en pocos ítems", patterns)

    filtered = self.client.get(
      f"{reverse('recommendations-list')}?project={project.id}",
      format="json",
    )
    self.assertEqual(filtered.status_code, status.HTTP_200_OK)
    self.assertEqual(len(filtered.data["results"]), len(response.data["results"]))
    self.assertTrue(all(item["project_id"] == project.id for item in filtered.data["results"]))