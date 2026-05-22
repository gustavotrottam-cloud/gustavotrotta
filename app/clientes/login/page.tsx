"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Mode = "init" | "link_sent" | "lead" | "lead_sent";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("init");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Detecta se o erro do Supabase significa "email não autorizado" */
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
        "O sistema está sendo configurado. Tente novamente em instantes ou solicite acesso pelo WhatsApp."
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
        // Email não cadastrado → captação de interesse
        setMode("lead");
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
        "Erro inesperado. Abra o console (F12) e me envie a mensagem em vermelho."
      );
    }
  };

  const onLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          phone,
          message,
          source: "login_form",
        }),
      });
      setLoading(false);

      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "" }));
        setError(
          j.error ||
            "Falha ao registrar seu interesse. Tente o WhatsApp diretamente."
        );
        return;
      }
      setMode("lead_sent");
    } catch (err) {
      setLoading(false);
      console.error("[login] lead submit:", err);
      setError("Erro inesperado. Use o WhatsApp.");
    }
  };

  const waText = `Olá Gustavo, vim do site (área exclusiva) e gostaria de saber mais.${
    name ? ` Sou ${name}.` : ""
  }${email ? ` Meu email: ${email}.` : ""}`;
  const waLink = `https://wa.me/5511932212045?text=${encodeURIComponent(waText)}`;

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
              Área Exclusiva · Clientes
            </div>
          </Link>
        </div>

        <div className="max-w-md">
          <div className="font-serif text-[3rem] leading-[1.04] tracking-editorial">
            Estratégia patrimonial,
            <br />
            <span className="italic text-gold-400">leitura de cenário</span>
            <br />e relacionamento.
          </div>
          <p className="mt-8 text-[0.95rem] leading-relaxed text-paper-100/65">
            Uma central privada de inteligência financeira para clientes — vídeos,
            relatórios curados, agenda de eventos e acompanhamento próximo.
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
              Área Exclusiva
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
                  Entre na sua{" "}
                  <span className="italic text-navy-800">central privada</span>.
                </h1>
                <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-600">
                  O acesso é por convite. Use o email cadastrado para receber um
                  link seguro de entrada — sem senhas.
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

          {/* ─── LEAD: email não autorizado, captação de interesse ─── */}
          {mode === "lead" && (
            <>
              <div className="mt-10 lg:mt-0">
                <div className="text-[0.7rem] uppercase tracking-wider3 text-gold-600">
                  Acesso por convite
                </div>
                <h1 className="mt-4 font-serif text-[2.2rem] leading-[1.06] tracking-editorial text-ink-900 md:text-[2.5rem]">
                  Esse email ainda não tem{" "}
                  <span className="italic text-navy-800">acesso</span>.
                </h1>
                <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-600">
                  A área é por convite individual. Deixe seu interesse abaixo e
                  retorno pessoalmente — ou fale comigo agora pelo WhatsApp.
                </p>
              </div>

              <form onSubmit={onLeadSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wider2 text-muted-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="mt-2 block w-full border-b border-ink-900/15 bg-transparent py-3 text-[0.95rem] text-muted-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="text-[0.7rem] uppercase tracking-wider2 text-muted-500"
                  >
                    Seu nome
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo"
                    className="mt-2 block w-full border-b border-ink-900/25 bg-transparent py-3 text-[1rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="text-[0.7rem] uppercase tracking-wider2 text-muted-500"
                  >
                    Telefone · com DDD
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 91234-5678"
                    className="mt-2 block w-full border-b border-ink-900/25 bg-transparent py-3 text-[1rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="text-[0.7rem] uppercase tracking-wider2 text-muted-500"
                  >
                    Mensagem · opcional
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Conte brevemente o que despertou seu interesse"
                    rows={3}
                    className="mt-2 block w-full resize-none border-b border-ink-900/25 bg-transparent py-3 text-[0.98rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900"
                  />
                </div>

                {error && (
                  <div className="text-[0.85rem] text-red-700">{error}</div>
                )}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading || !name.trim() || phone.replace(/\D/g, "").length < 10}
                    className="inline-flex flex-1 items-center justify-center gap-3 bg-ink-900 px-6 py-4 text-[0.72rem] uppercase tracking-wider2 text-paper-50 transition-all duration-300 hover:bg-navy-800 disabled:opacity-60"
                  >
                    {loading ? "Enviando..." : "Solicitar acesso"}
                  </button>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 border border-ink-900 px-6 py-4 text-[0.72rem] uppercase tracking-wider2 text-ink-900 transition-all duration-300 hover:bg-ink-900 hover:text-paper-50"
                  >
                    Falar no WhatsApp
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMode("init");
                    setError(null);
                  }}
                  className="mt-2 text-[0.8rem] text-muted-500 underline underline-offset-4 hover:text-ink-900"
                >
                  ← Usar outro email
                </button>
              </form>
            </>
          )}

          {/* ─── LEAD_SENT: interesse registrado ─── */}
          {mode === "lead_sent" && (
            <div className="mt-10 border border-ink-900/15 bg-paper-200/40 p-6 lg:mt-0">
              <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
                Interesse registrado
              </div>
              <p className="mt-3 text-[1rem] leading-relaxed text-ink-900">
                Obrigado, {name || "tudo bem"}. Recebi sua mensagem e retorno
                pessoalmente em até um dia útil.
              </p>
              <p className="mt-4 text-[0.92rem] leading-relaxed text-muted-600">
                Se preferir conversar agora, fale comigo direto pelo WhatsApp:
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-3 bg-[#25D366] px-6 py-3 text-[0.72rem] uppercase tracking-wider2 text-white transition-all duration-300 hover:bg-[#1ebe57]"
              >
                Abrir conversa no WhatsApp →
              </a>
            </div>
          )}

          {/* ─── Rodapé contato ─── */}
          {mode !== "lead_sent" && (
            <div className="mt-12 border-t border-paper-300/70 pt-6 text-[0.78rem] leading-relaxed text-muted-500">
              Dúvidas sobre acesso? Fale pelo{" "}
              <a
                href="https://wa.me/5511932212045?text=Ol%C3%A1%20Gustavo%2C%20gostaria%20de%20solicitar%20acesso%20%C3%A0%20%C3%A1rea%20exclusiva."
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-900 underline underline-offset-4 hover:text-navy-800"
              >
                WhatsApp
              </a>{" "}
              ou pelo email{" "}
              <a
                href="mailto:gustavo.mendonca@valorinvestimentos.com.br"
                className="text-ink-900 underline underline-offset-4 hover:text-navy-800"
              >
                gustavo.mendonca@valorinvestimentos.com.br
              </a>
              .
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
