import { cn } from "@/lib/utils";

/**
 * NyumbaFaster wordmark + key glyph. Inline SVG so it inherits color from the
 * parent text class — gold by default, but goes dark on the footer.
 */
export function BrandMark({ className }: { className?: string }) {
    return (
        <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
            <KeyGlyph className="h-6 w-6 text-gold-500" />
            <span className="text-base">
                <span className="text-ink-900 dark:text-cream-50">Nyumba</span>
                <span className="text-gold-600">Faster</span>
            </span>
        </span>
    );
}

function KeyGlyph({ className }: { className?: string }) {
    // A tiny house with a key — riffs on the brand without being literal.
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
            <path
                d="M3 11.5 12 4l9 7.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5 10.5V20h4v-5h6v5h4v-9.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="14" r="1.4" fill="currentColor" />
        </svg>
    );
}
