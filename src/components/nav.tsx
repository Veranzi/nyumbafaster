import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BrandMark } from "@/components/brand-mark";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { env } from "@/lib/env";

export async function Nav() {
    const t = await getTranslations("nav");
    const locale = (await getLocale()) as "en" | "sw";
    const whatsappHref = env.contact.whatsapp
        ? `https://wa.me/${env.contact.whatsapp.replace(/\D+/g, "")}`
        : null;

    return (
        <header className="sticky top-0 z-30 border-b border-cream-200/80 bg-cream-50/85 backdrop-blur-md dark:border-ink-700 dark:bg-ink-900/85">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                <Link href="/" className="group">
                    <BrandMark className="transition-opacity group-hover:opacity-80" />
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/houses">{t("browse")}</Link>
                    </Button>
                </nav>

                <div className="flex items-center gap-2">
                    <LanguageSwitcher locale={locale} />
                    {whatsappHref && (
                        <Button
                            asChild
                            size="sm"
                            className="bg-[#25D366] text-white hover:bg-[#1ebe5a]"
                        >
                            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                                <WhatsAppIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Talk to us</span>
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
