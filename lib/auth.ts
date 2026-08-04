export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token");
}

export function setToken(token: string): void {
  sessionStorage.setItem("token", token);
}

export function removeToken(): void {
  sessionStorage.removeItem("token");
}

export function getUser(): { id: string; email: string; role: string; nom_complet: string } | null {
  if (typeof window === "undefined") return null;
  const user = sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function setUser(user: { id: string; email: string; role: string; nom_complet: string }): void {
  sessionStorage.setItem("user", JSON.stringify(user));
}

export function removeUser(): void {
  sessionStorage.removeItem("user");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("refresh_token");
}

export function setRefreshToken(token: string): void {
  sessionStorage.setItem("refresh_token", token);
}

export function removeRefreshToken(): void {
  sessionStorage.removeItem("refresh_token");
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
// La session (token + user) est stockée dans `sessionStorage` : elle est isolée
// PAR ONGLET, ce qui permet d'ouvrir plusieurs sessions indépendantes.
// Le middleware ne peut PAS lire sessionStorage (côté serveur) : on réplique le
// token dans un cookie lisible par le middleware pour les gardes de routes.

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
