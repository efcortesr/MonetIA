from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from core.models import Category, Project


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def owner(db):
    user_model = get_user_model()
    return user_model.objects.create_user(
        username="owner",
        password="secret-123",
        email="owner@example.com",
    )


@pytest.fixture
def authenticated_client(api_client, owner):
    api_client.force_authenticate(user=owner)
    return api_client


@pytest.fixture
def category(db):
    return Category.objects.create(name="Infraestructura", color="#111111")


@pytest.fixture
def project(owner):
    return Project.objects.create(
        owner=owner,
        name="Proyecto Demo",
        description="Proyecto para pruebas",
        budget=Decimal("1000.00"),
        start_date="2026-01-01",
        end_date="2026-12-31",
        status="activo",
    )
