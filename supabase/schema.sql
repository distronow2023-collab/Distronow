-- DistroNow web · esquema de base de datos (Supabase)
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run.

-- 1) Administradores autorizados (emails que pueden editar desde /admin)
create table if not exists public.admins (
  email text primary key
);

-- 2) Artistas que aparecen en la web
create table if not exists public.artists (
  id bigint generated always as identity primary key,
  name text not null,
  spotify_id text,
  visible boolean not null default false,
  position integer not null default 100,
  created_at timestamptz not null default now()
);

-- 3) Partners ("Trabajamos con")
create table if not exists public.partners (
  id bigint generated always as identity primary key,
  name text not null,
  logo_url text,
  website text,
  visible boolean not null default true,
  position integer not null default 100,
  created_at timestamptz not null default now()
);

-- Función: ¿el usuario conectado es administrador?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = (auth.jwt() ->> 'email'));
$$;

alter table public.admins   enable row level security;
alter table public.artists  enable row level security;
alter table public.partners enable row level security;

-- Lectura pública: solo lo marcado como visible
drop policy if exists "artists_public_read" on public.artists;
create policy "artists_public_read" on public.artists for select using (visible or public.is_admin());
drop policy if exists "partners_public_read" on public.partners;
create policy "partners_public_read" on public.partners for select using (visible or public.is_admin());

-- Escritura: solo administradores
drop policy if exists "artists_admin_write" on public.artists;
create policy "artists_admin_write" on public.artists for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "partners_admin_write" on public.partners;
create policy "partners_admin_write" on public.partners for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins_self_read" on public.admins;
create policy "admins_self_read" on public.admins for select using (email = (auth.jwt() ->> 'email'));

-- 4) Almacenamiento de logos de partners (bucket público)
insert into storage.buckets (id, name, public) values ('partners', 'partners', true)
on conflict (id) do nothing;
drop policy if exists "partners_logos_read" on storage.objects;
create policy "partners_logos_read" on storage.objects for select using (bucket_id = 'partners');
drop policy if exists "partners_logos_admin_write" on storage.objects;
create policy "partners_logos_admin_write" on storage.objects for all
  using (bucket_id = 'partners' and public.is_admin())
  with check (bucket_id = 'partners' and public.is_admin());

-- 4b) Ajustes de la web (velocidad del carrusel, etc.)
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

-- 4c) Solicitudes, mensajes y ajustes de formularios

create table if not exists public.applications (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  artist_name text not null,
  name text not null,
  email text not null,
  spotify text,
  instagram text,
  youtube text,
  motivation text,
  tracks integer,
  listeners integer,
  status text not null default 'nueva' check (status in ('nueva','en revisión','aceptada','descartada')),
  notes text
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  read boolean not null default false
);

alter table public.applications enable row level security;
alter table public.messages enable row level security;

-- Solo administradores pueden leer, editar y borrar. Las altas las hace el servidor con la clave de servicio.
drop policy if exists "applications_admin" on public.applications;
create policy "applications_admin" on public.applications for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "messages_admin" on public.messages;
create policy "messages_admin" on public.messages for all using (public.is_admin()) with check (public.is_admin());

insert into public.settings (key, value) values
  ('applications_open', 'true'),
  ('login_dark', 'false')
on conflict (key) do nothing;

-- 5) Administradores: CAMBIA estos emails por los de los socios
insert into public.admins (email) values
  ('info@distronow.com')
on conflict do nothing;

-- 6) Artistas iniciales: 15 visibles con enlace; 35 candidatos ocultos (8 ya con enlace, 27 pendientes de pegar desde /admin)
insert into public.artists (name, spotify_id, visible, position) values
  ('Qba0gang', '2NMRlEX8JsYhetkzAEei4F', true, 1),
  ('Pochi', '7wbgA4GKIqnYmnUUJbRdrb', true, 2),
  ('TRAPMALOY', '2XDtNhmtCGeQb2JHM6VZH0', true, 3),
  ('Kiillyy', '6c2BhAXg9skFH774m3SMkl', true, 4),
  ('450DEMON', '3pxVZkdzJCb7brlCEr3iip', true, 5),
  ('RANDALL13', '7ITzhP0voK7pyFGUWNJ39v', true, 6),
  ('Soki Beats', '3HOFsPM3TlhWUQUqNM0An2', true, 7),
  ('AP450', '2rF6qcSVrne9xB5SMONqOs', true, 8),
  ('Lilkovo', '5bXe0ibQ6lsPnTyx5pi4mP', true, 9),
  ('qymyco', '0QNlPXdnS7UtOSC2hyOje5', true, 10),
  ('K9OG', '3ZuhUNDs6lQ3ifEwAQ22z5', true, 11),
  ('BabyMurda', '2kz8jl2xrOh8D7hP2VMvQP', true, 12),
  ('Mendez 47', '2UqlJuqPrNCJPVFa9cOEtg', true, 13),
  ('Dylanss0n', '0MjDqqTA28UrUZhOiRRour', true, 14),
  ('Sav28', '40mwZLIT1HDEiJ5YjqvBBD', true, 15),
  ('Uzii Gaang', '7sRct0HMMs3s99sNQPjfEt', false, 16),
  ('Lizz', null, false, 17),
  ('Nuttyrn', '1erwzyuxrmIXxg0jaEVHM0', false, 18),
  ('DD Evans', '6xu4Aprt1X6CH9YfTyXqJ9', false, 19),
  ('24Gz', null, false, 20),
  ('Sersy 23', '5bLlLbAOwo0tOK6zvivHwy', false, 21),
  ('Nito45', null, false, 22),
  ('j13', null, false, 23),
  ('Gusi', null, false, 24),
  ('nanoss0n', null, false, 25),
  ('Navas', null, false, 26),
  ('28Minimal', null, false, 27),
  ('J. Largo', null, false, 28),
  ('ANB LAMZO', null, false, 29),
  ('Lavish', null, false, 30),
  ('Og Gs', null, false, 31),
  ('Yung Represalia', null, false, 32),
  ('Joga', null, false, 33),
  ('Sorroxxe', null, false, 34),
  ('Musy Lvp', '2tWdY7GajeHEYYCXh8ZKu8', false, 35),
  ('R. Black Mamba', '1JDuZvMKGu7ITN6ZKhxsLS', false, 36),
  ('Elmynor', '0rWyUHIzKtcKdJt0sCx6NN', false, 37),
  ('GRETY EL34', '4pxfniZ6NW8hKOSkXcOE27', false, 38),
  ('Emedemarco', null, false, 39),
  ('MenorTrvp', null, false, 40),
  ('Traperiimma', null, false, 41),
  ('El Toca', null, false, 42),
  ('Rc.Mel0dy', null, false, 43),
  ('Button Bricks', null, false, 44),
  ('Lavro', null, false, 45),
  ('Ruba', null, false, 46),
  ('MB7', null, false, 47),
  ('Blueice Davies', null, false, 48),
  ('la paww', null, false, 49),
  ('O45 Double T', null, false, 50);
