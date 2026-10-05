# Web DistroNow

## Archivos (todos en la raíz del repositorio)
- `index.html` · la web (estilos, código y logos van dentro del propio archivo).
- `admin.html` · panel para gestionar artistas y partners → `/admin`.
- `aviso-legal.html`, `privacidad.html`, `cookies.html` · páginas legales (BORRADOR: revisar con SFTL y rellenar lo marcado entre [CORCHETES]).
- `api/` · funciones de Vercel: `artistas` (fotos de Spotify), `partners`, `config`.
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
