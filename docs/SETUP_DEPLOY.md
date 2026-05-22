# Setup de produção — checklist sequencial

Cada item é um passo independente. **Faça na ordem** — alguns dependem dos anteriores.

---

## 0. Antes de tudo: tirar o projeto do OneDrive

O OneDrive corrompe `.next/` (transforma arquivos em reparse points). Antes
de subir, mova a pasta:

1. Pause sync do OneDrive (bandeja do sistema → ícone OneDrive → Configurações → Pausar sincronização → 8h)
2. Copie a pasta `site-gustavo-trotta/` pra um local fora do OneDrive, ex:
   - `C:\dev\site-gustavo-trotta\`
3. Rode `npm install` no novo local
4. Daqui pra frente, trabalhe a partir daí

---

## 1. Aplicar migration 006 (audit_log) no Supabase

1. Abra https://supabase.com/dashboard/project/pfujcrlcbsoqkalpulev/sql/new
2. Copie todo o conteúdo de `db/migrations/006_audit_log.sql`
3. Cole no SQL Editor → Run

Verificação: rode `select count(*) from public.audit_log;` — deve retornar 0
(tabela vazia mas criada).

---

## 2. Comprar domínio

Sugestão: `gustavotrotta.com.br` no Registro.br (R$ 50/ano, brasileiro,
rápido).

1. Acesse https://registro.br
2. Verifique disponibilidade
3. Cadastre seu CPF, complete compra (PIX ou boleto)
4. Domínio fica ativo em ~30 minutos

Alternativa: usar a Cloudflare Registrar (sem markup, mas em USD). Pra `.com.br`
o Registro.br é o canal nativo.

---

## 3. Criar conta Cloudflare (DNS + Turnstile + DDoS gratuitos)

1. Cadastre em https://dash.cloudflare.com/sign-up
2. **Add a site** → digite `gustavotrotta.com.br` → plano **Free** ($0/mês)
3. Cloudflare vai escanear DNS. Vai dar lista vazia (domínio novo) — tudo bem
4. Anote os **2 nameservers** que ele te dá (algo como
   `ana.ns.cloudflare.com` e `bob.ns.cloudflare.com`)
5. Volte no Registro.br → painel do domínio → "Alterar servidores DNS" →
   cole os 2 nameservers da Cloudflare → salvar
6. Propagação leva de 1 a 24 horas (geralmente <1 hora)

### 3a. Configurar Turnstile (anti-bot grátis)

Já dentro do dashboard Cloudflare:

1. Menu lateral → **Turnstile**
2. **Add site** → Nome: "Planejamento Financeiro Gustavo"
3. Domínio: `gustavotrotta.com.br` (e pode adicionar `localhost` pra dev)
4. Widget type: **Managed**
5. Salva
6. Cloudflare te dá **Site Key** (pública) e **Secret Key** (segredo). Anote os dois.

---

## 4. Criar conta Upstash (rate limiting grátis)

1. Cadastre em https://console.upstash.com
2. **Create Database** → tipo **Redis** → região **us-east-1** ou **sa-east-1**
   (São Paulo, mais próximo)
3. Nome: `gustavotrotta-ratelimit`
4. Plano **Free** (10k requests/dia, sobra muito pra MVP)
5. Após criar, dentro do banco → tab **REST API** → copie:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 5. Criar conta Sentry (erros + alertas, grátis)

1. https://sentry.io/signup/
2. Crie projeto → tipo **Next.js**
3. Anote o **DSN** (URL longa começando com `https://...@...ingest.sentry.io/...`)

*(integração do Sentry em si fica pra fase 2 — por ora só guardar a conta criada)*

---

## 6. Deploy na Vercel

1. Suba o projeto pro GitHub (se ainda não tá lá). Repo privado.
2. Vai em https://vercel.com/new
3. Import do GitHub → autorize → escolha o repo
4. **Framework Preset**: Next.js (auto-detectado)
5. **Environment Variables** (todas obrigatórias):

```
NEXT_PUBLIC_SUPABASE_URL=https://pfujcrlcbsoqkalpulev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[copie do .env.local]
SUPABASE_SERVICE_ROLE_KEY=[copie do .env.local]
RESEND_API_KEY=[copie do .env.local]
NEXT_PUBLIC_SANITY_PROJECT_ID=as54et5s
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=[copie do .env.local — o token editor]
PDF_TOKEN_SECRET=[gere string aleatória 32+ chars]
UPSTASH_REDIS_REST_URL=[do passo 4]
UPSTASH_REDIS_REST_TOKEN=[do passo 4]
NEXT_PUBLIC_TURNSTILE_SITE_KEY=[Site Key do passo 3a]
TURNSTILE_SECRET_KEY=[Secret Key do passo 3a]
CHROMIUM_PACK_URL=https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar
PDF_PUBLIC_ORIGIN=https://gustavotrotta.com.br
```

6. **Deploy**. Demora 2-3 minutos.
7. Vai te dar uma URL `gustavotrotta-xyz.vercel.app` — teste se carrega
8. **Vercel → seu projeto → Settings → Domains** → add `gustavotrotta.com.br`
   e `www.gustavotrotta.com.br`
9. Vercel te dá um CNAME pra configurar. Vai na **Cloudflare → DNS**:
   - Tipo `CNAME` · Name `@` (ou `gustavotrotta.com.br`) · Target `cname.vercel-dns.com`
   - Tipo `CNAME` · Name `www` · Target `cname.vercel-dns.com`
   - Proxy: **DNS only** (cinza, não laranja — Vercel já tem CDN/SSL)
10. Volta na Vercel → ele detecta o DNS, emite SSL via Let's Encrypt automaticamente
11. Em ~5 minutos `https://gustavotrotta.com.br` tá funcionando

### 6a. Atualizar Site URL no Supabase

Como o domínio mudou:

1. https://supabase.com/dashboard/project/pfujcrlcbsoqkalpulev/auth/url-configuration
2. **Site URL**: `https://gustavotrotta.com.br`
3. **Redirect URLs**: adicionar `https://gustavotrotta.com.br/clientes/auth/callback`
   - Mantenha `http://localhost:3000/clientes/auth/callback` pra dev

---

## 7. Subir Supabase pro plano Pro ($25/mês)

Recomendado pra produção (não obrigatório no dia 0):

1. https://supabase.com/dashboard/project/pfujcrlcbsoqkalpulev/settings/billing
2. Upgrade para **Pro**
3. Habilita:
   - Backups diários + **Point-in-time recovery (PITR) 7 dias** (recupera estado de qualquer minuto)
   - 8GB DB (vs 500MB free) — sobra
   - Logs estendidos
   - Email support

---

## 8. Configurar BetterUptime (alerta se cair)

1. https://betterstack.com/uptime → criar conta grátis
2. **Add monitor** → URL `https://gustavotrotta.com.br` → check a cada 3 min
3. Alerta por email + WhatsApp (cadastra seu número)
4. Adicione também `https://gustavotrotta.com.br/planejamento-financeiro` —
   garante que a página crítica tá viva

---

## 9. Verificações pós-launch

Depois que tudo subir, faça esse checklist:

- [ ] `https://gustavotrotta.com.br` carrega com cadeado verde (SSL OK)
- [ ] `https://gustavotrotta.com.br/politica-de-privacidade` aparece
- [ ] Janela anônima → `/planejamento-financeiro/contato` → preencher → vai pra etapa 01
- [ ] Tente submeter sem checkbox de consent → deve rejeitar
- [ ] Tente submeter 6× rápido → deve dar erro "muitas tentativas" (rate limit)
- [ ] Vai em https://securityheaders.com/?q=gustavotrotta.com.br → deve dar nota **A** ou superior
- [ ] Vai em https://www.ssllabs.com/ssltest/analyze.html?d=gustavotrotta.com.br → deve dar **A+**
- [ ] Login admin em `gustavotrotta.com.br/clientes/login` funciona com magic link
- [ ] Admin → Leads → consegue ver leads e clicar "Ver dados completos do plano"

---

## Custo mensal estimado em produção

| Item | Custo | Quando assinar |
|---|---|---|
| Domínio | R$ 50/ano (~R$ 4/mês) | Já |
| Cloudflare | $0 | Já |
| Upstash | $0 (free tier) | Já |
| Sentry | $0 (free tier) | Já |
| Vercel Hobby | $0 | Começar com isso |
| Supabase Free | $0 | Começar |
| **Total inicial** | **~R$ 4/mês** | |
| | | |
| Vercel Pro | $20/mês | Quando precisar Firewall ou >100GB |
| Supabase Pro | $25/mês | **Recomendado pra produção** (PITR) |
| BetterUptime Free | $0 | Já no launch |
| **Total recomendado** | **~R$ 230/mês** | Após validar tráfego |

---

## Onde mexer se algo der errado

| Sintoma | Onde olhar |
|---|---|
| Site não carrega | Vercel → Deployments → último build → Logs |
| Erro 500 em rota | Vercel → Functions → logs em tempo real |
| Lead não tá sendo criado | Supabase → SQL Editor → `select * from leads order by created_at desc limit 10;` |
| PDF não baixa | Verifique `CHROMIUM_PACK_URL` na Vercel + URL acessível |
| Rate limit travando demais | Upstash Console → ver tráfego, ajustar limites em `lib/rateLimit.ts` chamadas |
| DNS não propagou | https://dnschecker.org/?host=gustavotrotta.com.br |
| Email não chega | Resend Dashboard → Logs (cada email aparece) |

---

## Próximos passos pós-launch (semanas 1–4)

- [ ] Integrar Sentry no código (`npm install @sentry/nextjs` + config)
- [ ] Verificar domínio próprio no Resend (pra enviar emails sem `onboarding@resend.dev`)
- [ ] Criar rota self-service de exclusão de dados (`/excluir-meus-dados`) — LGPD facilita
- [ ] Documento interno: Registro de Tratamento de Dados (planilha simples)
- [ ] Considerar 2FA pra admin (Supabase Auth já suporta TOTP)
