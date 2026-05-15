import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    return profile?.role === "admin" ? user : null;
}

// POST — save a media record after client-side storage upload
export async function POST(request: NextRequest, { params }: Params) {
    const supabase = await createSupabaseServerClient();
    if (!await requireAdmin(supabase)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id: property_id } = await params;
    const body = await request.json().catch(() => null);
    const { kind, storage_path, sort_order } = body ?? {};

    if (!["photo", "video"].includes(kind) || !storage_path) {
        return NextResponse.json({ error: "kind and storage_path required" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("property_media")
        .insert({ property_id, kind, storage_path, sort_order: sort_order ?? 0 })
        .select("id,kind,storage_path,sort_order")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ media: data });
}

// DELETE — remove DB record and storage object
export async function DELETE(request: NextRequest, { params }: Params) {
    const supabase = await createSupabaseServerClient();
    if (!await requireAdmin(supabase)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id: property_id } = await params;
    const { mediaId } = await request.json().catch(() => ({}));
    if (!mediaId) return NextResponse.json({ error: "mediaId required" }, { status: 400 });

    const { data: record } = await supabase
        .from("property_media")
        .select("storage_path")
        .eq("id", mediaId)
        .eq("property_id", property_id)
        .maybeSingle();

    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Remove from storage (non-fatal if missing)
    await supabase.storage.from("property-media").remove([record.storage_path]);

    const { error } = await supabase.from("property_media").delete().eq("id", mediaId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
}

// PATCH — update sort_order for multiple photos at once
export async function PATCH(request: NextRequest, { params }: Params) {
    const supabase = await createSupabaseServerClient();
    if (!await requireAdmin(supabase)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await params; // consume params
    const { order } = await request.json().catch(() => ({}));
    if (!Array.isArray(order)) return NextResponse.json({ error: "order array required" }, { status: 400 });

    // order = [{ id, sort_order }, ...]
    await Promise.all(
        (order as { id: string; sort_order: number }[]).map(({ id, sort_order }) =>
            supabase.from("property_media").update({ sort_order }).eq("id", id),
        ),
    );

    return NextResponse.json({ ok: true });
}
