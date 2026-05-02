import Link from "next/link";
import Image from "next/image";
import { MapPin, BedDouble, Bath } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/verification-badge";
import { formatRent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Property, PublicProfile } from "@/lib/supabase/types";

export type PropertyCardData = Pick<
    Property,
    "id" | "title" | "estate" | "sub_county" | "rent_kes" | "bedrooms"
    | "bathrooms" | "property_type" | "viewing_fee_kes" | "listed_by_agent"
> & {
    cover_url: string | null;
    owner: Pick<PublicProfile, "full_name" | "agency_name" | "verification_status"> | null;
};

export function PropertyCard({ p, className }: { p: PropertyCardData; className?: string }) {
    const ownerLabel = p.owner?.agency_name ?? p.owner?.full_name ?? "—";

    return (
        <Link
            href={`/houses/${p.id}`}
            className={cn(
                "group relative block overflow-hidden rounded-2xl border border-cream-200 bg-cream-50 shadow-sm transition",
                "hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-[0_12px_30px_-12px_rgba(212,150,12,0.35)]",
                "dark:border-ink-700 dark:bg-ink-800",
                className,
            )}
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-100 dark:bg-ink-900">
                {p.cover_url ? (
                    <Image
                        src={p.cover_url}
                        alt={p.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-xs text-ink-700/40 dark:text-cream-50/40">
                        No photo yet
                    </div>
                )}
                {p.viewing_fee_kes === 0 && (
                    <Badge variant="success" className="absolute left-3 top-3 shadow-sm">
                        Free viewing
                    </Badge>
                )}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>

            <div className="p-5">
                <div className="flex items-baseline justify-between gap-2">
                    <div className="text-2xl font-semibold tabular-nums tracking-tight text-gold-700 dark:text-gold-400">
                        {formatRent(p.rent_kes)}
                    </div>
                    <div className="text-xs text-ink-700/60 dark:text-cream-50/50">/ month</div>
                </div>

                <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-ink-900 dark:text-cream-50">
                    {p.title}
                </h3>

                <div className="mt-3 flex items-center gap-3 text-xs text-ink-700/65 dark:text-cream-50/55">
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gold-600" />
                        {p.estate}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <BedDouble className="h-3.5 w-3.5" />
                        {p.bedrooms === 0 ? "Bedsitter" : `${p.bedrooms} bd`}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5" />
                        {p.bathrooms} ba
                    </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-cream-200 pt-3 dark:border-ink-700">
                    <span className="truncate text-xs text-ink-700/70 dark:text-cream-50/60">
                        {p.listed_by_agent ? "Agent" : "Landlord"}: <span className="font-medium">{ownerLabel}</span>
                    </span>
                    {p.owner && <VerificationBadge status={p.owner.verification_status} />}
                </div>
            </div>
        </Link>
    );
}
