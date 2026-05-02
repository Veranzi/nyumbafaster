-- Keja: saved searches + alerts
create type alert_frequency as enum ('off', 'instant', 'daily');

create table public.saved_searches (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references public.profiles(id) on delete cascade,
    label           text,
    -- Filter blob mirrors the query-string shape used by /houses.
    -- Example: {q:"kilimani", min_rent:25000, max_rent:60000, bedrooms:[1,2],
    --           furnishing:"semi", amenities:{parking:true, wifi:true}}
    filters         jsonb not null,
    alert_frequency alert_frequency not null default 'daily',
    last_alerted_at timestamptz,
    created_at      timestamptz not null default now()
);

create index saved_searches_user_idx on public.saved_searches(user_id);
create index saved_searches_alerts_idx on public.saved_searches(alert_frequency)
    where alert_frequency <> 'off';
