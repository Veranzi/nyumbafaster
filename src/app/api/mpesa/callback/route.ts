// Daraja STK Push callback. Safaricom POSTs here after the customer confirms
// or rejects the prompt on their phone.
//
// Idempotency: Daraja retries duplicate callbacks for the same CheckoutRequestID
// — we rely on the unique index (provider, mpesa_request_id) on payments and
// guard with a status check.
//
// Auth: Safaricom does NOT sign callbacks. The only protection is a hard-to-guess
// callback URL. For production, also bind to a static IP allow-list in your
// reverse proxy (Safaricom publishes their egress IPs).

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { parseStkCallback, type StkCallback } from "@/lib/daraja/stk-push";

export const runtime = "nodejs";  // ensure Node runtime for the admin client

export async function POST(req: Request) {
    const payload = (await req.json().catch(() => null)) as StkCallback | null;
    if (!payload?.Body?.stkCallback?.CheckoutRequestID) {
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Bad payload" }, { status: 400 });
    }

    const cb = parseStkCallback(payload);
    const admin = createSupabaseAdminClient();

    // Find the pending payment by CheckoutRequestID.
    const { data: payment, error: findErr } = await admin
        .from("payments")
        .select("id,status,related_viewing_id")
        .eq("mpesa_request_id", cb.checkoutRequestId)
        .maybeSingle();

    if (findErr || !payment) {
        // Acknowledge anyway so Safaricom stops retrying — log for triage.
        console.error("Daraja callback: payment not found", cb.checkoutRequestId, findErr);
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted (orphan)" });
    }
    if (payment.status !== "pending") {
        // Duplicate. Acknowledge.
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Already processed" });
    }

    if (cb.success) {
        await admin
            .from("payments")
            .update({
                status: "success",
                mpesa_receipt: cb.mpesaReceipt,
                msisdn: `+${cb.phoneNumber}`,
                completed_at: new Date().toISOString(),
                raw_callback: payload,
            })
            .eq("id", payment.id);

        // Money is in escrow; viewing.escrow_status was set to 'held' at booking
        // time. Nothing else to do until the viewing completes (then it flips to
        // 'released' via /api/viewings/[id]/confirm).
    } else {
        await admin
            .from("payments")
            .update({
                status: "failed",
                failure_reason: cb.resultDesc,
                raw_callback: payload,
            })
            .eq("id", payment.id);

        // Roll the viewing back: tenant didn't pay, host shouldn't be on the hook.
        if (payment.related_viewing_id) {
            await admin
                .from("viewings")
                .update({ status: "cancelled", escrow_status: "none", cancellation_reason: cb.resultDesc })
                .eq("id", payment.related_viewing_id);
        }
    }

    // Daraja expects 200 with this body shape; otherwise it retries.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
