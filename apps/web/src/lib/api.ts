const DEFAULT_API_URL = "http://127.0.0.1:8000/api/v1";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Request failed (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as T;
}