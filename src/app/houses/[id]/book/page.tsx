import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPropertyById } from "@/lib/property/queries";
import { formatKES } from "@/lib/format";
import { BookingForm } from "./booking-form";

type Params = { id: string };

export const metadata = { title: "Book a viewing" };

export default async function BookViewingPage({ params }: { params: Promise<Params> }) {
    const { id } = await params;
    const t = await getTranslations("booking");

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/houses/${id}/book`)}`);

    const property = await getPropertyById(id);
    if (!property || property.status !== "active") notFound();

    return (
        <div className="mx-auto max-w-xl px-4 py-12">
            <h1 className="text-2xl font-semibold">{t("title")}</h1>
            <p className="mt-1 text-sm text-zinc-500">
                {property.title} — {property.estate}
            </p>

            <div className="mt-6 rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-900 dark:border-gold-900/40 dark:bg-gold-950/30 dark:text-gold-200">
                <strong>Viewing fee {property.viewing_fee_kes === 0 ? "(free)" : formatKES(property.viewing_fee_kes)}</strong>
                <p className="mt-1 text-xs leading-relaxed opacity-90">{t("fee_explainer")}</p>
            </div>

            <div className="mt-6">
                <BookingForm propertyId={property.id} feeKes={property.viewing_fee_kes} userId={user.id} />
            </div>
        </div>
    );
}
