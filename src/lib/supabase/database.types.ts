// Hand-rolled Database type for the Supabase JS client.
// REPLACE with `supabase gen types typescript --project-id <id> > database.types.ts`
// once the project is provisioned and migrations are applied.
//
// We only model the tables/columns/RPCs the app actually touches at MVP.

import type {
    Profile, Property, PropertyMedia, Viewing, Payment,
    PropertyType, Furnishing, ListingStatus, EscrowStatus, ViewingStatus,
    PaymentKind, PaymentStatus, VerificationStatus,
} from "./types";

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
    Row: Row;
    Insert: Insert;
    Update: Update;
    Relationships: [];
};

export type Database = {
    // Required by @supabase/postgrest-js v1.x for type inference. Without this
    // marker every insert/update lands on `never` and selects on `GenericStringError`.
    __InternalSupabase: { PostgrestVersion: "12" };

    public: {
        Tables: {
            profiles: Table<
                Profile,
                Pick<Profile, "id" | "phone"> & Partial<Profile>
            >;
            verifications: Table<
                {
                    id: string;
                    user_id: string;
                    provider: string;
                    provider_ref: string | null;
                    id_number_hash: string | null;
                    document_url: string | null;
                    selfie_url: string | null;
                    status: VerificationStatus;
                    rejection_reason: string | null;
                    raw_payload: Json | null;
                    created_at: string;
                    decided_at: string | null;
                },
                {
                    user_id: string;
                    provider?: string;
                    provider_ref?: string | null;
                    id_number_hash?: string | null;
                    document_url?: string | null;
                    selfie_url?: string | null;
                    status?: VerificationStatus;
                    rejection_reason?: string | null;
                    raw_payload?: Json | null;
                    decided_at?: string | null;
                },
                Partial<{
                    status: VerificationStatus;
                    rejection_reason: string | null;
                    id_number_hash: string | null;
                    raw_payload: Json | null;
                    decided_at: string | null;
                }>
            >;
            properties: Table<
                Property,
                {
                    owner_id: string;
                    title: string;
                    description: string;
                    property_type: PropertyType;
                    bedrooms: number;
                    bathrooms: number;
                    furnishing: Furnishing;
                    rent_kes: number;
                    deposit_months: number;
                    viewing_fee_kes: number;
                    county: string;
                    estate: string;
                    sub_county?: string | null;
                    address_line?: string | null;
                    listed_by_agent?: boolean;
                    amenities?: Record<string, unknown>;
                    status?: ListingStatus;
                    listed_at?: string | null;
                }
            >;
            property_media: Table<
                PropertyMedia,
                Omit<PropertyMedia, "id"> & { id?: string }
            >;
            property_views: Table<
                { property_id: string; viewer_id: string | null; viewed_at: string },
                { property_id: string; viewer_id?: string | null }
            >;
            favourites: Table<
                { user_id: string; property_id: string; created_at: string },
                { user_id: string; property_id: string }
            >;
            viewings: Table<
                Viewing,
                Omit<Viewing, "id" | "created_at" | "confirmed_at" | "completed_at"> & {
                    id?: string;
                    confirmed_at?: string | null;
                    completed_at?: string | null;
                }
            >;
            payments: Table<
                Payment,
                {
                    user_id: string;
                    counterparty_id?: string | null;
                    kind: PaymentKind;
                    amount_kes: number;
                    fee_bps?: number;
                    fee_kes?: number;
                    provider?: string;
                    mpesa_request_id?: string | null;
                    mpesa_receipt?: string | null;
                    msisdn?: string | null;
                    status?: PaymentStatus;
                    failure_reason?: string | null;
                    raw_callback?: Json | null;
                    related_viewing_id?: string | null;
                    related_lease_id?: string | null;
                },
                Partial<{
                    status: PaymentStatus;
                    mpesa_request_id: string | null;
                    mpesa_receipt: string | null;
                    msisdn: string | null;
                    failure_reason: string | null;
                    raw_callback: Json | null;
                    fee_bps: number;
                    fee_kes: number;
                    completed_at: string | null;
                    provider: string;
                }>
            >;
            leases: Table<
                {
                    id: string; property_id: string; tenant_id: string; landlord_id: string;
                    start_date: string; end_date: string | null; monthly_rent_kes: number;
                    deposit_kes: number; status: "pending" | "active" | "ended" | "terminated";
                    created_at: string;
                },
                {
                    property_id: string; tenant_id: string; landlord_id: string;
                    start_date: string; monthly_rent_kes: number;
                    end_date?: string | null; deposit_kes?: number;
                    status?: "pending" | "active" | "ended" | "terminated";
                }
            >;
            rent_payments: Table<
                { id: string; lease_id: string; period_month: string; amount_kes: number;
                  payment_id: string | null; paid_at: string | null; created_at: string },
                { lease_id: string; period_month: string; amount_kes: number;
                  payment_id?: string | null; paid_at?: string | null }
            >;
            conversations: Table<
                {
                    id: string; property_id: string; tenant_id: string; owner_id: string;
                    last_message_at: string | null; tenant_unread: number; owner_unread: number;
                    created_at: string;
                },
                { property_id: string; tenant_id: string; owner_id: string }
            >;
            messages: Table<
                {
                    id: string; conversation_id: string; sender_id: string;
                    body: string; attachments: Json; read_at: string | null; created_at: string;
                },
                { conversation_id: string; sender_id: string; body: string; attachments?: Json }
            >;
            reviews: Table<
                {
                    id: string; reviewer_id: string;
                    subject_kind: "landlord" | "agent" | "property"; subject_id: string;
                    rating: number; body: string | null;
                    viewing_id: string | null; lease_id: string | null;
                    helpful_count: number; created_at: string;
                },
                {
                    reviewer_id: string;
                    subject_kind: "landlord" | "agent" | "property"; subject_id: string;
                    rating: number; body?: string | null;
                    viewing_id?: string | null; lease_id?: string | null;
                }
            >;
            saved_searches: Table<
                {
                    id: string; user_id: string; label: string | null;
                    filters: Json; alert_frequency: "off" | "instant" | "daily";
                    last_alerted_at: string | null; created_at: string;
                },
                { user_id: string; filters: Json; label?: string | null;
                  alert_frequency?: "off" | "instant" | "daily" }
            >;
        };
        Views: Record<string, never>;
        Functions: {
            set_property_location: {
                Args: { p_id: string; p_lng: number; p_lat: number };
                Returns: void;
            };
            create_viewing_with_payment: {
                Args: {
                    p_property_id: string;
                    p_scheduled_for: string;
                    p_msisdn: string;
                    p_note: string;
                };
                Returns: { viewing_id: string; payment_id: string | null;
                           viewing_fee_kes: number; owner_id: string };
            };
        };
    };
};

// Re-export Escrow + other enums in case callers want them.
export type { EscrowStatus, ViewingStatus, PaymentKind, PaymentStatus, VerificationStatus };
