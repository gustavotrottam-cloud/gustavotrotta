import type { Metadata } from "next";
import Container from "@/components/Container";
import Section from "@/components/Section";
import { confirmDeletion } from "./actions";

export const metadata: Metadata = {
  title: "Confirmar exclusão · Gustavo Trotta",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: { token?: string };
};

export default async function ConfirmarExclusaoPage({ searchParams }: Props) {
  const token = searchParams.token?.trim() ?? "";
  const result = await confirmDeletion(token);

  return (
    <Section className="pt-40 md:pt-48 lg:pt-52 pb-20 md:pb-28">
      <Container>
        <div className="mx-auto max-w-2xl">
          <div className="eyebrow">LGPD · Art. 18</div>
          {result.ok ? (
            <>
              <h1 className="mt-6 font-serif text-[2.2rem] leading-[1.05] tracking-editorial text-ink-900 md:text-[2.6rem]">
                Dados excluídos
              </h1>
              <div className="prose-editorial mt-10 space-y-6 text-[1rem] leading-relaxed text-ink-700">
                <p>
                  A exclusão dos seus dados foi concluída com sucesso. Os
                  registros listados abaixo foram apagados de forma definitiva
                  do nosso sistema:
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-[0.95rem]">
                  <li>
                    {result.stats.leads} registro
                    {result.stats.leads === 1 ? "" : "s"} de contato (leads)
                  </li>
                  <li>
                    {result.stats.planning_plans} plano
                    {result.stats.planning_plans === 1 ? "" : "s"} financeiro
                    {result.stats.planning_plans === 1 ? "" : "s"} salvo
                    {result.stats.planning_plans === 1 ? "" : "s"}
                  </li>
                  {result.stats.auth_users > 0 && (
                    <li>1 conta de acesso (autenticação)</li>
                  )}
                </ul>
                <p className="text-[0.92rem] text-muted-600">
                  Esta ação não pode ser desfeita. Mantemos apenas um registro
                  anonimizado dessa solicitação (sem seu email ou identidade)
                  para fins de auditoria de conformidade LGPD.
                </p>
                <p className="text-[0.92rem] text-muted-600">
                  Se você quiser interagir novamente conosco no futuro,
                  precisará preencher os formulários do site normalmente — não
                  há histórico nosso pra retomar.
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-6 font-serif text-[2.2rem] leading-[1.05] tracking-editorial text-ink-900 md:text-[2.6rem]">
                {result.reason === "already_done"
                  ? "Já realizada"
                  : result.reason === "expired"
                  ? "Link expirado"
                  : "Não foi possível confirmar"}
              </h1>
              <div className="prose-editorial mt-10 space-y-6 text-[1rem] leading-relaxed text-ink-700">
                <p>{result.message}</p>
                {(result.reason === "expired" ||
                  result.reason === "invalid") && (
                  <p>
                    Você pode iniciar uma nova solicitação em{" "}
                    <a
                      href="/politica-de-privacidade/excluir-dados"
                      className="text-ink-900 underline underline-offset-2 hover:text-gold-600"
                    >
                      /politica-de-privacidade/excluir-dados
                    </a>
                    .
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </Container>
    </Section>
  );
}
