import type { Metadata } from "next";
import Container from "@/components/Container";
import Section from "@/components/Section";

export const metadata: Metadata = {
  title: "Política de Privacidade · Gustavo Trotta",
  description:
    "Como tratamos os dados pessoais coletados no site e na ferramenta de Planejamento Financeiro, em conformidade com a LGPD (Lei 13.709/2018).",
};

const lastUpdated = "22 de maio de 2026";

export default function PoliticaDePrivacidadePage() {
  return (
    <Section className="pt-40 md:pt-48 lg:pt-52 pb-20 md:pb-28">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="eyebrow">Conformidade · LGPD</div>
          <h1 className="mt-6 font-serif text-[2.4rem] leading-[1.05] tracking-editorial text-ink-900 md:text-[3rem]">
            Política de{" "}
            <span className="italic text-navy-800">Privacidade</span>
          </h1>
          <p className="mt-5 text-[0.92rem] uppercase tracking-wider2 text-muted-500">
            Última atualização · {lastUpdated}
          </p>

          <div className="prose-editorial mt-12 space-y-10 text-[1rem] leading-relaxed text-ink-700">
            {/* Quem é o controlador */}
            <section>
              <h2 className="font-serif text-[1.6rem] tracking-editorial text-ink-900">
                Quem somos
              </h2>
              <p className="mt-4">
                Esta política descreve como{" "}
                <strong>Gustavo Mendonça Trotta</strong>, assessor de
                investimentos autônomo credenciado à XP Investimentos CCTVM
                S.A. e sócio da Valor Investimentos, trata os dados pessoais
                coletados pelo site{" "}
                <strong>gustavotrotta.com.br</strong> e pela ferramenta
                Planejamento Financeiro disponível no domínio.
              </p>
              <p className="mt-4">
                Para fins desta política, somos o{" "}
                <strong>controlador</strong> dos seus dados pessoais, nos
                termos da Lei Geral de Proteção de Dados (Lei 13.709/2018 —
                LGPD).
              </p>
            </section>

            {/* Que dados coletamos */}
            <section>
              <h2 className="font-serif text-[1.6rem] tracking-editorial text-ink-900">
                Que dados coletamos
              </h2>
              <p className="mt-4">
                Coletamos apenas o necessário para entregar a ferramenta e
                eventualmente entrar em contato sobre o seu planejamento:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong>Dados de contato:</strong> nome completo, telefone
                  (WhatsApp) e email (opcional). Coletados na entrada da
                  ferramenta.
                </li>
                <li>
                  <strong>Dados financeiros declarados:</strong> idade, estado
                  civil, número de dependentes, receitas, despesas, patrimônio
                  (financeiro, imobilizado, societário), objetivos de
                  aposentadoria, premissas econômicas escolhidas. Esses dados
                  são fornecidos exclusivamente por você ao preencher as
                  etapas do planejamento.
                </li>
                <li>
                  <strong>Dados técnicos:</strong> endereço IP, agente do
                  navegador, identificador de sessão (cookie). Usados pra
                  funcionamento básico da ferramenta e segurança contra abuso.
                </li>
                <li>
                  <strong>Mensagens enviadas:</strong> texto livre que você
                  envia pelo formulário de contato.
                </li>
              </ul>
              <p className="mt-4 text-muted-600">
                <strong>O que NÃO coletamos:</strong> número de CPF, RG,
                documentos oficiais, dados bancários, senhas, informações de
                saúde, dados de cartão de crédito, dados de menores de idade
                conscientemente.
              </p>
            </section>

            {/* Por que coletamos (base legal) */}
            <section>
              <h2 className="font-serif text-[1.6rem] tracking-editorial text-ink-900">
                Por que coletamos
              </h2>
              <p className="mt-4">As finalidades do tratamento são:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong>Geração do plano patrimonial</strong> — usar os
                  dados financeiros declarados pra calcular projeções e
                  produzir o documento em PDF que você baixa.{" "}
                  <em>Base legal: execução de procedimentos preliminares a um
                  serviço — Art. 7º, V da LGPD.</em>
                </li>
                <li>
                  <strong>Contato comercial sobre o estudo</strong> — entrar
                  em contato com você sobre o resultado do planejamento, com
                  base no consentimento explícito que você dá ao iniciar a
                  ferramenta. <em>Base legal: consentimento — Art. 7º, I.</em>
                </li>
                <li>
                  <strong>Segurança e prevenção a fraude</strong> — logs
                  técnicos pra evitar abuso, spam e ataques. <em>Base legal:
                  legítimo interesse — Art. 7º, IX.</em>
                </li>
              </ul>
              <p className="mt-4">
                Não usamos seus dados pra marketing em massa, perfilamento
                publicitário automatizado ou venda a terceiros.
              </p>
            </section>

            {/* Com quem compartilhamos */}
            <section>
              <h2 className="font-serif text-[1.6rem] tracking-editorial text-ink-900">
                Com quem compartilhamos
              </h2>
              <p className="mt-4">
                Seus dados são processados por nós e por{" "}
                <strong>operadores</strong> contratados (subprocessadores) que
                executam funções técnicas em nosso nome:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong>Supabase Inc.</strong> — banco de dados e
                  armazenamento (hospedagem na região de São Paulo, AWS).
                </li>
                <li>
                  <strong>Vercel Inc.</strong> — hospedagem da aplicação web.
                </li>
                <li>
                  <strong>Resend Inc.</strong> — entrega de emails
                  transacionais.
                </li>
                <li>
                  <strong>Cloudflare Inc.</strong> — proteção contra ataques e
                  CDN.
                </li>
              </ul>
              <p className="mt-4">
                Esses operadores estão contratualmente obrigados a tratar
                seus dados apenas pelas finalidades acima, sem reutilização
                para fins próprios. Para acesso interno, apenas Gustavo Trotta
                (controlador) acessa seus dados completos via área
                administrativa do site.
              </p>
              <p className="mt-4">
                <strong>Não vendemos, alugamos nem cedemos</strong> seus
                dados a anunciantes, parceiros comerciais ou qualquer terceiro
                não listado acima.
              </p>
            </section>

            {/* Por quanto tempo guardamos */}
            <section>
              <h2 className="font-serif text-[1.6rem] tracking-editorial text-ink-900">
                Por quanto tempo guardamos
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong>Dados de contato (lead):</strong> mantidos enquanto
                  houver interesse comercial recíproco. Leads sem interação
                  por 24 meses são anonimizados ou excluídos.
                </li>
                <li>
                  <strong>Dados do plano patrimonial:</strong> mantidos junto
                  ao lead pelo mesmo prazo (24 meses) ou até você solicitar
                  exclusão.
                </li>
                <li>
                  <strong>Logs técnicos:</strong> retidos por até 6 meses
                  para fins de segurança e auditoria.
                </li>
                <li>
                  <strong>Emails enviados:</strong> conforme política do
                  provedor de email (Resend), tipicamente 7 dias.
                </li>
              </ul>
            </section>

            {/* Seus direitos */}
            <section>
              <h2 className="font-serif text-[1.6rem] tracking-editorial text-ink-900">
                Seus direitos como titular
              </h2>
              <p className="mt-4">
                A LGPD garante a você, a qualquer momento, gratuitamente:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Confirmação de que tratamos seus dados</li>
                <li>Acesso aos dados que temos sobre você</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                <li>
                  Anonimização, bloqueio ou eliminação de dados desnecessários
                  ou tratados em desconformidade
                </li>
                <li>
                  Portabilidade dos dados a outro fornecedor de serviço, mediante
                  requisição expressa
                </li>
                <li>
                  Eliminação dos dados pessoais tratados com seu consentimento
                </li>
                <li>
                  Informação sobre as entidades públicas e privadas com as
                  quais compartilhamos seus dados
                </li>
                <li>
                  Revogação do consentimento a qualquer momento
                </li>
                <li>Reclamação à ANPD (Autoridade Nacional de Proteção de Dados)</li>
              </ul>
              <p className="mt-4">
                Para exercer qualquer um desses direitos, envie um email pra{" "}
                <a
                  href="mailto:gustavo.mendonca@valorinvestimentos.com.br"
                  className="text-ink-900 underline underline-offset-2 hover:text-gold-600"
                >
                  gustavo.mendonca@valorinvestimentos.com.br
                </a>{" "}
                com o assunto <strong>"LGPD — solicitação de titular"</strong>.
                Responderemos em até 15 dias.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="font-serif text-[1.6rem] tracking-editorial text-ink-900">
                Cookies e tecnologias similares
              </h2>
              <p className="mt-4">
                Usamos cookies estritamente necessários pra funcionamento da
                ferramenta:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong>pf_anon</strong> — identificador de sessão anônimo
                  no Planejamento Financeiro, válido por 90 dias. Permite
                  você retomar o preenchimento se voltar.
                </li>
                <li>
                  <strong>sb-*</strong> — cookies do Supabase Auth (apenas
                  para usuários logados na Área Exclusiva).
                </li>
              </ul>
              <p className="mt-4">
                Não usamos cookies de rastreamento publicitário, Google
                Analytics, Meta Pixel ou similares.
              </p>
            </section>

            {/* Segurança */}
            <section>
              <h2 className="font-serif text-[1.6rem] tracking-editorial text-ink-900">
                Segurança
              </h2>
              <p className="mt-4">
                Aplicamos medidas técnicas e administrativas razoáveis pra
                proteger seus dados:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Criptografia em trânsito (HTTPS/TLS 1.3 em todas as conexões)</li>
                <li>Criptografia em repouso (AES-256 no banco de dados)</li>
                <li>
                  Controle de acesso por papel (Row-Level Security no PostgreSQL)
                </li>
                <li>Autenticação sem senha (magic link) para a área administrativa</li>
                <li>Rate limiting e proteção contra bots nos formulários</li>
                <li>Backups automáticos diários do banco de dados</li>
                <li>Logs de auditoria pra acessos administrativos</li>
              </ul>
              <p className="mt-4">
                Mesmo com essas medidas, nenhum sistema é 100% imune. Caso
                identifiquemos um incidente de segurança com risco aos seus
                dados, comunicaremos você e a ANPD em prazo razoável, conforme
                Art. 48 da LGPD.
              </p>
            </section>

            {/* DPO e contato */}
            <section>
              <h2 className="font-serif text-[1.6rem] tracking-editorial text-ink-900">
                Encarregado (DPO) e contato
              </h2>
              <p className="mt-4">
                O encarregado pela proteção de dados pessoais (DPO) é o
                próprio controlador:
              </p>
              <div className="mt-4 border border-paper-300/70 bg-paper-100 px-5 py-4">
                <div className="font-serif text-[1.1rem] text-ink-900">
                  Gustavo Mendonça Trotta
                </div>
                <div className="mt-1 text-[0.9rem] text-muted-600">
                  Email:{" "}
                  <a
                    href="mailto:gustavo.mendonca@valorinvestimentos.com.br"
                    className="text-ink-900 hover:underline"
                  >
                    gustavo.mendonca@valorinvestimentos.com.br
                  </a>
                </div>
                <div className="text-[0.9rem] text-muted-600">
                  WhatsApp: +55 11 93221-2045
                </div>
                <div className="text-[0.9rem] text-muted-600">
                  São Paulo · Brasil
                </div>
              </div>
            </section>

            {/* Mudanças */}
            <section>
              <h2 className="font-serif text-[1.6rem] tracking-editorial text-ink-900">
                Alterações nesta política
              </h2>
              <p className="mt-4">
                Esta política pode ser atualizada conforme evolução da
                ferramenta ou da legislação aplicável. Mudanças relevantes são
                comunicadas com pelo menos 15 dias de antecedência por email
                aos titulares ativos. A versão atual está sempre disponível
                nesta página, com a data da última atualização no topo.
              </p>
            </section>

            {/* Disclaimer */}
            <section className="border-t border-paper-300/70 pt-8">
              <p className="text-[0.82rem] text-muted-500">
                Esta política aplica-se ao site gustavotrotta.com.br e à
                ferramenta de Planejamento Financeiro. Operações financeiras
                executadas dentro da XP Investimentos são regidas pela
                política de privacidade própria da XP.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </Section>
  );
}
