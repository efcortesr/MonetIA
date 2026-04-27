import pytest
from django.urls import reverse

from core.models import Expense


@pytest.mark.django_db
def test_register_expense_with_valid_data(authenticated_client, owner, project, category):
    payload = {
        "project": project.id,
        "category": category.id,
        "user": owner.id,
        "amount": "350.00",
        "description": "Licencia anual",
        "date": "2026-05-10",
        "receipt_url": "",
        "status": "registrado",
    }

    response = authenticated_client.post(
        reverse("expenses-list"), payload, format="json")

    assert response.status_code == 201
    assert Expense.objects.filter(project=project, amount="350.00").exists()


@pytest.mark.django_db
def test_register_expense_with_invalid_data(authenticated_client, owner, project, category):
    payload = {
        "project": project.id,
        "category": category.id,
        "user": owner.id,
        "amount": "-10.00",
        "description": "Dato invalido",
        "date": "2026-05-10",
        "receipt_url": "",
        "status": "registrado",
    }

    response = authenticated_client.post(
        reverse("expenses-list"), payload, format="json")

    assert response.status_code == 400
    assert "amount" in response.data
