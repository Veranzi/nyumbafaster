import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BedDouble, Bath, MapPin, Car, Wifi, Droplets, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/verification-badge";
import { ListingMap } from "@/components/listing-map";
import { ContactHost } from "@/components/contact-host";
import { getPropertyById, mediaUrl } from "@/lib/property/queries";
import { findEstate } from "@/lib/geo/kenya";
import { formatRent, formatKES } from "@/lib/format";
import { env } from "@/lib/env";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
    const { id } = await params;
    try {
        const p = await getPropertyById(id);
        if (!p) return { title: "Listing not found" };
        return {
            title: `${p.title} — ${formatRent(p.rent_kes)} / mo`,
            description: p.description.slice(0, 160),
        };
    } catch {
        return { title: "Listing" };
    }
}

export default async function ListingDetailPage({ params }: { params: Promise<Params> }) {
    const { id } = await params;
    const t = await getTranslations("listing");

    let p: Awaited<ReturnType<typeof getPropertyById>>;
    try {
        p = await getPropertyById(id);
    } catch {
        p = null;
    }
    if (!p) notFound();

    const photos = p.media.filter((m) => m.kind === "photo").sort((a, b) => a.sort_order - b.sort_order);
    const videos = p.media.filter((m) => m.kind === "video");
    const cover = photos[0]?.storage_path;
    const walkthrough = videos[0]?.storage_path;
    const posterPath = photos[0]?.storage_path;
    const estate = findEstate(p.estate.toLowerCase().replace(/\s+/g, "-"));

    return (
        <article className="mx-auto max-w-5xl px-4 py-8">
            {/* GALLERY ─────────────────────────────────── */}
            <div className="grid gap-2 md:grid-cols-3 md:grid-rows-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 md:col-span-2 md:row-span-2 dark:bg-zinc-900">
                    {cover ? (
                        <Image src={mediaUrl(cover)} alt={p.title} fill className="object-cover" priority />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                            No photos yet
                        </div>
                    )}
                </div>
                {photos.slice(1, 5).map((m) => (
                    <div key={m.id} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                        <Image src={mediaUrl(m.storage_path)} alt="" fill className="object-cover" />
                    </div>
                ))}
            </div>

            {/* VIDEO WALKTHROUGH ───────────────────────── */}
            {walkthrough && (
                <div className="mt-4 overflow-hidden rounded-xl border border-cream-200 bg-black dark:border-ink-700">
                    <video
                        src={mediaUrl(walkthrough)}
                        poster={posterPath ? mediaUrl(posterPath) : undefined}
                        controls
                        preload="metadata"
                        playsInline
                        className="aspect-video w-full"
                    />
                </div>
            )}

            <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
                {/* MAIN CONTENT ────────────────────────── */}
                <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h1 className="text-2xl font-semibold">{p.title}</h1>
                        <Badge variant="outline">{p.property_type.replace("_", " ")}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                        <MapPin className="h-4 w-4" />
                        {p.estate}{p.sub_county ? `, ${p.sub_county}` : ""}, {p.county}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <span className="inline-flex items-center gap-1">
                            <BedDouble className="h-4 w-4" />
                            {p.bedrooms === 0 ? "Bedsitter" : `${p.bedrooms} bedroom${p.bedrooms === 1 ? "" : "s"}`}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            {p.bathrooms} bathroom{p.bathrooms === 1 ? "" : "s"}
                        </span>
                        <span className="capitalize">{p.furnishing} furnished</span>
                    </div>

                    <p className="mt-6 whitespace-pre-line text-zinc-700 dark:text-zinc-300">{p.description}</p>

                    {/* AMENITIES ───────────────────────── */}
                    <h2 className="mt-8 text-lg font-semibold">{t("amenities_title")}</h2>
                    <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        {amenityRows(p.amenities).map(([key, label, Icon]) => (
                            <li key={key} className="inline-flex items-center gap-2">
                                <Icon className="h-4 w-4 text-gold-600" />
                                {label}
                            </li>
                        ))}
                    </ul>

                    {/* MAP ─────────────────────────────── */}
                    {estate && (
                        <>
                            <h2 className="mt-8 text-lg font-semibold">{t("location_title")}</h2>
                            <div className="mt-3">
                                <ListingMap lng={estate.lng} lat={estate.lat} />
                            </div>
                            <p className="mt-2 text-xs text-zinc-500">
                                Approximate. Exact pin shown after viewing is confirmed.
                            </p>
                        </>
                    )}
                </div>

                {/* SIDEBAR ─────────────────────────────── */}
                <aside className="space-y-4">
                    <div className="rounded-xl border border-cream-200 bg-cream-50 p-5 shadow-sm dark:border-ink-700 dark:bg-ink-800">
                        <div className="text-2xl font-semibold tabular-nums text-gold-700 dark:text-gold-400">
                            {formatRent(p.rent_kes)}
                        </div>
                        <div className="text-xs text-ink-700/60 dark:text-cream-50/50">{t("rent_per_month")}</div>

                        <dl className="mt-4 space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-ink-700/60 dark:text-cream-50/50">Deposit</dt>
                                <dd className="tabular-nums">
                                    {p.deposit_months} month{p.deposit_months === 1 ? "" : "s"} ({formatKES(p.deposit_months * p.rent_kes)})
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-ink-700/60 dark:text-cream-50/50">{t("viewing_fee")}</dt>
                                <dd className="tabular-nums">
                                    {p.viewing_fee_kes === 0 ? t("no_viewing_fee") : formatKES(p.viewing_fee_kes)}
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-5 border-t border-cream-200 pt-4 dark:border-ink-700">
                            <ContactHost
                                listing={{
                                    title: p.title,
                                    estate: p.estate,
                                    rentKes: p.rent_kes,
                                    publicUrl: `${env.app.url}/houses/${p.id}`,
                                }}
                            />
                        </div>
                    </div>

                    {p.owner && (
                        <div className="rounded-xl border border-cream-200 bg-cream-50 p-5 dark:border-ink-700 dark:bg-ink-800">
                            <div className="text-xs uppercase tracking-wide text-ink-700/60 dark:text-cream-50/50">
                                {t("host_title")}
                            </div>
                            <div className="mt-1 font-semibold">
                                {p.owner.agency_name ?? p.owner.full_name ?? "—"}
                            </div>
                            <div className="text-xs text-ink-700/60 dark:text-cream-50/50">
                                {p.listed_by_agent ? "Property agent" : "Landlord"}
                            </div>
                            <div className="mt-3"><VerificationBadge status={p.owner.verification_status} /></div>
                            {p.owner.rating_count > 0 ? (
                                <div className="mt-2 text-sm">
                                    ⭐ {p.owner.rating_avg?.toFixed(1)} ({p.owner.rating_count})
                                </div>
                            ) : (
                                <div className="mt-2 text-sm text-ink-700/60 dark:text-cream-50/50">{t("no_reviews_yet")}</div>
                            )}
                        </div>
                    )}

                    <a
                        href={`/report?property=${p.id}`}
                        className="block text-center text-xs text-red-600 hover:underline"
                    >
                        {t("report_listing")}
                    </a>
                </aside>
            </div>
        </article>
    );
}

function amenityRows(blob: Record<string, unknown>): Array<[string, string, typeof Droplets]> {
    const out: Array<[string, string, typeof Droplets]> = [];
    if (blob.water === "24h")          out.push(["water", "24h water supply", Droplets]);
    else if (blob.water === "borehole") out.push(["water", "Borehole water", Droplets]);
    if (blob.backup_water)             out.push(["bw", "Backup water tank", Droplets]);
    if (blob.electricity === "tokens") out.push(["el", "Token meter (KPLC prepaid)", Zap]);
    if (blob.electricity === "postpaid") out.push(["el", "Postpaid electricity", Zap]);
    if (blob.parking)                  out.push(["park", "Parking", Car]);
    if (blob.wifi)                     out.push(["wifi", "Internet ready", Wifi]);
    if (blob.security === "24h_guard") out.push(["sec", "24h security guard", Shield]);
    return out;
}
