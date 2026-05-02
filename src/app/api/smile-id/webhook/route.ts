// Smile ID webhook. Called when a hosted KYC flow concludes.
// Documented payload shape: https://docs.usesmileid.com/integration-options/web-api
// We only need ResultCode + JobComplete + the partner_params.user_id.

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { hashIdNumber } from "@/lib/smile-id/client";

export const runtime = "nodejs";

type Payload = {
    ResultCode?: string;          // "0810" / "0811" verified ranges
    ResultText?: string;
    JobComplete?: boolean;
    PartnerParams?: { user_id?: string };
    Actions?: Record<string, string>;
    IDNumber?: string;
};

const VERIFIED_CODES = new Set(["0810", "0811", "0812", "0820", "0821"]);

export async function POST(req: Request) {
    const body = (await req.json().catch(() => null)) as Payload | null;
    if (!body || !body.JobComplete || !body.PartnerParams?.user_id) {
        return NextResponse.json({ error: "Bad payload" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const userId = body.PartnerParams.user_id;
    const verified = body.ResultCode ? VERIFIED_CODES.has(body.ResultCode) : false;

    await admin.from("verifications").update({
        status: verified ? "verified" : "rejected",
        rejection_reason: verified ? null : (body.ResultText ?? "rejected"),
        id_number_hash: body.IDNumber ? hashIdNumber(body.IDNumber) : null,
        raw_payload: body,
        decided_at: new Date().toISOString(),
    }).eq("user_id", userId).eq("status", "pending");

    await admin.from("profiles").update({
        verification_status: verified ? "verified" : "rejected",
        verified_at: verified ? new Date().toISOString() : null,
    }).eq("id", userId);

    return NextResponse.json({ ok: true });
}
