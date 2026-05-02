"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher({ locale }: { locale: "en" | "sw" }) {
    const [isPending, start] = useTransition();
    const next: "en" | "sw" = locale === "en" ? "sw" : "en";

    function toggle() {
        start(() => {
            // 1 year, lax. Not HttpOnly so a future client-only flow can read it.
            document.cookie = `KEJA_LOCALE=${next}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
            // RSC re-render via full reload — cheap and correct.
            window.location.reload();
        });
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            disabled={isPending}
            aria-label={`Switch to ${next.toUpperCase()}`}
        >
            <Globe className="h-4 w-4" />
            {next.toUpperCase()}
        </Button>
    );
}
