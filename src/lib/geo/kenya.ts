// Static geo data for the Kenyan rental market.
// Estate centroids drive map default centers and "popular estate" SEO pages.
// Coordinates are approximate (rooftop accuracy not required for map nudging).

export type Estate = {
    slug: string;
    name: string;
    county: string;
    sub_county: string;
    lng: number;
    lat: number;
    popular?: boolean;
};

// MVP launch market: Nairobi only. Add Mombasa/Kisumu/Nakuru/Eldoret in v2.
export const ESTATES: Estate[] = [
    // Kilimani belt — primary launch focus
    { slug: "kilimani",     name: "Kilimani",     county: "Nairobi", sub_county: "Dagoretti North", lng: 36.7849, lat: -1.2921, popular: true },
    { slug: "kileleshwa",   name: "Kileleshwa",   county: "Nairobi", sub_county: "Dagoretti North", lng: 36.7813, lat: -1.2789, popular: true },
    { slug: "lavington",    name: "Lavington",    county: "Nairobi", sub_county: "Dagoretti North", lng: 36.7693, lat: -1.2790, popular: true },
    { slug: "westlands",    name: "Westlands",    county: "Nairobi", sub_county: "Westlands",       lng: 36.8008, lat: -1.2649, popular: true },
    { slug: "parklands",    name: "Parklands",    county: "Nairobi", sub_county: "Westlands",       lng: 36.8186, lat: -1.2587 },
    { slug: "spring-valley",name: "Spring Valley",county: "Nairobi", sub_county: "Westlands",       lng: 36.7856, lat: -1.2479 },
    // Eastlands belt
    { slug: "south-b",      name: "South B",      county: "Nairobi", sub_county: "Makadara",        lng: 36.8425, lat: -1.3133 },
    { slug: "south-c",      name: "South C",      county: "Nairobi", sub_county: "Langata",         lng: 36.8237, lat: -1.3236 },
    { slug: "buruburu",     name: "Buruburu",     county: "Nairobi", sub_county: "Embakasi West",   lng: 36.8767, lat: -1.2858 },
    { slug: "donholm",      name: "Donholm",      county: "Nairobi", sub_county: "Embakasi West",   lng: 36.8932, lat: -1.2886 },
    { slug: "umoja",        name: "Umoja",        county: "Nairobi", sub_county: "Embakasi West",   lng: 36.9012, lat: -1.2802 },
    { slug: "kasarani",     name: "Kasarani",     county: "Nairobi", sub_county: "Kasarani",        lng: 36.8967, lat: -1.2207 },
    { slug: "ruaka",        name: "Ruaka",        county: "Kiambu",  sub_county: "Kiambaa",         lng: 36.7726, lat: -1.2106 },
    { slug: "kileleshwa",   name: "Kileleshwa",   county: "Nairobi", sub_county: "Dagoretti North", lng: 36.7813, lat: -1.2789 },
    { slug: "rongai",       name: "Ongata Rongai",county: "Kajiado", sub_county: "Kajiado North",   lng: 36.7459, lat: -1.3955 },
    { slug: "syokimau",     name: "Syokimau",     county: "Machakos",sub_county: "Mavoko",          lng: 36.9544, lat: -1.3631 },
    { slug: "kahawa-sukari",name: "Kahawa Sukari",county: "Nairobi", sub_county: "Kasarani",        lng: 36.9347, lat: -1.1925 },
];

export const POPULAR_ESTATES = ESTATES.filter((e) => e.popular);

export const COUNTIES = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu",
    "Kiambu", "Kajiado", "Machakos", "Nyeri",
] as const;

export function findEstate(slug: string): Estate | undefined {
    return ESTATES.find((e) => e.slug === slug);
}

// Default map center: Nairobi CBD-ish.
export const NAIROBI_CENTER = { lng: 36.8172, lat: -1.2864, zoom: 11 };
