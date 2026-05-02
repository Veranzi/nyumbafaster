export const metadata = { title: "Terms" };

export default function TermsPage() {
    return (
        <>
            <h1 className="text-3xl font-semibold tracking-tight">Terms of use</h1>
            <p className="mt-2 text-sm text-zinc-500">Last updated: 3 May 2026</p>

            <p className="mt-6 text-zinc-700 dark:text-zinc-300">
                By using NyumbaFaster you agree to the terms below. We've kept them short and
                in plain English — a full agreement signed at booking time will follow once
                we enable in-app payments.
            </p>

            <h2 className="mt-10 text-xl font-semibold">1. What NyumbaFaster does</h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                NyumbaFaster is a discovery and booking service. We curate rental listings
                in Kenya and arrange viewings between tenants and hosts. We are not the
                landlord or the agent of record, and we do not own the properties listed.
            </p>

            <h2 className="mt-10 text-xl font-semibold">2. Listings</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
                <li>Hosts are responsible for the accuracy of their listings.</li>
                <li>We verify hosts' identity but we don't independently verify ownership of
                    each unit. If you suspect a fake listing, use the{" "}
                    <a className="text-gold-700 underline" href="/report-scam">scam report page</a>.</li>
                <li>Photos remain the host's property; we display them solely for the
                    purpose of listing the unit.</li>
            </ul>

            <h2 className="mt-10 text-xl font-semibold">3. Viewings</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
                <li>You must be 18+ to book a viewing.</li>
                <li>Viewing fees, where charged, are collected outside the platform during
                    the pilot phase. Refund policy is communicated at booking time.</li>
                <li>NyumbaFaster acts as an introducer; the lease is a private agreement
                    between you and the host.</li>
            </ul>

            <h2 className="mt-10 text-xl font-semibold">4. Acceptable use</h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                Don't scrape the site, post fake listings, harass hosts or other tenants, or
                attempt to circumvent the booking flow. We may suspend or remove accounts
                that violate these rules.
            </p>

            <h2 className="mt-10 text-xl font-semibold">5. Liability</h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                NyumbaFaster is provided "as is" during the pilot. We do our best to verify
                hosts and remove scams quickly, but we can't guarantee any specific outcome.
                Our liability is limited to the fees you paid us directly (if any).
            </p>

            <h2 className="mt-10 text-xl font-semibold">6. Governing law</h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                These terms are governed by the laws of Kenya. Disputes will be resolved
                in the courts of Nairobi unless we mutually agree to mediation first.
            </p>

            <h2 className="mt-10 text-xl font-semibold">7. Changes</h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                We may update these terms as the product evolves. Material changes will be
                announced on the homepage at least seven days before they take effect.
            </p>
        </>
    );
}
