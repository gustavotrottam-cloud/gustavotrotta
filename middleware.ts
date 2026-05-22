import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ANON_COOKIE = "pf_anon";
const ANON_TTL = 60 * 60 * 24 * 90; // 90 dias

/**
 * Middleware:
 *  - /clientes/planejamento(/...) → redirect pra /planejamento-financeiro (legacy)
 *  - /planejamento-financeiro(/...) → garante cookie pf_anon (sessão anônima)
 *  - /clientes/* → exige autenticação (mantém comportamento anterior)
 */
export async function middleware(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Legacy redirect: /clientes/planejamento → /planejamento-financeiro
  if (
    pathname === "/clientes/planejamento" ||
    pathname.startsWith("/clientes/planejamento/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/planejamento-financeiro";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Planejamento Financeiro (rota pública) — garante cookie anon
  if (
    pathname === "/planejamento-financeiro" ||
    pathname.startsWith("/planejamento-financeiro/")
  ) {
    const existing = request.cookies.get(ANON_COOKIE)?.value;
    if (!existing || !isUuid(existing)) {
      const newId = crypto.randomUUID();
      // Disponibiliza o cookie no MESMO request (pra Server Components verem)
      request.cookies.set(ANON_COOKIE, newId);
      const response = NextResponse.next({ request });
      // Persiste no browser pra próximas requests
      response.cookies.set(ANON_COOKIE, newId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ANON_TTL,
      });
      return response;
    }
    return NextResponse.next();
  }

  // /clientes/* — auth check
  const { response, user } = await updateSession(request);

  const isLoginPage =
    pathname === "/clientes/login" || pathname === "/clientes/login/";
  const isAuthCallback = pathname.startsWith("/clientes/auth/callback");

  if (!isLoginPage && !isAuthCallback && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/clientes/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/clientes";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return response;
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    s
  );
}

export const config = {
  matcher: [
    "/clientes/:path*",
    "/planejamento-financeiro",
    "/planejamento-financeiro/:path*",
  ],
};
