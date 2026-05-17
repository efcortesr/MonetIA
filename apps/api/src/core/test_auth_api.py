import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
def test_register_user_success(client):
    url = reverse("register")
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "securepassword123"
    }
    response = client.post(url, payload, content_type="application/json")
    assert response.status_code == 201
    assert "token" in response.data
    assert response.data["user"]["name"] == "Jane Doe"
    assert response.data["user"]["email"] == "jane@example.com"
    assert User.objects.filter(email="jane@example.com").exists()

@pytest.mark.django_db
def test_register_user_missing_fields(client):
    url = reverse("register")
    payload = {
        "email": "jane@example.com",
        "password": "securepassword123"
    }
    response = client.post(url, payload, content_type="application/json")
    assert response.status_code == 400
    assert "error" in response.data

@pytest.mark.django_db
def test_login_user_success(client):
    User.objects.create_user(
        username="john@example.com",
        email="john@example.com",
        password="securepassword123",
        first_name="John Doe"
    )
    url = reverse("login")
    payload = {
        "email": "john@example.com",
        "password": "securepassword123"
    }
    response = client.post(url, payload, content_type="application/json")
    assert response.status_code == 200
    assert "token" in response.data
    assert response.data["user"]["name"] == "John Doe"

@pytest.mark.django_db
def test_login_user_incorrect_credentials(client):
    User.objects.create_user(
        username="john@example.com",
        email="john@example.com",
        password="securepassword123",
        first_name="John Doe"
    )
    url = reverse("login")
    payload = {
        "email": "john@example.com",
        "password": "wrongpassword"
    }
    response = client.post(url, payload, content_type="application/json")
    assert response.status_code == 401
    assert response.data["error"] == "Credenciales incorrectas"

@pytest.mark.django_db
def test_google_auth_new_user(client):
    url = reverse("google-auth")
    payload = {
        "email": "google_new@gmail.com",
        "name": "Google User"
    }
    response = client.post(url, payload, content_type="application/json")
    assert response.status_code == 201
    assert "token" in response.data
    assert response.data["user"]["name"] == "Google User"
    assert response.data["user"]["email"] == "google_new@gmail.com"
    assert User.objects.filter(email="google_new@gmail.com").exists()

@pytest.mark.django_db
def test_google_auth_existing_user(client):
    User.objects.create_user(
        username="google_old@gmail.com",
        email="google_old@gmail.com",
        password="some_random_password",
        first_name="Google Old"
    )
    url = reverse("google-auth")
    payload = {
        "email": "google_old@gmail.com",
        "name": "Google Old"
    }
    response = client.post(url, payload, content_type="application/json")
    assert response.status_code == 200
    assert "token" in response.data
    assert response.data["user"]["name"] == "Google Old"

@pytest.mark.django_db
def test_google_auth_missing_fields(client):
    url = reverse("google-auth")
    payload = {
        "email": "google_old@gmail.com"
    }
    response = client.post(url, payload, content_type="application/json")
    assert response.status_code == 400
    assert "error" in response.data
