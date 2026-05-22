import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import Sidebar from "@/components/clientes/Sidebar";
import Topbar from "@/components/clientes/Topbar";

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") || "·"
  );
}

function firstName(name: string) {
  return name.split(/\s+/).filter(Boolean)[0] ?? name;
}

/**
 * Layout autenticado de /clientes — sidebar + topbar + checagem server-side.
 * O middleware já redireciona não-autenticados; isso é defesa em camadas.
 */
export default async function AreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Se Supabase não está configurado ainda, mostra a tela de login (que
  // explica como solicitar acesso) em vez de dar 500.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/clientes/login");
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/clientes/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const fullName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Cliente";
  const role: "client" | "admin" = profile?.role === "admin" ? "admin" : "client";

  return (
    <div className="flex min-h-screen bg-paper-200/40">
      <Sidebar userLabel={user.email ?? fullName} role={role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          greeting={`Olá, ${firstName(fullName)}.`}
          initials={initialsFromName(fullName)}
        />
        <main className="flex-1 px-6 py-10 md:px-10 lg:px-12 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
