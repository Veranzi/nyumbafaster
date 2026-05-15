import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, ListOrdered, PlusCircle, Users, Calendar, ShieldCheck, LogOut } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getUserSafe();
    if (!user) redirect("/sign-in?next=/admin");

    const supabase = await createSupabaseServerClient();
    const { data: profile } = await supabase
        .from("profiles")
        .select("role,full_name,agency_name")
        .eq("id", user.id)
        .maybeSingle();

    if (profile?.role !== "admin") redirect("/dashboard");

    const name = profile?.full_name ?? profile?.agency_name ?? user.email ?? "Admin";

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6 flex items-center gap-3">
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-red-700 dark:bg-red-950 dark:text-red-400">
                    Admin
                </span>
                <span className="text-sm text-zinc-500">{name}</span>
            </div>

            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                <aside className="space-y-1 text-sm">
                    <NavLink href="/admin" icon={LayoutDashboard}>Overview</NavLink>
                    <NavLink href="/admin/listings" icon={ListOrdered}>Listings</NavLink>
                    <NavLink href="/admin/listings/new" icon={PlusCircle}>Add listing</NavLink>
                    <NavLink href="/admin/users" icon={Users}>Users</NavLink>
                    <NavLink href="/admin/viewings" icon={Calendar}>Viewings</NavLink>
                    <NavLink href="/admin/kyc" icon={ShieldCheck}>KYC queue</NavLink>

                    <form action="/sign-out" method="POST" className="pt-4">
                        <button className="flex w-full items-center gap-2 rounded px-2 py-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </form>
                </aside>

                <section>{children}</section>
            </div>
        </div>
    );
}

function NavLink({
    href,
    icon: Icon,
    children,
}: {
    href: string;
    icon: typeof LayoutDashboard;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2 rounded px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
            <Icon className="h-4 w-4" />
            {children}
        </Link>
    );
}
