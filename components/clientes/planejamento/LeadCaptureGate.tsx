"use client";

import { useState, useTransition } from "react";

type Props = {
  /** True quando o visitante já tem sessão Supabase (cliente logado) */
  isLogged: boolean;
  /** URL do endpoint que serve o PDF — mesmo pra logado e anônimo */
  pdfHref: string;
  /** Pre-fill (caso já tenha capturado antes) */
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  /** Server action que cria/atualiza lead + libera download. Retorna {ok, error?} */
  registerLead: (data: {
    name: string;
    phone: string;
    email?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  /** Server action que apaga o plano atual após download bem-sucedido. */
  resetPlan: () => Promise<{ ok: boolean; error?: string }>;
};

async function downloadPdfBlob(pdfHref: string, filename: string): Promise<void> {
  const resp = await fetch(pdfHref, { credentials: "same-origin" });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`PDF retornou ${resp.status}. ${body.slice(0, 120)}`);
  }
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoga após pequeno delay (alguns browsers precisam do url ainda válido por um instante)
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** Telefone BR: DDD (2 dígitos) + 8 ou 9 dígitos. Aceita formato livre na entrada. */
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

export default function LeadCaptureGate({
  isLogged,
  pdfHref,
  defaultName = "",
  defaultPhone = "",
  defaultEmail = "",
  registerLead,
  resetPlan,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function finalize(): Promise<void> {
    // Download via blob (callback síncrono) + reset + redirect
    const filename = `planejamento-financeiro-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    await downloadPdfBlob(pdfHref, filename);
    await resetPlan();
    // Pequeno delay pra navegador disparar download antes de navegar fora
    setTimeout(() => {
      window.location.href = "/planejamento-financeiro?baixado=1";
    }, 400);
  }

  // Caso logado: botão direto. Mesmo flow de download blob + reset.
  if (isLogged) {
    async function handleLoggedClick(e: React.MouseEvent) {
      e.preventDefault();
      setError(null);
      startTransition(async () => {
        // Marca lead_data com snapshot mínimo (cliente já é conhecido)
        await registerLead({
          name: defaultName || "Cliente logado",
          phone: defaultPhone || "00000000000",
          email: defaultEmail || undefined,
        });
        try {
          await finalize();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Falha no download");
        }
      });
    }

    return (
      <div className="flex items-center justify-between border-y border-paper-300/70 py-4">
        <div className="text-[0.72rem] uppercase tracking-wider2 text-muted-500">
          Documento editorial · 5 páginas
        </div>
        <button
          type="button"
          onClick={handleLoggedClick}
          disabled={pending}
          className="group inline-flex items-center gap-3 border border-ink-900 px-6 py-3 text-[0.7rem] uppercase tracking-wider2 text-ink-900 transition-all duration-300 hover:bg-ink-900 hover:text-paper-50 disabled:opacity-60"
        >
          {pending ? (
            "Gerando PDF..."
          ) : (
            <>
              <DownloadIcon />
              Baixar plano em PDF
            </>
          )}
        </button>
        {error && (
          <div className="ml-4 text-[0.78rem] text-red-700">{error}</div>
        )}
      </div>
    );
  }

  // Anônimo: gate de captura
  if (!expanded) {
    return (
      <div className="border border-ink-900 bg-ink-900 px-8 py-7 text-paper-50">
        <div className="grid items-center gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-400">
              Receber meu plano
            </div>
            <h3 className="mt-2 font-serif text-[1.5rem] leading-[1.15] tracking-editorial md:text-[1.7rem]">
              Documento editorial em PDF —{" "}
              <span className="italic text-gold-400">gratuito</span>.
            </h3>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-paper-100/70">
              5 páginas com capa, projeção, leitura do cenário e disclaimers.
              Pedimos seu nome e telefone pra enviar — e pra eventualmente trocar
              uma palavra sobre o seu plano.
            </p>
          </div>
          <div className="md:col-span-5 md:text-right">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-3 bg-paper-50 px-7 py-4 text-[0.7rem] uppercase tracking-wider2 text-ink-900 transition-all duration-300 hover:bg-gold-400"
            >
              <DownloadIcon />
              Quero meu plano
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form expandido
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

    startTransition(async () => {
      const result = await registerLead({
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail || undefined,
      });
      if (!result.ok) {
        setError(result.error ?? "Falha ao registrar.");
        return;
      }
      try {
        await finalize();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha no download");
      }
    });
  }

  return (
    <div className="border border-ink-900 bg-ink-900 px-8 py-8 text-paper-50">
      <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-400">
        Quase lá
      </div>
      <h3 className="mt-2 font-serif text-[1.5rem] leading-[1.15] tracking-editorial md:text-[1.7rem]">
        Pra onde mando o seu plano?
      </h3>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-wider2 text-paper-100/60">
            Nome completo
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            className="mt-2 block w-full border-b border-paper-100/30 bg-transparent py-3 text-[1rem] text-paper-50 outline-none transition-colors placeholder:text-paper-100/30 focus:border-gold-400"
            placeholder="Como você se chama"
          />
        </label>

        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-wider2 text-paper-100/60">
            WhatsApp · DDD + número
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
            autoComplete="tel"
            required
            inputMode="numeric"
            className="mt-2 block w-full border-b border-paper-100/30 bg-transparent py-3 text-[1rem] text-paper-50 outline-none transition-colors placeholder:text-paper-100/30 focus:border-gold-400"
            placeholder="(11) 91234-5678"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-[0.65rem] uppercase tracking-wider2 text-paper-100/60">
            Email (opcional)
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="mt-2 block w-full border-b border-paper-100/30 bg-transparent py-3 text-[1rem] text-paper-50 outline-none transition-colors placeholder:text-paper-100/30 focus:border-gold-400"
            placeholder="seu@email.com"
          />
        </label>

        {error && (
          <div className="md:col-span-2 border border-gold-400/40 bg-gold-400/10 px-4 py-3 text-[0.85rem] text-gold-200">
            {error}
          </div>
        )}

        <div className="md:col-span-2 mt-4 flex items-center justify-between gap-4 border-t border-paper-100/15 pt-5">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            disabled={pending}
            className="text-[0.7rem] uppercase tracking-wider2 text-paper-100/60 hover:text-paper-50"
          >
            ← Voltar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-3 bg-paper-50 px-7 py-4 text-[0.7rem] uppercase tracking-wider2 text-ink-900 transition-all duration-300 hover:bg-gold-400 disabled:opacity-60"
          >
            {pending ? (
              "Gerando PDF..."
            ) : (
              <>
                <DownloadIcon />
                Baixar plano
              </>
            )}
          </button>
        </div>

        <p className="md:col-span-2 text-[0.72rem] leading-relaxed text-paper-100/55">
          Ao baixar, você concorda em ser contatado eventualmente pelo Gustavo
          (assessor) sobre o seu plano. Seus dados não são compartilhados com
          terceiros. Documento é informativo — não constitui recomendação de
          investimento.
        </p>
      </form>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
