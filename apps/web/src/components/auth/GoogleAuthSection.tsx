"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import Script from "next/script";
import { googleAuthAction } from "@/app/actions/auth-actions";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthSectionProps {
  buttonText: "signin_with" | "signup_with" | "continue_with";
  actionType: "iniciar sesión" | "registrarse";
  disabled?: boolean;
}

export default function GoogleAuthSection({ buttonText, actionType, disabled }: Readonly<GoogleAuthSectionProps>) {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const initializeGoogleSignIn = () => {
    if (typeof globalThis.window !== "undefined" && globalThis.window.google) {
      try {
        globalThis.window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "996228663829-0ueokf900fbcoj8e6adpuig16tersr7n.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        const btnParent = document.getElementById("google-signin-div");
        if (btnParent) {
          globalThis.window.google.accounts.id.renderButton(btnParent, {
            theme: "outline",
            size: "large",
            width: btnParent.clientWidth || 380,
            text: buttonText,
            shape: "rectangular",
          });
        }
      } catch {
        console.error("Error initializing Google Identity Services:");
      }
    }
  };

  useEffect(() => {
    if (typeof globalThis.window !== "undefined" && globalThis.window.google) {
      initializeGoogleSignIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    setIsGooglePending(true);
    setGoogleError(null);
    try {
      const res = await googleAuthAction(undefined, undefined, response.credential);
      if (res?.error) {
        setGoogleError(res.error);
      }
    } catch {
      setGoogleError(`Error al ${actionType} con Google.`);
    } finally {
      setIsGooglePending(false);
    }
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
    } catch {
      setGoogleError(`Error al ${actionType} con Google.`);
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
    <>
      <Script 
        src="https://accounts.google.com/gsi/client" 
        onLoad={initializeGoogleSignIn}
        strategy="afterInteractive"
      />

      {googleError && (
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 mb-4 text-sm text-rose-600 animate-shake">
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
            <span className="font-medium">{googleError}</span>
          </div>
        </div>
      )}

      {/* Official Google OAuth 2.0 & Simulated Selector */}
      <div className="flex flex-col items-center justify-center">
        {/* Official Google Button (hydrated by GIS script) */}
        <div id="google-signin-div" className="w-full flex justify-center min-h-[44px]"></div>
        
        <div className="text-center my-3 text-[10px] text-zinc-400 font-medium">— o para pruebas locales —</div>

        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          disabled={disabled || isGooglePending}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 hover:text-zinc-900 transition-all duration-200 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
        >
          🔑 Selector de Cuentas Rápido
        </button>
      </div>

      {/* Account Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Selector de Cuentas Rápido</h3>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => handleGoogleSelect("sarangoe3@afit.edu.co", "Sara Arango")}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-left hover:bg-zinc-100/50 hover:border-zinc-200 transition-all cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-xs">SA</div>
                <div>
                  <div className="text-xs font-bold text-zinc-900">Sara Arango</div>
                  <div className="text-[10px] text-zinc-500">sarangoe3@afit.edu.co (Líder / 8 Proy)</div>
                </div>
              </button>

              <button
                onClick={() => handleGoogleSelect("samuel@example.com", "Samuel Dev")}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-left hover:bg-zinc-100/50 hover:border-zinc-200 transition-all cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white text-xs">SD</div>
                <div>
                  <div className="text-xs font-bold text-zinc-900">Samuel Dev</div>
                  <div className="text-[10px] text-zinc-500">samuel@example.com (Desarrollador)</div>
                </div>
              </button>

              <button
                onClick={() => handleGoogleSelect("guest@example.com", "Invitado Especial")}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-left hover:bg-zinc-100/50 hover:border-zinc-200 transition-all cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white text-xs">IE</div>
                <div>
                  <div className="text-xs font-bold text-zinc-900">Invitado Especial</div>
                  <div className="text-[10px] text-zinc-500">guest@example.com (Visualizador)</div>
                </div>
              </button>

              <div className="text-center my-3 text-[10px] text-zinc-400 font-semibold">— o ingresa cualquier correo de pruebas —</div>

              <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
                <input
                  name="google-email"
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-all"
                >
                  Entrar con este correo
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
