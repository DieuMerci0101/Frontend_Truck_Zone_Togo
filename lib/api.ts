const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://truck-zone-togo.onrender.com";

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erreur inconnue" }));
    throw new Error(error.detail || `Erreur ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(endpoint: string) => fetchAPI<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    fetchAPI<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) =>
    fetchAPI<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) =>
    fetchAPI<T>(endpoint, { method: "DELETE" }),
};
