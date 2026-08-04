export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function removeToken(): void {
  localStorage.removeItem("token");
}

export function getUser(): { id: string; email: string; role: string; nom_complet: string } | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function setUser(user: { id: string; email: string; role: string; nom_complet: string }): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function removeUser(): void {
  localStorage.removeItem("user");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getDashboardPath(role: string): string {
  switch (String(role).toLowerCase()) {
    case "chauffeur": case "driver": return "/dashboard/chauffeur";
    case "proprietaire": case "owner": return "/dashboard/proprietaire";
    case "mecanicien": case "mechanic": return "/dashboard/mecanicien";
    case "admin": return "/admin/dashboard";
    default: return "/dashboard";
  }
}

// ─── Cookies pour le middleware Next.js ─────────────
// Le middleware ne peut PAS lire localStorage (côté serveur).
// On stocke le token dans un cookie lisible par le middleware.

export function setTokenCookie(token: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `tt_token=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function removeTokenCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = "tt_token=; path=/; max-age=0";
}

export function setUserCookie(user: { id: string; email: string; role: string; nom_complet: string }): void {
  if (typeof document === "undefined") return;
  document.cookie = `tt_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
}

export function removeUserCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = "tt_role=; path=/; max-age=0";
}
