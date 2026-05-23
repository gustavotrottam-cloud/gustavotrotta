import { Resend } from "resend";

/** Envelope mínimo de um lead pra notificação. */
export type LeadEmailPayload = {
  /** Email real do lead. Pode ser ausente em leads anônimos (planejamento financeiro). */
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  message?: string | null;
  source?: string | null;
  createdAt?: string;
};

const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ESCAPE_MAP[c] ?? c);

/**
 * Constrói o HTML de notificação editorial (alinhado ao tom do site).
 * Compatível com a maioria dos clientes de email (inline styles, tabela).
 */
function buildLeadEmailHtml(p: LeadEmailPayload): string {
  const row = (label: string, value: string | null | undefined) => {
    const v = (value ?? "").trim();
    if (!v) return "";
    return `
      <tr>
        <td style="padding:14px 0 6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#6B6B70;">${escapeHtml(label)}</td>
      </tr>
      <tr>
        <td style="padding:0 0 14px 0;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.45;color:#0A0A0B;border-bottom:1px solid #E5E3DA;">${escapeHtml(v).replace(/\n/g, "<br>")}</td>
      </tr>`;
  };

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Novo interesse — Área Exclusiva</title>
</head>
<body style="margin:0;padding:0;background:#F2F1EB;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2F1EB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FAFAF7;padding:40px 36px;border:1px solid #E5E3DA;">
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid #E5E3DA;">
              <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#B8935A;">Notificação automática · Área Exclusiva</div>
              <h1 style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.15;color:#0A0A0B;letter-spacing:-0.01em;">
                Novo interesse registrado
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding-top:20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${row("Nome", p.name)}
                ${row("Email", p.email ?? "(não informado)")}
                ${row("Telefone", p.phone)}
                ${row("Mensagem", p.message)}
                ${row("Origem", p.source)}
              </table>
            </td>
          </tr>
          ${p.phone ? `
          <tr>
            <td style="padding-top:24px;">
              <a href="https://wa.me/${escapeHtml(p.phone.replace(/\D/g, ""))}"
                 style="display:inline-block;padding:12px 20px;background:#25D366;color:#FFFFFF;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;">
                Responder pelo WhatsApp →
              </a>
            </td>
          </tr>` : ""}
          <tr>
            <td style="padding-top:32px;border-top:1px solid #E5E3DA;margin-top:24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.06em;color:#8C8C90;">
              ${p.createdAt ? `Recebido em ${escapeHtml(p.createdAt)}.<br>` : ""}
              Site institucional de Gustavo Trotta · Notificação interna.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildLeadEmailText(p: LeadEmailPayload): string {
  const parts = [
    "NOVO INTERESSE — ÁREA EXCLUSIVA",
    "",
    p.name ? `Nome: ${p.name}` : null,
    `Email: ${p.email ?? "(não informado)"}`,
    p.phone ? `Telefone: ${p.phone}` : null,
    p.message ? `Mensagem: ${p.message}` : null,
    p.source ? `Origem: ${p.source}` : null,
    p.createdAt ? `Recebido em: ${p.createdAt}` : null,
  ].filter(Boolean);
  return parts.join("\n");
}

/**
 * Envia email de notificação ao admin sobre novo lead.
 * Retorna `{ sent: true }` ou `{ sent: false, reason }`. NÃO lança —
 * falha de email não deve impedir a gravação do lead no banco.
 */
export async function notifyLeadByEmail(payload: LeadEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  const from = process.env.LEAD_NOTIFY_FROM;

  if (!apiKey || !to || !from) {
    return { sent: false, reason: "missing_env" } as const;
  }

  try {
    const resend = new Resend(apiKey);
    const subjectIdentity = payload.name ?? payload.email ?? "novo lead";
    const { data, error } = await resend.emails.send({
      from,
      to,
      // Só seta reply-to se o lead deu email real (anônimo do planejamento
      // pode entrar sem email).
      ...(payload.email ? { replyTo: payload.email } : {}),
      subject: `Novo interesse no site · ${subjectIdentity}`,
      html: buildLeadEmailHtml(payload),
      text: buildLeadEmailText(payload),
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { sent: false, reason: error.message } as const;
    }
    return { sent: true, id: data?.id } as const;
  } catch (err) {
    console.error("[email] unexpected:", err);
    return {
      sent: false,
      reason: err instanceof Error ? err.message : "unknown",
    } as const;
  }
}
