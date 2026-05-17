"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const DEFAULT_API_URL = "http://127.0.0.1:8000/api/v1";

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
  return url.replace("localhost", "127.0.0.1");
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Por favor, ingresa todos los campos." };
  }

  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Credenciales incorrectas" };
    }

    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    cookieStore.set("userName", data.user.name, { path: "/" });
    cookieStore.set("userEmail", data.user.email, { path: "/" });
  } catch (error) {
    console.error("Login action error:", error);
    return { error: "No se pudo conectar con el servidor de autenticación." };
  }

  redirect("/dashboard");
}

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Todos los campos son obligatorios." };
  }

  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "No se pudo realizar el registro." };
    }

    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    cookieStore.set("userName", data.user.name, { path: "/" });
    cookieStore.set("userEmail", data.user.email, { path: "/" });
  } catch (error) {
    console.error("Register action error:", error);
    return { error: "No se pudo conectar con el servidor de autenticación." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("userName");
  cookieStore.delete("userEmail");
  redirect("/login");
}

export async function googleAuthAction(email?: string, name?: string, credential?: string) {
  if (!credential && (!email || !name)) {
    return { error: "El correo y nombre de Google son obligatorios." };
  }

  try {
    const baseUrl = getApiBaseUrl();
    const payload = credential ? { credential } : { email, name };
    
    const res = await fetch(`${baseUrl}/auth/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "No se pudo autenticar con Google." };
    }

    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    cookieStore.set("userName", data.user.name, { path: "/" });
    cookieStore.set("userEmail", data.user.email, { path: "/" });
  } catch (error) {
    console.error("Google auth action error:", error);
    return { error: "No se pudo conectar con el servidor de autenticación." };
  }

  redirect("/dashboard");
}
