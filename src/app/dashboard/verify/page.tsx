import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/verification-badge";
import type { VerificationStatus } from "@/lib/supabase/types";

export const metadata = { title: "Verify ID" };

export default async function VerifyPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("profiles")
        .select("verification_status,verified_at")
        .eq("id", user!.id)
        .maybeSingle()
        .returns<{ verification_status: VerificationStatus; verified_at: string | null } | null>();

    const status = (profile?.verification_status ?? "unverified") as VerificationStatus;

    return (
        <div className="max-w-xl space-y-4">
            <h1 className="text-2xl font-semibold">Verify your ID</h1>
            <p className="text-sm text-zinc-500">
                Kenyan law (Data Protection Act 2019, plus the Communications Authority) requires
                hosts and tenants exchanging money to be ID-verified. We use Smile ID, which checks
                your photo and ID against IPRS. Your raw ID number is never stored.
            </p>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Current status</div>
                        <div className="mt-1"><VerificationBadge status={status} /></div>
                        {profile?.verified_at && (
                            <div className="mt-1 text-xs text-zinc-500">
                                Verified on {new Date(profile.verified_at).toLocaleDateString("en-KE")}
                            </div>
                        )}
                    </div>
                    {status !== "verified" && (
                        <Button asChild>
                            <Link href="/api/smile-id/start">
                                {status === "rejected" ? "Try again" : "Start verification"}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {status === "rejected" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30">
                    Your last attempt was rejected. Common causes: blurry photo, ID number mismatch,
                    or face not matching the ID photo. Try again in good lighting with the ID flat
                    on a dark surface.
                </div>
            )}
        </div>
    );
}
