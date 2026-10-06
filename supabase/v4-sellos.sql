-- Back-office de sellos y A&R. Ejecutar una vez en Supabase → SQL Editor (después de schema.sql / v3).

-- Sellos
create table if not exists public.labels (
  id bigint generated always as identity primary key,
  name text not null,
  logo_url text,
  notes text,                       -- notas internas (solo admin)
  created_at timestamptz not null default now()
);
-- Cuentas del panel (email) que pertenecen a cada sello
create table if not exists public.label_accounts (
  label_id bigint not null references public.labels(id) on delete cascade,
  email text not null,
  primary key (label_id, email)
);
-- Personas del sello que pueden entrar al back-office (A&R, responsables)
create table if not exists public.label_members (
  label_id bigint not null references public.labels(id) on delete cascade,
  email text not null,
  primary key (label_id, email)
);

-- Rendimiento por pista y periodo (export GYRO "Track Level")
create table if not exists public.track_stats (
  period date not null,             -- primer día del mes del statement
  isrc text not null,
  email text not null,
  status text,
  artist text,
  tsf numeric,
  commission numeric,
  gross numeric,
  primary key (period, isrc)
);
create index if not exists track_stats_email on public.track_stats (email);

-- Datos de catálogo por pista (export "track-level": título, lanzamiento…)
create table if not exists public.track_meta (
  isrc text primary key,
  title text,
  release_title text,
  release_date date,
  main_artist text,
  record_label text
);

-- Rendimiento por cuenta y periodo (export GYRO "Account Level")
create table if not exists public.account_stats (
  period date not null,
  email text not null,
  releases integer,
  tracks integer,
  streams bigint,
  gross numeric,
  tsf numeric,
  post_tsf numeric,
  primary key (period, email)
);

-- Solicitudes de retirada de pistas hechas por los sellos
create table if not exists public.takedown_requests (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  label_id bigint not null references public.labels(id) on delete cascade,
  isrc text not null,
  email text,
  reason text,
  requested_by text not null default (auth.jwt() ->> 'email'),
  status text not null default 'pendiente' check (status in ('pendiente','hecha','rechazada')),
  admin_note text
);

-- ¿A qué sellos pertenece el usuario conectado?
create or replace function public.my_label_ids()
returns setof bigint language sql stable security definer set search_path = public as $$
  select label_id from public.label_members where lower(email) = lower(auth.jwt() ->> 'email');
$$;
-- ¿Esta cuenta (email) es de alguno de mis sellos?
create or replace function public.is_my_account(acc text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.label_accounts la
                 where lower(la.email) = lower(acc) and la.label_id in (select public.my_label_ids()));
$$;
-- El sello puede cambiar solo su logo
create or replace function public.set_label_logo(p_label bigint, p_url text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_label not in (select public.my_label_ids()) and not public.is_admin() then
    raise exception 'Sin permiso';
  end if;
  update public.labels set logo_url = p_url where id = p_label;
end $$;

alter table public.labels            enable row level security;
alter table public.label_accounts    enable row level security;
alter table public.label_members     enable row level security;
alter table public.track_stats       enable row level security;
alter table public.track_meta        enable row level security;
alter table public.account_stats     enable row level security;
alter table public.takedown_requests enable row level security;

drop policy if exists labels_read on public.labels;
create policy labels_read on public.labels for select using (public.is_admin() or id in (select public.my_label_ids()));
drop policy if exists labels_admin on public.labels;
create policy labels_admin on public.labels for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists la_read on public.label_accounts;
create policy la_read on public.label_accounts for select using (public.is_admin() or label_id in (select public.my_label_ids()));
drop policy if exists la_admin on public.label_accounts;
create policy la_admin on public.label_accounts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists lm_read on public.label_members;
create policy lm_read on public.label_members for select using (public.is_admin() or lower(email) = lower(auth.jwt() ->> 'email'));
drop policy if exists lm_admin on public.label_members;
create policy lm_admin on public.label_members for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists ts_read on public.track_stats;
create policy ts_read on public.track_stats for select using (public.is_admin() or public.is_my_account(email));
drop policy if exists ts_admin on public.track_stats;
create policy ts_admin on public.track_stats for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists tm_read on public.track_meta;
create policy tm_read on public.track_meta for select using (
  public.is_admin() or exists (select 1 from public.track_stats ts where ts.isrc = track_meta.isrc and public.is_my_account(ts.email)));
drop policy if exists tm_admin on public.track_meta;
create policy tm_admin on public.track_meta for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists as_read on public.account_stats;
create policy as_read on public.account_stats for select using (public.is_admin() or public.is_my_account(email));
drop policy if exists as_admin on public.account_stats;
create policy as_admin on public.account_stats for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists tr_read on public.takedown_requests;
create policy tr_read on public.takedown_requests for select using (public.is_admin() or label_id in (select public.my_label_ids()));
drop policy if exists tr_insert on public.takedown_requests;
create policy tr_insert on public.takedown_requests for insert with check (
  public.is_admin() or (label_id in (select public.my_label_ids()) and public.is_my_account(email)));
drop policy if exists tr_admin on public.takedown_requests;
create policy tr_admin on public.takedown_requests for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists tr_admin_del on public.takedown_requests;
create policy tr_admin_del on public.takedown_requests for delete using (public.is_admin());

-- Logos de sellos: lectura pública; cada sello sube en su carpeta (<id del sello>/archivo)
insert into storage.buckets (id, name, public) values ('labels', 'labels', true) on conflict (id) do nothing;
drop policy if exists labels_logos_read on storage.objects;
create policy labels_logos_read on storage.objects for select using (bucket_id = 'labels');
drop policy if exists labels_logos_write on storage.objects;
create policy labels_logos_write on storage.objects for insert with check (
  bucket_id = 'labels' and (public.is_admin() or (storage.foldername(name))[1] in (select l::text from public.my_label_ids() as l)));

-- Umbral de la herramienta de track fee (AUD/mes por pista). Ajustable en /admin → Ajustes.
insert into public.settings (key, value) values ('tsf_threshold_aud', '1.00') on conflict (key) do nothing;
