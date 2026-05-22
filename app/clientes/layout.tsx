import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Layout-base de `/clientes/*`. Intencionalmente minimal: serve apenas como
 * fronteira de privacidade (robots noindex). O layout com sidebar/topbar +
 * checagem de auth vive em `(area)/layout.tsx`. A rota `/clientes/login`
 * passa só por aqui, evitando loop com a redireção do layout autenticado.
 */
export default function ClientesBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
