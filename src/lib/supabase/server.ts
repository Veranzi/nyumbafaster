// Server-side Supabase clients.
//
// createSupabaseServerClient(): user-scoped client that reads/writes session
// cookies. RLS is enforced — use this in RSCs, server actions, and API routes
// where the request acts on behalf of the signed-in user.
//
// createSupabaseAdminClient(): service-role client. Bypasses RLS. ONLY use
// from server-only paths that have already validated the caller (e.g. Daraja
// webhooks signed by callback URL secret, cron jobs). NEVER expose to a
// browser bundle.

import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import type { Database } from "./database.types";

export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(env.supabase.url, env.supabase.anonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(toSet) {
                try {
                    for (const { name, value, options } of toSet) {
                        cookieStore.set(name, value, options);
                    }
                } catch {
                    // RSCs cannot set cookies — middleware refreshes the session
                    // before any RSC runs, so this is fine to swallow here.
                }
            },
        },
    });
}

let _admin: SupabaseClient<Database> | null = null;
export function createSupabaseAdminClient(): SupabaseClient<Database> {
    if (_admin) return _admin;
    if (!env.supabase.serviceKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY missing — admin client unavailable");
    }
    _admin = createClient<Database>(env.supabase.url, env.supabase.serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return _admin;
}
