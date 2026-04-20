from rest_framework.routers import DefaultRouter

from .views import (
    AlertsViewSet,
    CategoriesViewSet,
    ExpensesViewSet,
    ProjectRolesViewSet,
    ProjectsViewSet,
    PredictionsViewSet,
    RecommendationsViewSet,
)

router = DefaultRouter()
router.register(r"projects", ProjectsViewSet, basename="projects")
router.register(r"project-roles", ProjectRolesViewSet,
                basename="project-roles")
router.register(r"expenses", ExpensesViewSet, basename="expenses")
router.register(r"categories", CategoriesViewSet, basename="categories")
router.register(r"alerts", AlertsViewSet, basename="alerts")
router.register(r"predictions", PredictionsViewSet, basename="predictions")
router.register(r"recommendations", RecommendationsViewSet,
                basename="recommendations")

urlpatterns = router.urls
