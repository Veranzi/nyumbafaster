// Minimal Daraja (M-Pesa) HTTP client. Server-only.
//
// Why hand-rolled instead of a wrapper SDK:
// - Wrappers (intasend-node, mpesa-node) are unmaintained or add fees.
// - Daraja's surface for STK Push + B2C is small enough to write directly.
// - Token caching is the only non-trivial bit; ~100 LoC handles it.

import "server-only";
import { env } from "@/lib/env";

const BASE = {
    sandbox:    "https://sandbox.safaricom.co.ke",
    production: "https://api.safaricom.co.ke",
} as const;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
        return cachedToken.token;
    }
    if (!env.daraja.consumerKey || !env.daraja.consumerSecret) {
        throw new Error("Daraja credentials not configured");
    }

    const auth = Buffer.from(
        `${env.daraja.consumerKey}:${env.daraja.consumerSecret}`,
    ).toString("base64");

    const res = await fetch(
        `${BASE[env.daraja.env]}/oauth/v1/generate?grant_type=client_credentials`,
        { headers: { Authorization: `Basic ${auth}` }, cache: "no-store" },
    );

    if (!res.ok) throw new Error(`Daraja auth failed: ${res.status}`);

    const body = (await res.json()) as { access_token: string; expires_in: string };
    const expiresIn = Number(body.expires_in) * 1000;
    cachedToken = { token: body.access_token, expiresAt: Date.now() + expiresIn };
    return cachedToken.token;
}

export async function darajaFetch<T>(
    path: string,
    init: { method?: string; headers?: HeadersInit; body?: unknown } = {},
): Promise<T> {
    const token = await getAccessToken();
    const res = await fetch(`${BASE[env.daraja.env]}${path}`, {
        method: init.method ?? "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...(init.headers ?? {}),
        },
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
        cache: "no-store",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Daraja ${path} failed: ${res.status} ${text}`);
    }
    return (await res.json()) as T;
}

/** STK Push timestamp + password. Daraja wants YYYYMMDDHHmmss in EAT. */
export function stkPushAuth() {
    const now = new Date();
    // Africa/Nairobi is UTC+3 with no DST.
    const eat = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const ts =
        eat.getUTCFullYear().toString() +
        String(eat.getUTCMonth() + 1).padStart(2, "0") +
        String(eat.getUTCDate()).padStart(2, "0") +
        String(eat.getUTCHours()).padStart(2, "0") +
        String(eat.getUTCMinutes()).padStart(2, "0") +
        String(eat.getUTCSeconds()).padStart(2, "0");

    const password = Buffer.from(
        `${env.daraja.shortcode}${env.daraja.passkey}${ts}`,
    ).toString("base64");

    return { timestamp: ts, password };
}
