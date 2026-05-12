import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/format";
import type { ListingStatus } from "@/lib/supabase/types";

export const metadata = { title: "Admin — Listings" };

type Row = {
    id: string;
    title: string;
    estate: string;
    bedrooms: number;
    rent_kes: number;
    status: ListingStatus;
    created_at: string;
    owner: { full_name: string | null; agency_name: string | null; phone: string } | { full_name: string | null; agency_name: string | null; phone: string }[] | null;
};

const statusVariant: Record<ListingStatus, "success" | "warning" | "default" | "danger"> = {
    active: "success",
    draft: "warning",
    rented: "default",
    inactive: "danger",
};

const VALID_STATUSES: ListingStatus[] = ["active", "draft", "rented", "inactive"];

export default async function AdminListingsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>;
}) {
    const { status } = await searchParams;
    const filterStatus = VALID_STATUSES.includes(status as ListingStatus) ? (status as ListingStatus) : null;

    const supabase = await createSupabaseServerClient();
    let query = supabase
        .from("properties")
        .select(
            "id,title,estate,bedrooms,rent_kes,status,created_at," +
            "owner:profiles!properties_owner_id_fkey(full_name,agency_name,phone)",
        )
        .order("created_at", { ascending: false })
        .limit(100)
        .returns<Row[]>();

    if (filterStatus) query = query.eq("status", filterStatus);

    const { data: listings } = await query;

    const tabs = [
        { label: "All", value: "" },
        { label: "Active", value: "active" },
        { label: "Draft", value: "draft" },
        { label: "Rented", value: "rented" },
        { label: "Inactive", value: "inactive" },
    ];

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Listings</h1>

            <div className="flex flex-wrap gap-2 text-sm">
                {tabs.map((t) => (
                    <Link
                        key={t.value}
                        href={t.value ? `/admin/listings?status=${t.value}` : "/admin/listings"}
                        className={[
                            "rounded-full px-3 py-1 transition",
                            (filterStatus ?? "") === t.value
                                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700",
                        ].join(" ")}
                    >
                        {t.label}
                    </Link>
                ))}
            </div>

            {!listings?.length ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                    <p className="text-zinc-500">No listings found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                                <th className="px-4 py-3">Listing</th>
                                <th className="px-4 py-3">Owner</th>
                                <th className="px-4 py-3">Rent</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Added</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {listings.map((l) => {
                                const owner = Array.isArray(l.owner) ? l.owner[0] : l.owner;
                                return (
                                    <tr key={l.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/houses/${l.id}`}
                                                target="_blank"
                                                className="font-medium hover:underline"
                                            >
                                                {l.title}
                                            </Link>
                                            <div className="text-xs text-zinc-500">
                                                {l.estate} · {l.bedrooms === 0 ? "Bedsitter" : `${l.bedrooms} bd`}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            <span className="text-zinc-700 dark:text-zinc-300">
                                                {owner?.agency_name ?? owner?.full_name ?? "—"}
                                            </span>
                                            <div className="text-zinc-400">{owner?.phone}</div>
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">{formatKES(l.rent_kes)}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={statusVariant[l.status]}>{l.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-zinc-500">
                                            {new Date(l.created_at).toLocaleDateString("en-KE")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                {l.status !== "active" && (
                                                    <form method="POST" action={`/api/admin/listings/${l.id}`}>
                                                        <input type="hidden" name="status" value="active" />
                                                        <Button type="submit" size="sm" variant="outline">
                                                            Activate
                                                        </Button>
                                                    </form>
                                                )}
                                                {l.status === "active" && (
                                                    <form method="POST" action={`/api/admin/listings/${l.id}`}>
                                                        <input type="hidden" name="status" value="inactive" />
                                                        <Button type="submit" size="sm" variant="outline">
                                                            Suspend
                                                        </Button>
                                                    </form>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
