-- Keja: users + identity verification
-- Note: auth.users is managed by Supabase Auth. We mirror role + profile
-- here in public.profiles, keyed on the auth user id.

create type user_role as enum ('tenant', 'landlord', 'agent', 'admin');
create type ui_locale as enum ('en', 'sw');
create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');

create table public.profiles (
    id            uuid primary key references auth.users(id) on delete cascade,
    phone         text unique not null,                       -- E.164, e.g. +2547XXXXXXXX
    email         text,
    full_name     text,
    role          user_role not null default 'tenant',
    locale        ui_locale not null default 'en',
    avatar_url    text,
    bio           text,
    agency_name   text,                                       -- only for role='agent'
    -- Aggregated rating cache (recomputed by trigger on review insert)
    rating_avg    numeric(3,2),
    rating_count  int not null default 0,
    -- Verification cache so we don't join verifications on every list query
    verification_status verification_status not null default 'unverified',
    verified_at   timestamptz,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_phone_trgm on public.profiles using gin (phone gin_trgm_ops);

-- Smile ID / IPRS verification audit log. Raw national IDs are NEVER stored —
-- only a SHA-256 hash for dedupe + the provider's reference id.
create table public.verifications (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references public.profiles(id) on delete cascade,
    provider        text not null default 'smile_id',         -- smile_id | manual
    provider_ref    text,                                     -- Smile ID job id
    id_number_hash  text,                                     -- sha256(national_id)
    document_url    text,                                     -- supabase storage path
    selfie_url      text,
    status          verification_status not null default 'pending',
    rejection_reason text,
    raw_payload     jsonb,                                    -- provider response
    created_at      timestamptz not null default now(),
    decided_at      timestamptz
);

create unique index verifications_id_hash_unique
    on public.verifications(id_number_hash)
    where id_number_hash is not null;

create index verifications_user_idx on public.verifications(user_id);

-- Auto-create profile row whenever a Supabase auth user is created.
-- The phone comes from auth.users.phone (set during OTP signup).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    insert into public.profiles (id, phone, email)
    values (new.id, coalesce(new.phone, ''), new.email)
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- updated_at maintenance
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_touch
    before update on public.profiles
    for each row execute function public.touch_updated_at();
