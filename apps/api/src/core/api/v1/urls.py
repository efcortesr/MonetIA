from django.urls import path
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
from modules.chat.views import chat_query_view, chat_csrf_view  # ← sin "MonetIA.apps.api.src."
from .auth_views import register_view, login_view, google_auth_view

router = DefaultRouter()
router.register(r"projects",        ProjectsViewSet,
                basename="projects")
router.register(r"project-roles",   ProjectRolesViewSet,
                basename="project-roles")
router.register(r"expenses",        ExpensesViewSet,
                basename="expenses")
router.register(r"categories",      CategoriesViewSet,
                basename="categories")
router.register(r"alerts",          AlertsViewSet,          basename="alerts")
router.register(r"predictions",     PredictionsViewSet,
                basename="predictions")
router.register(r"recommendations", RecommendationsViewSet,
                basename="recommendations")

urlpatterns = router.urls + [
    path("chat/", chat_query_view, name="chat"),
    path("chat/csrf/", chat_csrf_view, name="chat-csrf"),
    path("auth/register/", register_view, name="register"),
    path("auth/login/", login_view, name="login"),
    path("auth/google/", google_auth_view, name="google-auth"),
]
