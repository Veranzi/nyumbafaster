"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { POPULAR_ESTATES } from "@/lib/geo/kenya";
import { FILTERABLE_AMENITIES } from "@/lib/property/amenities";

const BEDROOM_OPTIONS = [
    { value: "any",    label: "any" },
    { value: "studio", label: "bedrooms_studio" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4+" },
];

const FURNISHING_OPTIONS = [
    { value: "any",  label: "furnishing_any" },
    { value: "none", label: "furnishing_none" },
    { value: "semi", label: "furnishing_semi" },
    { value: "full", label: "furnishing_full" },
];

export function SearchFilters() {
    const t = useTranslations("search");
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();
    const [isPending, start] = useTransition();

    function update(patch: Record<string, string | null>) {
        const next = new URLSearchParams(sp.toString());
        for (const [k, v] of Object.entries(patch)) {
            if (v === null || v === "" || v === "any") next.delete(k);
            else next.set(k, v);
        }
        start(() => router.push(`${pathname}?${next.toString()}`));
    }

    function reset() {
        start(() => router.push(pathname));
    }

    const checkedAmenities = (sp.get("amenities") ?? "").split(",").filter(Boolean);
    function toggleAmenity(key: string, on: boolean) {
        const set = new Set(checkedAmenities);
        if (on) set.add(key);
        else set.delete(key);
        update({ amenities: set.size ? Array.from(set).join(",") : null });
    }

    return (
        <aside className="space-y-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t("filters")}
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                    <X className="h-4 w-4" />
                    {t("clear")}
                </Button>
            </div>

            <div>
                <Label htmlFor="q">{t("estate")}</Label>
                <div className="relative mt-1.5">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        id="q"
                        defaultValue={sp.get("q") ?? ""}
                        placeholder="Kilimani, Lavington…"
                        className="pl-9"
                        onBlur={(e) => update({ q: e.currentTarget.value || null })}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") update({ q: e.currentTarget.value || null });
                        }}
                    />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {POPULAR_ESTATES.slice(0, 6).map((e) => (
                        <button
                            key={e.slug}
                            type="button"
                            className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs hover:border-emerald-500 dark:border-zinc-700"
                            onClick={() => update({ q: e.name })}
                        >
                            {e.name}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <Label>{t("price_range")}</Label>
                <div className="mt-1.5 flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        defaultValue={sp.get("min_rent") ?? ""}
                        onBlur={(e) => update({ min_rent: e.currentTarget.value || null })}
                    />
                    <span className="text-zinc-400">—</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        defaultValue={sp.get("max_rent") ?? ""}
                        onBlur={(e) => update({ max_rent: e.currentTarget.value || null })}
                    />
                </div>
            </div>

            <div>
                <Label>{t("bedrooms")}</Label>
                <Select
                    defaultValue={sp.get("bedrooms") ?? "any"}
                    onValueChange={(v) => update({ bedrooms: v })}
                >
                    <SelectTrigger className="mt-1.5">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {BEDROOM_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label.startsWith("bedrooms_") || o.label === "any"
                                    ? t(o.label === "any" ? "bedrooms_any" : o.label as "bedrooms_studio")
                                    : o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>{t("furnishing")}</Label>
                <Select
                    defaultValue={sp.get("furnishing") ?? "any"}
                    onValueChange={(v) => update({ furnishing: v })}
                >
                    <SelectTrigger className="mt-1.5">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {FURNISHING_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {t(o.label as "furnishing_any" | "furnishing_none" | "furnishing_semi" | "furnishing_full")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>{t("amenities")}</Label>
                <div className="mt-2 grid grid-cols-1 gap-2">
                    {FILTERABLE_AMENITIES.map((a) => {
                        const checked = checkedAmenities.includes(a.key);
                        return (
                            <label key={a.key} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={(v) => toggleAmenity(a.key, Boolean(v))}
                                />
                                {t(a.messageKey as Parameters<typeof t>[0])}
                            </label>
                        );
                    })}
                </div>
            </div>

            {isPending && (
                <div className="text-xs text-zinc-500">…updating</div>
            )}
        </aside>
    );
}
