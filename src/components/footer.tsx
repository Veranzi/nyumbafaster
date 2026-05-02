import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BrandMark } from "@/components/brand-mark";

export async function Footer() {
    const t = await getTranslations("footer");
    const tBrand = await getTranslations("brand");
    const year = new Date().getFullYear();

    return (
        <footer className="mt-24 border-t border-cream-200 bg-gradient-to-b from-cream-50 to-cream-100 py-12 dark:border-ink-700 dark:from-ink-900 dark:to-ink-800">
            <div className="mx-auto max-w-6xl px-4">
                <div className="flex flex-wrap justify-between gap-8 text-sm text-ink-700/80 dark:text-cream-50/70">
                    <div className="max-w-sm space-y-3">
                        <BrandMark />
                        <p className="text-ink-700/70 dark:text-cream-50/60">{tBrand("tagline")}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-2">
                        <Link href="/about" className="hover:text-gold-700">{t("about")}</Link>
                        <Link href="/contact" className="hover:text-gold-700">{t("contact")}</Link>
                        <Link href="/report-scam" className="font-medium text-red-700 hover:underline">
                            {t("report_scam")}
                        </Link>
                        <Link href="/privacy" className="hover:text-gold-700">{t("privacy")}</Link>
                        <Link href="/terms" className="hover:text-gold-700">{t("terms")}</Link>
                    </div>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 pt-4 text-xs text-ink-700/50 dark:border-ink-700 dark:text-cream-50/40">
                    <span>© {year} {tBrand("name")}. All rights reserved.</span>
                    <span>{t("made_in_kenya")}</span>
                </div>
            </div>
        </footer>
    );
}
