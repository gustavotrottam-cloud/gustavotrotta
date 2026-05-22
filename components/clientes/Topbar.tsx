"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function Topbar({
  greeting,
  initials,
}: {
  greeting: string;
  initials: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSignOut = async () => {
    setLoading(true);
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/clientes/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-paper-300/70 bg-paper-100/85 px-8 backdrop-blur-md">
      <div>
        <div className="text-[0.7rem] uppercase tracking-wider3 text-muted-500">
          Bem-vindo
        </div>
        <div className="mt-1 font-serif text-[1.4rem] tracking-editorial text-ink-900">
          {greeting}
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-[0.85rem] font-medium text-paper-50 transition-transform hover:scale-105"
          aria-label="Menu da conta"
        >
          {initials}
        </button>
        {open && (
          <>
            <button
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-10 cursor-default"
              aria-label="Fechar menu"
            />
            <div className="absolute right-0 top-12 z-20 w-56 border border-paper-300 bg-paper-100 py-2 shadow-xl">
              <button
                onClick={onSignOut}
                disabled={loading}
                className="block w-full px-5 py-3 text-left text-[0.88rem] text-ink-700 transition-colors hover:bg-paper-200 disabled:opacity-50"
              >
                {loading ? "Saindo..." : "Sair"}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
