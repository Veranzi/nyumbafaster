"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ImagePlus, VideoIcon, Trash2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type MediaItem = {
    id: string;
    kind: "photo" | "video" | "tour_360";
    storage_path: string;
    sort_order: number;
    url: string;
};

type UploadingItem = {
    name: string;
    kind: "photo" | "video";
    progress: "uploading" | "saving" | "error";
    error?: string;
};

export function MediaUploader({
    listingId,
    initialPhotos,
    initialVideos,
}: {
    listingId: string;
    initialPhotos: MediaItem[];
    initialVideos: MediaItem[];
}) {
    const [photos, setPhotos] = useState<MediaItem[]>(initialPhotos);
    const [videos, setVideos] = useState<MediaItem[]>(initialVideos);
    const [uploading, setUploading] = useState<UploadingItem[]>([]);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const supabase = createSupabaseBrowserClient();

    async function uploadFiles(files: FileList, kind: "photo" | "video") {
        if (!supabase) return;
        const fileArray = Array.from(files);

        for (const file of fileArray) {
            const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, "-");
            const storagePath = `${listingId}/${kind}s/${Date.now()}-${safeName}`;

            setUploading((prev) => [...prev, { name: file.name, kind, progress: "uploading" }]);

            const { error: storageError } = await supabase.storage
                .from("property-media")
                .upload(storagePath, file, { upsert: false });

            if (storageError) {
                setUploading((prev) =>
                    prev.map((u) =>
                        u.name === file.name ? { ...u, progress: "error", error: storageError.message } : u,
                    ),
                );
                continue;
            }

            setUploading((prev) =>
                prev.map((u) => (u.name === file.name ? { ...u, progress: "saving" } : u)),
            );

            const nextSortOrder =
                kind === "photo"
                    ? (photos.at(-1)?.sort_order ?? -1) + 1
                    : 0;

            const res = await fetch(`/api/admin/listings/${listingId}/media`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kind, storage_path: storagePath, sort_order: nextSortOrder }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setUploading((prev) =>
                    prev.map((u) =>
                        u.name === file.name ? { ...u, progress: "error", error: body.error ?? "Save failed" } : u,
                    ),
                );
                continue;
            }

            const { media } = await res.json();
            const newItem: MediaItem = {
                ...media,
                url: URL.createObjectURL(file),
            };

            if (kind === "photo") setPhotos((prev) => [...prev, newItem]);
            else setVideos((prev) => [...prev, newItem]);

            setUploading((prev) => prev.filter((u) => u.name !== file.name));
        }
    }

    async function deleteMedia(item: MediaItem) {
        const res = await fetch(`/api/admin/listings/${listingId}/media`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mediaId: item.id }),
        });
        if (!res.ok) return;
        if (item.kind === "photo") setPhotos((prev) => prev.filter((p) => p.id !== item.id));
        else setVideos((prev) => prev.filter((v) => v.id !== item.id));
    }

    async function movePhoto(index: number, direction: "up" | "down") {
        const newPhotos = [...photos];
        const swapIndex = direction === "up" ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newPhotos.length) return;

        [newPhotos[index], newPhotos[swapIndex]] = [newPhotos[swapIndex], newPhotos[index]];
        const reordered = newPhotos.map((p, i) => ({ ...p, sort_order: i }));
        setPhotos(reordered);

        await fetch(`/api/admin/listings/${listingId}/media`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                order: reordered.map((p) => ({ id: p.id, sort_order: p.sort_order })),
            }),
        });
    }

    return (
        <div className="space-y-8">
            {/* ── PHOTOS ─────────────────────────────── */}
            <section>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Photos</h2>
                        <p className="text-xs text-zinc-500">
                            First photo is the cover image. Drag reorder with the arrows.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => photoInputRef.current?.click()}
                    >
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Add photos
                    </Button>
                    <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && uploadFiles(e.target.files, "photo")}
                    />
                </div>

                {photos.length === 0 && uploading.filter((u) => u.kind === "photo").length === 0 && (
                    <div
                        className="mt-3 cursor-pointer rounded-xl border-2 border-dashed border-zinc-300 p-10 text-center hover:border-zinc-400 dark:border-zinc-700"
                        onClick={() => photoInputRef.current?.click()}
                    >
                        <ImagePlus className="mx-auto h-8 w-8 text-zinc-400" />
                        <p className="mt-2 text-sm text-zinc-500">Click to upload photos</p>
                        <p className="text-xs text-zinc-400">JPG, PNG, WebP · multiple allowed</p>
                    </div>
                )}

                {(photos.length > 0 || uploading.some((u) => u.kind === "photo")) && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {photos.map((photo, index) => (
                            <div
                                key={photo.id}
                                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900"
                            >
                                <Image
                                    src={photo.url}
                                    alt=""
                                    fill
                                    sizes="25vw"
                                    className="object-cover"
                                />
                                {index === 0 && (
                                    <span className="absolute left-1.5 top-1.5 rounded bg-gold-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                        Cover
                                    </span>
                                )}
                                <div className="absolute inset-0 flex flex-col items-end justify-between bg-black/40 p-1 opacity-0 transition group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() => deleteMedia(photo)}
                                        className="rounded bg-red-600 p-1 text-white hover:bg-red-700"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    <div className="flex flex-col gap-1">
                                        <button
                                            type="button"
                                            disabled={index === 0}
                                            onClick={() => movePhoto(index, "up")}
                                            className="rounded bg-white/80 p-1 text-zinc-800 hover:bg-white disabled:opacity-30"
                                        >
                                            <ChevronUp className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={index === photos.length - 1}
                                            onClick={() => movePhoto(index, "down")}
                                            className="rounded bg-white/80 p-1 text-zinc-800 hover:bg-white disabled:opacity-30"
                                        >
                                            <ChevronDown className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Uploading placeholders */}
                        {uploading.filter((u) => u.kind === "photo").map((u) => (
                            <UploadPlaceholder key={u.name} item={u} />
                        ))}

                        {/* Add more tile */}
                        <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 hover:border-zinc-400 dark:border-zinc-700"
                        >
                            <ImagePlus className="h-6 w-6 text-zinc-400" />
                        </button>
                    </div>
                )}
            </section>

            {/* ── VIDEOS ─────────────────────────────── */}
            <section>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Videos</h2>
                        <p className="text-xs text-zinc-500">Walkthrough videos shown below the photo gallery.</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => videoInputRef.current?.click()}
                    >
                        <VideoIcon className="mr-2 h-4 w-4" />
                        Add video
                    </Button>
                    <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && uploadFiles(e.target.files, "video")}
                    />
                </div>

                {videos.length === 0 && uploading.filter((u) => u.kind === "video").length === 0 && (
                    <div
                        className="mt-3 cursor-pointer rounded-xl border-2 border-dashed border-zinc-300 p-10 text-center hover:border-zinc-400 dark:border-zinc-700"
                        onClick={() => videoInputRef.current?.click()}
                    >
                        <VideoIcon className="mx-auto h-8 w-8 text-zinc-400" />
                        <p className="mt-2 text-sm text-zinc-500">Click to upload a walkthrough video</p>
                        <p className="text-xs text-zinc-400">MP4, MOV, WebM</p>
                    </div>
                )}

                {(videos.length > 0 || uploading.some((u) => u.kind === "video")) && (
                    <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
                        {videos.map((video) => (
                            <li key={video.id} className="flex items-center justify-between gap-4 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
                                        <VideoIcon className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {video.storage_path.split("/").at(-1)}
                                        </p>
                                        <a
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-gold-600 hover:underline"
                                        >
                                            Preview ↗
                                        </a>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => deleteMedia(video)}
                                    className="shrink-0 rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                        {uploading.filter((u) => u.kind === "video").map((u) => (
                            <li key={u.name} className="flex items-center gap-3 p-4">
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                <span className="truncate text-sm text-zinc-500">{u.name}</span>
                                {u.progress === "error" && (
                                    <span className="text-xs text-red-600">{u.error}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

function UploadPlaceholder({ item }: { item: UploadingItem }) {
    return (
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
            {item.progress === "error" ? (
                <p className="px-2 text-center text-xs text-red-600">{item.error ?? "Failed"}</p>
            ) : (
                <>
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                    <p className="truncate px-2 text-center text-xs text-zinc-500">
                        {item.progress === "uploading" ? "Uploading…" : "Saving…"}
                    </p>
                </>
            )}
        </div>
    );
}
