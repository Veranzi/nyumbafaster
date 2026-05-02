import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/verification-badge";
import type { VerificationStatus } from "@/lib/supabase/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardHome() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,role,verification_status,agency_name")
        .eq("id", user!.id)
        .maybeSingle()
        .returns<{
            full_name: string | null;
            role: "tenant" | "landlord" | "agent" | "admin";
            verification_status: VerificationStatus;
            agency_name: string | null;
        } | null>();

    const role = profile?.role ?? "tenant";
    const verified = (profile?.verification_status ?? "unverified") === "verified";

    const [{ count: listingCount }, { count: viewingCount }] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("owner_id", user!.id),
        supabase.from("viewings").select("id", { count: "exact", head: true }).or(`tenant_id.eq.${user!.id},owner_id.eq.${user!.id}`),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    Karibu, {profile?.full_name ?? profile?.agency_name ?? "friend"}
                </h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                    <span className="capitalize">{role}</span>
                    <VerificationBadge status={(profile?.verification_status ?? "unverified") as VerificationStatus} />
                </div>
            </div>

            {!verified && (
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30">
                    <CardHeader>
                        <CardTitle>Verify your ID to unlock bookings</CardTitle>
                        <CardDescription>
                            We require Smile ID verification before you can book viewings or list properties.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/dashboard/verify">Start verification</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="My listings" value={listingCount ?? 0} href="/dashboard/listings" />
                <StatCard label="Viewings" value={viewingCount ?? 0} href="/dashboard/viewings" />
                <StatCard label="Messages" value={0} href="/dashboard/messages" />
            </div>
        </div>
    );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
    return (
        <Link
            href={href}
            className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
            <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
        </Link>
    );
}
