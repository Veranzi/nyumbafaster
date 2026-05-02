-- Keja: viewing bookings + escrow payments
create type viewing_status as enum (
    'requested', 'confirmed', 'completed', 'no_show_tenant',
    'no_show_owner', 'cancelled', 'disputed'
);

create type escrow_status as enum ('none', 'held', 'released', 'refunded', 'disputed');

create table public.viewings (
    id                 uuid primary key default gen_random_uuid(),
    property_id        uuid not null references public.properties(id) on delete restrict,
    tenant_id          uuid not null references public.profiles(id) on delete restrict,
    -- owner_id at booking time (cached so payouts are unambiguous if owner changes)
    owner_id           uuid not null references public.profiles(id) on delete restrict,
    scheduled_for      timestamptz not null,
    viewing_fee_kes    int not null default 0,
    escrow_status      escrow_status not null default 'none',
    status             viewing_status not null default 'requested',
    tenant_note        text,
    cancellation_reason text,
    created_at         timestamptz not null default now(),
    confirmed_at       timestamptz,
    completed_at       timestamptz
);

create index viewings_tenant_idx   on public.viewings(tenant_id, scheduled_for desc);
create index viewings_owner_idx    on public.viewings(owner_id, scheduled_for desc);
create index viewings_property_idx on public.viewings(property_id);

-- Payments table: every M-Pesa interaction (in or out). Idempotency via
-- (provider, mpesa_request_id) — Daraja sends duplicate callbacks routinely.
create type payment_kind as enum (
    'viewing_fee', 'deposit', 'rent', 'listing_fee',
    'subscription', 'featured_listing', 'refund', 'payout'
);
create type payment_status as enum ('pending', 'success', 'failed', 'reversed');

create table public.payments (
    id                 uuid primary key default gen_random_uuid(),
    user_id            uuid not null references public.profiles(id) on delete restrict,
    counterparty_id    uuid references public.profiles(id) on delete set null,
    kind               payment_kind not null,
    amount_kes         int not null check (amount_kes > 0),
    -- Bps fee captured at the time of charge so future rate changes are auditable.
    fee_bps            int not null default 0,
    fee_kes            int not null default 0,

    provider           text not null default 'daraja',        -- daraja | intasend | manual
    mpesa_request_id   text,                                  -- CheckoutRequestID
    mpesa_receipt      text,                                  -- MpesaReceiptNumber
    msisdn             text,                                  -- payer phone E.164

    status             payment_status not null default 'pending',
    failure_reason     text,
    raw_callback       jsonb,

    related_viewing_id uuid references public.viewings(id) on delete set null,
    related_lease_id   uuid,                                  -- FK added in 0004 once leases exist below

    created_at         timestamptz not null default now(),
    completed_at       timestamptz
);

create unique index payments_mpesa_request_unique
    on public.payments(provider, mpesa_request_id)
    where mpesa_request_id is not null;

create index payments_user_idx        on public.payments(user_id, created_at desc);
create index payments_kind_status_idx on public.payments(kind, status);

-- Leases: created when a tenant moves in. Used for v2 rent collection.
create type lease_status as enum ('pending', 'active', 'ended', 'terminated');

create table public.leases (
    id              uuid primary key default gen_random_uuid(),
    property_id     uuid not null references public.properties(id) on delete restrict,
    tenant_id       uuid not null references public.profiles(id) on delete restrict,
    landlord_id     uuid not null references public.profiles(id) on delete restrict,
    start_date      date not null,
    end_date        date,
    monthly_rent_kes int not null check (monthly_rent_kes > 0),
    deposit_kes     int not null default 0,
    status          lease_status not null default 'pending',
    created_at      timestamptz not null default now()
);

create index leases_tenant_idx   on public.leases(tenant_id);
create index leases_landlord_idx on public.leases(landlord_id);
create index leases_property_idx on public.leases(property_id);

alter table public.payments
    add constraint payments_lease_fk
    foreign key (related_lease_id) references public.leases(id) on delete set null;

-- Rent payments (v2). One per period_month per lease.
create table public.rent_payments (
    id            uuid primary key default gen_random_uuid(),
    lease_id      uuid not null references public.leases(id) on delete cascade,
    period_month  date not null,                              -- first of month
    amount_kes    int not null,
    payment_id    uuid references public.payments(id) on delete set null,
    paid_at       timestamptz,
    created_at    timestamptz not null default now(),
    unique (lease_id, period_month)
);
