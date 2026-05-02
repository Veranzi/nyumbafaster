import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BrandMark } from "@/components/brand-mark";
import { getUserSafe } from "@/lib/supabase/auth";

export async function Nav() {
    const t = await getTranslations("nav");
    const locale = (await getLocale()) as "en" | "sw";

    const user = await getUserSafe();

    return (
        <header className="sticky top-0 z-30 border-b border-cream-200/80 bg-cream-50/85 backdrop-blur-md dark:border-ink-700 dark:bg-ink-900/85">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                <Link href="/" className="group">
                    <BrandMark className="text-base md:text-lg transition-opacity group-hover:opacity-80" />
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/houses">{t("browse")}</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/dashboard/listings/new">{t("list_property")}</Link>
                    </Button>
                </nav>

                <div className="flex items-center gap-2">
                    <LanguageSwitcher locale={locale} />
                    {user ? (
                        <Button asChild size="sm">
                            <Link href="/dashboard">{t("dashboard")}</Link>
                        </Button>
                    ) : (
                        <Button asChild size="sm">
                            <Link href="/sign-in">{t("sign_in")}</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
