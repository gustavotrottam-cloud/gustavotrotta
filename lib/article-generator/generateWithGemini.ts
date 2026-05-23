import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
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
- Disclaimer educacional ao final (via blockquote): "Este conteúdo tem caráter educacional e reflete análise de cenário no momento da publicação. Não constitui recomendação personalizada de investimento. Decisões patrimoniais devem considerar o perfil, os objetivos e o horizonte de cada investidor."
- Último bloco do body: parágrafo com link inline pro vídeo, usando o campo "link" do schema.

ESTRUTURA DE CADA ARTIGO:
- Lead (1 parágrafo style "normal"): contextualiza tema sem rodeio.
- 3 a 5 subseções com style "h2" + 1-2 parágrafos style "normal" cada.
- Fechamento (1 parágrafo style "normal", sem h2): conclusão prática.
- Bloco style "blockquote" com o disclaimer educacional.
- Bloco final style "normal" com link inline (campo "link") pro vídeo: text = "A análise completa em vídeo: ", link.text = "Comentário mensal · {mês ano} →", link.href = URL do vídeo.

QUANTOS ARTIGOS:
- 1 artigo se o vídeo é monotemático (um único assunto profundo).
- 2 a 4 artigos se o vídeo tem temas distintos (ex: review mensal cobrindo cenário global + Brasil + alocação).
- Cada artigo deve poder ser lido isolado, mas pode citar "como tratei em outro artigo" se fizer sentido.

CATEGORIA:
- Escolha UMA das categorias listadas no input. Use o slug exato.
- Se nada combinar, prefira a mais ampla disponível.

HERO IMAGE (heroPrompt + heroAlt):
- heroPrompt em INGLÊS para gerar imagem via FLUX em estilo editorial premium.
- NÃO use clichês de bolsa, gráficos, dinheiro, dollar signs, suit-and-tie executives.
- Prefira: arquitetura clássica/moderna, composições atmosféricas, ainda lifes minimalistas, objetos abstratos em equilíbrio.
- Sempre inclua: "editorial photography, premium financial publication aesthetic, no text, no people, no logos, no charts, no money, cinematic light, fine grain texture".
- Paleta: navy/ink/paper/gold (cores do site).
- heroAlt em português, curto (1 frase), descrevendo a cena.

ESCRITA NORMALIZADA:
- Corrija erros comuns de transcrição automática (CDI, Selic, IPCA, NTN-B, S&P, COPOM, EBITDA etc.)
- Use números por extenso quando suaviza a leitura ("sessenta e um meses" em vez de "61 meses" em prosa fluida; "1,4 a 1,5" mantém em dado técnico)
- Cite porcentagens com vírgula como decimal (formato brasileiro)`;

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    articles: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Título sem ponto final" },
          slug: { type: SchemaType.STRING, description: "kebab-case sem acentos" },
          excerpt: { type: SchemaType.STRING, description: "1-2 linhas, máx 320 chars" },
          categorySlug: { type: SchemaType.STRING, description: "slug exato de uma categoria disponível" },
          tags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "3 a 6 tags em lowercase",
          },
          readingTimeMin: { type: SchemaType.NUMBER, description: "minutos de leitura, 3-8" },
          heroPrompt: { type: SchemaType.STRING, description: "prompt em inglês pra FLUX" },
          heroAlt: { type: SchemaType.STRING, description: "alt em português, 1 frase curta" },
          body: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                style: {
                  type: SchemaType.STRING,
                  enum: ["normal", "h2", "h3", "blockquote"],
                },
                text: { type: SchemaType.STRING },
                link: {
                  type: SchemaType.OBJECT,
                  nullable: true,
                  properties: {
                    text: { type: SchemaType.STRING },
                    href: { type: SchemaType.STRING },
                  },
                },
              },
              required: ["style", "text"],
            },
          },
        },
        required: [
          "title",
          "slug",
          "excerpt",
          "categorySlug",
          "tags",
          "readingTimeMin",
          "heroPrompt",
          "heroAlt",
          "body",
        ],
      },
    },
  },
  required: ["articles"],
};

export async function generateArticlesFromTranscript(opts: {
  transcript: string;
  videoUrl: string;
  videoId: string;
  durationSec: number;
  categories: AvailableCategory[];
  apiKey: string;
}): Promise<{ articles: GeneratedArticle[]; usage?: unknown }> {
  const client = new GoogleGenerativeAI(opts.apiKey);
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responseSchema: responseSchema as any,
      temperature: 0.7,
      maxOutputTokens: 16000,
    },
  });

  const categoryLines = opts.categories
    .map(
      (c) =>
        `- "${c.slug}" (${c.name})${c.description ? ` — ${c.description}` : ""}`
    )
    .join("\n");

  const userMessage = `Vídeo: ${opts.videoUrl}
Duração: ${Math.floor(opts.durationSec / 60)} min ${opts.durationSec % 60}s
Data de hoje: ${new Date().toLocaleDateString("pt-BR", { dateStyle: "long" })}

CATEGORIAS DISPONÍVEIS (escolha categorySlug exato):
${categoryLines}

INSTRUÇÃO ESPECIAL pro link final do vídeo: use exatamente "${opts.videoUrl}" como href.

TRANSCRIÇÃO (transcrita automaticamente — pode ter erros menores em termos técnicos, corrija ao reescrever):

${opts.transcript}`;

  const response = await model.generateContent(userMessage);
  const rawText = response.response.text();

  let parsed: { articles: GeneratedArticle[] };
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error(
      `Falha ao parsear JSON do Gemini. Trecho: ${rawText.slice(0, 300)}...`
    );
  }

  if (
    !parsed.articles ||
    !Array.isArray(parsed.articles) ||
    parsed.articles.length === 0
  ) {
    throw new Error("Gemini retornou JSON sem articles[] válido");
  }

  parsed.articles.forEach((a, i) => {
    if (!a.title) throw new Error(`Artigo ${i} sem title`);
    if (!a.slug) throw new Error(`Artigo ${i} sem slug`);
    if (!a.body || a.body.length === 0)
      throw new Error(`Artigo ${i} sem body`);
    if (!a.categorySlug) throw new Error(`Artigo ${i} sem categorySlug`);
    if (!a.heroPrompt) throw new Error(`Artigo ${i} sem heroPrompt`);
  });

  return {
    articles: parsed.articles,
    usage: response.response.usageMetadata,
  };
}
