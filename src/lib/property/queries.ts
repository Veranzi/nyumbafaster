// Server-side property queries.
// Public listings only — RLS already restricts non-active rows for non-owners,
// but we double-belt with explicit status='active' on the public surface.

import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Property, PropertyMedia, PublicProfile } from "@/lib/supabase/types";
import { demoListItems, demoDetail } from "./demo-listings";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/property-media/`;

export type Filters = {
    q?: string;                       // estate / free text
    minRent?: number;
    maxRent?: number;
    bedrooms?: "studio" | number;     // "studio" → bedrooms = 0
    furnishing?: "none" | "semi" | "full";
    amenities?: string[];             // e.g. ["water_24h", "parking"]
};

export function parseFilters(sp: URLSearchParams): Filters {
    const f: Filters = {};
    const q = sp.get("q");
    if (q) f.q = q;
    const min = Number(sp.get("min_rent"));
    if (Number.isFinite(min) && min > 0) f.minRent = min;
    const max = Number(sp.get("max_rent"));
    if (Number.isFinite(max) && max > 0) f.maxRent = max;
    const br = sp.get("bedrooms");
    if (br === "studio") f.bedrooms = "studio";
    else if (br && /^[1-4]$/.test(br)) f.bedrooms = Number(br);
    const fu = sp.get("furnishing");
    if (fu === "none" || fu === "semi" || fu === "full") f.furnishing = fu;
    const am = sp.get("amenities");
    if (am) f.amenities = am.split(",").filter(Boolean);
    return f;
}

export type PropertyListItem = Pick<
    Property,
    "id" | "title" | "estate" | "sub_county" | "rent_kes" | "bedrooms"
    | "bathrooms" | "property_type" | "viewing_fee_kes" | "listed_by_agent"
> & {
    cover_url: string | null;
    owner: Pick<PublicProfile, "full_name" | "agency_name" | "verification_status"> | null;
};

export async function listProperties(filters: Filters, limit = 30): Promise<PropertyListItem[]> {
    if (!isSupabaseConfigured) return demoListItems(filters, limit);

    const supabase = await createSupabaseServerClient();

    // Lean column set — we don't pull description/amenities for the index page.
    let query = supabase
        .from("properties")
        .select(
            "id,title,estate,sub_county,rent_kes,bedrooms,bathrooms,property_type," +
            "viewing_fee_kes,listed_by_agent," +
            "owner:profiles!properties_owner_id_fkey(full_name,agency_name,verification_status)," +
            "media:property_media(storage_path,sort_order)",
        )
        .eq("status", "active")
        .order("listed_at", { ascending: false })
        .limit(limit);

    if (filters.minRent) query = query.gte("rent_kes", filters.minRent);
    if (filters.maxRent) query = query.lte("rent_kes", filters.maxRent);
    if (filters.furnishing) query = query.eq("furnishing", filters.furnishing);

    if (filters.bedrooms === "studio") query = query.eq("bedrooms", 0);
    else if (typeof filters.bedrooms === "number") {
        query = filters.bedrooms === 4
            ? query.gte("bedrooms", 4)
            : query.eq("bedrooms", filters.bedrooms);
    }

    if (filters.q) {
        // Cheap path: ILIKE on estate; full text search via search_tsv is wired up
        // in the migration but we don't expose plainto_tsquery via PostgREST without
        // an RPC. Adding that RPC is in the v2 polish list.
        query = query.ilike("estate", `%${filters.q}%`);
    }

    if (filters.amenities?.length) {
        // jsonb amenity flags. "water_24h" + "security_24h" map to specific values,
        // others are boolean true.
        for (const a of filters.amenities) {
            if (a === "water_24h")        query = query.eq("amenities->>water", "24h");
            else if (a === "security_24h") query = query.eq("amenities->>security", "24h_guard");
            else                           query = query.eq(`amenities->>${a}`, "true");
        }
    }

    type Row = Pick<
        Property,
        "id" | "title" | "estate" | "sub_county" | "rent_kes" | "bedrooms"
        | "bathrooms" | "property_type" | "viewing_fee_kes" | "listed_by_agent"
    > & {
        media: Array<{ storage_path: string; sort_order: number }> | null;
        owner: Pick<PublicProfile, "full_name" | "agency_name" | "verification_status"> | Pick<PublicProfile, "full_name" | "agency_name" | "verification_status">[] | null;
    };

    const { data, error } = await query.returns<Row[]>();
    if (error) throw error;

    return (data ?? []).map((row) => {
        const media = row.media ?? [];
        const cover = [...media].sort((a, b) => a.sort_order - b.sort_order)[0];
        const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
        return {
            id: row.id,
            title: row.title,
            estate: row.estate,
            sub_county: row.sub_county,
            rent_kes: row.rent_kes,
            bedrooms: row.bedrooms,
            bathrooms: row.bathrooms,
            property_type: row.property_type,
            viewing_fee_kes: row.viewing_fee_kes,
            listed_by_agent: row.listed_by_agent,
            cover_url: cover ? mediaUrl(cover.storage_path) : null,
            owner: owner ?? null,
        } as PropertyListItem;
    });
}

export type PropertyDetail = Property & {
    media: PropertyMedia[];
    owner: PublicProfile | null;
    coords: { lng: number; lat: number } | null;
};

export async function getPropertyById(id: string): Promise<PropertyDetail | null> {
    if (!isSupabaseConfigured) return demoDetail(id);

    const supabase = await createSupabaseServerClient();

    type Row = Property & {
        media: PropertyMedia[] | null;
        owner: PublicProfile | PublicProfile[] | null;
    };

    const { data, error } = await supabase
        .from("properties")
        .select(
            "*," +
            "media:property_media(*)," +
            "owner:profiles!properties_owner_id_fkey(id,full_name,role,avatar_url,agency_name,rating_avg,rating_count,verification_status)",
        )
        .eq("id", id)
        .maybeSingle()
        .returns<Row | null>();

    if (error) throw error;
    if (!data) return null;

    // Postgres returns geography as a hex string by default. We need lng/lat
    // for the map; ask the API via an RPC for big lists, but for a single row
    // we can call a tiny function. Skipped for MVP — wire ST_AsGeoJSON via an
    // RPC `property_coords(id)` later if needed.
    const coords = null;

    const owner = Array.isArray(data.owner) ? data.owner[0] : data.owner;
    return { ...data, media: data.media ?? [], owner: owner ?? null, coords };
}

export function mediaUrl(path: string): string {
    // Local /public paths (start with /) are served directly by Next.js.
    // Anything else is a Supabase Storage object key.
    if (path.startsWith("/") || path.startsWith("http")) return path;
    return `${STORAGE_BASE}${path}`;
}
