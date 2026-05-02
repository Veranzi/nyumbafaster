import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { env } from "@/lib/env";

export async function Nav() {
    const t = await getTranslations("nav");
    const tBrand = await getTranslations("brand");
    const locale = (await getLocale()) as "en" | "sw";
    const whatsappHref = env.contact.whatsapp
        ? `https://wa.me/${env.contact.whatsapp.replace(/\D+/g, "")}`
        : null;

    return (
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <HomeIcon className="h-5 w-5 text-gold-600" />
                    <span>{tBrand("name")}</span>
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
