import type { Metadata } from "next";
import Container from "@/components/Container";
import Section from "@/components/Section";
import DeletionRequestForm from "./DeletionRequestForm";

export const metadata: Metadata = {
  title: "Exclusão de dados · Gustavo Trotta",
  description:
    "Caminho dedicado para o exercício do direito à exclusão dos dados pessoais, em conformidade com o art. 18 da LGPD.",
  // Página intencionalmente fora da indexação — locável via política de
  // privacidade, mas não promovida pra busca pública.
  robots: { index: false, follow: false },
};

export default function ExcluirDadosPage() {
  return (
    <Section className="pt-40 md:pt-48 lg:pt-52 pb-20 md:pb-28">
      <Container>
        <div className="mx-auto max-w-2xl">
          <div className="eyebrow">LGPD · Art. 18</div>
          <h1 className="mt-6 font-serif text-[2.2rem] leading-[1.05] tracking-editorial text-ink-900 md:text-[2.6rem]">
            Exclusão dos seus dados
          </h1>

          <div className="prose-editorial mt-10 space-y-6 text-[1rem] leading-relaxed text-ink-700">
            <p>
              Você tem o direito de solicitar a exclusão imediata e definitiva
              dos seus dados pessoais coletados por este site e pela ferramenta
              de Planejamento Financeiro.
            </p>
            <p>
              Após sua solicitação, enviaremos um link de confirmação ao seu
              email. Ao clicar nesse link, todos os registros associados ao
              endereço informado serão apagados — incluindo formulários
              preenchidos, planos salvos e dados de contato. Esta ação é
              irreversível.
            </p>
            <p className="text-[0.92rem] text-muted-600">
              Por questão de segurança, o link expira em 30 minutos. Se o
              endereço informado não tiver dados conosco, nenhum email é
              enviado e nenhum registro é criado.
            </p>
          </div>

          <div className="mt-12 border-t border-ink-900/10 pt-12">
            <DeletionRequestForm />
          </div>

          <p className="mt-12 text-[0.85rem] leading-relaxed text-muted-500">
            Para outros direitos previstos no art. 18 (acesso, correção,
            portabilidade, revogação de consentimento), envie um email pra{" "}
            <a
              href="mailto:gustavo.mendonca@valorinvestimentos.com.br"
              className="text-ink-700 underline underline-offset-2 hover:text-gold-600"
            >
              gustavo.mendonca@valorinvestimentos.com.br
            </a>{" "}
            com o assunto "LGPD — solicitação de titular".
          </p>
        </div>
      </Container>
    </Section>
  );
}
