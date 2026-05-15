import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { env } from "@/lib/env";
import { displayWhatsApp } from "@/lib/contact";

export const metadata = { title: "Contact" };

export default function ContactPage() {
    const wa = env.contact.whatsapp
        ? `https://wa.me/${env.contact.whatsapp.replace(/\D+/g, "")}`
        : null;

    return (
        <>
            <h1 className="text-3xl font-semibold tracking-tight">Contact us</h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Fastest way to reach the Q-uills team is WhatsApp — we usually reply
                within the day.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {env.contact.whatsapp && (
                    <a
                        href={wa!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-gold-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                        <WhatsAppIcon className="h-7 w-7 text-[#25D366]" />
                        <div className="mt-3 text-lg font-semibold">WhatsApp</div>
                        <div className="mt-1 text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
                            {displayWhatsApp()}
                        </div>
                        <div className="mt-2 text-xs text-zinc-500">Tap to chat</div>
                    </a>
                )}
                {env.contact.email && (
                    <a
                        href={`mailto:${env.contact.email}`}
                        className="rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-gold-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                        <Mail className="h-7 w-7 text-gold-600" />
                        <div className="mt-3 text-lg font-semibold">Email</div>
                        <div className="mt-1 break-all text-sm text-zinc-700 dark:text-zinc-300">
                            {env.contact.email}
                        </div>
                        <div className="mt-2 text-xs text-zinc-500">Tap to compose</div>
                    </a>
                )}
            </div>

            <h2 className="mt-12 text-xl font-semibold">Office</h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                We operate remotely across Nairobi. Viewings happen on-site at each listing —
                book one through any property page or message us above.
            </p>

            <h2 className="mt-10 text-xl font-semibold">For landlords and agents</h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                If you'd like to have your property listed on Q-uills, send us a
                WhatsApp with the unit address, photos, and rent. We'll come back with
                next steps.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
                {wa && (
                    <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                        <a href={wa} target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon className="h-5 w-5" />
                            Open WhatsApp
                        </a>
                    </Button>
                )}
            </div>
        </>
    );
}
