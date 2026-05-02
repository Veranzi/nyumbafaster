// GET /api/smile-id/start — generate a Smile ID web link and redirect the user.
// Stores a 'pending' verification row keyed by Smile's ref id; webhook updates
// it once the user finishes the hosted flow.

import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { createSmileIdWebLink } from "@/lib/smile-id/client";
import { env } from "@/lib/env";

export async function GET() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(`${env.app.url}/sign-in?next=/dashboard/verify`);

    const link = await createSmileIdWebLink({
        userId: user.id,
        callbackUrl: `${env.app.url}/api/smile-id/webhook`,
    });

    const admin = createSupabaseAdminClient();
    await admin.from("verifications").insert({
        user_id: user.id,
        provider: "smile_id",
        provider_ref: link.refId,
        status: "pending",
    });
    await admin.from("profiles").update({ verification_status: "pending" }).eq("id", user.id);

    return NextResponse.redirect(link.link);
}
