# Web DistroNow

## Archivos (todos en la raíz del repositorio)
- `index.html` · la web (estilos, código y logos van dentro del propio archivo).
- `admin.html` · panel para gestionar artistas y partners → `/admin`.
- `aviso-legal.html`, `privacidad.html`, `cookies.html` · páginas legales (BORRADOR: revisar con SFTL y rellenar lo marcado entre [CORCHETES]).
- `api/` · funciones de Vercel: `artistas` (fotos de Spotify), `partners`, `config`, `foto` (miniaturas del panel), `settings` (ajustes como la velocidad del carrusel).
- `supabase/schema.sql` · base de datos del panel (se ejecuta una vez en Supabase).
- `vercel.json` · URLs limpias (/aviso-legal en vez de /aviso-legal.html).

## Puesta en marcha del panel (una sola vez)
1. Crea un proyecto en supabase.com (plan gratuito) con la cuenta de DistroNow.
2. Supabase → SQL Editor → New query: pega `supabase/schema.sql`, cambia el email de administrador del apartado 5 y pulsa Run.
3. Supabase → Authentication → Users → Add user: crea el usuario de cada socio (mismo email que en el paso 2).
4. Supabase → Authentication → Sign In / Providers: desactiva "Allow new users to sign up".
5. Supabase → Project Settings → API: copia "Project URL" y la clave "anon public".
6. Vercel → Settings → Environment Variables: añade `SUPABASE_URL` y `SUPABASE_ANON_KEY` con esos valores y haz Redeploy.
7. Entra en `https://<tu-web>/admin` con tu email y contraseña.

Sin los pasos 1–6 la web funciona igual con la lista de artistas de respaldo y sin partners.

## Uso del panel
- Artistas: añadir con nombre + enlace de Spotify, marcar visible (máx. 50), ordenar con ▲▼, eliminar.
- Partners: nombre, web y logo (PNG/SVG transparente). Aparecen en "Trabajamos con".
- Los cambios se ven en la web en unos 5 minutos (caché).

## Artistas cargados
- 15 visibles con enlace.
- 8 candidatos con enlace, ocultos (Uzii Gaang, Nuttyrn, DD Evans, Sersy 23, Musy Lvp, Elmynor, GRETY EL34, R. Black Mamba): revisar la foto en /admin y marcar visibles.
- 27 candidatos sin enlace: pegar el enlace de Spotify desde /admin.

## Ajustes
- Velocidad del carrusel de artistas: /admin → Ajustes (1 muy lento … 10 rápido; por defecto 3).
- Si ya habías ejecutado `schema.sql` antes de esta versión, ejecuta también `supabase/settings.sql` en el SQL Editor de Supabase.

## Solicitudes y contacto (v3)
La web tiene dos formularios: "Distribuye con DistroNow" (solicitudes) y "Contacto".
Cada envío se guarda en Supabase (se gestiona en /admin → Solicitudes / Mensajes) y llega por correo a info@distronow.com.

Configuración (una vez):
1. Supabase → SQL Editor: ejecuta `supabase/v3-formularios.sql` (si ya habías ejecutado schema.sql antes).
2. Supabase → Project Settings → API: copia la clave **service_role** (secreta).
3. Crea cuenta en resend.com con info@distronow.com, añade el dominio distronow.com (registros DNS que indica Resend) y crea una API key.
4. Vercel → Settings → Environment Variables:
   - `SUPABASE_SERVICE_ROLE_KEY` = clave service_role (NO compartir, NO poner en el código)
   - `RESEND_API_KEY` = clave de Resend
   - `MAIL_FROM` = `DistroNow Web <web@distronow.com>` (cuando el dominio esté verificado)
   - `MAIL_TO` = `info@distronow.com` (opcional, es el valor por defecto)
   Después, Redeploy.

En /admin → Ajustes: abrir o cerrar solicitudes y activar el login en modo oscuro.

## Back-office de sellos (v4) · /sellos
- Cada sello (o A&R) entra en `/sellos` con su email (enlace sin contraseña) y ve solo sus cuentas: pistas, royalties, track fee y resultado por cuenta y por pista.
- Herramienta "Track fee": pistas que no compensan su TSF (o están por debajo del umbral de Ajustes) y botón para pedir su retirada. Las solicitudes llegan por email y a /admin → Retiradas.
- El sello puede subir su logo.

Puesta en marcha:
1. Supabase → SQL Editor: ejecuta `supabase/v4-sellos.sql`.
2. (Opcional) Ejecuta el archivo PRIVADO `seed-sellos-PRIVADO.sql` que se entrega aparte. NO lo subas a GitHub.
3. Supabase → Authentication → URL Configuration: añade tu dominio y `https://<tu-dominio>/sellos` en "Redirect URLs".
4. Cada mes (día 15): /admin → Datos → importa el export GYRO "Track Level" (y "Account Level") con el mes del statement. Una vez, importa también el catálogo (track-level) para que se vean los títulos.
5. /admin → Sellos: revisa las cuentas de cada sello y da acceso a sus A&R ("Dar acceso e invitar").
