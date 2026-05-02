// Smile ID integration. Server-only.
//
// At MVP we use Smile ID's *web link* method: we generate a hosted KYC URL,
// redirect the user there, and they upload ID + selfie on Smile's domain.
// The result is delivered to our webhook. This avoids embedding Smile's SDK
// (which would inflate the client bundle and require their job-status polling).
//
// Endpoint reference:
//   - https://docs.usesmileid.com/web-api/web-link-flow

import "server-only";
import crypto from "node:crypto";
import { env } from "@/lib/env";

const BASE = {
    sandbox:    "https://testapi.smileidentity.com/v1",
    production: "https://api.smileidentity.com/v1",
} as const;

/**
 * Smile ID signs requests with HMAC-SHA256 over the timestamp using your
 * partner API key. Server returns { signature, timestamp } that the client
 * library would normally compute.
 */
function sign() {
    const timestamp = new Date().toISOString();
    const hmac = crypto.createHmac("sha256", env.smileId.apiKey);
    hmac.update(timestamp);
    hmac.update(env.smileId.partnerId);
    hmac.update("sid_request");
    return { timestamp, signature: hmac.digest("base64") };
}

export type CreateWebLinkArgs = {
    userId: string;       // our profiles.id
    callbackUrl: string;  // Smile webhook → our /api/smile-id/webhook
    productCode?: "biometric_kyc" | "doc_verification" | "enhanced_kyc";
};

export type CreateWebLinkResult = {
    link: string;         // hosted URL to redirect the user to
    refId: string;        // Smile's job_id
};

export async function createSmileIdWebLink(args: CreateWebLinkArgs): Promise<CreateWebLinkResult> {
    if (!env.smileId.apiKey || !env.smileId.partnerId) {
        // In dev without creds, fall back to a mock so the verify flow is testable.
        return {
            link: `/dashboard/verify/mock?user_id=${encodeURIComponent(args.userId)}`,
            refId: `mock_${crypto.randomBytes(8).toString("hex")}`,
        };
    }

    const { timestamp, signature } = sign();
    const body = {
        signature,
        timestamp,
        partner_id: env.smileId.partnerId,
        user_id: args.userId,
        callback_url: args.callbackUrl,
        product: args.productCode ?? "biometric_kyc",
        country: "KE",
        id_types: [{ country: "KE", id_type: "NATIONAL_ID" }],
    };

    const res = await fetch(`${BASE[env.smileId.env]}/smile_links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Smile ID link create failed: ${res.status} ${text}`);
    }

    const data = (await res.json()) as { link: string; ref_id: string };
    return { link: data.link, refId: data.ref_id };
}

/** Hash a national ID number for storage. We never persist the raw value. */
export function hashIdNumber(raw: string): string {
    return crypto.createHash("sha256").update(raw.trim().toUpperCase()).digest("hex");
}
