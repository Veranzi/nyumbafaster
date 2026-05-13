import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { env } from "@/lib/env";
import { displayWhatsApp } from "@/lib/contact";

export const metadata = { title: "About" };

export default function AboutPage() {
    const wa = env.contact.whatsapp
        ? `https://wa.me/${env.contact.whatsapp.replace(/\D+/g, "")}`
        : null;

    return (
        <>
            <h1 className="text-3xl font-semibold tracking-tight">About Q-uills</h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Q-uills is a Kenya-focused rental marketplace. We help tenants find
                verified houses and apartments without the usual run-around — fake listings,
                ghost agents, and viewing fees lost to no-shows.
            </p>

            <h2 className="mt-10 text-xl font-semibold">What we do</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
                <li>Curate listings from ID-verified landlords and agents in Nairobi.</li>
                <li>Handle the whole booking conversation over WhatsApp so you never lose context.</li>
                <li>Confirm each viewing slot with the host before we send you over.</li>
                <li>Refund any deposits collected through us if a listing turns out to be fake.</li>
            </ul>

            <h2 className="mt-10 text-xl font-semibold">Where we operate today</h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                We're focused on the Kilimani belt — Kilimani, Lavington, Kileleshwa and
                Westlands. Mombasa, Kisumu, Nakuru and Eldoret are on the roadmap.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
                {wa && (
                    <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                        <a href={wa} target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon className="h-5 w-5" />
                            Chat on WhatsApp
                        </a>
                    </Button>
                )}
                <Button asChild variant="outline" size="lg">
                    <Link href="/houses">Browse rentals</Link>
                </Button>
            </div>
            {env.contact.whatsapp && (
                <p className="mt-3 text-sm text-zinc-500">
                    Direct line: <span className="font-medium tabular-nums">{displayWhatsApp()}</span>
                </p>
            )}
        </>
    );
}
