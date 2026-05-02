// Sidebar block that gives a tenant two ways to reach NyumbaFaster about a
// listing — WhatsApp (primary) and email (fallback). Pre-fills both with the
// listing context so the operator sees what the visitor is asking about.

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { whatsappLink, emailLink, displayWhatsApp, type ListingContext } from "@/lib/contact";
import { env } from "@/lib/env";

export function ContactHost({ listing }: { listing: ListingContext }) {
    if (!env.contact.whatsapp && !env.contact.email) {
        return (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
                Contact channel not configured. Set{" "}
                <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_CONTACT_WHATSAPP</code> in
                your env file.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {env.contact.whatsapp && (
                <Button asChild size="lg" className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                    <a href={whatsappLink(listing)} target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon className="h-5 w-5" />
                        Book on WhatsApp
                    </a>
                </Button>
            )}
            {env.contact.email && (
                <Button asChild variant="outline" className="w-full">
                    <a href={emailLink(listing)}>
                        <Mail className="h-4 w-4" />
                        Email instead
                    </a>
                </Button>
            )}
            {env.contact.whatsapp && (
                <p className="pt-1 text-center text-xs text-zinc-500">
                    or text us at <span className="font-medium tabular-nums">{displayWhatsApp()}</span>
                </p>
            )}
        </div>
    );
}
