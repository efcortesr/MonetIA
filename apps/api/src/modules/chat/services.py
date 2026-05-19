import os
import logging
from decimal import Decimal
from google import genai

from django.db.models import Prefetch

from core.models import Expense, Project

logger = logging.getLogger(__name__)


class FinancialChatService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        self.model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
        self.use_mock = os.environ.get(
            "GEMINI_MOCK_MODE", "false").lower() == "true"
        self.client = genai.Client(
            api_key=self.api_key) if self.api_key and not self.use_mock else None

    def _build_user_profile(self, user) -> str:
        """Builds a user profile string for the chat context."""
        if not user or not user.is_authenticated:
            return "Usuario: No autenticado"
        name = user.get_full_name() or user.first_name or user.username
        role = "Sin rol definido"
        try:
            role = user.profile.role
        except Exception:
            pass
        lines = [
            "PERFIL DEL USUARIO:",
            f"- Nombre: {name}",
            f"- Correo: {user.email}",
            f"- Rol en la plataforma: {role}",
        ]
        return "\n".join(lines)

    def _build_context(self, project_id=None, user=None) -> str:
        expenses_prefetch = Prefetch(
            "expenses",
            queryset=Expense.objects.select_related("category"),
            to_attr="prefetched_expenses",
        )
        base_qs = Project.objects.prefetch_related(expenses_prefetch, "roles")
        if user and user.is_authenticated:
            base_qs = base_qs.filter(owner=user)

        qs = base_qs.filter(pk=project_id) if project_id else base_qs.all()

        user_profile = self._build_user_profile(user)

        if not qs.exists():
            return f"{user_profile}\n\nNo hay proyectos registrados en el sistema."

        total_budget = Decimal("0")
        total_spent = Decimal("0")
        lines = [user_profile, ""]

        for p in qs:
            budget = p.budget
            spent = p.total_spent
            remaining = p.remaining_budget
            pct = (spent / budget * 100) if budget and budget > 0 else Decimal("0")

            total_budget += budget
            total_spent += spent

            lines.append(
                f"- {p.name} (ID:{p.id}): "
                f"presupuesto=COP {budget:,.0f}, "
                f"gastado=COP {spent:,.0f}, "
                f"restante=COP {remaining:,.0f}, "
                f"consumo={pct:.1f}%, estado={p.status}, "
                f"periodo={p.start_date} \u2192 {p.end_date}"
            )

            # Gastos por categoría dentro del proyecto
            cat_totals: dict[str, Decimal] = {}
            expenses = getattr(p, "prefetched_expenses", [])
            for exp in expenses:
                name = exp.category.name
                cat_totals[name] = cat_totals.get(
                    name, Decimal("0")) + exp.amount

            for cat_name, cat_total in sorted(
                cat_totals.items(), key=lambda x: x[1], reverse=True
            ):
                lines.append(f"    \u2022 {cat_name}: COP {cat_total:,.0f}")

        lines.append("")
        lines.append("RESUMEN GLOBAL:")
        lines.append(f"- Presupuesto total: COP {total_budget:,.0f}")
        lines.append(f"- Gasto total: COP {total_spent:,.0f}")
        lines.append(f"- Saldo total: COP {total_budget - total_spent:,.0f}")

        return "\n".join(lines)

    def _build_prompt(self, question: str, project_id=None, user=None) -> str:
        context = self._build_context(project_id, user)
        user_name = ""
        if user and user.is_authenticated:
            user_name = user.get_full_name() or user.first_name or user.username
        greeting = f"Est\u00e1s ayudando a {user_name}." if user_name else ""
        return f"""Eres un asistente financiero experto integrado en MonetIA. {greeting}

DATOS ACTUALES DEL SISTEMA:
{context}

INSTRUCCIONES:
- Responde SIEMPRE en espa\u00f1ol, de forma clara y concisa.
- Dirige tu respuesta al usuario por su nombre cuando sea natural hacerlo.
- Usa formato COP con puntos de miles para los montos.
- Si detectas consumo mayor al 80%, menciona el riesgo.
- M\u00e1ximo 4 oraciones salvo que el usuario pida m\u00e1s detalle.
- NO inventes datos que no est\u00e9n en el contexto anterior.
- Si no hay datos, ind\u00edcalo amablemente.

PREGUNTA DEL USUARIO: {question}"""

    def _mock_response(self, question: str) -> str:
        """Genera respuestas simuladas para modo desarrollo"""
        question_lower = question.lower()

        if "gast" in question_lower or "presupuesto" in question_lower:
            return "Seg\u00fan los datos del sistema, tienes un presupuesto total definido con gastos registrados. El consumo est\u00e1 dentro de los l\u00edmites aceptables."
        elif "riesgo" in question_lower or "alerta" in question_lower:
            return "Actualmente no hay alertas cr\u00edticas. Todos los proyectos est\u00e1n dentro de sus l\u00edmites de presupuesto."
        elif "proyecto" in question_lower:
            return "Tienes varios proyectos activos siendo ejecutados dentro de los par\u00e1metros presupuestales definidos."
        else:
            return "He procesado tu consulta. \u00bfHay algo m\u00e1s espec\u00edfico sobre tu informaci\u00f3n financiera que desees conocer?"

    def answer(self, question: str, project_id=None, user=None) -> str:

        if not question or not question.strip():
            return "Por favor, ingresa una pregunta v\u00e1lida."

        # Usar modo mock si est\u00e1 activado
        if self.use_mock:
            logger.info(f"[MOCK MODE] Respondiendo a: {question}")
            return self._mock_response(question)

        logger.info(
            f"[GEMINI MODE] API Key: {self.api_key[:20] if self.api_key else 'NONE'}")
        logger.info(f"[GEMINI MODE] Client: {self.client}")

        if not self.client:
            logger.error("Cliente Gemini no est\u00e1 configurado")
            return (
                "El motor de IA no est\u00e1 configurado. "
                "Agrega GEMINI_API_KEY al archivo .env del backend."
            )

        try:
            prompt = self._build_prompt(question, project_id, user)
            logger.info(
                f"[GEMINI] Prompt construido, enviando a {self.model}...")
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config={"max_output_tokens": 1000},
            )
            text = (response.text or "").strip()
            logger.info(f"[GEMINI] Respuesta recibida: {text[:50]}...")

            if not text:
                return "No se pudo generar una respuesta"

            return text

        except Exception:
            logger.exception("Error Gemini chat")
            return (
                "Ocurri\u00f3 un error al procesar tu consulta. "
                "Intenta de nuevo en unos momentos."
            )
