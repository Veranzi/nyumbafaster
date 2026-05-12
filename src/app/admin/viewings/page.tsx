import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/format";
import type { ViewingStatus, EscrowStatus } from "@/lib/supabase/types";

export const metadata = { title: "Admin — Viewings" };

type Row = {
    id: string;
    status: ViewingStatus;
    escrow_status: EscrowStatus;
    viewing_fee_kes: number;
    scheduled_for: string;
    property_id: string;
    property: { title: string; estate: string } | { title: string; estate: string }[] | null;
    tenant: { full_name: string | null; phone: string } | { full_name: string | null; phone: string }[] | null;
    owner: { full_name: string | null; agency_name: string | null; phone: string } | { full_name: string | null; agency_name: string | null; phone: string }[] | null;
};

const escrowVariant: Record<EscrowStatus, "success" | "warning" | "default" | "danger"> = {
    none: "default",
    held: "warning",
    released: "success",
    refunded: "default",
    disputed: "danger",
};

const statusVariant: Record<ViewingStatus, "success" | "warning" | "default" | "danger"> = {
    requested: "warning",
    confirmed: "success",
    completed: "success",
    no_show_tenant: "danger",
    no_show_owner: "danger",
    cancelled: "default",
    disputed: "danger",
};

const VALID_ESCROW: EscrowStatus[] = ["none", "held", "released", "refunded", "disputed"];

export default async function AdminViewingsPage({
    searchParams,
}: {
    searchParams: Promise<{ escrow?: string }>;
}) {
    const { escrow } = await searchParams;
    const filterEscrow = VALID_ESCROW.includes(escrow as EscrowStatus) ? (escrow as EscrowStatus) : null;

    const supabase = await createSupabaseServerClient();
    let query = supabase
        .from("viewings")
        .select(
            "id,status,escrow_status,viewing_fee_kes,scheduled_for,property_id," +
            "property:properties(title,estate)," +
            "tenant:profiles!viewings_tenant_id_fkey(full_name,phone)," +
            "owner:profiles!viewings_owner_id_fkey(full_name,agency_name,phone)",
        )
        .order("scheduled_for", { ascending: false })
        .limit(100)
        .returns<Row[]>();

    if (filterEscrow) query = query.eq("escrow_status", filterEscrow);

    const { data: viewings } = await query;

    const tabs = [
        { label: "All", value: "" },
        { label: "Escrow held", value: "held" },
        { label: "Disputed", value: "disputed" },
        { label: "Released", value: "released" },
    ];

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Viewings</h1>

            <div className="flex flex-wrap gap-2 text-sm">
                {tabs.map((t) => (
                    <a
                        key={t.value}
                        href={t.value ? `/admin/viewings?escrow=${t.value}` : "/admin/viewings"}
                        className={[
                            "rounded-full px-3 py-1 transition",
                            (filterEscrow ?? "") === t.value
                                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700",
                        ].join(" ")}
                    >
                        {t.label}
                    </a>
                ))}
            </div>

            {!viewings?.length ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                    <p className="text-zinc-500">No viewings found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                                <th className="px-4 py-3">Property</th>
                                <th className="px-4 py-3">Tenant</th>
                                <th className="px-4 py-3">Host</th>
                                <th className="px-4 py-3">Scheduled</th>
                                <th className="px-4 py-3">Fee</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Escrow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {viewings.map((v) => {
                                const property = Array.isArray(v.property) ? v.property[0] : v.property;
                                const tenant = Array.isArray(v.tenant) ? v.tenant[0] : v.tenant;
                                const owner = Array.isArray(v.owner) ? v.owner[0] : v.owner;
                                return (
                                    <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/houses/${v.property_id}`}
                                                target="_blank"
                                                className="font-medium hover:underline"
                                            >
                                                {property?.title ?? "—"}
                                            </Link>
                                            <div className="text-xs text-zinc-500">{property?.estate}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            <div>{tenant?.full_name ?? "—"}</div>
                                            <div className="text-zinc-400">{tenant?.phone}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            <div>{(owner as { agency_name?: string | null; full_name?: string | null } | null)?.agency_name ?? owner?.full_name ?? "—"}</div>
                                            <div className="text-zinc-400">{owner?.phone}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-zinc-500">
                                            {new Date(v.scheduled_for).toLocaleString("en-KE")}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums text-xs">
                                            {v.viewing_fee_kes > 0 ? formatKES(v.viewing_fee_kes) : <span className="text-zinc-400">Free</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={statusVariant[v.status]}>{v.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={escrowVariant[v.escrow_status]}>{v.escrow_status}</Badge>
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
