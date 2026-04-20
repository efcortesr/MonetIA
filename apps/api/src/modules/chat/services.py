import os
import logging
from decimal import Decimal
from google import genai

from core.models import Project

logger = logging.getLogger(__name__)


class FinancialChatService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        self.model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

    def _build_context(self, project_id=None) -> str:
        qs = ( 
            Project.objects
            .prefetch_related("expenses__category", "roles")
            .filter(pk=project_id) if project_id
            else Project.objects.prefetch_related("expenses__category", "roles").all()
        )

        if not qs.exists():
            return "No hay proyectos registrados en el sistema."

        total_budget = Decimal("0")
        total_spent  = Decimal("0")
        lines = []

        for p in qs:
            budget    = p.budget
            spent     = p.total_spent
            remaining = p.remaining_budget
            pct       = (spent / budget * 100) if budget and budget > 0 else Decimal("0")

            total_budget += budget
            total_spent  += spent

            lines.append(
                f"- {p.name} (ID:{p.id}): "
                f"presupuesto=COP {budget:,.0f}, "
                f"gastado=COP {spent:,.0f}, "
                f"restante=COP {remaining:,.0f}, "
                f"consumo={pct:.1f}%, estado={p.status}"
            )

            # Gastos por categoría dentro del proyecto
            cat_totals: dict[str, Decimal] = {}
            for exp in p.expenses.all():
                name = exp.category.name
                cat_totals[name] = cat_totals.get(name, Decimal("0")) + exp.amount

            for cat_name, cat_total in sorted(
                cat_totals.items(), key=lambda x: x[1], reverse=True
            ):
                lines.append(f"    • {cat_name}: COP {cat_total:,.0f}")

        lines.append(f"\nRESUMEN GLOBAL:")
        lines.append(f"- Presupuesto total: COP {total_budget:,.0f}")
        lines.append(f"- Gasto total: COP {total_spent:,.0f}")
        lines.append(f"- Saldo total: COP {total_budget - total_spent:,.0f}")

        return "\n".join(lines)

    def _build_prompt(self, question: str, project_id=None) -> str:
        context = self._build_context(project_id)
        return f"""Eres un asistente financiero experto integrado en MonetIA.

DATOS ACTUALES DEL SISTEMA:
{context}

INSTRUCCIONES:
- Responde SIEMPRE en español, de forma clara y concisa.
- Usa formato COP con puntos de miles para los montos.
- Si detectas consumo mayor al 80%, menciona el riesgo.
- Máximo 4 oraciones salvo que el usuario pida más detalle.
- NO inventes datos que no estén en el contexto anterior.
- Si no hay datos, indícalo amablemente.

PREGUNTA DEL USUARIO: {question}"""

    def answer(self, question: str, project_id=None) -> str:
        
        if not question or not question.strip():
            return "Por favor, ingresa una pregunta válida."
        
        if not self.client:
            return (
                "El motor de IA no está configurado. "
                "Agrega GEMINI_API_KEY al archivo .env del backend."
            )

        try:
            prompt = self._build_prompt(question, project_id)
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config={"max_output_tokens": 200},
            )
            text = (response.text or "").strip()
            
            if not text:
                return "No se pudo generar una respuesta"

        except Exception as exc:
            logger.error("Error Gemini chat: %s", exc)
            return (
                "Ocurrió un error al procesar tu consulta. "
                "Intenta de nuevo en unos momentos."
            )