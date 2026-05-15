import { Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { env } from "@/lib/env";
import { displayWhatsApp } from "@/lib/contact";
import { getPropertyById } from "@/lib/property/queries";
import { formatRent } from "@/lib/format";

export const metadata = { title: "Report a scam" };

type SearchParams = { listing?: string };

export default async function ReportScamPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const { listing: listingId } = await searchParams;

    // If we arrived from a listing's "Report this listing" link, look it up
    // and pre-fill the report with its title / estate / URL so the operator
    // doesn't have to ask which one the visitor means.
    let listingPrefix = "";
    if (listingId) {
        try {
            const p = await getPropertyById(listingId);
            if (p) {
                const url = `${env.app.url}/houses/${p.id}`;
                listingPrefix =
                    `Listing I'm reporting:\n` +
                    `${p.title}\n` +
                    `${p.estate} · ${formatRent(p.rent_kes)}/mo\n` +
                    `${url}\n\n`;
            }
        } catch { /* fall through to generic body */ }
    }

    const reportBody =
        listingPrefix +
        "What happened:\n" +
        "Amount lost (if any):\n" +
        "When:\n" +
        "Phone numbers / M-Pesa till numbers used:";

    const wa = env.contact.whatsapp
        ? `https://wa.me/${env.contact.whatsapp.replace(/\D+/g, "")}` +
          `?text=${encodeURIComponent("Hi Q-uills, I want to report a suspicious listing or behaviour:\n\n" + reportBody)}`
        : null;
    const email = env.contact.email
        ? `mailto:${env.contact.email}` +
          `?subject=${encodeURIComponent("Scam report")}` +
          `&body=${encodeURIComponent(reportBody)}`
        : null;

    return (
        <>
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        <strong>Have you already paid money?</strong>
                        <p className="mt-1">
                            Stop sending more. Contact your bank or M-Pesa to flag the transaction
                            and reverse it if possible (you have a short window). Then tell us
                            below — we keep a list and warn other tenants.
                        </p>
                    </div>
                </div>
            </div>

            <h1 className="mt-8 text-3xl font-semibold tracking-tight">Report a scam</h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                We take fake listings and rogue agents seriously. Tell us what happened and
                we'll investigate, take the listing down, and warn the community.
            </p>

            {listingPrefix && (
                <div className="mt-6 rounded-xl border border-cream-200 bg-cream-50 p-4 text-sm dark:border-ink-700 dark:bg-ink-800">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gold-700 dark:text-gold-400">
                        Reporting this listing
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap text-ink-800 dark:text-cream-50/80">
{listingPrefix.replace(/^Listing I'm reporting:\n/, "")}
                    </pre>
                </div>
            )}

            <h2 className="mt-10 text-xl font-semibold">What to send</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
                <li>The listing URL (or a screenshot)</li>
                <li>What was promised vs. what actually happened</li>
                <li>How much money changed hands, and via what method (M-Pesa, bank, cash)</li>
                <li>Any phone numbers, names or M-Pesa till numbers used</li>
                <li>The date and time of contact</li>
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
                {wa && (
                    <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                        <a href={wa} target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon className="h-5 w-5" />
                            Report on WhatsApp
                        </a>
                    </Button>
                )}
                {email && (
                    <Button asChild size="lg" variant="outline">
                        <a href={email}>
                            <Mail className="h-4 w-4" />
                            Email a report
                        </a>
                    </Button>
                )}
            </div>
            {env.contact.whatsapp && (
                <p className="mt-3 text-sm text-zinc-500">
                    Reports go directly to <span className="font-medium tabular-nums">{displayWhatsApp()}</span>.
                </p>
            )}

            <h2 className="mt-12 text-xl font-semibold">Other channels</h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                For confirmed fraud you should also report to the Directorate of Criminal
                Investigations (DCI) on the toll-free line <strong>0800 722 203</strong> and
                the Office of the Data Protection Commissioner if your personal data was
                misused.
            </p>
        </>
    );
}
