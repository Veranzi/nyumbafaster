"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import {
    whatsappLink, emailLink, displayWhatsApp, type ListingContext,
} from "@/lib/contact";
import { env } from "@/lib/env";

export function BookingForm({ listing }: { listing: ListingContext }) {
    const [name, setName]               = useState("");
    const [phone, setPhone]             = useState("");
    const [scheduledFor, setScheduledFor] = useState("");
    const [note, setNote]               = useState("");

    const details = { name, phone, preferredAt: scheduledFor, note };
    const whatsapp = whatsappLink(listing, details);
    const email    = emailLink(listing, details);

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="name">Your name</Label>
                    <Input
                        id="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        className="mt-1.5"
                    />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        required
                        placeholder="07XX XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1.5"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="when">Preferred date and time</Label>
                <Input
                    id="when"
                    type="datetime-local"
                    required
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="mt-1.5"
                />
            </div>

            <div>
                <Label htmlFor="note">Note (optional)</Label>
                <Textarea
                    id="note"
                    rows={3}
                    placeholder="e.g. Looking to move in next month, prefer evening viewings"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-1.5"
                />
            </div>

            <div className="space-y-2 pt-2">
                {env.contact.whatsapp && (
                    <Button asChild size="lg" className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                        <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon className="h-5 w-5" />
                            Send on WhatsApp
                        </a>
                    </Button>
                )}
                {env.contact.email && (
                    <Button asChild variant="outline" className="w-full">
                        <a href={email}>
                            <Mail className="h-4 w-4" />
                            Email instead
                        </a>
                    </Button>
                )}
                {env.contact.whatsapp && (
                    <p className="pt-1 text-center text-xs text-zinc-500">
                        Goes to <span className="font-medium tabular-nums">{displayWhatsApp()}</span>
                    </p>
                )}
            </div>
        </form>
    );
}
