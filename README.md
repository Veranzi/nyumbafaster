# Q-uills

A Kenya-focused rental marketplace. Web MVP for Nairobi (Kilimani launch market).
Verified landlords and agents, escrowed M-Pesa viewing fees, in-app chat.

> **Status:** scaffold + vertical slice. Auth, listings, search, booking flow,
> M-Pesa STK push, and Smile ID verification are wired against sandbox APIs.
> Photo upload, two-way reviews, alerts, and the messages thread UI ship next.

---

## Stack

| Layer            | Choice                                                |
|------------------|-------------------------------------------------------|
| Web              | Next.js 16 (App Router) + TypeScript + Tailwind 4    |
| DB / Auth        | Supabase (Postgres + RLS + Realtime + Storage)        |
| Payments         | Daraja (M-Pesa STK Push + B2C)                        |
| ID verification  | Smile ID (web link flow)                              |
| SMS              | Africa's Talking                                      |
| Maps             | MapLibre + MapTiler                                   |
| i18n             | next-intl (EN at launch, SW strings ready)            |

## Quick start

```bash
pnpm install
cp .env.local.example .env.local        # then fill values
pnpm dev
```

The app boots at http://localhost:3000. Listings, search, and the landing page
render even without Supabase configured (showing an empty state).

### Supabase

Either point at a hosted project or run the local stack — see
[`supabase/README.md`](./supabase/README.md). Apply migrations in order
(`0001` → `0010`). Create a public storage bucket named `property-media`.

### Daraja sandbox (M-Pesa)

1. Create a developer account at https://developer.safaricom.co.ke/.
2. Create a **Lipa Na M-Pesa Online** sandbox app, copy the consumer key/secret.
3. Sandbox shortcode is `174379`, test phone is `254708374149` / PIN `12345`.
4. Expose your local dev to Daraja with ngrok:
   ```
   ngrok http 3000
   # then set DARAJA_CALLBACK_URL=https://<id>.ngrok.app/api/mpesa/callback
   ```

### Smile ID sandbox

Get a partner ID + API key at https://portal.usesmileid.com/. With creds blank,
the app falls back to a mock verification flow (`/dashboard/verify/mock`) so the
rest of the booking flow is testable.

### Africa's Talking

Default `AT_USERNAME=sandbox` works out of the box for SMS in dev (messages don't
deliver but the API responds OK). For production, register a sender ID — that
takes ~3 working days to approve.

## Project layout

```
quills/
├── messages/{en,sw}.json        i18n strings
├── middleware.ts                Supabase session refresh
├── supabase/migrations/         schema + RLS + RPCs (0001…0010)
└── src/
    ├── app/                     Next.js routes
    │   ├── (public)            landing, /houses, /houses/[id], /sign-in
    │   ├── dashboard/          host & tenant area
    │   └── api/                Daraja, Smile ID, viewings, listings
    ├── components/             nav, footer, ui/, property-card, search-filters, listing-map
    ├── lib/
    │   ├── supabase/           client.ts, server.ts, middleware.ts, types.ts
    │   ├── daraja/             STK push + auth + callback parser
    │   ├── smile-id/           web-link client + ID hash
    │   ├── africastalking/     SMS sender
    │   ├── property/           queries, amenities taxonomy
    │   ├── geo/kenya.ts        estate centroids
    │   ├── format.ts           KES + Kenyan-mobile normalizer
    │   ├── env.ts              type-safe env access
    │   └── utils.ts            cn()
    └── i18n/request.ts          next-intl request config
```

## Key flows

### Booking a viewing (tenant)

1. `/houses/[id]` → "Book viewing" (signed-out → /sign-in).
2. `/houses/[id]/book` collects schedule + M-Pesa phone.
3. `POST /api/viewings/book`:
   - Calls RPC `create_viewing_with_payment` (atomic insert).
   - Fires `stkPush()` to Daraja.
   - Updates payment row with `CheckoutRequestID`.
4. User enters M-Pesa PIN on phone.
5. Daraja → `POST /api/mpesa/callback` → marks payment success, escrow held.
6. After viewing: `POST /api/viewings/[id]/confirm` releases escrow (minus 10%).

### ID verification

1. `/dashboard/verify` → "Start verification".
2. `GET /api/smile-id/start` → redirects to Smile-hosted KYC page.
3. User completes flow on Smile's domain.
4. Smile → `POST /api/smile-id/webhook` → updates `verifications` + `profiles.verification_status`.

## Launch checklist (do not skip)

| Item                                                              | Lead time   |
|-------------------------------------------------------------------|-------------|
| Register a Kenyan business entity (Sole Prop / Ltd)               | 1–2 weeks   |
| Open a business M-Pesa Paybill or Till                            | 2 weeks     |
| Apply for Daraja **production** access (needs Paybill + CR12)     | 2–3 weeks   |
| Smile ID production account (needs registered entity)             | 1 week      |
| Africa's Talking sender ID approval                               | 3 days      |
| ODPC data controller registration (KES 4,000/yr)                  | same week   |
| Whitelist Daraja callback IPs in your reverse proxy               | day-of      |
| KYC seed agents in Kilimani for 100+ live listings (ops work)     | 4 weeks     |

## Things to delete or fix before public launch

- The mock fallback in `lib/smile-id/client.ts` (`/dashboard/verify/mock`).
- The seed data migration `0009_seed_kilimani.sql` — it inserts dev profiles
  with deterministic UUIDs that won't exist in `auth.users` in production.
- The "free demo" RLS allowance in 0008 that lets unauthenticated requests
  read `properties` — it's currently scoped to `status = 'active'` which is
  correct, but audit before opening the API to the public.
- B2C disbursement in `/api/viewings/[id]/confirm` is a TODO. Until it ships,
  Q-uills settles agents weekly via spreadsheet → manual M-Pesa transfer.
