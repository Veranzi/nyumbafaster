// Type-safe env access.
//
// CRITICAL: Next.js inlines `process.env.NEXT_PUBLIC_*` only when accessed via
// LITERAL property syntax (`process.env.FOO`). Dynamic access (`process.env[name]`)
// is NOT replaced at build time, so client bundles see `undefined`. Always read
// public vars by literal name below.

export const env = {
    supabase: {
        url:        process.env.NEXT_PUBLIC_SUPABASE_URL      ?? "",
        anonKey:    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        // Server-only — dynamic access is fine on the server.
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY     ?? "",
    },
    daraja: {
        env:            (process.env.DARAJA_ENV ?? "sandbox") as "sandbox" | "production",
        consumerKey:    process.env.DARAJA_CONSUMER_KEY ?? "",
        consumerSecret: process.env.DARAJA_CONSUMER_SECRET ?? "",
        shortcode:      process.env.DARAJA_SHORTCODE ?? "174379",
        passkey:        process.env.DARAJA_PASSKEY ?? "",
        callbackUrl:    process.env.DARAJA_CALLBACK_URL ?? "",
    },
    smileId: {
        env:        (process.env.SMILE_ID_ENV ?? "sandbox") as "sandbox" | "production",
        partnerId:  process.env.SMILE_ID_PARTNER_ID ?? "",
        apiKey:     process.env.SMILE_ID_API_KEY ?? "",
    },
    africasTalking: {
        username:   process.env.AT_USERNAME ?? "sandbox",
        apiKey:     process.env.AT_API_KEY ?? "",
        senderId:   process.env.AT_SMS_SENDER_ID ?? "NYUMBAFAST",
    },
    app: {
        url:            process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        defaultLocale:  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "en") as "en" | "sw",
        commissionBps:  Number(process.env.NEXT_PUBLIC_VIEWING_FEE_COMMISSION_BPS ?? process.env.KEJA_VIEWING_FEE_COMMISSION_BPS ?? 1000),
        maptilerKey:    process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "",
    },
    // Direct contact channel used while sign-in + M-Pesa are disabled.
    contact: {
        whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "",
        email:    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
    },
    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    },
} as const;

/**
 * True when the Supabase env vars look real — not empty, not the scaffold
 * placeholder. Use to short-circuit DB calls during initial setup so the dev
 * UI doesn't crash before the project is provisioned.
 */
export const isSupabaseConfigured =
    !!env.supabase.url &&
    !!env.supabase.anonKey &&
    !env.supabase.url.includes("YOUR-PROJECT") &&
    !env.supabase.anonKey.includes("replace-me");

export function assertServerEnv() {
    if (!env.supabase.url) throw new Error("NEXT_PUBLIC_SUPABASE_URL missing");
    if (!env.supabase.anonKey) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY missing");
    if (!env.supabase.serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
}
