// Shared chrome for the static info pages reachable from the footer.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
            <article className="prose prose-zinc max-w-none dark:prose-invert">
                {children}
            </article>
        </div>
    );
}
