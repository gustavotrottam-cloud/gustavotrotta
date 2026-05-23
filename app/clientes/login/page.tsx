"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Mode = "init" | "link_sent" | "restricted";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("init");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUnknownEmail = (msg: string) => {
    const m = msg.toLowerCase();
    return (
      m.includes("signups not allowed") ||
      m.includes("signup is disabled") ||
      m.includes("user not found") ||
      m.includes("invalid login")
    );
  };

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!SUPABASE_CONFIGURED) {
      setError(
        "O sistema está sendo configurado. Tente novamente em instantes."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabase();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/clientes/auth/callback`,
        },
      });

      setLoading(false);

      if (!signInError) {
        setMode("link_sent");
        return;
      }

      if (isUnknownEmail(signInError.message)) {
        setMode("restricted");
        return;
      }

      const m = signInError.message.toLowerCase();
      if (m.includes("rate")) {
        setError("Muitas tentativas em pouco tempo. Aguarde 60 segundos.");
      } else {
        setError(`Falha ao enviar link: ${signInError.message}`);
      }
      console.error("[login] signInWithOtp error:", signInError);
    } catch (err) {
      setLoading(false);
      console.error("[login] unexpected:", err);
      setError(
        "Erro inesperado. Abra o console (F12) e verifique a mensagem em vermelho."
      );
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* ─── Esquerda · marca editorial ─── */}
      <div className="relative hidden overflow-hidden bg-ink-900 text-paper-100 lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-14">
        <div>
          <Link href="/" className="inline-block">
            <div className="font-serif text-[1.3rem] tracking-editorial">
              Gustavo <span className="text-gold-500">Trotta</span>
            </div>
            <div className="mt-2 text-[0.65rem] uppercase tracking-wider3 text-paper-100/55">
              Administração
            </div>
          </Link>
        </div>

        <div className="max-w-md">
          <div className="font-serif text-[3rem] leading-[1.04] tracking-editorial">
            Painel interno de
            <br />
            <span className="italic text-gold-400">gestão e curadoria</span>.
          </div>
          <p className="mt-8 text-[0.95rem] leading-relaxed text-paper-100/65">
            Acesso restrito. Gestão de leads, planos financeiros e curadoria
            editorial do site.
          </p>
        </div>

        <div className="text-[0.65rem] uppercase tracking-wider3 text-paper-100/45">
          Sócio da Valor Investimentos · Escritório credenciado XP
        </div>
      </div>

      {/* ─── Direita · formulário ─── */}
      <div className="flex flex-col items-stretch justify-center bg-paper-100 px-6 py-12 md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Marca compacta (mobile) */}
          <Link href="/" className="lg:hidden">
            <div className="font-serif text-lg tracking-editorial text-ink-900">
              Gustavo <span className="text-gold-500">Trotta</span>
            </div>
            <div className="mt-1 text-[0.65rem] uppercase tracking-wider3 text-muted-500">
              Administração
            </div>
          </Link>

          {/* ─── INIT: pede email ─── */}
          {mode === "init" && (
            <>
              <div className="mt-10 lg:mt-0">
                <div className="text-[0.7rem] uppercase tracking-wider3 text-muted-500">
                  Acesso
                </div>
                <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.05] tracking-editorial text-ink-900 md:text-[2.8rem]">
                  Painel{" "}
                  <span className="italic text-navy-800">administrativo</span>.
                </h1>
                <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-600">
                  Acesso restrito ao administrador do site. Use o email
                  cadastrado para receber um link seguro de entrada — sem senhas.
                </p>
              </div>

              <form onSubmit={onEmailSubmit} className="mt-10 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="text-[0.7rem] uppercase tracking-wider2 text-muted-500"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="mt-2 block w-full border-b border-ink-900/25 bg-transparent py-3 text-[1rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900"
                  />
                </div>

                {error && (
                  <div className="text-[0.85rem] text-red-700">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-3 bg-ink-900 px-8 py-4 text-[0.72rem] uppercase tracking-wider2 text-paper-50 transition-all duration-300 hover:bg-navy-800 disabled:opacity-60"
                >
                  {loading ? "Verificando..." : "Enviar link de acesso"}
                  {!loading && <span aria-hidden>→</span>}
                </button>
              </form>
            </>
          )}

          {/* ─── LINK_SENT: magic link enviado ─── */}
          {mode === "link_sent" && (
            <div className="mt-10 border border-ink-900/15 bg-paper-200/40 p-6 lg:mt-0">
              <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
                Link enviado
              </div>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-900">
                Enviamos um link de acesso para <strong>{email}</strong>. Clique
                no botão dentro do email para entrar — válido por uma hora.
              </p>
              <p className="mt-4 text-[0.85rem] text-muted-600">
                Não recebeu? Verifique a pasta de spam ou{" "}
                <button
                  onClick={() => {
                    setMode("init");
                    setError(null);
                  }}
                  className="underline underline-offset-4 hover:text-ink-900"
                >
                  tente outro email
                </button>
                .
              </p>
            </div>
          )}

          {/* ─── RESTRICTED: email não autorizado ─── */}
          {mode === "restricted" && (
            <div className="mt-10 border border-ink-900/15 bg-paper-200/40 p-6 lg:mt-0">
              <div className="text-[0.7rem] uppercase tracking-wider2 text-muted-500">
                Acesso restrito
              </div>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-900">
                Este email não possui permissão para acessar o painel
                administrativo.
              </p>
              <p className="mt-4 text-[0.9rem] leading-relaxed text-muted-600">
                Se você é cliente do escritório ou tem interesse em conversar,
                acesse a{" "}
                <Link
                  href="/"
                  className="text-ink-900 underline underline-offset-4 hover:text-navy-800"
                >
                  página principal
                </Link>{" "}
                ou fale comigo direto pelo WhatsApp.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://wa.me/5511932212045"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] px-6 py-3 text-[0.72rem] uppercase tracking-wider2 text-white transition-all duration-300 hover:bg-[#1ebe57]"
                >
                  WhatsApp →
                </a>
                <button
                  onClick={() => {
                    setMode("init");
                    setEmail("");
                    setError(null);
                  }}
                  className="inline-flex items-center justify-center gap-2 border border-ink-900 px-6 py-3 text-[0.72rem] uppercase tracking-wider2 text-ink-900 transition-all duration-300 hover:bg-ink-900 hover:text-paper-50"
                >
                  Usar outro email
                </button>
              </div>
            </div>
          )}

          {/* ─── Rodapé contato ─── */}
          <div className="mt-12 border-t border-paper-300/70 pt-6 text-[0.78rem] leading-relaxed text-muted-500">
            <Link
              href="/"
              className="text-ink-900 underline-offset-4 hover:text-navy-800 hover:underline"
            >
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
