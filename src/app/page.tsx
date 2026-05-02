import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, Banknote, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { POPULAR_ESTATES } from "@/lib/geo/kenya";
import { listProperties } from "@/lib/property/queries";
import { PropertyCard } from "@/components/property-card";

export const revalidate = 60;

export default async function HomePage() {
    const t = await getTranslations("home");

    // Best-effort fetch of a few featured listings. If Supabase isn't configured
    // yet we still want the page to render — swallow + log.
    let featured: Awaited<ReturnType<typeof listProperties>> = [];
    try {
        featured = await listProperties({}, 6);
    } catch (e) {
        console.warn("listProperties failed (Supabase not configured?)", e);
    }

    return (
        <>
            {/* HERO ─────────────────────────────────────── */}
            <section className="border-b border-zinc-200 bg-gradient-to-b from-gold-50 to-zinc-50 dark:border-zinc-800 dark:from-gold-950/30 dark:to-zinc-950">
                <div className="mx-auto max-w-6xl px-4 py-14 md:py-24">
                    <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                        {t("hero_title")}
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
                        {t("hero_subtitle")}
                    </p>

                    <form action="/houses" className="mt-8 flex max-w-xl gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                name="q"
                                placeholder={t("search_placeholder")}
                                className="h-12 w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 dark:border-zinc-700 dark:bg-zinc-950"
                            />
                        </div>
                        <Button type="submit" size="lg">
                            {t("search_button")}
                        </Button>
                    </form>

                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-gold-600" />
                            {t("trust_badge_1")}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <Banknote className="h-4 w-4 text-gold-600" />
                            {t("trust_badge_2")}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 text-gold-600" />
                            {t("trust_badge_3")}
                        </span>
                    </div>
                </div>
            </section>

            {/* POPULAR ESTATES ──────────────────────────── */}
            <section className="mx-auto max-w-6xl px-4 py-10">
                <h2 className="text-xl font-semibold">{t("popular_estates")}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                    {POPULAR_ESTATES.map((e) => (
                        <Link
                            key={e.slug}
                            href={`/houses?q=${encodeURIComponent(e.name)}`}
                            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:border-gold-500 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                            {e.name}
                        </Link>
                    ))}
                </div>
            </section>

            {/* FEATURED LISTINGS ───────────────────────── */}
            {featured.length > 0 && (
                <section className="mx-auto max-w-6xl px-4 pb-10">
                    <div className="mb-4 flex items-end justify-between">
                        <h2 className="text-xl font-semibold">Latest in Nairobi</h2>
                        <Button asChild variant="link" size="sm">
                            <Link href="/houses">See all →</Link>
                        </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {featured.map((p) => (
                            <PropertyCard key={p.id} p={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* HOW IT WORKS ─────────────────────────────── */}
            <section className="bg-white py-12 dark:bg-zinc-950">
                <div className="mx-auto max-w-6xl px-4">
                    <h2 className="text-2xl font-semibold">{t("how_it_works_title")}</h2>
                    <ol className="mt-6 grid gap-6 md:grid-cols-3">
                        {([1, 2, 3] as const).map((n) => (
                            <li
                                key={n}
                                className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
                            >
                                <div className="text-sm font-semibold text-gold-700">{`Step ${n}`}</div>
                                <div className="mt-1 text-lg font-medium">
                                    {t(`step_${n}_title` as "step_1_title" | "step_2_title" | "step_3_title")}
                                </div>
                                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    {t(`step_${n}_body` as "step_1_body" | "step_2_body" | "step_3_body")}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        </>
    );
}
