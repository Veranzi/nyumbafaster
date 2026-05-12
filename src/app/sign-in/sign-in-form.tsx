"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { normalizeKenyanMobile } from "@/lib/format";

type Step = "phone" | "otp";
type Mode = "phone" | "email";

export function SignInForm({ next }: { next?: string }) {
    // Hook order must be stable, so we resolve the client outside any conditional
    // and split the configured/unconfigured paths into two separate components.
    const supabase = createSupabaseBrowserClient();

    if (!supabase) return <SupabaseSetupNotice />;
    return <AuthFlow supabase={supabase} next={next} />;
}

function AuthFlow({ supabase, next }: { supabase: SupabaseClient; next?: string }) {
    const [mode, setMode] = useState<Mode>("phone");
    if (mode === "email") {
        return <EmailPasswordFlow supabase={supabase} next={next} onSwitch={() => setMode("phone")} />;
    }
    return <PhoneOtpFlow supabase={supabase} next={next} onSwitch={() => setMode("email")} />;
}

function SupabaseSetupNotice() {
    return (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
            <strong>Supabase not configured.</strong>
            <p className="mt-2 leading-relaxed">
                Edit <code className="rounded bg-amber-100 px-1">.env.local</code> and set{" "}
                <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
                real values from your Supabase project, then restart <code>pnpm dev</code>.
            </p>
        </div>
    );
}

function PhoneOtpFlow({
    supabase,
    next,
    onSwitch,
}: {
    supabase: SupabaseClient;
    next?: string;
    onSwitch: () => void;
}) {
    const t = useTranslations("auth");
    const router = useRouter();

    const [step, setStep] = useState<Step>("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, start] = useTransition();

    function handleSendCode(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const e164 = normalizeKenyanMobile(phone);
        if (!e164) {
            setError(t("phone_invalid"));
            return;
        }
        start(async () => {
            const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
            if (error) {
                setError(error.message);
                return;
            }
            setPhone(e164);
            setStep("otp");
        });
    }

    function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!/^\d{6}$/.test(otp)) {
            setError(t("code_invalid"));
            return;
        }
        start(async () => {
            const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
            if (error) {
                setError(error.message);
                return;
            }
            router.push(next ?? "/dashboard");
            router.refresh();
        });
    }

    return (
        <form
            onSubmit={step === "phone" ? handleSendCode : handleVerify}
            className="space-y-4 rounded-xl border border-cream-200 bg-cream-50 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800"
        >
            {step === "phone" ? (
                <>
                    <div>
                        <Label htmlFor="phone">{t("phone_label")}</Label>
                        <Input
                            id="phone"
                            type="tel"
                            inputMode="tel"
                            placeholder={t("phone_placeholder")}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            autoFocus
                            required
                            className="mt-1.5"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <Button type="submit" className="w-full" disabled={pending}>
                        {pending ? "…" : t("send_code")}
                    </Button>
                </>
            ) : (
                <>
                    <div className="text-sm text-ink-700/70 dark:text-cream-50/60">
                        Code sent to <span className="font-medium">{phone}</span>
                    </div>
                    <div>
                        <Label htmlFor="otp">{t("code_label")}</Label>
                        <Input
                            id="otp"
                            inputMode="numeric"
                            pattern="\d{6}"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            autoFocus
                            required
                            className="mt-1.5 tabular-nums tracking-widest"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <Button type="submit" className="w-full" disabled={pending}>
                        {pending ? "…" : t("verify")}
                    </Button>
                    <button
                        type="button"
                        onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
                        className="block w-full text-center text-xs text-gold-700 hover:underline"
                    >
                        {t("resend_code")}
                    </button>
                </>
            )}

            {step === "phone" && (
                <button
                    type="button"
                    onClick={onSwitch}
                    className="block w-full text-center text-xs text-zinc-400 hover:text-zinc-600"
                >
                    Sign in with email instead
                </button>
            )}
        </form>
    );
}

function EmailPasswordFlow({
    supabase,
    next,
    onSwitch,
}: {
    supabase: SupabaseClient;
    next?: string;
    onSwitch: () => void;
}) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, start] = useTransition();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        start(async () => {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
                return;
            }
            router.push(next ?? "/dashboard");
            router.refresh();
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-cream-200 bg-cream-50 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800"
        >
            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                    className="mt-1.5"
                />
            </div>
            <div>
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1.5"
                />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "…" : "Sign in"}
            </Button>
            <button
                type="button"
                onClick={onSwitch}
                className="block w-full text-center text-xs text-zinc-400 hover:text-zinc-600"
            >
                Sign in with phone instead
            </button>
        </form>
    );
}
