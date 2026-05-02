import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Params = { id: string };

export const metadata = { title: "Edit listing" };

export default async function EditListingPage({ params }: { params: Promise<Params> }) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: listing } = await supabase
        .from("properties")
        .select("id,title,status,estate,rent_kes,owner_id")
        .eq("id", id)
        .maybeSingle();

    if (!listing || listing.owner_id !== user!.id) notFound();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Edit listing</h1>
                <Badge variant={listing.status === "active" ? "success" : "outline"}>
                    {listing.status}
                </Badge>
            </div>
            <p className="text-sm text-zinc-500">{listing.title}</p>

            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
                <p className="text-sm text-zinc-500">
                    Photo upload + amenity editing UI lands in the next sprint.
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                    For now, drop photos directly into Supabase Storage bucket{" "}
                    <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">property-media</code>{" "}
                    and insert rows into <code>property_media</code>.
                </p>
            </div>

            <div className="flex gap-2">
                <Button asChild variant="outline"><Link href="/dashboard/listings">← All listings</Link></Button>
                <Button asChild><Link href={`/houses/${listing.id}`}>View public page</Link></Button>
            </div>
        </div>
    );
}
