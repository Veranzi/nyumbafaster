# Daraja (M-Pesa) integration

Production checklist (do NOT skip):

1. **Register an entity** with Companies Registry and obtain a CR12 / CR13.
2. **Open a business M-Pesa Paybill or Till** at any Safaricom shop (~2 weeks).
3. **Apply for Daraja production access** at https://developer.safaricom.co.ke/.
   Submit your Paybill number, CR12, and the use cases (we use STK Push and B2C).
   Approval is 2–3 weeks. Start this on day 1 of the build — it's the longest pole.
4. **Get the production passkey and credentials** from the Daraja portal once
   approved. Set them in production env vars (NEVER commit).
5. **Whitelist callback URLs** with Safaricom for production. Sandbox accepts any
   URL; production blocks anything not on file.
6. **Test the full STK loop** end-to-end with a real KES 1 transaction before
   announcing.

## Sandbox testing

The sandbox shortcode is `174379` (already in `.env.local`).

Use the test phone `254708374149` for the STK prompt; PIN is `12345`.
Real phones won't receive the prompt in sandbox.

## Callback exposure during dev

Daraja can't reach `localhost`. Use ngrok or a Cloudflare tunnel:

```bash
ngrok http 3000
# then set DARAJA_CALLBACK_URL=https://abcd1234.ngrok.app/api/mpesa/callback
```

## Why we don't use a wrapper SDK

`mpesa-node`, `daraja-mpesa-node`, etc. are unmaintained or add a service fee.
The Daraja surface we need (STK Push + B2C + Auth) is small. Direct integration
in `client.ts` + `stk-push.ts` is ~150 lines and we control it end-to-end.
