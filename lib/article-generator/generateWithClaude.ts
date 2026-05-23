import Anthropic from "@anthropic-ai/sdk";
import type { GeneratedArticle } from "./types";

export type AvailableCategory = {
  slug: string;
  name: string;
  area: string;
  description?: string;
};

const SYSTEM_PROMPT = `Você é o assessor de investimentos Gustavo Trotta, sócio da Valor Investimentos / XP. Está reescrevendo a transcrição de um vídeo seu (gravado por você mesmo) como artigos editoriais para o seu site institucional.

REGRAS DE TOM (obrigatórias):
- Primeira pessoa autoral: "acompanho", "observo", "nas conversas com clientes", "trago aqui".
- Estilo editorial premium boutique / family office. Frases curtas, dois pontos como recurso, elegância sintática.
- Zero oralidade: NUNCA use "né", "tá", "pessoal", "cara", "obviamente", reticências, exclamações.
- NUNCA: recomendações de compra/venda, promessas de retorno, "vai subir/cair", linguagem de vendedor.
- Disclaimer educacional ao final de cada artigo (eu adiciono via blockquote): "Este conteúdo tem caráter educacional e reflete análise de cenário no momento da publicação. Não constitui recomendação personalizada de investimento. Decisões patrimoniais devem considerar o perfil, os objetivos e o horizonte de cada investidor."
- Link inline ao final apontando pro vídeo original: "A análise completa em vídeo: [Comentário mensal de mercado · {mês ano} →](URL)"

ESTRUTURA DE CADA ARTIGO:
- Lead (1 parágrafo): contextualiza tema sem rodeio.
- 3 a 5 subseções com h2.
- Cada subseção: 1 a 2 parágrafos.
- Fechamento (1 parágrafo, sem h2): conclusão prática.
- Blockquote com o disclaimer.
- Parágrafo final com link pro vídeo.

QUANTOS ARTIGOS:
- 1 artigo se o vídeo é monotemático (um único assunto profundo).
- 2 a 4 artigos se o vídeo tem temas distintos que conversam mas não são o mesmo (ex: review mensal cobrindo cenário global + Brasil + alocação).
- Cada artigo deve poder ser lido isolado, mas pode citar "como tratei em outro artigo" se fizer sentido.

CATEGORIA:
- Escolha UMA das categorias disponíveis (vou listar). Use o slug exato.
- Se nada combinar, prefira a mais ampla disponível.

HERO IMAGE (heroPrompt + heroAlt):
- Escreva um prompt em INGLÊS para gerar imagem via FLUX em estilo editorial premium.
- NÃO use clichês de bolsa, gráficos, dinheiro, dollar signs, suit-and-tie executives.
- Prefira: arquitetura clássica/moderna, composições atmosféricas, ainda lifes minimalistas, paisagens conceituais, objetos abstratos em equilíbrio.
- Sempre inclua: "editorial photography, premium financial publication aesthetic, no text, no people, no logos, no charts, no money, cinematic light, fine grain texture".
- Paleta: navy/ink/paper/gold (cores do site).
- heroAlt em português, curto (1 frase), descrevendo a cena.

FORMATO DE SAÍDA — JSON ESTRITO:
Retorne APENAS um objeto JSON válido com este schema, sem markdown wrap, sem explicação antes ou depois:
{
  "articles": [
    {
      "title": "string sem ponto final",
      "slug": "kebab-case-sem-acentos",
      "excerpt": "string de 1-2 linhas (máx 320 chars)",
      "categorySlug": "slug-exato-de-uma-categoria-disponivel",
      "tags": ["3 a 6 tags em lowercase"],
      "readingTimeMin": número 3-8,
      "body": [
        { "style": "normal", "text": "lead..." },
        { "style": "h2", "text": "Subtítulo" },
        { "style": "normal", "text": "parágrafo..." }
      ],
      "heroPrompt": "prompt em inglês",
      "heroAlt": "descrição curta em português"
    }
  ]
}`;

export async function generateArticlesFromTranscript(opts: {
  transcript: string;
  videoUrl: string;
  videoId: string;
  durationSec: number;
  categories: AvailableCategory[];
  apiKey: string;
}): Promise<{ articles: GeneratedArticle[]; usage?: unknown }> {
  const client = new Anthropic({ apiKey: opts.apiKey });

  const categoryLines = opts.categories
    .map((c) => `- "${c.slug}" (${c.name})${c.description ? ` — ${c.description}` : ""}`)
    .join("\n");

  const userMessage = `Vídeo: ${opts.videoUrl}
Duração: ${Math.floor(opts.durationSec / 60)} min ${opts.durationSec % 60}s
Data de hoje: ${new Date().toLocaleDateString("pt-BR", { dateStyle: "long" })}

CATEGORIAS DISPONÍVEIS (escolha categorySlug exato):
${categoryLines}

INSTRUÇÃO ESPECIAL pro link final do vídeo: use exatamente "${opts.videoUrl}" como href.

TRANSCRIÇÃO (transcrita automaticamente — pode ter erros menores em termos técnicos como CDI, Selic, IPCA, NTN-B etc., corrija ao reescrever):

${opts.transcript}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  // Concatena texto da resposta (pode vir em múltiplos content blocks)
  const rawText = response.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Tenta extrair JSON — pode vir com fences ```json ou puro
  let jsonText = rawText.trim();
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonText = fenceMatch[1].trim();

  let parsed: { articles: GeneratedArticle[] };
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(
      `Falha ao parsear JSON da Claude. Trecho: ${jsonText.slice(0, 300)}...`
    );
  }

  if (!parsed.articles || !Array.isArray(parsed.articles) || parsed.articles.length === 0) {
    throw new Error("Claude retornou JSON sem articles[] válido");
  }

  // Validações mínimas + normalizações
  parsed.articles.forEach((a, i) => {
    if (!a.title) throw new Error(`Artigo ${i} sem title`);
    if (!a.slug) throw new Error(`Artigo ${i} sem slug`);
    if (!a.body || a.body.length === 0)
      throw new Error(`Artigo ${i} sem body`);
    if (!a.categorySlug)
      throw new Error(`Artigo ${i} sem categorySlug`);
    if (!a.heroPrompt)
      throw new Error(`Artigo ${i} sem heroPrompt`);
  });

  return { articles: parsed.articles, usage: response.usage };
}
