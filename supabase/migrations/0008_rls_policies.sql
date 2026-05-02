-- Keja: Row Level Security
-- Default deny, then opt-in per table. The service-role key bypasses all of this
-- and is only used server-side (lib/supabase/server.ts when admin=true).

alter table public.profiles            enable row level security;
alter table public.verifications       enable row level security;
alter table public.properties          enable row level security;
alter table public.property_media      enable row level security;
alter table public.property_views      enable row level security;
alter table public.favourites          enable row level security;
alter table public.viewings            enable row level security;
alter table public.payments            enable row level security;
alter table public.leases              enable row level security;
alter table public.rent_payments       enable row level security;
alter table public.conversations       enable row level security;
alter table public.messages            enable row level security;
alter table public.reviews             enable row level security;
alter table public.saved_searches      enable row level security;

-- ─── profiles ──────────────────────────────────────────
-- Anyone can read public profile fields (we expose a view for this in app code,
-- but allowing select on the table keeps Supabase joins simple). PII (phone,
-- email) is filtered out at the API layer.
create policy "profiles are publicly readable"
    on public.profiles for select using (true);

create policy "users update own profile"
    on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- ─── verifications ─────────────────────────────────────
create policy "users see own verifications"
    on public.verifications for select using (auth.uid() = user_id);
create policy "users insert own verification jobs"
    on public.verifications for insert with check (auth.uid() = user_id);
-- updates only by service role (webhook from Smile ID)

-- ─── properties ────────────────────────────────────────
create policy "active listings are public"
    on public.properties for select using (status = 'active' or auth.uid() = owner_id);

create policy "owners insert their listings"
    on public.properties for insert with check (auth.uid() = owner_id);

create policy "owners update their listings"
    on public.properties for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "owners delete their listings"
    on public.properties for delete using (auth.uid() = owner_id);

-- ─── property_media ────────────────────────────────────
create policy "media follows parent listing visibility"
    on public.property_media for select using (
        exists (
            select 1 from public.properties p
            where p.id = property_media.property_id
              and (p.status = 'active' or p.owner_id = auth.uid())
        )
    );
create policy "owners write own media"
    on public.property_media for all using (
        exists (select 1 from public.properties p
                where p.id = property_media.property_id and p.owner_id = auth.uid())
    ) with check (
        exists (select 1 from public.properties p
                where p.id = property_media.property_id and p.owner_id = auth.uid())
    );

-- ─── favourites ────────────────────────────────────────
create policy "users own favourites"
    on public.favourites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── viewings ──────────────────────────────────────────
create policy "tenant or owner read viewing"
    on public.viewings for select using (auth.uid() in (tenant_id, owner_id));
create policy "tenant inserts viewing request"
    on public.viewings for insert with check (auth.uid() = tenant_id);
create policy "tenant or owner update viewing"
    on public.viewings for update using (auth.uid() in (tenant_id, owner_id));

-- ─── payments ──────────────────────────────────────────
create policy "users see own payments"
    on public.payments for select using (auth.uid() in (user_id, counterparty_id));
-- inserts and updates only via service role (server hits Daraja)

-- ─── leases / rent_payments ────────────────────────────
create policy "lease parties read lease"
    on public.leases for select using (auth.uid() in (tenant_id, landlord_id));

create policy "lease parties read rent payments"
    on public.rent_payments for select using (
        exists (select 1 from public.leases l
                where l.id = rent_payments.lease_id
                  and auth.uid() in (l.tenant_id, l.landlord_id))
    );

-- ─── conversations / messages ──────────────────────────
create policy "convo parties read"
    on public.conversations for select using (auth.uid() in (tenant_id, owner_id));
create policy "tenant creates convo"
    on public.conversations for insert with check (auth.uid() = tenant_id);
create policy "convo parties update"
    on public.conversations for update using (auth.uid() in (tenant_id, owner_id));

create policy "convo parties read messages"
    on public.messages for select using (
        exists (select 1 from public.conversations c
                where c.id = messages.conversation_id
                  and auth.uid() in (c.tenant_id, c.owner_id))
    );
create policy "convo parties send messages"
    on public.messages for insert with check (
        auth.uid() = sender_id and
        exists (select 1 from public.conversations c
                where c.id = messages.conversation_id
                  and auth.uid() in (c.tenant_id, c.owner_id))
    );

-- ─── reviews ───────────────────────────────────────────
create policy "reviews are public"
    on public.reviews for select using (true);
create policy "users write own reviews"
    on public.reviews for insert with check (auth.uid() = reviewer_id);
create policy "users update own reviews"
    on public.reviews for update using (auth.uid() = reviewer_id) with check (auth.uid() = reviewer_id);
create policy "users delete own reviews"
    on public.reviews for delete using (auth.uid() = reviewer_id);

-- ─── saved searches ────────────────────────────────────
create policy "users own saved searches"
    on public.saved_searches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
