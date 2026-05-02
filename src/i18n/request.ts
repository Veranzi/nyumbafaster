import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const SUPPORTED = ["en", "sw"] as const;
type Locale = (typeof SUPPORTED)[number];
const DEFAULT: Locale = "en";

function pickLocale(value: string | undefined): Locale {
    if (value && (SUPPORTED as readonly string[]).includes(value)) return value as Locale;
    return DEFAULT;
}

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("KEJA_LOCALE")?.value;

    let locale = pickLocale(cookieLocale);

    if (!cookieLocale) {
        const accept = (await headers()).get("accept-language") ?? "";
        if (accept.toLowerCase().startsWith("sw")) locale = "sw";
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
        timeZone: "Africa/Nairobi",
    };
});
