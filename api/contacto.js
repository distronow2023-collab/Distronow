// POST /api/contacto · recibe un mensaje de contacto, lo guarda y avisa por correo.
import { insertarFila } from './_supabase.js';
import { enviarCorreo, tablaHtml } from './_mail.js';
import { leerCuerpo, limpio, emailValido, pareceSpam } from './_forms.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido' }); return; }
  const b = leerCuerpo(req);
  if (pareceSpam(b)) { res.status(200).json({ ok: true }); return; }

  const m = {
    name: limpio(b.name, 120),
    email: limpio(b.email, 160).toLowerCase(),
    subject: limpio(b.subject, 160),
    message: limpio(b.message, 3000)
  };
  const errores = [];
  if (!m.name) errores.push('nombre');
  if (!emailValido(m.email)) errores.push('email');
  if (m.message.length < 10) errores.push('mensaje');
  if (!b.consent) errores.push('aceptación de la política de privacidad');
  if (errores.length) { res.status(400).json({ error: 'Revisa: ' + errores.join(', ') + '.' }); return; }

  let guardado = false, enviado = false;
  try { guardado = await insertarFila('messages', m); } catch (e) { console.error(e); }
  try {
    enviado = await enviarCorreo({
      asunto: 'Contacto web · ' + (m.subject || m.name),
      responderA: m.email,
      html: tablaHtml('Nuevo mensaje de contacto', [['Nombre', m.name], ['Email', m.email], ['Asunto', m.subject], ['Mensaje', m.message]])
    });
  } catch (e) { console.error(e); }

  if (!guardado && !enviado) { res.status(500).json({ error: 'No hemos podido enviar tu mensaje. Escríbenos a info@distronow.com.' }); return; }
  res.status(200).json({ ok: true });
}
