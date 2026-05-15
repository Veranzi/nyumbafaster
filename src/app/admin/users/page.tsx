import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserRole, VerificationStatus } from "@/lib/supabase/types";

export const metadata = { title: "Admin — Users" };

type Row = {
    id: string;
    full_name: string | null;
    agency_name: string | null;
    phone: string;
    role: UserRole;
    verification_status: VerificationStatus;
    created_at: string;
};

const roleVariant: Record<UserRole, "success" | "warning" | "default" | "danger"> = {
    admin: "danger",
    agent: "warning",
    landlord: "success",
    tenant: "default",
};

const verifyVariant: Record<VerificationStatus, "success" | "warning" | "default" | "danger"> = {
    verified: "success",
    pending: "warning",
    unverified: "default",
    rejected: "danger",
};

const VALID_ROLES: UserRole[] = ["tenant", "landlord", "agent", "admin"];

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ role?: string }>;
}) {
    const { role } = await searchParams;
    const filterRole = VALID_ROLES.includes(role as UserRole) ? (role as UserRole) : null;

    const supabase = await createSupabaseServerClient();
    const base = supabase
        .from("profiles")
        .select("id,full_name,agency_name,phone,role,verification_status,created_at");

    const { data: users } = await (filterRole ? base.eq("role", filterRole) : base)
        .order("created_at", { ascending: false })
        .limit(100)
        .returns<Row[]>();

    const tabs = [
        { label: "All", value: "" },
        { label: "Tenants", value: "tenant" },
        { label: "Landlords", value: "landlord" },
        { label: "Agents", value: "agent" },
        { label: "Admins", value: "admin" },
    ];

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Users</h1>

            <div className="flex flex-wrap gap-2 text-sm">
                {tabs.map((t) => (
                    <a
                        key={t.value}
                        href={t.value ? `/admin/users?role=${t.value}` : "/admin/users"}
                        className={[
                            "rounded-full px-3 py-1 transition",
                            (filterRole ?? "") === t.value
                                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700",
                        ].join(" ")}
                    >
                        {t.label}
                    </a>
                ))}
            </div>

            {!users?.length ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                    <p className="text-zinc-500">No users found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">KYC</th>
                                <th className="px-4 py-3">Joined</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {users.map((u) => (
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
                                    <td className="px-4 py-3">
                                        <Badge variant={roleVariant[u.role]}>{u.role}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={verifyVariant[u.verification_status]}>
                                            {u.verification_status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-zinc-500">
                                        {new Date(u.created_at).toLocaleDateString("en-KE")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {u.role !== "admin" && (
                                                <form method="POST" action={`/api/admin/users/${u.id}`}>
                                                    <input type="hidden" name="role" value="admin" />
                                                    <Button type="submit" size="sm" variant="outline">
                                                        Make admin
                                                    </Button>
                                                </form>
                                            )}
                                            {u.role === "tenant" && (
                                                <form method="POST" action={`/api/admin/users/${u.id}`}>
                                                    <input type="hidden" name="role" value="landlord" />
                                                    <Button type="submit" size="sm" variant="outline">
                                                        → Landlord
                                                    </Button>
                                                </form>
                                            )}
                                            {u.verification_status === "unverified" && (
                                                <form method="POST" action={`/api/admin/users/${u.id}`}>
                                                    <input type="hidden" name="verification_status" value="verified" />
                                                    <Button type="submit" size="sm" variant="outline">
                                                        Verify
                                                    </Button>
                                                </form>
                                            )}
                                            {u.verification_status === "rejected" && (
                                                <form method="POST" action={`/api/admin/users/${u.id}`}>
                                                    <input type="hidden" name="verification_status" value="verified" />
                                                    <Button type="submit" size="sm" variant="outline">
                                                        Re-verify
                                                    </Button>
                                                </form>
                                            )}
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
