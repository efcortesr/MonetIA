from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.http import require_POST, require_safe

from .services import FinancialChatService

@api_view(["GET"])
@permission_classes([AllowAny])
@require_safe
def chat_csrf_view(request):
    """
    GET endpoint to set/ensure the CSRF cookie on the client side.
    """
    return Response({"detail": "CSRF cookie set."})

@api_view(["POST"])
@permission_classes([AllowAny])
@require_POST
def chat_query_view(request):
    """
    POST endpoint to interact with the financial chat assistant.
    The user may or may not be authenticated; context is filtered accordingly.
    """
    question = (request.data.get("question") or "").strip()
    project_id = request.data.get("project_id")  # opcional

    if not question:
        return Response(
            {"error": "El campo question es requerido"}, status=status.HTTP_400_BAD_REQUEST
        )

    if len(question) > 200:
        return Response(
            {"error": "Pregunta demasiado larga (máx. 200 caracteres)"}, status=status.HTTP_400_BAD_REQUEST
        )

    service = FinancialChatService()
    answer = service.answer(question, project_id=project_id, user=request.user)

    return Response({"answer": answer})
