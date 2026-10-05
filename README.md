# Web DistroNow

Web estática (HTML, CSS y JS) con una función de Vercel para las fotos de artistas.

## Estructura
- `index.html` — la página.
- `assets/css/styles.css` — estilos (paleta y tipografías de marca).
- `assets/js/main.js` — intro, recorrido, artistas, servicios y login.
- `assets/img/` — logos e iconos.
- `api/artistas.js` — función serverless: devuelve foto y enlace de Spotify de cada artista (oEmbed público, sin claves, caché 24 h).

## Publicar en Vercel
1. Sube esta carpeta a un repositorio de GitHub de la organización de DistroNow.
2. En Vercel: Add New → Project → Import ese repositorio.
3. Framework Preset: **Other**. Sin comando de build. Output directory: la raíz.
4. Deploy. La web queda en `https://<proyecto>.vercel.app` y la función en `/api/artistas`.

## Cambios habituales
- **Artistas:** edita la lista `ARTISTAS` en `api/artistas.js` (y el respaldo `ARTISTS_FALLBACK` en `assets/js/main.js`).
- **Login:** la URL del iframe del panel está en `LOGIN_URL` en `assets/js/main.js`.
- **Textos de fases y servicios:** `STAGES` y `SERVICES` en `assets/js/main.js`.

## Pendiente de verificar
- IDs de Spotify de Pochi, Kiillyy, AP450 y qymyco (comprobar que la foto corresponde).
- Sin ID: Soki Beats, GRINDIN', K9OG.
- Que el iframe del panel se deja incrustar desde vuestro dominio.
