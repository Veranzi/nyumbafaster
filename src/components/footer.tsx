import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function Footer() {
    const t = await getTranslations("footer");
    const tBrand = await getTranslations("brand");
    const year = new Date().getFullYear();

    return (
        <footer className="mt-24 border-t border-zinc-200 bg-zinc-50 py-10 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mx-auto max-w-6xl px-4">
                <div className="flex flex-wrap justify-between gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                    <div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {tBrand("name")}
                        </div>
                        <p className="mt-1 max-w-xs">{tBrand("tagline")}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <Link href="/about" className="hover:text-gold-700">{t("about")}</Link>
                        <Link href="/contact" className="hover:text-gold-700">{t("contact")}</Link>
                        <Link href="/report-scam" className="text-red-600 hover:underline">
                            {t("report_scam")}
                        </Link>
                        <Link href="/privacy" className="hover:text-gold-700">{t("privacy")}</Link>
                        <Link href="/terms" className="hover:text-gold-700">{t("terms")}</Link>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
                    <span>© {year} {tBrand("name")}. All rights reserved.</span>
                    <span>{t("made_in_kenya")}</span>
                </div>
            </div>
        </footer>
    );
}
