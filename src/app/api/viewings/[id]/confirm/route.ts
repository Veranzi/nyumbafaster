// POST /api/viewings/[id]/confirm
//
// Both parties confirm the viewing happened → escrow releases to host (minus
// NyumbaFaster's commission). If tenant marks "no show" or "fake listing", we hold and
// open a dispute — funds release to neither side until a human reviews.
//
// Bidirectional confirmation prevents either side gaming the system. MVP only
// requires the tenant to confirm; v2 will add a host-side confirm + 48h
// dispute window before automatic release.

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const Body = z.object({
    outcome: z.enum(["completed", "no_show_owner", "disputed"]),
    note:    z.string().max(500).optional(),
});

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

    // Read viewing scoped via RLS — caller must be tenant or owner.
    const { data: viewing, error } = await supabase
        .from("viewings")
        .select("id,tenant_id,owner_id,viewing_fee_kes,escrow_status,status")
        .eq("id", id)
        .maybeSingle();

    if (error || !viewing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (viewing.tenant_id !== user.id) {
        return NextResponse.json({ error: "Only the tenant can confirm" }, { status: 403 });
    }
    if (viewing.status !== "confirmed" && viewing.status !== "requested") {
        return NextResponse.json({ error: `Viewing is ${viewing.status}` }, { status: 409 });
    }

    const admin = createSupabaseAdminClient();
    const now = new Date().toISOString();

    if (parsed.data.outcome === "completed") {
        const feeKes = viewing.viewing_fee_kes;
        const commissionKes = Math.floor((feeKes * env.app.commissionBps) / 10_000);
        // payoutKes = feeKes - commissionKes; computed but not yet used (B2C disbursement is v2)
        void commissionKes;

        await admin.from("viewings").update({
            status: "completed",
            escrow_status: feeKes > 0 ? "released" : "none",
            completed_at: now,
        }).eq("id", id);

        if (feeKes > 0) {
            // Mark the original viewing-fee payment with the commission breakdown.
            await admin.from("payments").update({
                fee_bps: env.app.commissionBps,
                fee_kes: commissionKes,
            }).eq("related_viewing_id", id).eq("kind", "viewing_fee");

            // TODO v2: trigger Daraja B2C to disburse `payoutKes` to host's
            // M-Pesa. For MVP we settle weekly via spreadsheet/manual transfer.
        }
    } else if (parsed.data.outcome === "no_show_owner") {
        // Tenant showed up, host didn't. Refund tenant + flag host.
        await admin.from("viewings").update({
            status: "no_show_owner",
            escrow_status: viewing.viewing_fee_kes > 0 ? "refunded" : "none",
            cancellation_reason: parsed.data.note ?? null,
        }).eq("id", id);

        if (viewing.viewing_fee_kes > 0) {
            // TODO v2: Daraja reversal API. For MVP, mark for manual refund via
            // a queue an ops person works through twice a week.
            await admin.from("payments").insert({
                user_id: viewing.tenant_id,
                counterparty_id: viewing.owner_id,
                kind: "refund",
                amount_kes: viewing.viewing_fee_kes,
                status: "pending",
                related_viewing_id: id,
            });
        }
    } else {
        // disputed — hold escrow until human review.
        await admin.from("viewings").update({
            status: "disputed",
            escrow_status: "disputed",
            cancellation_reason: parsed.data.note ?? null,
        }).eq("id", id);
    }

    return NextResponse.json({ ok: true });
}
