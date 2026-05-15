"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ESTATES } from "@/lib/geo/kenya";
import type { PropertyType, Furnishing } from "@/lib/supabase/types";
import { Sparkles, PenLine } from "lucide-react";

type Mode = "paste" | "manual";

type FormState = {
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

const BLANK: FormState = {
    title: "", description: "", property_type: "one_bed",
    bedrooms: 1, bathrooms: 1, furnishing: "none",
    rent_kes: 0, deposit_months: 2, viewing_fee_kes: 0,
    estate: "Kilimani", address_line: "",
    amenity_water_24h: false, amenity_parking: false, amenity_wifi: false,
    amenity_security_24h: false, amenity_backup_water: false,
};

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
    { value: "bedsitter",    label: "Bedsitter" },
    { value: "single",       label: "Single room" },
    { value: "studio",       label: "Studio" },
    { value: "one_bed",      label: "1 Bedroom" },
    { value: "two_bed",      label: "2 Bedrooms" },
    { value: "three_bed",    label: "3 Bedrooms" },
    { value: "four_plus_bed",label: "4+ Bedrooms" },
    { value: "sq",           label: "SQ" },
    { value: "maisonette",   label: "Maisonette" },
    { value: "townhouse",    label: "Townhouse" },
    { value: "standalone",   label: "Standalone" },
    { value: "commercial",   label: "Commercial" },
];

export function AdminListingForm() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("paste");
    const [rawText, setRawText] = useState("");
    const [f, setF] = useState<FormState>(BLANK);
    const [parseError, setParseError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [parsed, setParsed] = useState(false);
    const [parsing, startParse] = useTransition();
    const [submitting, startSubmit] = useTransition();

    function set<K extends keyof FormState>(key: K, value: FormState[K]) {
        setF((cur) => ({ ...cur, [key]: value }));
    }

    function handleParse(e: React.FormEvent) {
        e.preventDefault();
        setParseError(null);
        startParse(async () => {
            const res = await fetch("/api/admin/parse-listing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: rawText }),
            });
            const data = await res.json();
            if (!res.ok) { setParseError(data.error ?? "Parse failed"); return; }
            const l = data.listing as Partial<FormState>;
            setF({
                title:              typeof l.title === "string"       ? l.title : BLANK.title,
                description:        typeof l.description === "string" ? l.description : BLANK.description,
                property_type:      typeof l.property_type === "string" ? l.property_type as PropertyType : BLANK.property_type,
                bedrooms:           typeof l.bedrooms === "number"    ? l.bedrooms : BLANK.bedrooms,
                bathrooms:          typeof l.bathrooms === "number"   ? l.bathrooms : BLANK.bathrooms,
                furnishing:         typeof l.furnishing === "string"  ? l.furnishing as Furnishing : BLANK.furnishing,
                rent_kes:           typeof l.rent_kes === "number"    ? l.rent_kes : BLANK.rent_kes,
                deposit_months:     typeof l.deposit_months === "number" ? l.deposit_months : BLANK.deposit_months,
                viewing_fee_kes:    typeof l.viewing_fee_kes === "number" ? l.viewing_fee_kes : BLANK.viewing_fee_kes,
                estate:             typeof l.estate === "string"      ? l.estate : BLANK.estate,
                address_line:       typeof l.address_line === "string"? l.address_line : BLANK.address_line,
                amenity_water_24h:  Boolean(l.amenity_water_24h),
                amenity_parking:    Boolean(l.amenity_parking),
                amenity_wifi:       Boolean(l.amenity_wifi),
                amenity_security_24h: Boolean(l.amenity_security_24h),
                amenity_backup_water: Boolean(l.amenity_backup_water),
            });
            setParsed(true);
            setMode("manual");
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitError(null);
        const estate = ESTATES.find((est) => est.name === f.estate);
        if (!estate) { setSubmitError("Pick a valid estate from the list."); return; }

        const amenities: Record<string, unknown> = {};
        if (f.amenity_water_24h)      amenities.water = "24h";
        if (f.amenity_backup_water)   amenities.backup_water = true;
        if (f.amenity_parking)        amenities.parking = true;
        if (f.amenity_wifi)           amenities.wifi = true;
        if (f.amenity_security_24h)   amenities.security = "24h_guard";

        startSubmit(async () => {
            const res = await fetch("/api/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: f.title, description: f.description,
                    property_type: f.property_type, bedrooms: f.bedrooms,
                    bathrooms: f.bathrooms, furnishing: f.furnishing,
                    rent_kes: f.rent_kes, deposit_months: f.deposit_months,
                    viewing_fee_kes: f.viewing_fee_kes,
                    county: estate.county, sub_county: estate.sub_county,
                    estate: f.estate, address_line: f.address_line || null,
                    lng: estate.lng, lat: estate.lat,
                    amenities, listed_by_agent: false,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setSubmitError(body.error ?? `Failed (${res.status})`);
                return;
            }
            router.push("/admin/listings");
        });
    }

    return (
        <div className="max-w-2xl space-y-6">
            {/* Mode tabs */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setMode("paste")}
                    className={[
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                        mode === "paste"
                            ? "bg-gold-600 text-white"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
                    ].join(" ")}
                >
                    <Sparkles className="h-4 w-4" />
                    Smart paste
                </button>
                <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className={[
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                        mode === "manual"
                            ? "bg-gold-600 text-white"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
                    ].join(" ")}
                >
                    <PenLine className="h-4 w-4" />
                    Manual
                </button>
            </div>

            {/* Smart paste panel */}
            {mode === "paste" && (
                <form onSubmit={handleParse} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                    <div>
                        <Label htmlFor="raw">Paste or type listing details</Label>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            Write anything — location, price, bedrooms, amenities. AI will extract the fields.
                        </p>
                        <Textarea
                            id="raw"
                            rows={8}
                            placeholder={`e.g. "3 bedroom apartment in Kilimani along Ngong Road. KES 85,000/month, 2 months deposit. Fully furnished, 2 bathrooms. 24h security, parking, WiFi ready. Viewing fee KES 500."`}
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            required
                            minLength={10}
                            className="mt-2 font-mono text-sm"
                        />
                    </div>
                    {parseError && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                            {parseError}
                        </p>
                    )}
                    <Button type="submit" disabled={parsing} className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        {parsing ? "Parsing with AI…" : "Parse with AI → fill form"}
                    </Button>
                </form>
            )}

            {/* Manual / post-parse form */}
            {mode === "manual" && (
                <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                    {parsed && (
                        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
                            <Sparkles className="h-4 w-4 shrink-0" />
                            AI filled in the fields below — review and adjust before saving.
                        </div>
                    )}

                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" required minLength={8} maxLength={140}
                            value={f.title} onChange={(e) => set("title", e.target.value)} className="mt-1.5" />
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
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Furnishing</Label>
                            <Select value={f.furnishing} onValueChange={(v) => set("furnishing", v as Furnishing)}>
                                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Unfurnished</SelectItem>
                                    <SelectItem value="semi">Semi-furnished</SelectItem>
                                    <SelectItem value="full">Fully furnished</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="br">Bedrooms</Label>
                            <Input id="br" type="number" min={0} max={12}
                                value={f.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="ba">Bathrooms</Label>
                            <Input id="ba" type="number" min={1} max={8}
                                value={f.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} className="mt-1.5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="rent">Rent (KES/month)</Label>
                            <Input id="rent" type="number" min={1000} required
                                value={f.rent_kes || ""} onChange={(e) => set("rent_kes", Number(e.target.value))} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="dep">Deposit (months)</Label>
                            <Input id="dep" type="number" min={0} max={6}
                                value={f.deposit_months} onChange={(e) => set("deposit_months", Number(e.target.value))} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="vf">Viewing fee (KES)</Label>
                            <Input id="vf" type="number" min={0} max={5000}
                                value={f.viewing_fee_kes} onChange={(e) => set("viewing_fee_kes", Number(e.target.value))} className="mt-1.5" />
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
                            <Label htmlFor="addr">Street / road</Label>
                            <Input id="addr" value={f.address_line}
                                onChange={(e) => set("address_line", e.target.value)} className="mt-1.5" />
                        </div>
                    </div>

                    <fieldset>
                        <legend className="text-sm font-medium">Amenities</legend>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            {([
                                ["amenity_water_24h",    "24h water supply"],
                                ["amenity_backup_water", "Backup water tank"],
                                ["amenity_parking",      "Parking"],
                                ["amenity_wifi",         "Internet ready"],
                                ["amenity_security_24h", "24h security guard"],
                            ] as const).map(([k, label]) => (
                                <label key={k} className="flex cursor-pointer items-center gap-2">
                                    <Checkbox
                                        checked={f[k]}
                                        onCheckedChange={(v) => set(k, Boolean(v))}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {submitError && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                            {submitError}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <Button type="submit" size="lg" disabled={submitting}>
                            {submitting ? "Saving…" : "Save as draft"}
                        </Button>
                        {parsed && (
                            <Button type="button" variant="outline" size="lg" onClick={() => setMode("paste")}>
                                ← Re-parse
                            </Button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}
