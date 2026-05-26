/**
 * Centraliza canais sociais e exemplos editoriais de posts recentes.
 *
 * Os posts abaixo são placeholders editoriais — quando houver tempo
 * (ou integração real), substituir por embeds ou screenshots de cada
 * postagem. A graça é mostrar atividade e linha de pensamento sem
 * virar feed cru.
 */

export const socialChannels = {
  instagram: {
    handle: "@gustavotmendonca",
    url: "https://instagram.com/gustavotmendonca",
    cadence: "Conteúdo semanal",
  },
  linkedin: {
    handle: "in/gustavo-trotta",
    url: "https://www.linkedin.com/in/gustavo-trotta/",
    cadence: "Análises semanais",
  },
  youtube: {
    handle: "@GustavoMendoncaInvest",
    url: "https://www.youtube.com/@GustavoMendoncaInvest",
    cadence: "Vídeos mensais",
  },
};

export type SocialPost = {
  /** "abr · 2026" — eyebrow editorial */
  date: string;
  /** Primeira frase do post — convite à leitura */
  excerpt: string;
  /** Link externo (pro post específico, ou pro perfil quando não houver) */
  href: string;
};

export const instagramPosts: SocialPost[] = [
  {
    date: "abr · 2026",
    excerpt:
      "O Banco Central segurou a Selic — e o que isso muda na alocação de quem tem horizonte de 10 anos.",
    href: socialChannels.instagram.url,
  },
  {
    date: "mar · 2026",
    excerpt:
      "Três perguntas que um plano de aposentadoria precisa responder antes de qualquer alocação.",
    href: socialChannels.instagram.url,
  },
];

export const linkedinPosts: SocialPost[] = [
  {
    date: "abr · 2026",
    excerpt:
      "Por que o juro real brasileiro continua sustentando uma das melhores relações risco-retorno do mundo.",
    href: socialChannels.linkedin.url,
  },
  {
    date: "mar · 2026",
    excerpt:
      "Sucessão patrimonial não é tema de fim de carreira — é decisão estrutural de quem está construindo agora.",
    href: socialChannels.linkedin.url,
  },
];
