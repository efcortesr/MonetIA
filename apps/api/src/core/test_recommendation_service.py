import pytest

from core.models import Expense, ProjectRole, Recommendation
from modules.recommendations.services import GeminiRecommendationService


@pytest.mark.django_db
def test_generate_recommendations_uses_fallback_without_gemini_key(monkeypatch, owner, project, category):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    Expense.objects.create(
        project=project,
        category=category,
        user=owner,
        amount="920.00",
        description="Infraestructura cloud",
        date="2026-06-15",
        receipt_url="",
        status="registrado",
    )
    ProjectRole.objects.create(project=project, name="DevOps", salary="150.00")

    service = GeminiRecommendationService()
    result = service.generate_recommendations(project)

    assert "results" in result
    assert len(result["results"]) >= 1
    assert Recommendation.objects.filter(
        project=project).count() == len(result["results"])
