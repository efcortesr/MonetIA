import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .services import FinancialChatService


@csrf_exempt
@require_http_methods(["GET", "POST"])
def chat_view(request):
    if request.method == "GET":
        return JsonResponse({"detail": "CSRF cookie set."})

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)

    question = (body.get("question") or "").strip()
    project_id = body.get("project_id")  # opcional

    if not question:
        return JsonResponse(
            {"error": "El campo question es requerido"}, status=400
        )

    if len(question) > 200:
        return JsonResponse(
            {"error": "Pregunta demasiado larga (máx. 200 caracteres)"}, status=400
        )

    service = FinancialChatService()
    answer = service.answer(question, project_id=project_id)

    return JsonResponse({"answer": answer})
