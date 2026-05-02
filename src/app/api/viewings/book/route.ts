// POST /api/viewings/book
// 1. Validate input.
// 2. RPC create_viewing_with_payment — atomic insert of viewing + payment row.
// 3. If a viewing fee > 0, fire Daraja STK Push and persist CheckoutRequestID.
// 4. Return so client can show "check your phone" UI.

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { stkPush } from "@/lib/daraja/stk-push";
import { normalizeKenyanMobile } from "@/lib/format";

const Body = z.object({
    property_id:   z.string().uuid(),
    scheduled_for: z.string().datetime({ offset: true }).or(z.string().min(10)),
    msisdn:        z.string().min(7).optional().default(""),
    note:          z.string().max(500).optional().default(""),
});

export async function POST(req: Request) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

    // Verified-only: tenants must complete Smile ID before paying viewing fees.
    const { data: profile } = await supabase
        .from("profiles")
        .select("verification_status")
        .eq("id", user.id)
        .maybeSingle();
    if (profile?.verification_status !== "verified") {
        return NextResponse.json(
            { error: "ID verification required before booking", code: "verification_required" },
            { status: 403 },
        );
    }

    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }
    const f = parsed.data;
    const scheduledFor = new Date(f.scheduled_for);
    if (Number.isNaN(scheduledFor.valueOf())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const msisdn = f.msisdn ? normalizeKenyanMobile(f.msisdn) : null;

    // RPC inserts viewing + payment atomically, scoped by RLS to the caller.
    const { data: rpc, error: rpcErr } = await supabase
        .rpc("create_viewing_with_payment", {
            p_property_id: f.property_id,
            p_scheduled_for: scheduledFor.toISOString(),
            p_msisdn: msisdn ?? "",
            p_note: f.note,
        })
        .single();

    if (rpcErr || !rpc) {
        return NextResponse.json({ error: rpcErr?.message ?? "Booking failed" }, { status: 400 });
    }

    const result = rpc as { viewing_id: string; payment_id: string | null; viewing_fee_kes: number };

    if (result.viewing_fee_kes === 0 || !result.payment_id) {
        return NextResponse.json({ viewing_id: result.viewing_id, stk_pending: false });
    }

    if (!msisdn) {
        return NextResponse.json({ error: "Phone required for paid viewings" }, { status: 400 });
    }

    // Fire STK push. We use the admin client to update the payment row with the
    // CheckoutRequestID afterwards — RLS on payments.update is service-only.
    try {
        const stk = await stkPush({
            msisdn,
            amountKes: result.viewing_fee_kes,
            accountReference: `NF-${result.viewing_id.slice(0, 8)}`,
            transactionDesc: "Viewing fee",
        });

        const admin = createSupabaseAdminClient();
        await admin
            .from("payments")
            .update({ mpesa_request_id: stk.checkoutRequestId, provider: "daraja" })
            .eq("id", result.payment_id);

        return NextResponse.json({
            viewing_id: result.viewing_id,
            payment_id: result.payment_id,
            stk_pending: true,
            customer_message: stk.customerMessage,
        });
    } catch (e) {
        // STK push failed — mark payment failed; the viewing row stays so the
        // tenant can retry payment from the dashboard.
        const admin = createSupabaseAdminClient();
        await admin
            .from("payments")
            .update({ status: "failed", failure_reason: (e as Error).message })
            .eq("id", result.payment_id);

        return NextResponse.json(
            { error: `M-Pesa push failed: ${(e as Error).message}` },
            { status: 502 },
        );
    }
}
