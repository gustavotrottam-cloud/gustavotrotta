# Gustavo Trotta — Site institucional

Site institucional premium para Gustavo Trotta, assessor de investimentos e sócio da Valor Investimentos / XP. Construído com **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS** e **Framer Motion**.

Esta primeira entrega cobre **Home** + **Sobre** polidas, com design system pronto para evoluir para Central de Conteúdo, Mídia, Área Logada e FAQ nas próximas iterações.

---

## Como rodar localmente

### 1. Instalar Node.js

O ambiente atual não tem Node instalado. Baixe e instale a versão LTS (20.x ou superior):

- **Windows:** https://nodejs.org/en/download (instalador `.msi`)
- Reabra o PowerShell após a instalação e valide com:

  ```powershell
  node --version
  npm --version
  ```

### 2. Instalar dependências

Dentro da pasta `site-gustavo-trotta/`:

```powershell
npm install
```

### 3. Subir o servidor de desenvolvimento

```powershell
npm run dev
```

Abra http://localhost:3000 — a Home carrega; `/sobre` carrega a página Sobre.

### 4. Build de produção

```powershell
npm run build
npm run start
```

### 5. Deploy

A stack está pronta para a Vercel:

1. Crie o repositório no GitHub e faça push.
2. Em https://vercel.com, importe o repositório.
3. Sem variáveis de ambiente nesta fase. Deploy direto.

---

## Estrutura

```
site-gustavo-trotta/
├── app/
│   ├── layout.tsx           # Layout raiz + fontes + Navbar/Footer
│   ├── page.tsx             # Home
│   ├── sobre/page.tsx       # Sobre Mim
│   └── globals.css          # Estilos base (Tailwind + utilitários editoriais)
├── components/
│   ├── Container.tsx        # Largura máxima + paddings responsivos
│   ├── Section.tsx          # Spacing vertical padrão
│   ├── Reveal.tsx           # Animação Framer Motion no scroll (respeita reduced-motion)
│   ├── SectionHeading.tsx   # Eyebrow + título serifado + introdução
│   ├── PortraitFrame.tsx    # Placeholder editorial para foto profissional
│   ├── Navbar.tsx           # Navegação fixa, glass on scroll, menu mobile
│   └── Footer.tsx           # Rodapé editorial + disclaimer regulatório
├── tailwind.config.ts       # Design tokens (cores, tipografia, tracking)
└── package.json
```

## Design tokens

- **Cores:** `ink` (pretos/grafites), `paper` (off-whites quentes), `muted` (cinzas), `navy` (azul profundo) e `gold` (dourado discreto para acentos).
- **Tipografia:** Cormorant Garamond (serif editorial) nos títulos + Inter (sans-serif sóbrio) no corpo.
- **Animações:** Framer Motion com easing editorial; respeita `prefers-reduced-motion`.
- **Espaçamentos:** seções com 24–32 unidades de padding vertical; grid 12 colunas a partir de `lg`.

## Próximas etapas sugeridas

1. **Central de Conteúdo** — `/conteudo` com categorias (Cenário, Patrimônio, Educação, Vídeos, Relatórios) e listagem dinâmica via CMS (Sanity ou similar).
2. **Mídia e Autoridade** — `/midia` editorial com cortes de entrevistas, palestras e logos reais.
3. **FAQ inteligente** — `/faq` com busca, pronto para integrar busca semântica.
4. **Área Exclusiva do Cliente** — `/clientes` com autenticação (Supabase ou Clerk), dashboard, biblioteca premium, "Pergunte ao Assessor".
5. **Agenda de Eventos** — `/eventos` integrada a calendário e materiais pós-evento.
6. **CMS** — Sanity Studio para vídeos, artigos, PDFs, informativos e eventos.
7. **Integrações** — WhatsApp Business API, CRM, e-mail marketing, YouTube/Instagram embeds.
8. **Imagens reais** — substituir `PortraitFrame` por `<Image />` com fotos profissionais.

## Conformidade

O rodapé inclui disclaimer institucional padrão. Antes do lançamento, validar com a área de compliance da XP / Valor o texto exato exigido e quaisquer menções obrigatórias (CNPI, registros, etc.).
