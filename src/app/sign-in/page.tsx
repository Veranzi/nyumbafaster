import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getUserSafe } from "@/lib/supabase/auth";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string }>;
}) {
    const { next } = await searchParams;
    const t = await getTranslations("auth");

    const user = await getUserSafe();
    if (user) redirect(next ?? "/dashboard");

    return (
        <div className="mx-auto max-w-md px-4 py-16">
            <h1 className="text-2xl font-semibold">{t("sign_in_title")}</h1>
            <p className="mt-1 text-sm text-zinc-500">{t("sign_in_subtitle")}</p>
            <div className="mt-8">
                <SignInForm next={next} />
            </div>
        </div>
    );
}
