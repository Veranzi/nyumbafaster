import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, Banknote, RotateCcw, Search, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { POPULAR_ESTATES } from "@/lib/geo/kenya";
import { listProperties } from "@/lib/property/queries";
import { PropertyCard } from "@/components/property-card";
import { env } from "@/lib/env";
import { displayWhatsApp } from "@/lib/contact";

export const revalidate = 60;

export default async function HomePage() {
    const t = await getTranslations("home");

    let featured: Awaited<ReturnType<typeof listProperties>> = [];
    try {
        featured = await listProperties({}, 6);
    } catch (e) {
        console.warn("listProperties failed (Supabase not configured?)", e);
    }

    return (
        <>
            {/* HERO ─────────────────────────────────────── */}
            <section className="relative overflow-hidden border-b border-cream-200 dark:border-ink-700">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gold-50 via-cream-50 to-cream-100 dark:from-gold-950/20 dark:via-ink-900 dark:to-ink-800" />
                <div className="absolute right-[-10%] top-[-15%] -z-10 h-[500px] w-[500px] rounded-full bg-gold-200/30 blur-3xl dark:bg-gold-700/20" />

                <div className="mx-auto max-w-6xl px-4 py-16 md:py-28">
                    <div className="inline-flex items-center gap-2 rounded-full border border-gold-300/50 bg-cream-50/70 px-3 py-1 text-xs font-medium text-gold-700 backdrop-blur dark:border-gold-700/40 dark:bg-ink-800/50 dark:text-gold-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                        Now serving Kilimani · Lavington · Kileleshwa · Westlands
                    </div>

                    <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-ink-900 md:text-6xl lg:text-7xl dark:text-cream-50">
                        {t("hero_title")}
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-700/80 md:text-xl dark:text-cream-50/70">
                        {t("hero_subtitle")}
                    </p>

                    <form action="/houses" className="mt-10 flex max-w-2xl gap-2 rounded-2xl border border-gold-200/70 bg-white/80 p-2 shadow-[0_8px_30px_-10px_rgba(212,150,12,0.25)] backdrop-blur dark:border-gold-700/30 dark:bg-ink-800/60">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gold-600/70" />
                            <input
                                name="q"
                                placeholder={t("search_placeholder")}
                                className="h-14 w-full rounded-xl border-0 bg-transparent pl-11 pr-3 text-base placeholder:text-ink-700/40 focus-visible:outline-none dark:placeholder:text-cream-50/40"
                            />
                        </div>
                        <Button type="submit" size="lg" className="h-14 rounded-xl px-7 text-base">
                            {t("search_button")}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </form>

                    <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-700/80 dark:text-cream-50/70">
                        <TrustBadge icon={ShieldCheck}>{t("trust_badge_1")}</TrustBadge>
                        <TrustBadge icon={Banknote}>{t("trust_badge_2")}</TrustBadge>
                        <TrustBadge icon={RotateCcw}>{t("trust_badge_3")}</TrustBadge>
                    </div>
                </div>
            </section>

            {/* POPULAR ESTATES ──────────────────────────── */}
            <section className="mx-auto max-w-6xl px-4 py-12">
                <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t("popular_estates")}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                    {POPULAR_ESTATES.map((e) => (
                        <Link
                            key={e.slug}
                            href={`/houses?q=${encodeURIComponent(e.name)}`}
                            className="group inline-flex items-center gap-1.5 rounded-full border border-cream-200 bg-cream-50 px-4 py-2 text-sm font-medium text-ink-800 transition hover:border-gold-400 hover:bg-gold-50 hover:text-gold-700 dark:border-ink-700 dark:bg-ink-800 dark:text-cream-50 dark:hover:bg-gold-950/30 dark:hover:text-gold-300"
                        >
                            {e.name}
                            <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* FEATURED LISTINGS ───────────────────────── */}
            {featured.length > 0 && (
                <section className="mx-auto max-w-6xl px-4 pb-12">
                    <div className="mb-6 flex items-end justify-between">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Latest in Nairobi</h2>
                            <p className="mt-1 text-sm text-ink-700/60 dark:text-cream-50/50">
                                Hand-picked listings from verified hosts.
                            </p>
                        </div>
                        <Button asChild variant="link" size="sm">
                            <Link href="/houses">
                                See all
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {featured.map((p) => (
                            <PropertyCard key={p.id} p={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* HOW IT WORKS ─────────────────────────────── */}
            <section className="border-t border-cream-200 bg-gradient-to-b from-cream-50 to-cream-100 py-16 dark:border-ink-700 dark:from-ink-900 dark:to-ink-800">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="max-w-2xl">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700 dark:text-gold-400">
                            How it works
                        </span>
                        <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                            {t("how_it_works_title")}
                        </h2>
                    </div>
                    <ol className="mt-10 grid gap-5 md:grid-cols-3">
                        {([1, 2, 3] as const).map((n) => (
                            <li
                                key={n}
                                className="group relative overflow-hidden rounded-2xl border border-cream-200 bg-cream-50 p-6 transition hover:border-gold-300 hover:shadow-md dark:border-ink-700 dark:bg-ink-800 dark:hover:border-gold-700/50"
                            >
                                <div className="absolute right-4 top-4 text-7xl font-semibold tabular-nums text-gold-100 transition group-hover:text-gold-200 dark:text-ink-700">
                                    {n}
                                </div>
                                <div className="relative">
                                    <div className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-700 dark:text-gold-400">
                                        Step {n}
                                    </div>
                                    <h3 className="mt-3 text-xl font-semibold tracking-tight">
                                        {t(`step_${n}_title` as "step_1_title" | "step_2_title" | "step_3_title")}
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-ink-700/70 dark:text-cream-50/60">
                                        {t(`step_${n}_body` as "step_1_body" | "step_2_body" | "step_3_body")}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* TALK TO US ──────────────────────────────── */}
            <section className="mx-auto max-w-6xl px-4 py-16">
                <div className="overflow-hidden rounded-3xl border border-gold-200 bg-gradient-to-br from-ink-900 to-ink-800 p-8 md:p-12 lg:p-16">
                    <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                                Skip the back-and-forth
                            </span>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-cream-50 md:text-4xl">
                                Tell us what you're looking for. We'll line up the viewings.
                            </h2>
                            <p className="mt-4 text-cream-50/70">
                                Message the NyumbaFaster team on WhatsApp with the area, budget and dates that
                                work for you. We'll come back with shortlisted, host-confirmed options —
                                usually within the day.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                {env.contact.whatsapp && (
                                    <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                                        <a
                                            href={`https://wa.me/${env.contact.whatsapp.replace(/\D+/g, "")}?text=${encodeURIComponent("Hi NyumbaFaster, I'm looking for a rental in ")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <WhatsAppIcon className="h-5 w-5" />
                                            Chat on WhatsApp
                                        </a>
                                    </Button>
                                )}
                                {env.contact.email && (
                                    <Button asChild size="lg" variant="outline" className="border-gold-400 text-gold-300 hover:bg-gold-950/40">
                                        <a href={`mailto:${env.contact.email}`}>
                                            <Mail className="h-4 w-4" />
                                            Email us
                                        </a>
                                    </Button>
                                )}
                            </div>
                            {env.contact.whatsapp && (
                                <p className="mt-4 text-sm text-cream-50/60">
                                    or text us at <span className="font-medium text-gold-300 tabular-nums">{displayWhatsApp()}</span>
                                </p>
                            )}
                        </div>
                        <dl className="grid grid-cols-2 gap-6 text-cream-50">
                            <Stat value="< 1d" label="Average response time on WhatsApp" />
                            <Stat value="0" label="Booking fees for tenants" />
                            <Stat value="100%" label="Listings checked by our team" />
                            <Stat value="EAT" label="Hosts in your timezone" />
                        </dl>
                    </div>
                </div>
            </section>
        </>
    );
}

function TrustBadge({ icon: Icon, children }: { icon: typeof ShieldCheck; children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-100 text-gold-700 dark:bg-gold-950/40 dark:text-gold-400">
                <Icon className="h-3.5 w-3.5" />
            </span>
            {children}
        </span>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="border-l-2 border-gold-500 pl-4">
            <div className="text-3xl font-semibold tabular-nums text-gold-300">{value}</div>
            <div className="mt-1 text-xs text-cream-50/60">{label}</div>
        </div>
    );
}
