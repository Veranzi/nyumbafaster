import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPropertyById } from "@/lib/property/queries";
import { formatRent } from "@/lib/format";
import { env } from "@/lib/env";
import { BookingForm } from "./booking-form";

type Params = { id: string };

export const metadata = { title: "Book a viewing" };

export default async function BookViewingPage({ params }: { params: Promise<Params> }) {
    const { id } = await params;
    const t = await getTranslations("booking");

    const property = await getPropertyById(id);
    if (!property || property.status !== "active") notFound();

    return (
        <div className="mx-auto max-w-xl px-4 py-12">
            <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="mt-1 text-sm text-zinc-500">
                {property.title} — {property.estate} · <span className="tabular-nums">{formatRent(property.rent_kes)}</span>/mo
            </p>

            <div className="mt-6 rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-900 dark:border-gold-900/40 dark:bg-gold-950/30 dark:text-gold-200">
                We'll open WhatsApp with your details so the NyumbaFaster team can confirm your viewing.
                No account needed.
            </div>

            <div className="mt-6">
                <BookingForm
                    listing={{
                        title: property.title,
                        estate: property.estate,
                        rentKes: property.rent_kes,
                        publicUrl: `${env.app.url}/houses/${property.id}`,
                    }}
                />
            </div>
        </div>
    );
}
