-- Ajustes de la web (velocidad del carrusel, etc.)
-- Si ya ejecutaste schema.sql ANTES de esta versión, ejecuta solo este archivo.
create table if not exists public.settings (
  key text primary key,
  value text not null
);
alter table public.settings enable row level security;
drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings for select using (true);
drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings for all using (public.is_admin()) with check (public.is_admin());
insert into public.settings (key, value) values ('carousel_speed', '3') on conflict (key) do nothing;
