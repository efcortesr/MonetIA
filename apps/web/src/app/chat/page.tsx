"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";


type Message = {
  id: number;
  role: "user" | "bot";
  text: string;
  time: string;
  pills?: { label: string; tone: "info" | "success" | "warn" | "danger" | "neutral" }[];
};

type Project = {
  id: number;
  name: string;
  budget: string;
  total_spent: string;
  remaining_budget: string;
  total_expenses: string;
  total_roles_cost: string;
  status: string;
};

type Expense = {
  id: number;
  amount: string;
  category: number;
  description: string;
  date: string;
};

type Category = {
  id: number;
  name: string;
  color: string;
};

type FinancialContext = {
  projects: Project[];
  expenses: Expense[];
  categories: Category[];
};

function fmtCOP(n: number | string) {
  return "COP " + Math.round(Number(n)).toLocaleString("es-CO");
}

function getTime() {
  return new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function buildSystemPrompt(ctx: FinancialContext): string {
  const totalBudget = ctx.projects.reduce((s, p) => s + Number(p.budget), 0);
  const totalSpent = ctx.projects.reduce((s, p) => s + Number(p.total_spent), 0);
  const totalRemaining = ctx.projects.reduce((s, p) => s + Number(p.remaining_budget), 0);

  const projectsSummary = ctx.projects
    .map((p) => {
      const pct =
        Number(p.budget) > 0
          ? ((Number(p.total_spent) / Number(p.budget)) * 100).toFixed(1)
          : "0";
      return `- ${p.name} (ID:${p.id}): presupuesto=${fmtCOP(p.budget)}, gastado=${fmtCOP(p.total_spent)}, restante=${fmtCOP(p.remaining_budget)}, consumo=${pct}%, estado=${p.status}`;
    })
    .join("\n");

  // Solo los últimos 50 gastos ordenados por fecha
  const lastExpenses = [...ctx.expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);

  const catTotals: Record<string, number> = {};
  lastExpenses.forEach((e) => {
    const cat = ctx.categories.find((c) => c.id === e.category);
    const name = cat ? cat.name : "Sin categoría";
    catTotals[name] = (catTotals[name] || 0) + Number(e.amount);
  });

  const catSummary = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amt]) => `  - ${name}: ${fmtCOP(amt)}`)
    .join("\n");

  const expensesSummary = lastExpenses
    .map((e) => {
      const cat = ctx.categories.find((c) => c.id === e.category);
      return `  - [${e.date}] ${e.description || "Sin descripción"}: ${fmtCOP(e.amount)} (${cat?.name ?? "Sin categoría"})`;
    })
    .join("\n");

  return `Eres un asistente financiero inteligente para la plataforma MonetIA. Responde SIEMPRE en español, de forma clara, concisa y amigable. Usa los datos reales del sistema para dar respuestas precisas.

DATOS ACTUALES DEL SISTEMA (${new Date().toLocaleDateString("es-CO")}):

RESUMEN GLOBAL:
- Presupuesto total: ${fmtCOP(totalBudget)}
- Gasto total ejecutado: ${fmtCOP(totalSpent)}
- Saldo disponible total: ${fmtCOP(totalRemaining)}
- Total de gastos registrados: ${ctx.expenses.length}
- Total de proyectos: ${ctx.projects.length}

PROYECTOS:
${projectsSummary || "  (ninguno registrado aún)"}

GASTOS POR CATEGORÍA (basado en últimos 50 gastos):
${catSummary || "  (ninguno registrado aún)"}

ÚLTIMOS 50 GASTOS REGISTRADOS:
${expensesSummary || "  (ninguno registrado aún)"}

INSTRUCCIONES:
- Responde de manera directa y sin tecnicismos innecesarios.
- Cuando menciones montos, usa el formato COP con puntos de miles.
- Si el usuario pregunta por un proyecto específico, extrae y presenta los datos relevantes.
- Si detectas riesgos (consumo > 80%), indícalo claramente.
- Sé conciso: máximo 3-4 oraciones por respuesta, a menos que el usuario pida detalles.
- NO inventes datos que no estén en el contexto.
- Si no hay proyectos o datos, indícalo amablemente.`;
}

const SUGGESTIONS = [
  "¿Cuánto he gastado en total?",
  "¿Qué proyecto tiene más riesgo?",
  "¿Cuánto presupuesto queda?",
  "Dame un resumen de todos los proyectos",
  "¿Cuál es la categoría con más gastos?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      text: "¡Hola! Soy tu asistente financiero. Puedo responder preguntas sobre presupuestos, gastos, saldos, roles y más. ¿En qué te ayudo?",
      time: getTime(),
      pills: [
        { label: "Presupuestos", tone: "info" },
        { label: "Gastos", tone: "success" },
        { label: "Alertas", tone: "warn" },
        { label: "Roles", tone: "neutral" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ctx, setCtx] = useState<FinancialContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchContext = useCallback(async () => {
    try {
      const [projRes, catRes, expRes] = await Promise.all([
        fetch(`${API_BASE}/projects/`, { cache: "no-store" }),
        fetch(`${API_BASE}/categories/`, { cache: "no-store" }),
        fetch(`${API_BASE}/expenses/`, { cache: "no-store" }),
      ]);
      const projects = projRes.ok ? await projRes.json() : [];
      const categories = catRes.ok ? await catRes.json() : [];
      const expenses = expRes.ok ? await expRes.json() : [];
      setCtx({ projects, categories, expenses });
    } catch {
      setCtx({ projects: [], categories: [], expenses: [] });
    }
  }, []);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

async function callGemini(
  userMessage: string,
): Promise<string> {
  // Construimos el system prompt igual que antes

  const response = await fetch(`${API_BASE}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: userMessage,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error ?? "Error del servidor");
  }

  const data = await response.json();
  return data.answer;
}

  function extractPills(text: string, context: FinancialContext): Message["pills"] {
    const pills: Message["pills"] = [];
    const totalSpent = context.projects.reduce((s, p) => s + Number(p.total_spent), 0);
    const totalBudget = context.projects.reduce((s, p) => s + Number(p.budget), 0);
    const pct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const lower = text.toLowerCase();
    if (lower.includes("gast") || lower.includes("presupuesto") || lower.includes("saldo")) {
      pills.push({ label: fmtCOP(totalSpent) + " gastado", tone: pct > 80 ? "danger" : "info" });
      pills.push({
        label: Math.round(pct) + "% consumido",
        tone: pct > 90 ? "danger" : pct > 70 ? "warn" : "success",
      });
    }
    return pills.slice(0, 3);
  }

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setInput("");
    setIsLoading(true);

    const userMsg: Message = { id: Date.now(), role: "user", text: msg, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const context = ctx ?? { projects: [], expenses: [], categories: [] };
      const reply = await callGemini(msg);
      const pills = extractPills(msg, context);
      const botMsg: Message = {
        id: Date.now() + 1,
        role: "bot",
        text: reply,
        time: getTime(),
        pills,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Error desconocido";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: `No pude procesar tu consulta. Verifica que el backend esté activo.\n\nError: ${errMsg}`,
          time: getTime(),
        },
      ]);
    }

    setIsLoading(false);
    inputRef.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const pillClass: Record<string, string> = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warn: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    neutral: "bg-zinc-50 text-zinc-600 border-zinc-200",
  };

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        ← Volver 
      </Link>

      <div>
        <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
          <span className="text-blue-600">◎</span>
          Asistente Financiero IA
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          Consulta información financiera de tus proyectos en lenguaje natural.
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden flex flex-col" style={{ height: "600px" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-100 bg-zinc-50">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            M
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-zinc-900">Asistente MonetIA</div>
            <div className="text-xs text-zinc-500">Responde con datos reales de tus proyectos</div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-500">En línea</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0 mt-0.5">
                  IA
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                      : "bg-zinc-100 text-zinc-800 rounded-2xl rounded-tl-sm border border-zinc-200"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.pills && msg.pills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.pills.map((p, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${pillClass[p.tone]}`}
                      >
                        {p.label}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-zinc-400 mt-1 px-1">{msg.time}</div>
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700 text-xs font-semibold shrink-0 mt-0.5">
                  Tú
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0 mt-0.5">
                IA
              </div>
              <div className="px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && !isLoading && (
          <div className="px-5 py-2 border-t border-zinc-100 flex gap-2 flex-wrap bg-zinc-50">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-zinc-100 flex gap-3 items-end bg-white">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribe tu consulta financiera... (Enter para enviar)"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-zinc-50 disabled:opacity-50"
            style={{ maxHeight: "80px" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}