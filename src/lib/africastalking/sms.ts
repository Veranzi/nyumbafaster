// Africa's Talking SMS sender. Server-only.
// Sandbox username "sandbox" works without a real API key for dev — messages
// don't actually deliver but the API responds 201 OK.

import "server-only";
import { env } from "@/lib/env";
import { normalizeKenyanMobile } from "@/lib/format";

const BASE = {
    production: "https://api.africastalking.com/version1/messaging",
    sandbox:    "https://api.sandbox.africastalking.com/version1/messaging",
} as const;

export async function sendSms(args: { to: string; body: string }): Promise<void> {
    const to = normalizeKenyanMobile(args.to);
    if (!to) throw new Error("Invalid Kenyan mobile");

    const isProd = env.africasTalking.username !== "sandbox";
    const url = isProd ? BASE.production : BASE.sandbox;

    if (!env.africasTalking.apiKey && isProd) {
        throw new Error("AT_API_KEY required for production SMS");
    }

    const params = new URLSearchParams({
        username: env.africasTalking.username,
        to,
        message: args.body,
        from: env.africasTalking.senderId,
    });

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            apiKey: env.africasTalking.apiKey || "sandbox",
        },
        body: params.toString(),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`AT SMS failed: ${res.status} ${text}`);
    }
}
