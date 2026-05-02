// Browser-side Supabase client. Use in client components only.
// RLS policies (migration 0008) are the auth boundary — never bypass them
// from the browser. The anon key is safe to expose; it's gated by RLS.

import { createBrowserClient } from "@supabase/ssr";
import { env, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Returns null when env vars are still placeholders so callers can render a
 * "Supabase not configured" UI instead of crashing the React tree.
 */
export function createSupabaseBrowserClient() {
    if (!isSupabaseConfigured) return null;
    return createBrowserClient<Database>(env.supabase.url, env.supabase.anonKey);
}
