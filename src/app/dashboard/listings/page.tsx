import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/format";
import type { ListingStatus, PropertyType } from "@/lib/supabase/types";

type ListingRow = {
    id: string;
    title: string;
    estate: string;
    rent_kes: number;
    status: ListingStatus;
    bedrooms: number;
    property_type: PropertyType;
    listed_at: string | null;
};

export const metadata = { title: "My listings" };

export default async function MyListingsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: listings } = await supabase
        .from("properties")
        .select("id,title,estate,rent_kes,status,bedrooms,property_type,listed_at")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false })
        .returns<ListingRow[]>();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">My listings</h1>
                <Button asChild>
                    <Link href="/dashboard/listings/new">+ New listing</Link>
                </Button>
            </div>

            {(!listings || listings.length === 0) ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                    <p className="text-zinc-500">No listings yet.</p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/listings/new">Create your first listing</Link>
                    </Button>
                </div>
            ) : (
                <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
                    {listings.map((l) => (
                        <li key={l.id} className="flex items-center justify-between gap-4 p-4">
                            <div className="min-w-0">
                                <Link href={`/houses/${l.id}`} className="line-clamp-1 font-medium hover:underline">
                                    {l.title}
                                </Link>
                                <div className="mt-1 text-xs text-zinc-500">
                                    {l.estate} · {l.bedrooms === 0 ? "Bedsitter" : `${l.bedrooms} bd`} · {formatKES(l.rent_kes)}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={l.status === "active" ? "success" : "outline"}>
                                    {l.status}
                                </Badge>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/dashboard/listings/${l.id}/edit`}>Edit</Link>
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
