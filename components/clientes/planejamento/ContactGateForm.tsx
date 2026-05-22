"use client";

import { useState, useTransition } from "react";
import TurnstileWidget from "@/components/TurnstileWidget";

type Props = {
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  registerContact: (data: {
    name: string;
    phone: string;
    email?: string;
    consent: boolean;
    /** Honeypot — sempre vazio quando humano. Bots costumam preencher. */
    website?: string;
    /** Token do Cloudflare Turnstile (anti-bot). Vazio em dev / sem CF. */
    turnstileToken?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  /** URL pra onde redirecionar após sucesso */
  nextHref: string;
};

function isValidBRPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

function formatPhoneMask(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function ContactGateForm({
  defaultName = "",
  defaultPhone = "",
  defaultEmail = "",
  registerContact,
  nextHref,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [consent, setConsent] = useState(false);
  // Honeypot — campo invisível. Se for preenchido = bot.
  const [website, setWebsite] = useState("");
  // Token Turnstile (vazio enquanto não houver desafio resolvido)
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setError("Nome muito curto.");
      return;
    }
    if (!isValidBRPhone(trimmedPhone)) {
      setError("Telefone inválido. Use DDD + número (ex: (11) 91234-5678).");
      return;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Email inválido.");
      return;
    }
    if (!consent) {
      setError("Você precisa aceitar a Política de Privacidade pra continuar.");
      return;
    }

    startTransition(async () => {
      const result = await registerContact({
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail || undefined,
        consent,
        website, // honeypot — server rejeita silenciosamente se preenchido
        turnstileToken,
      });
      if (!result.ok) {
        setError(result.error ?? "Falha ao registrar.");
        return;
      }
      window.location.href = nextHref;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <label className="block">
        <span className="text-[0.7rem] uppercase tracking-wider2 text-muted-500">
          Nome completo
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
          autoFocus
          className="mt-3 block w-full border-b border-ink-900/25 bg-transparent py-3 text-[1.1rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900"
          placeholder="Como você se chama"
        />
      </label>

      <label className="block">
        <span className="text-[0.7rem] uppercase tracking-wider2 text-muted-500">
          WhatsApp · DDD + número
        </span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
          autoComplete="tel"
          required
          inputMode="numeric"
          className="mt-3 block w-full border-b border-ink-900/25 bg-transparent py-3 text-[1.1rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900"
          placeholder="(11) 91234-5678"
        />
      </label>

      <label className="block">
        <span className="text-[0.7rem] uppercase tracking-wider2 text-muted-500">
          Email (opcional)
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="mt-3 block w-full border-b border-ink-900/25 bg-transparent py-3 text-[1.1rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900"
          placeholder="seu@email.com"
        />
      </label>

      {/* Honeypot — invisível pra humanos, tentador pra bots */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
        <label>
          Website (não preencher)
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {/* Consentimento LGPD — obrigatório */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-ink-900"
        />
        <span className="text-[0.82rem] leading-relaxed text-muted-600 group-hover:text-ink-700">
          Li e concordo com a{" "}
          <a
            href="/politica-de-privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-900 underline underline-offset-2 hover:text-gold-600"
          >
            Política de Privacidade
          </a>
          . Autorizo o uso dos meus dados pra envio do meu plano e eventual
          contato pelo assessor sobre o conteúdo do estudo.
        </span>
      </label>

      {/* Turnstile widget — só aparece se desafio for necessário (e se configurado) */}
      <TurnstileWidget onToken={setTurnstileToken} />

      {error && (
        <div className="border border-red-600/30 bg-red-600/5 px-4 py-3 text-[0.9rem] text-red-700">
          {error}
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-3 bg-ink-900 px-8 py-4 text-[0.72rem] uppercase tracking-wider2 text-paper-50 transition-all duration-300 hover:bg-navy-800 disabled:opacity-60"
        >
          {pending ? "Liberando ferramenta..." : "Iniciar planejamento"}
          {!pending && <span aria-hidden>→</span>}
        </button>
      </div>

      <p className="text-[0.72rem] leading-relaxed text-muted-500">
        Ao iniciar, você concorda em ser contatado eventualmente pelo Gustavo
        (assessor) sobre o seu plano. Seus dados não são compartilhados com
        terceiros. O preenchimento é gratuito e o documento final é
        informativo — não constitui recomendação de investimento.
      </p>
    </form>
  );
}
