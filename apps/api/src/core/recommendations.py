"""Genera recomendaciones de presupuesto y eficiencia a partir de patrones de gasto."""
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Sum


def _pct(value: Decimal) -> str:
  return f"{value * 100:.1f}"


def build_recommendations_for_project(project, categories: dict[int, str], today: date) -> list[dict]:
  """Devuelve lista de dicts con id, project_id, project, priority, pattern, title, body."""
  recommendations: list[dict] = []
  pid = project.id

  budget = project.budget or Decimal("0")
  total_spent = project.total_spent or Decimal("0")
  expenses_queryset = project.expenses.all()
  total_expenses = expenses_queryset.aggregate(total=Sum("amount"))["total"] or Decimal("0")

  # --- Tiempo transcurrido vs consumo de presupuesto (eficiencia del proyecto) ---
  start = project.start_date
  end = project.end_date
  if budget > 0 and start and end and end > start:
    total_days = (end - start).days
    if total_days > 0:
      elapsed_days = (min(today, end) - start).days
      elapsed_days = max(0, elapsed_days)
      timeline_ratio = Decimal(elapsed_days) / Decimal(total_days)
      timeline_pct = timeline_ratio * Decimal("100")
      consumed_ratio = total_spent / budget
      consumed_pct = consumed_ratio * Decimal("100")
      diff = consumed_pct - timeline_pct

      if diff > Decimal("10"):
        recommendations.append(
          {
            "id": f"time-budget-{pid}",
            "project_id": pid,
            "project": project.name,
            "priority": "Alta",
            "pattern": "Gasto más rápido que el avance temporal",
            "title": "Alinear ritmo de gasto con el calendario del proyecto",
            "body": (
              f"El tiempo transcurrido es aproximadamente el {_pct(timeline_ratio)}% del plazo, "
              f"pero ya se consumió el {_pct(consumed_ratio)}% del presupuesto. "
              "Revisa compras pendientes y prioriza solo lo crítico para recuperar eficiencia."
            ),
          }
        )
      elif diff < Decimal("-10"):
        recommendations.append(
          {
            "id": f"time-budget-under-{pid}",
            "project_id": pid,
            "project": project.name,
            "priority": "Baja",
            "pattern": "Presupuesto por debajo del ritmo temporal",
            "title": "Aprovechar margen frente al calendario",
            "body": (
              f"Con ~{_pct(timeline_ratio)}% del tiempo transcurrido, solo se ha consumido el "
              f"{_pct(consumed_ratio)}% del presupuesto. Puedes reasignar parte del remanente a "
              "riesgos o mejoras planificadas sin comprometer el cierre."
            ),
          }
        )

  # --- Alto consumo global de presupuesto (gastos + roles) ---
  if budget > 0:
    usage_ratio = total_spent / budget
    if usage_ratio >= Decimal("0.80"):
      recommendations.append(
        {
          "id": f"budget-{pid}",
          "project_id": pid,
          "project": project.name,
          "priority": "Alta",
          "pattern": "Alto consumo de presupuesto",
          "title": "Controlar gastos para evitar sobrecostos",
          "body": (
            f"El proyecto ya consumió el {_pct(usage_ratio)}% del presupuesto. "
            "Prioriza gastos esenciales y pospone compras no críticas para mantener la eficiencia."
          ),
        }
      )

  # --- Patrones solo sobre gastos registrados ---
  if total_expenses > 0:
    expense_list = list(expenses_queryset)
    amounts = [e.amount for e in expense_list]
    max_amount = max(amounts)
    if max_amount / total_expenses >= Decimal("0.50"):
      top = next(e for e in expense_list if e.amount == max_amount)
      desc = (top.description or "Un gasto").strip()[:80]
      recommendations.append(
        {
          "id": f"dominant-expense-{pid}-{top.id}",
          "project_id": pid,
          "project": project.name,
          "priority": "Alta",
          "pattern": "Gasto concentrado en pocos ítems",
          "title": "Revisar el impacto de los gastos más grandes",
          "body": (
            f"Un solo ítem ({desc}) representa el {_pct(max_amount / total_expenses)}% del total de gastos registrados. "
            "Valida que el costo esté justificado y busca alternativas o pagos escalonados para distribuir mejor el riesgo."
          ),
        }
      )

    expenses_by_category: dict[int, Decimal] = {}
    for expense in expense_list:
      expenses_by_category[expense.category_id] = expenses_by_category.get(expense.category_id, Decimal("0")) + expense.amount

    top_category_id, top_amount = max(expenses_by_category.items(), key=lambda item: item[1])
    category_ratio = top_amount / total_expenses

    if category_ratio >= Decimal("0.40"):
      category_name = categories.get(top_category_id, "categoría principal")
      recommendations.append(
        {
          "id": f"category-{pid}-{top_category_id}",
          "project_id": pid,
          "project": project.name,
          "priority": "Media",
          "pattern": "Alta concentración en categoría",
          "title": f"Reducir dependencia de {category_name}",
          "body": (
            f"El {_pct(category_ratio)}% de los gastos se concentra en {category_name}. "
            "Revisa alternativas de proveedores y define topes por categoría para optimizar el presupuesto."
          ),
        }
      )

    last_30_days = today - timedelta(days=30)
    previous_60_days = today - timedelta(days=60)
    recent_total = (
      expenses_queryset.filter(date__gt=last_30_days).aggregate(total=Sum("amount"))["total"] or Decimal("0")
    )
    previous_total = (
      expenses_queryset.filter(date__gt=previous_60_days, date__lte=last_30_days).aggregate(total=Sum("amount"))[
        "total"
      ]
      or Decimal("0")
    )

    if previous_total > 0:
      growth_ratio = recent_total / previous_total
      if growth_ratio >= Decimal("1.20"):
        recommendations.append(
          {
            "id": f"trend-{pid}",
            "project_id": pid,
            "project": project.name,
            "priority": "Media",
            "pattern": "Crecimiento acelerado del gasto",
            "title": "Corregir tendencia de gasto creciente",
            "body": (
              f"En los últimos 30 días el gasto subió {((growth_ratio - 1) * 100):.1f}% frente al período anterior. "
              "Programa una revisión semanal para detectar desviaciones y ajustar decisiones a tiempo."
            ),
          }
        )

  # Dedupe por id (por si algún patrón se solapa)
  seen: set[str] = set()
  unique: list[dict] = []
  for r in recommendations:
    if r["id"] not in seen:
      seen.add(r["id"])
      unique.append(r)

  return sorted(
    unique,
    key=lambda item: {"Alta": 0, "Media": 1, "Baja": 2}.get(item["priority"], 3),
  )
