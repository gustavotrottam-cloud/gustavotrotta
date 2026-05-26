export type MediaItem = {
  /** YouTube video ID (the `v=` parameter) */
  id: string;
  /** Display title — trimmed of channel/date noise but faithful to the video */
  title: string;
  /** Channel name as it appears on YouTube */
  channel: string;
  /** Program / segment, when meaningful (Money News, Giro do Mercado, etc.) */
  program?: string;
  /** Editorial context — short sentence framing the appearance (theme + date).
   *  Ex: "Sobre o ciclo de juros americano, mar/2025." */
  context?: string;
};

/**
 * Curated appearances of Gustavo Trotta in the financial media.
 * Add or remove items here — the MediaGrid component renders this list as-is.
 */
export const mediaItems: MediaItem[] = [
  {
    id: "hGYrUP6o9hg",
    title: "Tesouro Reserva compete com as 'caixinhas', diz especialista",
    channel: "CNN Brasil Money",
    program: "Money News",
    context: "Sobre a nova classe de produtos de liquidez do Tesouro Direto.",
  },
  {
    id: "AA53LT4xdD8",
    title: "As perspectivas para o mercado e a política de juros",
    channel: "Jovem Pan News",
    program: "Economia em Foco",
    context: "Sobre o ciclo de afrouxamento monetário e o efeito sobre alocações.",
  },
  {
    id: "Xqkrxsh15bQ",
    title: "Abertura de Ormuz traz alívio momentâneo, diz especialista",
    channel: "CNN Brasil Money",
    program: "Money News",
    context: "Sobre os impactos geopolíticos no preço do petróleo e nos mercados.",
  },
  {
    id: "VUXwo-k8-uI",
    title: "Mercado espera pronunciamento de Trump",
    channel: "CNN Brasil Money",
    program: "Money News",
    context: "Sobre a leitura dos investidores na reabertura da administração americana.",
  },
  {
    id: "KSOZ7bRJB3A",
    title: "Haddad sobre guerra, petróleo e preços nos postos",
    channel: "VEJA+",
  },
  {
    id: "gsiJRbOtWkc",
    title: "Estúdio News — análise de cenário",
    channel: "Record News",
    program: "Estúdio News",
  },
  {
    id: "kfdIzu_IUOQ",
    title: "Dividendos, PIB e inflação dos EUA: o que movimenta o Ibovespa",
    channel: "Money Times",
    program: "Giro do Mercado",
  },
  {
    id: "PzjJI7mCt7w",
    title: "Banco Central altera regras do Pix em casos de fraude",
    channel: "Jornal da Record",
  },
  {
    id: "PNVFs7Jy1S0",
    title: "Alta do ouro reflete busca por proteção, diz analista",
    channel: "CNN Brasil Money",
    program: "Money News",
  },
];

export const youtubeChannelUrl = "https://www.youtube.com/@GustavoMendoncaInvest";

export function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeThumbnailUrl(id: string) {
  // hqdefault is always present; maxresdefault sometimes 404s for older uploads
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
