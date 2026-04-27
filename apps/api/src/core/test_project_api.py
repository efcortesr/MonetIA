import pytest
from django.urls import reverse

from core.models import Project, Recommendation


@pytest.mark.django_db
def test_create_project_with_valid_data(authenticated_client, owner):
    payload = {
        "name": "Proyecto Alpha",
        "description": "Implementacion de plataforma",
        "budget": "25000.00",
        "start_date": "2026-03-01",
        "end_date": "2026-10-31",
        "status": "activo",
    }

    response = authenticated_client.post(
        reverse("projects-list"), payload, format="json")

    assert response.status_code == 201
    assert response.data["name"] == payload["name"]
    assert Project.objects.filter(name=payload["name"], owner=owner).exists()


@pytest.mark.django_db
def test_create_project_with_invalid_data(authenticated_client):
    payload = {
        "name": "Proyecto Invalido",
        "description": "No debe crearse",
        "budget": "0.00",
        "start_date": "2026-11-01",
        "end_date": "2026-10-01",
        "status": "activo",
    }

    response = authenticated_client.post(
        reverse("projects-list"), payload, format="json")

    assert response.status_code == 400
    assert "budget" in response.data or "end_date" in response.data


@pytest.mark.django_db
def test_get_project_recommendations(authenticated_client, project):
    Recommendation.objects.create(
        project=project,
        title="Controlar gastos operativos",
        body="Reducir costos no esenciales durante el siguiente sprint.",
        priority="Alta",
    )

    response = authenticated_client.get(
        reverse("projects-recommendations", args=[project.id]),
        format="json",
    )

    assert response.status_code == 200
    assert "results" in response.data
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["project"] == project.name
