from rest_framework.routers import DefaultRouter

from .views import AlertsViewSet, ProjectsViewSet, RecommendationsViewSet

router = DefaultRouter()
router.register(r"projects", ProjectsViewSet, basename="projects")
router.register(r"alerts", AlertsViewSet, basename="alerts")
router.register(r"recommendations", RecommendationsViewSet, basename="recommendations")

urlpatterns = router.urls
