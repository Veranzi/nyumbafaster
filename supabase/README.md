# Keja Supabase setup

Two ways to run the database:

## A. Supabase Cloud (recommended for dev)

1. Create a project at https://supabase.com.
2. In the SQL editor, run each file in `migrations/` in order (`0001` → `0009`).
3. Copy `Project URL`, `anon` key, and `service_role` key from **Settings → API** into `.env.local`.

## B. Local stack (Docker)

```bash
pnpm dlx supabase init      # writes supabase/config.toml if missing
pnpm dlx supabase start     # boots Postgres + Studio + GoTrue at :54323
pnpm dlx supabase db reset  # applies every migrations/*.sql in order
```

## Storage buckets

Create one bucket called `property-media` with **public read** enabled (the
`property_media.storage_path` column resolves to it).

```sql
insert into storage.buckets (id, name, public) values ('property-media', 'property-media', true);
```

## Auth provider config

In **Authentication → Providers**, enable **Phone** and configure either Twilio
(prod) or the Africa's Talking custom SMS hook (recommended for KE deliverability).

For dev, the test OTP `123456` works against any phone number when running locally.
