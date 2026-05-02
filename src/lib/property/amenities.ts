// Stable taxonomy for the properties.amenities JSON column.
// IMPORTANT: do not rename keys — they're indexed in jsonb_path_ops and stored
// across thousands of listings. Add new keys, deprecate old ones in place.

import type { LucideIcon } from "lucide-react";
import {
    Droplets, Zap, Car, Wifi, Dumbbell, Cat, Trees, Shield, Tv,
    Wind, ParkingSquare, Building2, Bath, ChefHat, Sun,
} from "lucide-react";

// Boolean amenities: present + truthy means "yes."
export const BOOLEAN_AMENITIES = [
    "parking", "wifi", "gym", "pets_allowed", "balcony",
    "backup_water", "garden", "swimming_pool", "lift", "borehole",
    "furnished_kitchen", "dstv_ready", "ensuite_master",
] as const;
export type BooleanAmenity = (typeof BOOLEAN_AMENITIES)[number];

// Enum amenities: a string with one of several allowed values.
export const ENUM_AMENITIES = {
    water:       ["24h", "rationed", "borehole", "tank_only"] as const,
    electricity: ["tokens", "postpaid"] as const,
    security:    ["none", "caretaker", "24h_guard", "electric_fence", "cctv"] as const,
} as const;
export type EnumAmenity = keyof typeof ENUM_AMENITIES;

export type AmenitiesBlob = {
    [K in BooleanAmenity]?: boolean;
} & {
    [K in EnumAmenity]?: (typeof ENUM_AMENITIES)[K][number];
};

// Display order in the listing UI.
export const AMENITY_ICONS: Record<string, LucideIcon> = {
    water:           Droplets,
    backup_water:    Droplets,
    borehole:        Droplets,
    electricity:     Zap,
    parking:         Car,
    wifi:            Wifi,
    gym:             Dumbbell,
    pets_allowed:    Cat,
    garden:          Trees,
    security:        Shield,
    dstv_ready:      Tv,
    balcony:         Wind,
    swimming_pool:   ParkingSquare,
    lift:            Building2,
    ensuite_master:  Bath,
    furnished_kitchen: ChefHat,
    sun:             Sun,
};

// i18n keys live in messages/{en,sw}.json under "search.amenity_*".
// This list drives the search filter UI (only the filter-worthy ones).
export const FILTERABLE_AMENITIES: Array<{ key: string; messageKey: string }> = [
    { key: "water_24h",     messageKey: "amenity_water_24h" },     // mapped: water === '24h'
    { key: "backup_water",  messageKey: "amenity_backup_water" },
    { key: "parking",       messageKey: "amenity_parking" },
    { key: "wifi",          messageKey: "amenity_wifi" },
    { key: "gym",           messageKey: "amenity_gym" },
    { key: "pets_allowed",  messageKey: "amenity_pets" },
    { key: "balcony",       messageKey: "amenity_balcony" },
    { key: "security_24h",  messageKey: "amenity_security" },      // mapped: security === '24h_guard'
];
