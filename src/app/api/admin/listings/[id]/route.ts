import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["active", "draft", "rented", "inactive"] as const;
type ListingStatus = typeof VALID_STATUSES[number];

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
    const status = formData.get("status") as ListingStatus;

    if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { error } = await supabase
        .from("properties")
        .update({ status })
        .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const referer = request.headers.get("referer") ?? "/admin/listings";
    return NextResponse.redirect(referer, { status: 303 });
}
