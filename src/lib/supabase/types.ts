// Hand-rolled DB types. Replace with `supabase gen types typescript` output once
// migrations are applied to a real project. Kept narrow on purpose — only the
// columns the app actually touches.

export type UserRole = "tenant" | "landlord" | "agent" | "admin";
export type Locale = "en" | "sw";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type PropertyType =
    | "bedsitter" | "single" | "studio"
    | "one_bed" | "two_bed" | "three_bed" | "four_plus_bed"
    | "sq" | "maisonette" | "townhouse" | "standalone" | "commercial";

export type Furnishing = "none" | "semi" | "full";
export type ListingStatus = "draft" | "active" | "rented" | "inactive";

export type ViewingStatus =
    | "requested" | "confirmed" | "completed"
    | "no_show_tenant" | "no_show_owner" | "cancelled" | "disputed";

export type EscrowStatus = "none" | "held" | "released" | "refunded" | "disputed";

export type PaymentKind =
    | "viewing_fee" | "deposit" | "rent" | "listing_fee"
    | "subscription" | "featured_listing" | "refund" | "payout";
export type PaymentStatus = "pending" | "success" | "failed" | "reversed";

export type Profile = {
    id: string;
    phone: string;
    email: string | null;
    full_name: string | null;
    role: UserRole;
    locale: Locale;
    avatar_url: string | null;
    bio: string | null;
    agency_name: string | null;
    rating_avg: number | null;
    rating_count: number;
    verification_status: VerificationStatus;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Property = {
    id: string;
    owner_id: string;
    listed_by_agent: boolean;
    title: string;
    description: string;
    property_type: PropertyType;
    bedrooms: number;
    bathrooms: number;
    furnishing: Furnishing;
    rent_kes: number;
    deposit_months: number;
    viewing_fee_kes: number;
    service_charge_kes: number;
    county: string;
    sub_county: string | null;
    estate: string;
    address_line: string | null;
    location: unknown; // PostGIS geography — only read via PostGIS functions
    amenities: Record<string, unknown>;
    rent_control_flagged: boolean;
    status: ListingStatus;
    listed_at: string | null;
    rented_at: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
};

export type PropertyMedia = {
    id: string;
    property_id: string;
    kind: "photo" | "video" | "tour_360";
    storage_path: string;
    width: number | null;
    height: number | null;
    duration_s: number | null;
    sort_order: number;
};

export type Viewing = {
    id: string;
    property_id: string;
    tenant_id: string;
    owner_id: string;
    scheduled_for: string;
    viewing_fee_kes: number;
    escrow_status: EscrowStatus;
    status: ViewingStatus;
    tenant_note: string | null;
    cancellation_reason: string | null;
    created_at: string;
    confirmed_at: string | null;
    completed_at: string | null;
};

export type Payment = {
    id: string;
    user_id: string;
    counterparty_id: string | null;
    kind: PaymentKind;
    amount_kes: number;
    fee_bps: number;
    fee_kes: number;
    provider: string;
    mpesa_request_id: string | null;
    mpesa_receipt: string | null;
    msisdn: string | null;
    status: PaymentStatus;
    failure_reason: string | null;
    raw_callback: unknown;
    related_viewing_id: string | null;
    related_lease_id: string | null;
    created_at: string;
    completed_at: string | null;
};

// Public profile shape exposed via the API to non-owners (PII stripped).
export type PublicProfile = Pick<
    Profile,
    "id" | "full_name" | "role" | "avatar_url" | "agency_name"
    | "rating_avg" | "rating_count" | "verification_status"
>;

export function toPublicProfile(p: Profile): PublicProfile {
    return {
        id: p.id,
        full_name: p.full_name,
        role: p.role,
        avatar_url: p.avatar_url,
        agency_name: p.agency_name,
        rating_avg: p.rating_avg,
        rating_count: p.rating_count,
        verification_status: p.verification_status,
    };
}
