// Server-side auth helper that swallows network failures.
//
// Why: in dev, Supabase URL is often a placeholder or localhost without a
// running stack. The middleware's auth.getUser() and every RSC's getUser()
// would throw `fetch failed`, breaking *every* page including the landing.
// We treat unreachable Supabase as "anonymous user" so the UI renders.

import "server-only";
import { createSupabaseServerClient } from "./server";
import { isSupabaseConfigured } from "@/lib/env";
import type { User } from "@supabase/supabase-js";

export async function getUserSafe(): Promise<User | null> {
    if (!isSupabaseConfigured) return null;
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (e) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("getUserSafe: Supabase unreachable —", (e as Error).message);
        }
        return null;
    }
}
