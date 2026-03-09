from django.urls import include, path

from .views import health

urlpatterns = [
  path("health/", health, name="health"),
  path("v1/", include("core.api.v1.urls")),
]
