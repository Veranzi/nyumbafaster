import { getTranslations } from "next-intl/server";
import { SearchFilters } from "@/components/search-filters";
import { PropertyCard } from "@/components/property-card";
import { listProperties, parseFilters } from "@/lib/property/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Browse rentals" };

export default async function HousesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const t = await getTranslations("search");
    const tEmpty = await getTranslations("search");
    const sp = await searchParams;

    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
        if (Array.isArray(v)) v.forEach((x) => usp.append(k, x));
        else if (v) usp.set(k, v);
    }
    const filters = parseFilters(usp);

    let results: Awaited<ReturnType<typeof listProperties>> = [];
    let error: string | null = null;
    try {
        results = await listProperties(filters, 60);
    } catch (e) {
        error = e instanceof Error ? e.message : "Search failed";
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <SearchFilters />

                <div>
                    <div className="mb-4 flex items-baseline justify-between">
                        <h1 className="text-2xl font-semibold">
                            {filters.q ? `Rentals in ${filters.q}` : "All rentals"}
                        </h1>
                        <span className="text-sm text-zinc-500">
                            {t("results_count", { count: results.length })}
                        </span>
                    </div>

                    {error ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                            <strong>Could not load listings:</strong> {error}
                            <div className="mt-1 text-xs opacity-75">
                                Supabase env vars likely not yet configured. See README.
                            </div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                            <h2 className="text-lg font-medium">{tEmpty("no_results_title")}</h2>
                            <p className="mt-1 text-sm text-zinc-500">{tEmpty("no_results_body")}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {results.map((p) => (
                                <PropertyCard key={p.id} p={p} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
