// POST /api/listings — create a draft listing.
// Status defaults to 'draft' until photos are added (UI step that follows).

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const Body = z.object({
    title:           z.string().min(8).max(140),
    description:     z.string().min(30).max(4000),
    property_type:   z.enum([
        "bedsitter", "single", "studio", "one_bed", "two_bed", "three_bed",
        "four_plus_bed", "sq", "maisonette", "townhouse", "standalone", "commercial",
    ]),
    bedrooms:        z.number().int().min(0).max(12),
    bathrooms:       z.number().int().min(1).max(8),
    furnishing:      z.enum(["none", "semi", "full"]),
    rent_kes:        z.number().int().min(1000).max(10_000_000),
    deposit_months:  z.number().int().min(0).max(6),
    viewing_fee_kes: z.number().int().min(0).max(5000),
    county:          z.string(),
    sub_county:      z.string().nullable(),
    estate:          z.string(),
    address_line:    z.string().nullable(),
    lng:             z.number(),
    lat:             z.number(),
    amenities:       z.record(z.string(), z.unknown()),
    listed_by_agent: z.boolean(),
});

export async function POST(req: Request) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

    const json = await req.json().catch(() => null);
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const f = parsed.data;

    // PostgREST doesn't accept geography literals — pass via the SRID-tagged WKT
    // through a helper that uses ST_GeogFromText. Cleaner to do it via an RPC,
    // but for MVP we call ST_SetSRID via the supabase rpc 'create_property'...
    // For now we insert without coords and patch via admin RPC below.
    const insert = {
        owner_id: user.id,
        listed_by_agent: f.listed_by_agent,
        title: f.title,
        description: f.description,
        property_type: f.property_type,
        bedrooms: f.bedrooms,
        bathrooms: f.bathrooms,
        furnishing: f.furnishing,
        rent_kes: f.rent_kes,
        deposit_months: f.deposit_months,
        viewing_fee_kes: f.viewing_fee_kes,
        county: f.county,
        sub_county: f.sub_county,
        estate: f.estate,
        address_line: f.address_line,
        amenities: f.amenities,
        status: "draft" as const,
    };

    const { data, error } = await supabase
        .from("properties")
        .insert(insert)
        .select("id")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Set the location with a follow-up SQL via the user-scoped client.
    // RLS allows owner updates, so this works without service role.
    try {
        await supabase.rpc("set_property_location", { p_id: data.id, p_lng: f.lng, p_lat: f.lat });
    } catch {
        // RPC may not exist yet (migration not applied); non-fatal for draft.
    }

    return NextResponse.json({ id: data.id });
}
