"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/browser";

/**
 * Callback de autenticação que suporta DOIS fluxos:
 *  - PKCE (login normal pelo formulário): chega com `?code=...` na query
 *  - Implicit (links gerados via Admin API generateLink): chega com `#access_token=...` no hash
 *
 * Como o hash não é enviado ao server, este precisa ser um Client Component.
 *
 * useSearchParams() força CSR bailout — wrapeamos em Suspense pra permitir
 * prerender da página (Next 14 exige).
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <AuthCallbackInner />
    </Suspense>
  );
}

function LoadingShell() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper-100 px-6">
      <div className="max-w-md text-center">
        <div className="font-serif text-[1.25rem] tracking-editorial text-ink-900">
          Gustavo <span className="text-gold-500">Trotta</span>
        </div>
        <h1 className="mt-10 font-serif text-[1.8rem] leading-[1.15] tracking-editorial text-ink-900">
          Entrando<span className="text-gold-500">...</span>
        </h1>
      </div>
    </div>
  );
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    const next = searchParams.get("next") ?? "/clientes";

    const run = async () => {
      // Fluxo PKCE — vem com ?code=
      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          code
        );
        if (exchangeError) {
          console.error("[callback] PKCE exchange error:", exchangeError);
          setError("Não foi possível concluir o login. Tente novamente.");
          setTimeout(() => router.replace("/clientes/login?error=pkce"), 2000);
          return;
        }
        router.replace(next);
        return;
      }

      // Fluxo Implicit — vem com #access_token=... no hash da URL
      const hash = window.location.hash.substring(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (setSessionError) {
            console.error("[callback] setSession error:", setSessionError);
            setError("Falha ao registrar sessão. Tente novamente.");
            setTimeout(
              () => router.replace("/clientes/login?error=set_session"),
              2000
            );
            return;
          }
          // Limpa o hash antes de redirecionar
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
          );
          router.replace(next);
          return;
        }

        const errorParam =
          params.get("error_description") ?? params.get("error");
        if (errorParam) {
          console.error("[callback] hash error:", errorParam);
          setError(decodeURIComponent(errorParam));
          setTimeout(() => router.replace("/clientes/login?error=hash"), 2500);
          return;
        }
      }

      // Sem code nem hash — link inválido ou já consumido
      setError("Link inválido ou já utilizado. Solicite um novo link de acesso.");
      setTimeout(() => router.replace("/clientes/login?error=no_token"), 2500);
    };

    run();
  }, [router, searchParams]);

  return (
    <div className="grid min-h-screen place-items-center bg-paper-100 px-6">
      <div className="max-w-md text-center">
        <Link href="/" className="inline-block">
          <div className="font-serif text-[1.25rem] tracking-editorial text-ink-900">
            Gustavo <span className="text-gold-500">Trotta</span>
          </div>
          <div className="mt-1 text-[0.65rem] uppercase tracking-wider3 text-muted-500">
            Área Exclusiva
          </div>
        </Link>

        {error ? (
          <>
            <h1 className="mt-10 font-serif text-[1.8rem] leading-[1.15] tracking-editorial text-ink-900">
              Algo deu errado.
            </h1>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-600">
              {error}
            </p>
            <p className="mt-3 text-[0.85rem] text-muted-500">
              Redirecionando para a tela de login...
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-10 font-serif text-[1.8rem] leading-[1.15] tracking-editorial text-ink-900">
              Entrando<span className="text-gold-500">...</span>
            </h1>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-600">
              Verificando sua sessão e levando você ao dashboard.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
