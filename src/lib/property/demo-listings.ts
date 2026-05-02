// In-memory demo listings used while Supabase isn't configured.
// Cycles through every image1-16.jpeg + video1-8.mp4 in /public so the storefront
// has real content to render. Once a real Supabase project is wired up these
// fall away — the queries module checks isSupabaseConfigured first.
//
// User said (2026-05-03): "you can randomly use the images and videos from public
// folder then ill tell you tomorrow the correct locations and details" — so
// titles/descriptions/amenities below are PLACEHOLDERS. Replace before launch.

import type {
    Property, PropertyMedia, PublicProfile,
    PropertyType, Furnishing, ListingStatus,
} from "@/lib/supabase/types";
import type { PropertyListItem, PropertyDetail, Filters } from "./queries";

const NOW = "2026-05-03T00:00:00Z";

// ─── Hosts ────────────────────────────────────────────────
const owner1: PublicProfile = {
    id: "demo-owner-1",
    full_name: "Brian Mwangi",
    role: "agent",
    avatar_url: null,
    agency_name: "Kilimani Realtors",
    rating_avg: 4.7,
    rating_count: 23,
    verification_status: "verified",
};
const owner2: PublicProfile = {
    id: "demo-owner-2",
    full_name: "Mama Wanjiku",
    role: "landlord",
    avatar_url: null,
    agency_name: null,
    rating_avg: 4.9,
    rating_count: 11,
    verification_status: "verified",
};
const owner3: PublicProfile = {
    id: "demo-owner-3",
    full_name: "Faith Akinyi",
    role: "agent",
    avatar_url: null,
    agency_name: "Westlands Premier",
    rating_avg: 4.5,
    rating_count: 17,
    verification_status: "verified",
};

// ─── Listings ────────────────────────────────────────────
type DemoSeed = {
    id: string;
    title: string;
    description: string;
    property_type: PropertyType;
    bedrooms: number;
    bathrooms: number;
    furnishing: Furnishing;
    rent_kes: number;
    deposit_months: number;
    viewing_fee_kes: number;
    estate: string;
    sub_county: string;
    address_line: string;
    amenities: Record<string, unknown>;
    images: string[];
    video?: string;
    owner: PublicProfile;
    listed_by_agent: boolean;
};

const SEEDS: DemoSeed[] = [
    {
        id: "demo-kil-2br-ngong",
        title: "Bright 2BR Apartment off Ngong Road",
        description:
            "Spacious 2-bedroom apartment with master en-suite, open-plan living and " +
            "natural light all day. Borehole water backup, 24h security and tokens electricity. " +
            "Walking distance to Yaya Centre, Junction Mall and Adams Arcade.",
        property_type: "two_bed", bedrooms: 2, bathrooms: 2, furnishing: "semi",
        rent_kes: 65000, deposit_months: 2, viewing_fee_kes: 1000,
        estate: "Kilimani", sub_county: "Dagoretti North",
        address_line: "Off Ngong Road, near Yaya Centre",
        amenities: {
            water: "24h", electricity: "tokens", parking: true, wifi: false, gym: true,
            backup_water: true, security: "24h_guard", balcony: true, pets_allowed: false,
        },
        images: ["/image1.jpeg", "/image2.jpeg"],
        video: "/video1.mp4",
        owner: owner1, listed_by_agent: true,
    },
    {
        id: "demo-kil-bedsitter-argwings",
        title: "Modern Bedsitter near Yaya Centre",
        description:
            "Self-contained bedsitter with kitchenette, hot shower and prepaid token meter. " +
            "Quiet gated compound with on-site caretaker. Ideal for a working professional " +
            "or student.",
        property_type: "bedsitter", bedrooms: 0, bathrooms: 1, furnishing: "none",
        rent_kes: 18000, deposit_months: 1, viewing_fee_kes: 0,
        estate: "Kilimani", sub_county: "Dagoretti North",
        address_line: "Argwings Kodhek Road",
        amenities: {
            water: "borehole", electricity: "tokens", parking: false, wifi: false,
            backup_water: true, security: "caretaker",
        },
        images: ["/image3.jpeg", "/image4.jpeg"],
        video: "/video2.mp4",
        owner: owner2, listed_by_agent: false,
    },
    {
        id: "demo-kil-3br-maisonette-wood",
        title: "3BR + DSQ Maisonette on Wood Avenue",
        description:
            "Family maisonette with 3 spacious bedrooms, detached SQ, private garden and " +
            "parking for 2 cars. Quiet cul-de-sac, walking distance to Lavington Mall.",
        property_type: "maisonette", bedrooms: 3, bathrooms: 3, furnishing: "none",
        rent_kes: 180000, deposit_months: 3, viewing_fee_kes: 2000,
        estate: "Kilimani", sub_county: "Dagoretti North",
        address_line: "Wood Avenue",
        amenities: {
            water: "24h", electricity: "postpaid", parking: true, wifi: false,
            garden: true, pets_allowed: true, backup_water: true, security: "24h_guard",
        },
        images: ["/image5.jpeg", "/image6.jpeg"],
        video: "/video3.mp4",
        owner: owner1, listed_by_agent: true,
    },
    {
        id: "demo-lav-1br-ringroad",
        title: "Furnished 1BR Apartment in Lavington",
        description:
            "Beautifully finished 1-bedroom with built-in wardrobes, modern kitchen and " +
            "balcony overlooking the compound. Includes gym, swimming pool and 24h security. " +
            "Close to Lavington Mall and Greenhouse.",
        property_type: "one_bed", bedrooms: 1, bathrooms: 1, furnishing: "full",
        rent_kes: 75000, deposit_months: 2, viewing_fee_kes: 1000,
        estate: "Lavington", sub_county: "Dagoretti North",
        address_line: "Off James Gichuru Road",
        amenities: {
            water: "24h", electricity: "tokens", parking: true, wifi: true, gym: true,
            swimming_pool: true, balcony: true, backup_water: true, security: "24h_guard",
            lift: true,
        },
        images: ["/image7.jpeg", "/image8.jpeg"],
        video: "/video4.mp4",
        owner: owner3, listed_by_agent: true,
    },
    {
        id: "demo-kile-2br-mandera",
        title: "Spacious 2BR Apartment in Kileleshwa",
        description:
            "Large 2-bedroom apartment in a leafy compound. Master en-suite, separate dining, " +
            "fully fitted kitchen and a balcony with treetop views. Ample parking.",
        property_type: "two_bed", bedrooms: 2, bathrooms: 2, furnishing: "semi",
        rent_kes: 90000, deposit_months: 2, viewing_fee_kes: 1500,
        estate: "Kileleshwa", sub_county: "Dagoretti North",
        address_line: "Mandera Road",
        amenities: {
            water: "24h", electricity: "tokens", parking: true, wifi: false,
            balcony: true, backup_water: true, security: "24h_guard", lift: true,
        },
        images: ["/image9.jpeg", "/image10.jpeg"],
        video: "/video5.mp4",
        owner: owner3, listed_by_agent: true,
    },
    {
        id: "demo-west-3br-pearl",
        title: "Premium 3BR Penthouse in Westlands",
        description:
            "Top-floor 3-bedroom penthouse with double-height ceilings, panoramic city views " +
            "and a private rooftop terrace. Concierge, gym, swimming pool and covered parking.",
        property_type: "three_bed", bedrooms: 3, bathrooms: 3, furnishing: "full",
        rent_kes: 220000, deposit_months: 3, viewing_fee_kes: 2000,
        estate: "Westlands", sub_county: "Westlands",
        address_line: "Off Waiyaki Way",
        amenities: {
            water: "24h", electricity: "tokens", parking: true, wifi: true, gym: true,
            swimming_pool: true, balcony: true, backup_water: true, security: "24h_guard",
            lift: true, dstv_ready: true,
        },
        images: ["/image11.jpeg", "/image12.jpeg"],
        video: "/video6.mp4",
        owner: owner3, listed_by_agent: true,
    },
    {
        id: "demo-west-bedsitter-school",
        title: "Cozy Studio in Westlands",
        description:
            "Compact studio in a secure compound near Westlands shopping centre. Walking " +
            "distance to The Mall, ABC Place and several restaurants.",
        property_type: "studio", bedrooms: 0, bathrooms: 1, furnishing: "semi",
        rent_kes: 25000, deposit_months: 1, viewing_fee_kes: 500,
        estate: "Westlands", sub_county: "Westlands",
        address_line: "School Lane",
        amenities: {
            water: "24h", electricity: "tokens", parking: false, wifi: true,
            backup_water: true, security: "24h_guard", lift: true,
        },
        images: ["/image13.jpeg", "/image14.jpeg"],
        video: "/video7.mp4",
        owner: owner3, listed_by_agent: true,
    },
    {
        id: "demo-kil-4br-townhouse",
        title: "4BR Townhouse in Kilimani — Gated Community",
        description:
            "Family townhouse in a small gated community of 8 units. 4 bedrooms all en-suite, " +
            "DSQ, private garden, double garage. Pool, gym and playground in the compound.",
        property_type: "townhouse", bedrooms: 4, bathrooms: 4, furnishing: "none",
        rent_kes: 350000, deposit_months: 3, viewing_fee_kes: 2500,
        estate: "Kilimani", sub_county: "Dagoretti North",
        address_line: "Riara Road",
        amenities: {
            water: "24h", electricity: "postpaid", parking: true, wifi: false, gym: true,
            swimming_pool: true, garden: true, pets_allowed: true,
            backup_water: true, security: "24h_guard", ensuite_master: true,
        },
        images: ["/image15.jpeg", "/image16.jpeg"],
        video: "/video8.mp4",
        owner: owner1, listed_by_agent: true,
    },
];

// ─── Adapters: shape SEEDs into the same types Supabase queries return ───
function toMedia(seed: DemoSeed): PropertyMedia[] {
    const photos: PropertyMedia[] = seed.images.map((src, idx) => ({
        id: `${seed.id}-photo-${idx}`,
        property_id: seed.id,
        kind: "photo" as const,
        storage_path: src,        // mediaUrl() leaves /-prefixed paths alone
        width: null,
        height: null,
        duration_s: null,
        sort_order: idx,
    }));
    if (seed.video) {
        photos.push({
            id: `${seed.id}-video`,
            property_id: seed.id,
            kind: "video" as const,
            storage_path: seed.video,
            width: null,
            height: null,
            duration_s: null,
            sort_order: 100,
        });
    }
    return photos;
}

function toListItem(seed: DemoSeed): PropertyListItem {
    return {
        id: seed.id,
        title: seed.title,
        estate: seed.estate,
        sub_county: seed.sub_county,
        rent_kes: seed.rent_kes,
        bedrooms: seed.bedrooms,
        bathrooms: seed.bathrooms,
        property_type: seed.property_type,
        viewing_fee_kes: seed.viewing_fee_kes,
        listed_by_agent: seed.listed_by_agent,
        cover_url: seed.images[0] ?? null,
        owner: {
            full_name: seed.owner.full_name,
            agency_name: seed.owner.agency_name,
            verification_status: seed.owner.verification_status,
        },
    };
}

function toDetail(seed: DemoSeed): PropertyDetail {
    const baseProperty: Property = {
        id: seed.id,
        owner_id: seed.owner.id,
        listed_by_agent: seed.listed_by_agent,
        title: seed.title,
        description: seed.description,
        property_type: seed.property_type,
        bedrooms: seed.bedrooms,
        bathrooms: seed.bathrooms,
        furnishing: seed.furnishing,
        rent_kes: seed.rent_kes,
        deposit_months: seed.deposit_months,
        viewing_fee_kes: seed.viewing_fee_kes,
        service_charge_kes: 0,
        county: "Nairobi",
        sub_county: seed.sub_county,
        estate: seed.estate,
        address_line: seed.address_line,
        location: null,
        amenities: seed.amenities,
        rent_control_flagged: false,
        status: "active" as ListingStatus,
        listed_at: NOW,
        rented_at: null,
        expires_at: null,
        created_at: NOW,
        updated_at: NOW,
    };

    return {
        ...baseProperty,
        media: toMedia(seed),
        owner: seed.owner,
        coords: null,
    };
}

// ─── Public API mirroring queries.ts ────────────────────
export function demoListItems(filters: Filters, limit: number): PropertyListItem[] {
    let rows = SEEDS.map(toListItem);

    if (filters.minRent)        rows = rows.filter((r) => r.rent_kes >= filters.minRent!);
    if (filters.maxRent)        rows = rows.filter((r) => r.rent_kes <= filters.maxRent!);
    if (filters.bedrooms === "studio") rows = rows.filter((r) => r.bedrooms === 0);
    else if (typeof filters.bedrooms === "number") {
        rows = filters.bedrooms === 4
            ? rows.filter((r) => r.bedrooms >= 4)
            : rows.filter((r) => r.bedrooms === filters.bedrooms);
    }
    if (filters.q) {
        const q = filters.q.toLowerCase();
        rows = rows.filter((r) =>
            r.estate.toLowerCase().includes(q) || r.title.toLowerCase().includes(q),
        );
    }
    // Furnishing + amenity filters need the seed shape; refetch from SEEDS to filter.
    if (filters.furnishing || filters.amenities?.length) {
        const idsKept = new Set(rows.map((r) => r.id));
        const filtered = SEEDS.filter((s) => idsKept.has(s.id))
            .filter((s) => !filters.furnishing || s.furnishing === filters.furnishing)
            .filter((s) => {
                if (!filters.amenities?.length) return true;
                return filters.amenities.every((a) => {
                    if (a === "water_24h")     return s.amenities.water === "24h";
                    if (a === "security_24h")  return s.amenities.security === "24h_guard";
                    return Boolean((s.amenities as Record<string, unknown>)[a]);
                });
            });
        rows = filtered.map(toListItem);
    }

    return rows.slice(0, limit);
}

export function demoDetail(id: string): PropertyDetail | null {
    const seed = SEEDS.find((s) => s.id === id);
    return seed ? toDetail(seed) : null;
}
