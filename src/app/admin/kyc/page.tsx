import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/supabase/types";

export const metadata = { title: "Admin — KYC Queue" };

type Row = {
    id: string;
    full_name: string | null;
    agency_name: string | null;
    phone: string;
    role: UserRole;
    verification_status: "pending";
    updated_at: string;
};

export default async function AdminKycPage() {
    const supabase = await createSupabaseServerClient();

    const { data: queue } = await supabase
        .from("profiles")
        .select("id,full_name,agency_name,phone,role,verification_status,updated_at")
        .eq("verification_status", "pending")
        .order("updated_at", { ascending: true })
        .limit(100)
        .returns<Row[]>();

    return (
        <div className="space-y-4">
            <div className="flex items-baseline gap-3">
                <h1 className="text-2xl font-semibold">KYC Queue</h1>
                {!!queue?.length && (
                    <Badge variant="warning">{queue.length} pending</Badge>
                )}
            </div>

            <p className="text-sm text-zinc-500">
                These users submitted ID verification via Smile ID. Review and approve or reject manually
                if the webhook was not received or requires override.
            </p>

            {!queue?.length ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                    <p className="text-zinc-500">No pending verifications.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Submitted</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {queue.map((u) => (
                                <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                                    <td className="px-4 py-3 font-medium">
                                        {u.agency_name ?? u.full_name ?? "—"}
                                        {u.agency_name && u.full_name && (
                                            <div className="text-xs text-zinc-400">{u.full_name}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 tabular-nums text-xs text-zinc-600 dark:text-zinc-400">
                                        {u.phone}
                                    </td>
                                    <td className="px-4 py-3 capitalize text-xs text-zinc-500">
                                        {u.role}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-zinc-500">
                                        {new Date(u.updated_at).toLocaleString("en-KE")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <form method="POST" action={`/api/admin/users/${u.id}`}>
                                                <input type="hidden" name="verification_status" value="verified" />
                                                <Button type="submit" size="sm" variant="outline">
                                                    Approve
                                                </Button>
                                            </form>
                                            <form method="POST" action={`/api/admin/users/${u.id}`}>
                                                <input type="hidden" name="verification_status" value="rejected" />
                                                <Button type="submit" size="sm" variant="outline">
                                                    Reject
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
