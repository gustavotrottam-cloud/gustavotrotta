"use client";

import { useState, useTransition } from "react";
import TurnstileWidget from "@/components/TurnstileWidget";
import { requestDeletion } from "./actions";

type Status =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "submitted" }
  | { phase: "error"; error: string };

export default function DeletionRequestForm() {
  const [status, setStatus] = useState<Status>({ phase: "idle" });
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !consent) return;

    setStatus({ phase: "submitting" });
    startTransition(async () => {
      const fd = new FormData();
      fd.append("email", email.trim());
      fd.append("consent", consent ? "on" : "");
      fd.append("website", website);
      if (turnstileToken) fd.append("cf-turnstile-response", turnstileToken);

      const result = await requestDeletion(fd);
      if (result.ok) {
        setStatus({ phase: "submitted" });
      } else {
        setStatus({ phase: "error", error: result.error });
      }
    });
  };

  if (status.phase === "submitted") {
    return (
      <div className="border border-ink-900/15 bg-paper-100 px-8 py-10">
        <div className="eyebrow text-ink-700">Solicitação registrada</div>
        <h2 className="mt-4 font-serif text-[1.4rem] leading-tight text-ink-900">
          Verifique sua caixa de entrada
        </h2>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-700">
          Se o endereço informado tiver dados conosco, você receberá um email
          com o link de confirmação em até alguns minutos. O link expira em
          30 minutos.
        </p>
        <p className="mt-4 text-[0.88rem] leading-relaxed text-muted-500">
          Confira também a pasta de spam ou promoções. O remetente é{" "}
          <code className="font-mono text-[0.82rem]">onboarding@resend.dev</code>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <label className="block">
        <span className="text-[0.7rem] uppercase tracking-wider2 text-muted-500">
          Email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="mt-3 block w-full border-b border-ink-900/25 bg-transparent py-3 text-[1.1rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900"
          placeholder="seu@email.com"
        />
      </label>

      {/* Honeypot */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
      >
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

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-ink-900"
        />
        <span className="text-[0.85rem] leading-relaxed text-muted-600 group-hover:text-ink-700">
          Confirmo que sou o titular dos dados associados a este endereço de
          email e que entendo que a exclusão é definitiva e irreversível.
        </span>
      </label>

      <TurnstileWidget onToken={setTurnstileToken} />

      {status.phase === "error" && (
        <div className="border border-red-600/30 bg-red-600/5 px-4 py-3 text-[0.9rem] text-red-700">
          {status.error}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending || !email.trim() || !consent}
          className="inline-flex items-center gap-3 bg-ink-900 px-8 py-4 text-[0.72rem] uppercase tracking-wider2 text-paper-50 transition-all duration-300 hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Enviando..." : "Solicitar exclusão"}
        </button>
      </div>
    </form>
  );
}
