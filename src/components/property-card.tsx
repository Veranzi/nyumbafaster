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
                "group block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md",
                "dark:border-zinc-800 dark:bg-zinc-950",
                className,
            )}
        >
            <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900">
                {p.cover_url ? (
                    <Image
                        src={p.cover_url}
                        alt={p.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        No photo
                    </div>
                )}
                {p.viewing_fee_kes === 0 && (
                    <Badge variant="success" className="absolute left-2 top-2">
                        Free viewing
                    </Badge>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                    <div className="text-lg font-semibold tabular-nums">{formatRent(p.rent_kes)}</div>
                    <div className="text-xs text-zinc-500">/ month</div>
                </div>

                <h3 className="mt-1 line-clamp-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {p.title}
                </h3>

                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {p.estate}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <BedDouble className="h-3 w-3" />
                        {p.bedrooms === 0 ? "Bedsitter" : `${p.bedrooms} bd`}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        {p.bathrooms} ba
                    </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                        {p.listed_by_agent ? "Agent" : "Landlord"}: {ownerLabel}
                    </span>
                    {p.owner && <VerificationBadge status={p.owner.verification_status} />}
                </div>
            </div>
        </Link>
    );
}
