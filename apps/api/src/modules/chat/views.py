import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .services import FinancialChatService

@api_view(["GET", "POST"])
def chat_view(request):
    if request.method == "GET":
        return Response({"detail": "CSRF cookie set."})

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
