"use client";

import { useActionState, startTransition, useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { registerAction, googleAuthAction } from "@/app/actions/auth-actions";

declare global {
  interface Window {
    google?: any;
  }
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const initializeGoogleSignIn = () => {
    if (typeof window !== "undefined" && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "996228663829-0ueokf900fbcoj8e6adpuig16tersr7n.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        const btnParent = document.getElementById("google-signup-div");
        if (btnParent) {
          window.google.accounts.id.renderButton(btnParent, {
            theme: "outline",
            size: "large",
            width: btnParent.clientWidth || 380,
            text: "signup_with",
            shape: "rectangular",
          });
        }
      } catch (err) {
        console.error("Error initializing Google Identity Services:", err);
      }
    }
  };

  useEffect(() => {
    // Re-initialize if script loaded already
    if (typeof window !== "undefined" && window.google) {
      initializeGoogleSignIn();
    }
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    setIsGooglePending(true);
    setGoogleError(null);
    try {
      const res = await googleAuthAction(undefined, undefined, response.credential);
      if (res?.error) {
        setGoogleError(res.error);
      }
    } catch (err) {
      setGoogleError("Error al registrarse con Google.");
    } finally {
      setIsGooglePending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  const handleGoogleSelect = async (email: string, name: string) => {
    setShowGoogleModal(false);
    setIsGooglePending(true);
    setGoogleError(null);
    try {
      const res = await googleAuthAction(email, name);
      if (res?.error) {
        setGoogleError(res.error);
      }
    } catch (err) {
      setGoogleError("Error al registrarse con Google.");
    } finally {
      setIsGooglePending(false);
    }
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("google-email") as string;
    if (email) {
      const name = email.split("@")[0].split(".")[0];
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      handleGoogleSelect(email, displayName);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <Script 
        src="https://accounts.google.com/gsi/client" 
        onLoad={initializeGoogleSignIn}
        strategy="afterInteractive"
      />
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-xl backdrop-blur-sm sm:p-10">
        
        {/* Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
            M
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Crear cuenta
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Regístrate en MonetIA y toma el control de tus finanzas
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(state?.error || googleError) && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-sm text-rose-600 animate-shake">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="font-medium">{state?.error || googleError}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-500"
              >
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                disabled={isPending || isGooglePending}
                placeholder="Juan Pérez"
                className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-500"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isPending || isGooglePending}
                placeholder="nombre@empresa.com"
                className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-500"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={isPending || isGooglePending}
                placeholder="••••••••"
                className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending || isGooglePending}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none transition-all duration-200"
            >
              {isPending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Registrarse"
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-zinc-500 font-semibold">O continuar con</span>
          </div>
        </div>

        {/* Official Google OAuth 2.0 & Simulated Selector */}
        <div className="flex flex-col items-center justify-center">
          {/* Official Google Button (hydrated by GIS script) */}
          <div id="google-signup-div" className="w-full flex justify-center min-h-[44px]"></div>
          
          <div className="text-center my-3 text-[10px] text-zinc-400 font-medium">— o para pruebas locales —</div>

          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            disabled={isPending || isGooglePending}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-600 shadow-sm hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-60 transition-all duration-200 cursor-pointer"
          >
            {isGooglePending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Selector de Cuentas Rápido
          </button>
        </div>

        {/* Navigation */}
        <div className="text-center text-sm text-zinc-500 mt-6">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>

      {/* Google Account Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <h2 className="mt-4 text-lg font-bold text-zinc-900">Registrarse con Google</h2>
              <p className="mt-1 text-xs text-zinc-500">Elige una cuenta para continuar en MonetIA</p>
            </div>

            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={() => handleGoogleSelect("irons.dev@gmail.com", "Irons Dev")}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-left text-sm hover:bg-zinc-100/70 transition-colors cursor-pointer"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  ID
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-zinc-800 truncate">Irons Dev</div>
                  <div className="text-xs text-zinc-500 truncate">irons.dev@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleSelect("antigravity.coder@gmail.com", "Antigravity")}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-left text-sm hover:bg-zinc-100/70 transition-colors cursor-pointer"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-zinc-800 truncate">Antigravity</div>
                  <div className="text-xs text-zinc-500 truncate">antigravity.coder@gmail.com</div>
                </div>
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-zinc-400 font-medium">O ingresa otra cuenta</span>
                </div>
              </div>

              <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
                <input
                  type="email"
                  name="google-email"
                  placeholder="correo@gmail.com"
                  required
                  className="block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    Continuar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
