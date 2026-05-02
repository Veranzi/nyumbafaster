import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function Footer() {
    const t = await getTranslations("footer");
    const tBrand = await getTranslations("brand");

    return (
        <footer className="mt-24 border-t border-zinc-200 bg-zinc-50 py-10 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mx-auto max-w-6xl px-4">
                <div className="flex flex-wrap justify-between gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                    <div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{tBrand("name")}</div>
                        <p className="mt-1 max-w-xs">{tBrand("tagline")}</p>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <Link href="/about">{t("about")}</Link>
                        <Link href="/contact">{t("contact")}</Link>
                        <Link href="/report-scam" className="text-red-600 hover:underline">
                            {t("report_scam")}
                        </Link>
                        <Link href="/privacy">{t("privacy")}</Link>
                        <Link href="/terms">{t("terms")}</Link>
                    </div>
                </div>
                <div className="mt-6 text-xs text-zinc-500">{t("made_in_kenya")}</div>
            </div>
        </footer>
    );
}
