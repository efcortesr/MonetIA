const DEFAULT_API_URL = "http://127.0.0.1:8000/api/v1";

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
  return url.replace("localhost", "127.0.0.1");
}

function getCookie(name: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();

  let token: string | undefined;
  if (typeof window !== "undefined") {
    token = getCookie("token");
  } else {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { cookies } = require("next/headers");
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    } catch {
      // fail silently when not in request context
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  // Merge external headers
  if (init?.headers) {
    const extHeaders = init.headers as Record<string, string>;
    Object.keys(extHeaders).forEach((key) => {
      headers[key] = extHeaders[key];
    });
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Request failed (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as T;
}