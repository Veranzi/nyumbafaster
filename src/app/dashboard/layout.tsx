import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, ListOrdered, Calendar, ShieldCheck, MessageSquare, LogOut } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getUserSafe();
    if (!user) redirect(`/sign-in?next=/dashboard`);

    const supabase = await createSupabaseServerClient();
    const { data: profile } = await supabase
        .from("profiles")
        .select("role,verification_status,full_name,agency_name")
        .eq("id", user.id)
        .maybeSingle();

    const role = profile?.role ?? "tenant";
    const isHost = role === "landlord" || role === "agent";

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                <aside className="space-y-1 text-sm">
                    <NavLink href="/dashboard" icon={Home}>Overview</NavLink>
                    {isHost && (
                        <>
                            <NavLink href="/dashboard/listings" icon={ListOrdered}>My listings</NavLink>
                            <NavLink href="/dashboard/listings/new" icon={ListOrdered}>+ New listing</NavLink>
                        </>
                    )}
                    <NavLink href="/dashboard/viewings" icon={Calendar}>Viewings</NavLink>
                    <NavLink href="/dashboard/messages" icon={MessageSquare}>Messages</NavLink>
                    <NavLink href="/dashboard/verify" icon={ShieldCheck}>
                        Verify ID {profile?.verification_status === "verified" ? "✓" : ""}
                    </NavLink>

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
    href, icon: Icon, children,
}: { href: string; icon: typeof Home; children: React.ReactNode }) {
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
