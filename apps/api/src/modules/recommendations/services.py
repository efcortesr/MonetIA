import json
import os
import uuid
import logging
import google.generativeai as genai
from decimal import Decimal
from django.db.models import Sum
from core.models import Recommendation

logger = logging.getLogger(__name__)

class GeminiRecommendationService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Use gemini-1.5-flash which is fast and supports JSON mode well
            self.model = genai.GenerativeModel("gemini-1.5-flash")
        else:
            self.model = None

    def _calculate_metrics(self, project):
        budget = project.budget or Decimal("0.00")
        total_expenses = project.total_expenses
        total_roles_cost = project.total_roles_cost
        total_spent = project.total_spent
        
        consumed_pct = (total_spent / budget * 100) if budget > 0 else Decimal("0.00")
        
        # Dominant category calculation
        expenses = project.expenses.all()
        category_totals = {}
        for exp in expenses:
            cat_name = exp.category.name
            category_totals[cat_name] = category_totals.get(cat_name, Decimal("0.00")) + exp.amount
            
        dominant_category = None
        if category_totals:
            dominant_category = max(category_totals.items(), key=lambda x: x[1])
            
        return {
            "budget": budget,
            "total_expenses": total_expenses,
            "total_roles_cost": total_roles_cost,
            "total_spent": total_spent,
            "consumed_pct": consumed_pct,
            "dominant_category": dominant_category, # (name, amount)
            "expenses_count": expenses.count(),
            "roles_count": project.roles.count()
        }

    def _get_fallback_recommendations(self, project, metrics):
        """Rule-based fallback if Gemini fails or is not configured."""
        results = []
        
        # Rule 1: Budget overrun or close to overrun
        if metrics["consumed_pct"] >= 90:
            results.append({
                "title": "Alerta Crítica de Presupuesto",
                "body": f"El gasto total ({metrics['consumed_pct']:.1f}% del presupuesto) está en zona crítica. Detén gastos no esenciales y revisa el costo de roles.",
                "priority": "Alta",
            })
        elif metrics["consumed_pct"] >= 70:
            results.append({
                "title": "Precaución con el Presupuesto",
                "body": f"Has consumido el {metrics['consumed_pct']:.1f}% del presupuesto. Planifica los próximos gastos cuidadosamente.",
                "priority": "Media",
            })
            
        # Rule 2: Dominant category
        if metrics["dominant_category"]:
            cat_name, cat_amount = metrics["dominant_category"]
            if cat_amount > (metrics["budget"] * Decimal("0.4")):
                results.append({
                    "title": f"Concentración de Gasto en {cat_name}",
                    "body": f"La categoría '{cat_name}' representa un volumen altísimo de tu límite. Intenta negociar con proveedores o buscar alternativas.",
                    "priority": "Alta",
                })
                
        # Rule 3: Roles cost vs Expenses
        if metrics["total_roles_cost"] > (metrics["budget"] * Decimal("0.6")):
            results.append({
                "title": "Estructura de equipo costosa",
                "body": "El costo de los roles supera el 60% del presupuesto. Revisa si el equipo está sobredimensionado para la fase actual.",
                "priority": "Media",
            })

        # Ensure at least 2 recommendations if we have data
        if len(results) < 2 and (metrics["expenses_count"] > 0 or metrics["roles_count"] > 0):
            if metrics["expenses_count"] > 0 and not any("categoría" in r["body"].lower() for r in results):
                results.append({
                    "title": "Revisar pequeñas transacciones",
                    "body": "Revisar compras frecuentes o pequeños gastos repetitivos puede ayudar a liberar margen del presupuesto.",
                    "priority": "Baja",
                })
            if metrics["roles_count"] > 0 and not any("equipo" in r["body"].lower() for r in results):
                results.append({
                    "title": "Optimización del equipo",
                    "body": "Asegúrate de que la distribución de roles esté alineada con las necesidades técnicas actuales.",
                    "priority": "Baja",
                })

        # Ultimate fallback if no data matches
        if not results:
            results.append({
                "title": "Registra más datos",
                "body": "Agrega más gastos y roles para recibir recomendaciones detalladas.",
                "priority": "Baja",
            })
            
        # Save to DB
        return self._save_and_format_recommendations(project, results)

    def _save_and_format_recommendations(self, project, results_list):
        """Helper to clear old recommendations, save new ones, and format output."""
        Recommendation.objects.filter(project=project).delete()
        
        saved_recs = []
        for item in results_list:
            priority = item.get("priority", "Media")
            if priority not in ["Alta", "Media", "Baja"]:
                priority = "Media"
                
            rec_obj = Recommendation.objects.create(
                project=project,
                title=item.get("title", "Sin título"),
                body=item.get("body", ""),
                priority=priority
            )
            
            saved_recs.append({
                "id": str(rec_obj.id),
                "title": rec_obj.title,
                "body": rec_obj.body,
                "priority": rec_obj.priority,
                "project": project.name
            })
            
        return {"results": saved_recs}

    def get_recommendations_for_project(self, project):
        metrics = self._calculate_metrics(project)
        
        if not self.api_key or not self.model:
            logger.warning("GEMINI_API_KEY no detectada. Usando fallback.")
            return self._get_fallback_recommendations(project, metrics)

        # Build prompt
        prompt = f"""
        Actúa como un analista financiero experto en gestión de proyectos.
        Analiza el siguiente proyecto y genera recomendaciones útiles, claras y accionables.
        
        DATOS DEL PROYECTO:
        - Proyecto: {project.name}
        - Presupuesto Total: ${metrics['budget']}
        - Gasto Total (Gastos + Roles): ${metrics['total_spent']}
        - Porcentaje de Presupuesto Consumido: {metrics['consumed_pct']:.2f}%
        - Costo de Roles/Equipo: ${metrics['total_roles_cost']}
        - Total de Gastos Directos: ${metrics['total_expenses']}
        - Categoría Dominante: {metrics['dominant_category'][0] if metrics['dominant_category'] else 'N/A'} (con ${metrics['dominant_category'][1] if metrics['dominant_category'] else 0})
        - Registros de Gastos: {metrics['expenses_count']}
        - Cantidad de Roles: {metrics['roles_count']}
        
        REGLAS PARA GENERAR RECOMENDACIONES:
        1. Debes generar al menos 2 recomendaciones si el proyecto tiene gastos o roles.
        2. Analiza la concentración de gasto, el consumo del presupuesto y el costo del equipo.
        3. Identifica si hay que reducir gastos, reasignar presupuesto, revisar compras repetitivas o ajustar el tamaño del equipo.
        4. OBLIGATORIO: Debes responder ÚNICA Y EXCLUSIVAMENTE con un JSON válido, sin markdown ni backticks, estrictamente con el siguiente formato:
        
        {{
            "results": [
                {{
                    "title": "Título corto y directo",
                    "body": "Explicación clara de por qué y qué hacer.",
                    "priority": "Alta" | "Media" | "Baja"
                }}
            ]
        }}
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            
            text_response = response.text.strip()
            
            # Clean up potential markdown formatting from LLM
            if text_response.startswith("```json"):
                text_response = text_response[7:-3]
            elif text_response.startswith("```"):
                text_response = text_response[3:-3]
                
            data = json.loads(text_response.strip())
            
            # Save directly avoiding the raw formatting
            if "results" in data and isinstance(data["results"], list) and len(data["results"]) > 0:
                return self._save_and_format_recommendations(project, data["results"])
            else:
                logger.warning("Gemini devolvió un JSON vacío o inválido. Usando fallback.")
                return self._get_fallback_recommendations(project, metrics)
                
        except Exception as e:
            logger.error(f"Error al llamar a Gemini: {str(e)}")
            return self._get_fallback_recommendations(project, metrics)

