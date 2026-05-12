import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKES } from "@/lib/format";

export const metadata = { title: "Admin — Overview" };

export default async function AdminOverviewPage() {
    const supabase = await createSupabaseServerClient();

    const [
        { count: totalListings },
        { count: activeListings },
        { count: totalUsers },
        { count: pendingKyc },
        { count: disputedViewings },
        { data: escrowRows },
    ] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
        supabase.from("viewings").select("id", { count: "exact", head: true }).eq("escrow_status", "disputed"),
        supabase.from("viewings").select("viewing_fee_kes").eq("escrow_status", "held"),
    ]);

    const escrowHeldKes = (escrowRows ?? []).reduce((s, v) => s + v.viewing_fee_kes, 0);
    const escrowHeldCount = escrowRows?.length ?? 0;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Overview</h1>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    label="Active listings"
                    value={activeListings ?? 0}
                    sub={`${totalListings ?? 0} total`}
                    href="/admin/listings"
                />
                <StatCard
                    label="Registered users"
                    value={totalUsers ?? 0}
                    href="/admin/users"
                />
                <StatCard
                    label="KYC pending"
                    value={pendingKyc ?? 0}
                    href="/admin/kyc"
                    urgent={(pendingKyc ?? 0) > 0}
                />
                <StatCard
                    label="Escrow held"
                    value={formatKES(escrowHeldKes)}
                    sub={`${escrowHeldCount} viewing${escrowHeldCount === 1 ? "" : "s"}`}
                    href="/admin/viewings"
                    urgent={escrowHeldCount > 0}
                />
                <StatCard
                    label="Disputed escrow"
                    value={disputedViewings ?? 0}
                    href="/admin/viewings?escrow=disputed"
                    urgent={(disputedViewings ?? 0) > 0}
                />
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    sub,
    href,
    urgent = false,
}: {
    label: string;
    value: string | number;
    sub?: string;
    href: string;
    urgent?: boolean;
}) {
    return (
        <Link
            href={href}
            className={[
                "block rounded-xl border p-5 transition hover:shadow-sm",
                urgent
                    ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
            ].join(" ")}
        >
            <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
            {sub && <div className="mt-0.5 text-xs text-zinc-400">{sub}</div>}
        </Link>
    );
}
