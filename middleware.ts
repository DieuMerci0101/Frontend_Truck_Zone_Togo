import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
  "/chauffeurs",
  "/mecaniciens",
  "/offres",
  "/contact",
  "/about",
  "/a-propos",
  "/admin/login",
];

const VERIFICATION_ROUTES = ["/dashboard/verification", "/dashboard/mecanicien/verification"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("tt_token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], "base64").toString("utf-8")
      );

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Normalisation insensible à la casse ('ADMIN' → 'admin').
      const role = String(payload.role || "").toLowerCase();
      const isVerified = payload.is_verified;

      const isVerificationRoute = VERIFICATION_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );

      if (!isVerificationRoute && role !== "admin") {
        if (isVerified === false) {
          const target =
            role === "mecanicien"
              ? "/dashboard/mecanicien/verification"
              : "/dashboard/verification";
          return NextResponse.redirect(new URL(target, request.url));
        }
      }

      if (isVerificationRoute && isVerified !== false) {
        const rolePath: Record<string, string> = {
          chauffeur: "/dashboard/chauffeur",
          proprietaire: "/dashboard/proprietaire",
          mecanicien: "/dashboard/mecanicien",
          admin: "/admin/dashboard",
        };
        return NextResponse.redirect(
          new URL(rolePath[role] || "/dashboard/chauffeur", request.url)
        );
      }

      if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
        const rolePath: Record<string, string> = {
          chauffeur: "/dashboard/chauffeur",
          proprietaire: "/dashboard/proprietaire",
          mecanicien: "/dashboard/mecanicien",
        };
        return NextResponse.redirect(
          new URL(rolePath[role] || "/login", request.url)
        );
      }

      // Anciennes URLs /dashboard/admin/* → nouvel espace isolé /admin/dashboard/*
      if (pathname.startsWith("/dashboard/admin") && role === "admin") {
        const target = pathname.replace(
          /^\/dashboard\/admin/,
          "/admin/dashboard"
        );
        return NextResponse.redirect(new URL(target, request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── Espace Admin isolé : /admin/* (hors /admin/login) ──
  // Requiert un token valide avec le rôle ADMIN, sinon redirection /admin/login.
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("tt_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], "base64").toString("utf-8")
      );

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      if (String(payload.role || "").toLowerCase() !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
