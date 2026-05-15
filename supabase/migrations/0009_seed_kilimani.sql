-- Keja: dev seed data for Kilimani launch market.
-- Run AFTER creating an auth user with the same UUID(s) below, OR comment out
-- the FK refs and seed profiles directly with your own ids.
-- This file is safe to skip in production.

insert into public.profiles (id, phone, full_name, role, agency_name, verification_status, verified_at, locale)
values
    ('00000000-0000-0000-0000-000000000a01', '+254700000001', 'Brian Kilimani Realtors', 'agent',    'Kilimani Realtors', 'verified', now(), 'en'),
    ('00000000-0000-0000-0000-000000000a02', '+254700000002', 'Mama Wanjiku',              'landlord', null,                'verified', now(), 'en'),
    ('00000000-0000-0000-0000-000000000b01', '+254700000010', 'Test Tenant',               'tenant',   null,                'verified', now(), 'en')
on conflict (id) do nothing;

-- A handful of Kilimani listings for the dev UI to render.
insert into public.properties
    (owner_id, listed_by_agent, title, description, property_type, bedrooms, bathrooms, furnishing,
     rent_kes, deposit_months, viewing_fee_kes, county, sub_county, estate, address_line, location,
     amenities, status, listed_at)
values
    ('00000000-0000-0000-0000-000000000a01', true,
     'Spacious 2BR Apartment in Kilimani — Ngong Road',
     'Bright 2-bedroom apartment with master en-suite, balcony, ample natural light, '
     || 'borehole water backup and 24h security. Close to Yaya Centre, Junction Mall and '
     || 'Adams Arcade. Walking distance to Kilimani Primary.',
     'two_bed', 2, 2, 'semi',
     65000, 2, 1000, 'Nairobi', 'Dagoretti North', 'Kilimani', 'Off Ngong Road, near Yaya',
     ST_SetSRID(ST_MakePoint(36.7849, -1.2921), 4326)::geography,
     '{"water":"24h","electricity":"tokens","parking":true,"wifi":false,"gym":true,"pets_allowed":false,"balcony":true,"backup_water":true,"security":"24h_guard"}'::jsonb,
     'active', now()),

    ('00000000-0000-0000-0000-000000000a02', false,
     'Modern Bedsitter near Yaya Centre — Tenants Only',
     'Self-contained bedsitter with kitchenette, hot shower, and prepaid token meter. '
     || 'Quiet compound, gated, with on-site caretaker. Ideal for working professional.',
     'bedsitter', 0, 1, 'none',
     18000, 1, 0, 'Nairobi', 'Dagoretti North', 'Kilimani', 'Argwings Kodhek Road',
     ST_SetSRID(ST_MakePoint(36.7872, -1.2935), 4326)::geography,
     '{"water":"borehole","electricity":"tokens","parking":false,"wifi":false,"backup_water":true,"security":"caretaker"}'::jsonb,
     'active', now()),

    ('00000000-0000-0000-0000-000000000a01', true,
     '3BR + DSQ Maisonette — Wood Avenue',
     'Family maisonette with 3 spacious bedrooms, detached SQ, private garden, '
     || 'and parking for 2 cars. Quiet cul-de-sac, walking distance to Lavington Mall.',
     'maisonette', 3, 3, 'none',
     180000, 3, 2000, 'Nairobi', 'Dagoretti North', 'Kilimani', 'Wood Avenue',
     ST_SetSRID(ST_MakePoint(36.7811, -1.2945), 4326)::geography,
     '{"water":"24h","electricity":"postpaid","parking":true,"wifi":false,"garden":true,"pets_allowed":true,"backup_water":true,"security":"24h_guard"}'::jsonb,
     'active', now())
on conflict do nothing;
