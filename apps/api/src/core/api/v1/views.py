from rest_framework.response import Response
from rest_framework.viewsets import ViewSet


class ProjectsViewSet(ViewSet):
  def list(self, request):
    data = [
      {
        "id": "ecom",
        "name": "Plataforma E-Commerce v2",
        "status": "En riesgo",
        "budget": 450000,
        "spent": 312000,
      },
      {
        "id": "mobile",
        "name": "App Móvil Clientes",
        "status": "Activo",
        "budget": 230000,
        "spent": 145000,
      },
    ]
    return Response({"results": data})


class AlertsViewSet(ViewSet):
  def list(self, request):
    data = [
      {
        "id": "a1",
        "title": "Incremento de costos de infraestructura",
        "severity": "high",
        "projectId": "ecom",
      },
      {
        "id": "a2",
        "title": "Horas extra por encima de lo planificado",
        "severity": "medium",
        "projectId": "ecom",
      },
    ]
    return Response({"results": data})


class RecommendationsViewSet(ViewSet):
  def list(self, request):
    data = [
      {
        "id": "r1",
        "priority": "Alta",
        "title": "Renegociar contrato con proveedor de hosting",
        "projectId": "ecom",
      },
      {
        "id": "r2",
        "priority": "Media",
        "title": "Consolidar licencias de software",
        "projectId": "mobile",
      },
    ]
    return Response({"results": data})
