import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NewListingForm } from "./new-listing-form";

export const metadata = { title: "New listing" };

export default async function NewListingPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in?next=/dashboard/listings/new");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role,verification_status")
        .eq("id", user.id)
        .maybeSingle();

    if (profile?.verification_status !== "verified") {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-950/30">
                <h1 className="text-lg font-semibold">Verify your ID first</h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    We require Smile ID verification before you can publish listings.
                </p>
                <a
                    href="/dashboard/verify"
                    className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
                >
                    Start verification
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-4">
            <h1 className="text-2xl font-semibold">List a property</h1>
            <p className="text-sm text-zinc-500">
                Add the basics now — you can upload photos and edit details after publishing.
            </p>
            <NewListingForm isAgent={profile?.role === "agent"} />
        </div>
    );
}
