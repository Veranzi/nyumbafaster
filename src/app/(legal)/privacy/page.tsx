import { env } from "@/lib/env";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
    return (
        <>
            <h1 className="text-3xl font-semibold tracking-tight">Privacy notice</h1>
            <p className="mt-2 text-sm text-zinc-500">Last updated: 3 May 2026</p>

            <p className="mt-6 text-zinc-700 dark:text-zinc-300">
                This page explains what NyumbaFaster collects, how we use it, and the rights
                you have under the Kenya Data Protection Act, 2019. Plain English first; the
                full registration with the Office of the Data Protection Commissioner (ODPC)
                follows once we move past the pilot.
            </p>

            <h2 className="mt-10 text-xl font-semibold">What we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
                <li><strong>Contact details you give us</strong> — name, phone, email when you
                    book a viewing or message us. We need these to set up the viewing.</li>
                <li><strong>Property details from hosts</strong> — address, photos, rent and
                    amenities so we can list the unit.</li>
                <li><strong>Basic browser/device info</strong> — only what every web server
                    receives (IP, user agent). We don't run third-party trackers at this
                    stage.</li>
            </ul>

            <h2 className="mt-10 text-xl font-semibold">How we use it</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
                <li>To match you with the right rental and arrange a viewing.</li>
                <li>To keep you updated about that booking by WhatsApp / SMS / email.</li>
                <li>To investigate scam reports and remove fake listings.</li>
                <li>To improve the product (anonymised, aggregated only).</li>
            </ul>

            <h2 className="mt-10 text-xl font-semibold">What we don't do</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
                <li>We don't sell your contact details to anyone.</li>
                <li>We don't share your phone number with the host until a viewing is confirmed.</li>
                <li>We don't store your national ID number in plain text — once verification
                    is enabled, only a one-way hash is kept for de-duplication.</li>
            </ul>

            <h2 className="mt-10 text-xl font-semibold">Your rights</h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                You can ask us at any time to: see what we hold about you, correct it, or
                delete it. Email{" "}
                <a className="text-gold-700 underline" href={`mailto:${env.contact.email}`}>
                    {env.contact.email || "our team"}
                </a>{" "}
                with the request and we'll action it within 14 days.
            </p>

            <h2 className="mt-10 text-xl font-semibold">Questions or complaints</h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                Reach us first using the channels on the{" "}
                <a className="text-gold-700 underline" href="/contact">contact page</a>. If
                you're not satisfied, you can file a complaint with the Office of the Data
                Protection Commissioner at{" "}
                <a className="text-gold-700 underline" href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer">
                    odpc.go.ke
                </a>
                .
            </p>
        </>
    );
}
