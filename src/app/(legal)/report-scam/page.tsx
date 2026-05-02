import { Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { env } from "@/lib/env";
import { displayWhatsApp } from "@/lib/contact";

export const metadata = { title: "Report a scam" };

export default function ReportScamPage() {
    const wa = env.contact.whatsapp
        ? `https://wa.me/${env.contact.whatsapp.replace(/\D+/g, "")}?text=${encodeURIComponent(
              "Hi NyumbaFaster, I want to report a suspicious listing or behaviour:\n\n" +
              "Listing URL: \nWhat happened: \nAmount lost (if any): \nWhen: ",
          )}`
        : null;
    const email = env.contact.email
        ? `mailto:${env.contact.email}?subject=${encodeURIComponent("Scam report")}&body=${encodeURIComponent(
              "Listing URL:\nWhat happened:\nAmount lost (if any):\nWhen:",
          )}`
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
