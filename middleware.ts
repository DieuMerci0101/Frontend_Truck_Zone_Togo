import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
  "/admin-login",
  "/chauffeurs",
  "/mecaniciens",
  "/offres",
  "/contact",
  "/about",
];

const VERIFICATION_ROUTES = ["/dashboard/verification"];

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

      const isVerificationRoute = VERIFICATION_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );

      if (!isVerificationRoute && payload.role !== "admin") {
        if (payload.is_verified === false) {
          return NextResponse.redirect(new URL("/dashboard/verification", request.url));
        }
      }

      if (isVerificationRoute && payload.is_verified !== false) {
        const rolePath: Record<string, string> = {
          chauffeur: "/dashboard/chauffeur",
          proprietaire: "/dashboard/proprietaire",
          mecanicien: "/dashboard/mecanicien",
          admin: "/dashboard/admin",
        };
        return NextResponse.redirect(
          new URL(rolePath[payload.role] || "/dashboard/chauffeur", request.url)
        );
      }

      if (pathname.startsWith("/dashboard/admin") && payload.role !== "admin") {
        const rolePath: Record<string, string> = {
          chauffeur: "/dashboard/chauffeur",
          proprietaire: "/dashboard/proprietaire",
          mecanicien: "/dashboard/mecanicien",
        };
        return NextResponse.redirect(
          new URL(rolePath[payload.role] || "/login", request.url)
        );
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
