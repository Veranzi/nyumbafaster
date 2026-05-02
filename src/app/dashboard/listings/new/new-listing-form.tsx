"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ESTATES } from "@/lib/geo/kenya";
import type { PropertyType, Furnishing } from "@/lib/supabase/types";

type Form = {
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
    address_line: string;
    amenity_water_24h: boolean;
    amenity_parking: boolean;
    amenity_wifi: boolean;
    amenity_security_24h: boolean;
    amenity_backup_water: boolean;
};

const PROPERTY_TYPES: PropertyType[] = [
    "bedsitter", "single", "studio", "one_bed", "two_bed", "three_bed",
    "four_plus_bed", "sq", "maisonette", "townhouse", "standalone",
];

export function NewListingForm({ isAgent }: { isAgent: boolean }) {
    const router = useRouter();
    const tProp = useTranslations("property_types");
    const [error, setError] = useState<string | null>(null);
    const [pending, start] = useTransition();

    const [f, setF] = useState<Form>({
        title: "",
        description: "",
        property_type: "one_bed",
        bedrooms: 1,
        bathrooms: 1,
        furnishing: "none",
        rent_kes: 0,
        deposit_months: 1,
        viewing_fee_kes: 0,
        estate: "Kilimani",
        address_line: "",
        amenity_water_24h: false,
        amenity_parking: false,
        amenity_wifi: false,
        amenity_security_24h: false,
        amenity_backup_water: false,
    });

    function set<K extends keyof Form>(key: K, value: Form[K]) {
        setF((cur) => ({ ...cur, [key]: value }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const estate = ESTATES.find((est) => est.name === f.estate);
        if (!estate) { setError("Pick a known estate from the list."); return; }

        const amenities: Record<string, unknown> = {};
        if (f.amenity_water_24h)     amenities.water = "24h";
        if (f.amenity_backup_water)  amenities.backup_water = true;
        if (f.amenity_parking)       amenities.parking = true;
        if (f.amenity_wifi)          amenities.wifi = true;
        if (f.amenity_security_24h)  amenities.security = "24h_guard";

        start(async () => {
            const res = await fetch("/api/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: f.title,
                    description: f.description,
                    property_type: f.property_type,
                    bedrooms: f.bedrooms,
                    bathrooms: f.bathrooms,
                    furnishing: f.furnishing,
                    rent_kes: f.rent_kes,
                    deposit_months: f.deposit_months,
                    viewing_fee_kes: f.viewing_fee_kes,
                    county: estate.county,
                    sub_county: estate.sub_county,
                    estate: f.estate,
                    address_line: f.address_line,
                    lng: estate.lng,
                    lat: estate.lat,
                    amenities,
                    listed_by_agent: isAgent,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setError(body.error ?? `Failed (${res.status})`);
                return;
            }
            const { id } = await res.json();
            router.push(`/dashboard/listings/${id}/edit`);
        });
    }

    return (
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" required minLength={8} maxLength={140}
                    value={f.title} onChange={(e) => set("title", e.target.value)} className="mt-1.5" />
                <p className="mt-1 text-xs text-zinc-500">e.g. "Modern 1BR in Kilimani — Wood Avenue"</p>
            </div>

            <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" required minLength={30} maxLength={4000} rows={5}
                    value={f.description} onChange={(e) => set("description", e.target.value)} className="mt-1.5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Property type</Label>
                    <Select value={f.property_type} onValueChange={(v) => set("property_type", v as PropertyType)}>
                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {PROPERTY_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>{tProp(t as Parameters<typeof tProp>[0])}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Furnishing</Label>
                    <Select value={f.furnishing} onValueChange={(v) => set("furnishing", v as Furnishing)}>
                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="semi">Semi</SelectItem>
                            <SelectItem value="full">Fully furnished</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="br">Bedrooms</Label>
                    <Input id="br" type="number" min={0} max={12} value={f.bedrooms}
                        onChange={(e) => set("bedrooms", Number(e.target.value))} className="mt-1.5" />
                </div>
                <div>
                    <Label htmlFor="ba">Bathrooms</Label>
                    <Input id="ba" type="number" min={1} max={8} value={f.bathrooms}
                        onChange={(e) => set("bathrooms", Number(e.target.value))} className="mt-1.5" />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="rent">Rent (KES / month)</Label>
                    <Input id="rent" type="number" min={1000} required value={f.rent_kes || ""}
                        onChange={(e) => set("rent_kes", Number(e.target.value))} className="mt-1.5" />
                </div>
                <div>
                    <Label htmlFor="dep">Deposit (months)</Label>
                    <Input id="dep" type="number" min={0} max={6} value={f.deposit_months}
                        onChange={(e) => set("deposit_months", Number(e.target.value))} className="mt-1.5" />
                </div>
                <div>
                    <Label htmlFor="vf">Viewing fee (KES)</Label>
                    <Input id="vf" type="number" min={0} max={5000} value={f.viewing_fee_kes}
                        onChange={(e) => set("viewing_fee_kes", Number(e.target.value))} className="mt-1.5" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Estate</Label>
                    <Select value={f.estate} onValueChange={(v) => set("estate", v)}>
                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {ESTATES.map((e) => <SelectItem key={e.slug} value={e.name}>{e.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="addr">Address (street / road)</Label>
                    <Input id="addr" value={f.address_line}
                        onChange={(e) => set("address_line", e.target.value)} className="mt-1.5" />
                </div>
            </div>

            <fieldset>
                <legend className="text-sm font-medium">Amenities</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    {[
                        ["amenity_water_24h",     "24h water"],
                        ["amenity_backup_water",  "Backup water tank"],
                        ["amenity_parking",       "Parking"],
                        ["amenity_wifi",          "Internet ready"],
                        ["amenity_security_24h",  "24h security guard"],
                    ].map(([k, label]) => (
                        <label key={k} className="flex items-center gap-2">
                            <Checkbox
                                checked={f[k as keyof Form] as boolean}
                                onCheckedChange={(v) => set(k as keyof Form, Boolean(v) as never)}
                            />
                            {label}
                        </label>
                    ))}
                </div>
            </fieldset>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" size="lg" disabled={pending}>
                {pending ? "Saving…" : "Save draft and continue"}
            </Button>
            <p className="text-xs text-zinc-500">
                You'll add photos on the next screen. Listings only go live after photos are uploaded.
            </p>
        </form>
    );
}
