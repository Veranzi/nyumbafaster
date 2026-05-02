// Refreshes the Supabase auth session on every request and rewrites the
// updated Set-Cookie headers onto the outgoing response. Without this,
// access tokens expire silently and RSCs see a logged-out user even though
// the browser still holds a valid refresh token.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env, isSupabaseConfigured } from "@/lib/env";

export async function updateSession(request: NextRequest) {
    const response = NextResponse.next({ request });
    if (!isSupabaseConfigured) return response;

    const supabase = createServerClient(env.supabase.url, env.supabase.anonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(toSet) {
                for (const { name, value, options } of toSet) {
                    request.cookies.set(name, value);
                    response.cookies.set(name, value, options);
                }
            },
        },
    });

    // Touching auth.getUser() is what triggers the cookie refresh. Don't drop it.
    // Swallow network failures — local Supabase may not be running yet.
    try {
        await supabase.auth.getUser();
    } catch {
        /* noop — getUserSafe() handles per-page rendering */
    }

    return response;
}
