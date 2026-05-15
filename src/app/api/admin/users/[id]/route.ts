import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const VALID_ROLES = ["tenant", "landlord", "agent", "admin"] as const;
const VALID_VERIFY = ["unverified", "pending", "verified", "rejected"] as const;

type UserRole = typeof VALID_ROLES[number];
type VerificationStatus = typeof VALID_VERIFY[number];

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const formData = await request.formData();
    const role = formData.get("role") as string | null;
    const verificationStatus = formData.get("verification_status") as string | null;

    const update: Partial<{
        role: UserRole;
        verification_status: VerificationStatus;
        verified_at: string;
    }> = {};

    if (role !== null) {
        if (!VALID_ROLES.includes(role as UserRole)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        update.role = role as UserRole;
    }

    if (verificationStatus !== null) {
        if (!VALID_VERIFY.includes(verificationStatus as VerificationStatus)) {
            return NextResponse.json({ error: "Invalid verification_status" }, { status: 400 });
        }
        update.verification_status = verificationStatus as VerificationStatus;
        if (verificationStatus === "verified") {
            update.verified_at = new Date().toISOString();
        }
    }

    if (Object.keys(update).length === 0) {
        return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { error } = await supabase.from("profiles").update(update).eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const referer = request.headers.get("referer") ?? "/admin/users";
    return NextResponse.redirect(referer, { status: 303 });
}
