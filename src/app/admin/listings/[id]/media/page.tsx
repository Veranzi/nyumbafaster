import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/property/queries";
import { MediaUploader } from "./media-uploader";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("properties").select("title").eq("id", id).maybeSingle();
    return { title: `Media — ${data?.title ?? id}` };
}

export default async function AdminListingMediaPage({ params }: { params: Promise<Params> }) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: listing } = await supabase
        .from("properties")
        .select("id,title,status")
        .eq("id", id)
        .maybeSingle();

    if (!listing) notFound();

    const { data: mediaRows } = await supabase
        .from("property_media")
        .select("id,kind,storage_path,sort_order")
        .eq("property_id", id)
        .order("sort_order", { ascending: true });

    const photos = (mediaRows ?? [])
        .filter((m) => m.kind === "photo")
        .map((m) => ({ ...m, url: mediaUrl(m.storage_path) }));

    const videos = (mediaRows ?? [])
        .filter((m) => m.kind === "video")
        .map((m) => ({ ...m, url: mediaUrl(m.storage_path) }));

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Photos & Videos</h1>
                    <p className="mt-1 text-sm text-zinc-500">{listing.title}</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href={`/houses/${listing.id}`}
                        target="_blank"
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                        View listing ↗
                    </Link>
                    <Link
                        href="/admin/listings"
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                        ← All listings
                    </Link>
                </div>
            </div>

            <MediaUploader
                listingId={listing.id}
                initialPhotos={photos}
                initialVideos={videos}
            />
        </div>
    );
}
