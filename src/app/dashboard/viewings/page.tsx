import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/format";
import type { ViewingStatus } from "@/lib/supabase/types";

export const metadata = { title: "Viewings" };

const statusVariant: Record<ViewingStatus, "success" | "warning" | "default" | "danger"> = {
    requested: "warning",
    confirmed: "success",
    completed: "success",
    no_show_tenant: "danger",
    no_show_owner: "danger",
    cancelled: "default",
    disputed: "danger",
};

export default async function ViewingsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    type Row = {
        id: string;
        property_id: string;
        status: ViewingStatus;
        escrow_status: "none" | "held" | "released" | "refunded" | "disputed";
        viewing_fee_kes: number;
        scheduled_for: string;
        tenant_id: string;
        owner_id: string;
        property: { title: string; estate: string } | { title: string; estate: string }[] | null;
    };

    const { data: viewings } = await supabase
        .from("viewings")
        .select("id,property_id,status,escrow_status,viewing_fee_kes,scheduled_for,tenant_id,owner_id," +
            "property:properties(title,estate)")
        .or(`tenant_id.eq.${user!.id},owner_id.eq.${user!.id}`)
        .order("scheduled_for", { ascending: false })
        .limit(50)
        .returns<Row[]>();

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Viewings</h1>

            {(!viewings || viewings.length === 0) ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                    <p className="text-zinc-500">No viewings yet.</p>
                </div>
            ) : (
                <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
                    {viewings.map((v) => {
                        const isTenant = v.tenant_id === user!.id;
                        const property = Array.isArray(v.property) ? v.property[0] : v.property ?? null;
                        return (
                            <li key={v.id} className="flex items-center justify-between gap-4 p-4">
                                <div className="min-w-0">
                                    <Link href={`/houses/${v.property_id}`} className="line-clamp-1 font-medium hover:underline">
                                        {property?.title ?? "—"}
                                    </Link>
                                    <div className="mt-1 text-xs text-zinc-500">
                                        {property?.estate} · {new Date(v.scheduled_for).toLocaleString("en-KE")} · {isTenant ? "as tenant" : "as host"}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    {v.viewing_fee_kes > 0 && (
                                        <span className="text-zinc-500">{formatKES(v.viewing_fee_kes)}</span>
                                    )}
                                    {v.escrow_status === "held" && <Badge variant="warning">In escrow</Badge>}
                                    <Badge variant={statusVariant[v.status as ViewingStatus]}>{v.status}</Badge>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
