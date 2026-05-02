"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatKES } from "@/lib/format";

export function BookingForm({
    propertyId,
    feeKes,
    userId,
}: {
    propertyId: string;
    feeKes: number;
    userId: string;
}) {
    const t = useTranslations("booking");
    const router = useRouter();

    const [phone, setPhone] = useState("");
    const [scheduledFor, setScheduledFor] = useState("");
    const [note, setNote] = useState("");
    const [phase, setPhase] = useState<"idle" | "stk_pending" | "booked">("idle");
    const [error, setError] = useState<string | null>(null);
    const [pending, start] = useTransition();

    void userId;  // accepted for future use; server route reads it from session.

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        start(async () => {
            const res = await fetch("/api/viewings/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    property_id: propertyId,
                    scheduled_for: scheduledFor,
                    msisdn: phone,
                    note,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setError(body.error ?? `Booking failed (${res.status})`);
                return;
            }

            const body = await res.json();
            if (body.stk_pending) {
                setPhase("stk_pending");
                // Naively poll twice for the callback. Production should use realtime.
                setTimeout(() => router.push(`/dashboard/viewings`), 8000);
            } else {
                setPhase("booked");
                router.push(`/dashboard/viewings`);
            }
        });
    }

    if (phase === "stk_pending") {
        return (
            <div className="rounded-xl border border-gold-200 bg-gold-50 p-6 text-center dark:border-gold-900/40 dark:bg-gold-950/30">
                <div className="text-2xl">📱</div>
                <p className="mt-2 font-medium">{t("stk_pending")}</p>
                <p className="mt-1 text-xs text-zinc-500">
                    Enter your M-Pesa PIN to confirm. We'll redirect you when payment lands.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div>
                <Label htmlFor="when">{t("preferred_date")}</Label>
                <Input
                    id="when"
                    type="datetime-local"
                    required
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="mt-1.5"
                />
            </div>

            {feeKes > 0 && (
                <div>
                    <Label htmlFor="phone">M-Pesa phone</Label>
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
                    <p className="mt-1 text-xs text-zinc-500">
                        We'll send an STK push for {formatKES(feeKes)}.
                    </p>
                </div>
            )}

            <div>
                <Label htmlFor="note">{t("note_label")}</Label>
                <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="e.g. Looking to move in next month, prefer evening viewings"
                    className="mt-1.5"
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={pending}>
                {feeKes > 0
                    ? t("pay_and_book", { amount: formatKES(feeKes) })
                    : "Request viewing"}
            </Button>
        </form>
    );
}
