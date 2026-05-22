"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

/**
 * Widget Cloudflare Turnstile. Renderiza o desafio invisível e devolve o
 * token via callback. O token vai num <input hidden> com name="turnstileToken"
 * pra ser enviado junto com o form.
 *
 * Se NEXT_PUBLIC_TURNSTILE_SITE_KEY não estiver setada, NÃO renderiza nada
 * (modo dev / sem proteção).
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          theme?: "auto" | "light" | "dark";
          appearance?: "always" | "execute" | "interaction-only";
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export default function TurnstileWidget({
  onToken,
}: {
  onToken: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    const tryRender = () => {
      if (!window.turnstile || !containerRef.current) return false;
      if (widgetIdRef.current) return true; // already rendered

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        appearance: "interaction-only", // só aparece se necessário desafio
        theme: "light",
        callback: (token) => onToken(token),
        "error-callback": () => onToken(""),
        "expired-callback": () => onToken(""),
      });
      return true;
    };

    if (!tryRender()) {
      // Script ainda não carregou — tenta novamente em 200ms
      const interval = setInterval(() => {
        if (tryRender()) clearInterval(interval);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [siteKey, onToken]);

  // Sem site key configurada: não renderiza nada (modo dev)
  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div ref={containerRef} />
    </>
  );
}
