// Builds wa.me + mailto deep-links with prefilled context. Used while the
// in-app sign-in / M-Pesa booking flow is disabled — every "book a viewing"
// action funnels into a WhatsApp conversation with the brand inbox.

import { env } from "@/lib/env";
import { formatRent } from "@/lib/format";

export type ListingContext = {
    title: string;
    estate: string;
    rentKes: number;
    publicUrl: string;          // absolute URL of the listing
};

export type InquiryDetails = {
    name?: string;
    phone?: string;
    preferredAt?: string;       // ISO string from <input type="datetime-local">
    note?: string;
};

function buildBody(listing: ListingContext, who?: InquiryDetails): string {
    const lines: string[] = [
        "Hi NyumbaFaster, I'd like to book a viewing for:",
        `*${listing.title}*`,
        `Estate: ${listing.estate}`,
        `Rent: ${formatRent(listing.rentKes)}/mo`,
        `Listing: ${listing.publicUrl}`,
    ];
    if (who && (who.name || who.phone || who.preferredAt || who.note)) {
        lines.push("", "My details:");
        if (who.name)        lines.push(`• Name: ${who.name}`);
        if (who.phone)       lines.push(`• Phone: ${who.phone}`);
        if (who.preferredAt) lines.push(`• Preferred viewing: ${formatPreferredAt(who.preferredAt)}`);
        if (who.note)        lines.push(`• Note: ${who.note}`);
    }
    return lines.join("\n");
}

function formatPreferredAt(value: string): string {
    const d = new Date(value);
    if (Number.isNaN(d.valueOf())) return value;
    return d.toLocaleString("en-KE", {
        weekday: "short", year: "numeric", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit",
    });
}

export function whatsappLink(listing: ListingContext, who?: InquiryDetails): string {
    // wa.me wants the number with no plus and no spaces.
    const number = env.contact.whatsapp.replace(/\D+/g, "");
    const text = encodeURIComponent(buildBody(listing, who));
    return `https://wa.me/${number}?text=${text}`;
}

export function emailLink(listing: ListingContext, who?: InquiryDetails): string {
    const subject = encodeURIComponent(`Viewing inquiry: ${listing.title}`);
    const body = encodeURIComponent(buildBody(listing, who));
    return `mailto:${env.contact.email}?subject=${subject}&body=${body}`;
}

/** Number formatted for human display: "+254 771 815 511" */
export function displayWhatsApp(): string {
    const raw = env.contact.whatsapp.replace(/\D+/g, "");
    const m = raw.match(/^254(\d{3})(\d{3})(\d{3})$/);
    return m ? `+254 ${m[1]} ${m[2]} ${m[3]}` : env.contact.whatsapp;
}
