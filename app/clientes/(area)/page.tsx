import DashboardCard from "@/components/clientes/DashboardCard";

export default function ClientesDashboard() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Intro */}
      <div className="max-w-2xl">
        <div className="eyebrow">Dashboard</div>
        <h1 className="mt-4 font-serif text-[2.2rem] leading-[1.05] tracking-editorial text-ink-900 md:text-[2.8rem]">
          Sua central de{" "}
          <span className="italic text-navy-800">inteligência financeira</span>.
        </h1>
        <p className="mt-5 text-[1rem] leading-relaxed text-muted-600">
          Resumo de cenário, materiais selecionados, agenda de encontros e
          conteúdos curados — pensados para acompanhar o seu patrimônio com
          continuidade.
        </p>
      </div>

      {/* Highlights row — cenário em destaque */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <DashboardCard
            eyebrow="Cenário desta semana"
            title={
              <>
                Política monetária e renda fixa
                <br />
                <span className="italic">no meio de 2026.</span>
              </>
            }
            href="/clientes/mercado"
            cta="Ler análise completa"
            accent
          >
            Leitura semanal sobre o ciclo de juros, expectativas de inflação,
            curva de Treasuries e o que isso significa para a estrutura da
            carteira nos próximos trimestres. Atualizado às segundas-feiras.
          </DashboardCard>
        </div>

        <DashboardCard
          eyebrow="Próximo encontro"
          title="Live · Q&A de meio de ano"
          href="/clientes/agenda"
          cta="Confirmar presença"
        >
          Quarta-feira, 19h. Cenário macro do segundo semestre, alocação e
          perguntas dos clientes ao vivo.
        </DashboardCard>
      </div>

      {/* Secondary grid — áreas */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          eyebrow="Em destaque · Vídeo"
          title="Dividendos, PIB dos EUA e o que move o Ibovespa"
          href="/clientes/mercado"
          cta="Assistir"
        >
          Participação no Giro do Mercado (Money Times). Comentário de 8 minutos
          sobre o que está movimentando o pregão.
        </DashboardCard>

        <DashboardCard
          eyebrow="Biblioteca · Previdência"
          title="3 novos materiais sobre PGBL e VGBL"
          href="/clientes/biblioteca"
          cta="Acessar"
        >
          PDFs, comparativos e checklists para entender quando cada veículo
          faz sentido no seu plano de longo prazo.
        </DashboardCard>

        <DashboardCard
          eyebrow="Research"
          title="Carta da gestora · Selic estrutural"
          href="/clientes/research"
          cta="Ler resumo executivo"
        >
          Tese sobre o nível terminal da Selic e implicações para crédito
          privado. Resumo executivo + insights destacados.
        </DashboardCard>

        <DashboardCard
          eyebrow="Recomendado · Sucessão"
          title="Holding familiar: vale a pena no seu caso?"
          href="/clientes/biblioteca"
          cta="Ler artigo"
        >
          Framework para decidir entre holding, doação em vida e testamento.
          Conteúdo personalizado para o seu perfil.
        </DashboardCard>

        <DashboardCard
          eyebrow="Sua próxima revisão"
          title="Revisão semestral de carteira"
          href="/clientes/agenda"
          cta="Agendar"
        >
          Encontro privado para revisar alocação, objetivos e cenário.
          Recomendamos a cada 6 meses.
        </DashboardCard>

        <DashboardCard
          eyebrow="Perguntas"
          title="Tem uma dúvida específica?"
          href="/clientes/perguntas"
          cta="Pesquisar ou enviar"
        >
          Central de dúvidas sobre investimentos, planejamento, tributação e
          sucessão. Respostas curadas e canal direto.
        </DashboardCard>
      </div>

      {/* Footnote */}
      <div className="mt-16 border-t border-paper-300/70 pt-6 text-[0.75rem] leading-relaxed text-muted-500">
        Conteúdo de uso exclusivo para clientes. Não constitui recomendação de
        investimento. Decisões de alocação devem considerar perfil, objetivos
        e situação patrimonial individuais.
      </div>
    </div>
  );
}
