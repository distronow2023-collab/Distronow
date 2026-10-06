-- Solicitudes de distribución y mensajes de contacto + nuevos ajustes.
-- Si ya ejecutaste schema.sql antes de esta versión, ejecuta solo este archivo (y settings.sql si no lo hiciste).

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
