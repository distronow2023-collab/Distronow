// Envío de correos con Resend (resend.com). Variables en Vercel:
//   RESEND_API_KEY · clave de Resend
//   MAIL_TO        · destino de los avisos (por defecto info@distronow.com)
//   MAIL_FROM      · remitente verificado en Resend, p. ej. "DistroNow Web <web@distronow.com>"
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function tablaHtml(titulo, filas) {
  const rows = filas.map(([k, v]) =>
    '<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e9ee;color:#5b6b78;white-space:nowrap;vertical-align:top">' + esc(k) +
    '</td><td style="padding:8px 12px;border-bottom:1px solid #e5e9ee;color:#0b1620">' + (String(v || '').startsWith('http') ? '<a href="' + esc(v) + '">' + esc(v) + '</a>' : esc(v || '—').replace(/\n/g, '<br>')) + '</td></tr>'
  ).join('');
  return '<div style="font-family:Arial,sans-serif;max-width:640px"><h2 style="color:#050B10;margin:0 0 12px">' + esc(titulo) +
    '</h2><table style="border-collapse:collapse;width:100%;font-size:14px">' + rows + '</table>' +
    '<p style="color:#8a99a6;font-size:12px;margin-top:16px">Enviado desde la web de DistroNow. Gestiónalo en /admin.</p></div>';
}

export async function enviarCorreo({ asunto, html, responderA }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || 'DistroNow Web <onboarding@resend.dev>',
      to: [process.env.MAIL_TO || 'info@distronow.com'],
      reply_to: responderA || undefined,
      subject: asunto,
      html
    })
  });
  if (!r.ok) throw new Error('Resend ' + r.status + ' ' + (await r.text()));
  return true;
}
