// One-off: resets the password for quills@admin.com and prints the new one.
// Run with: node scripts/reset-admin-password.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv(filePath) {
    const env = {};
    try {
        for (const line of readFileSync(filePath, "utf8").split("\n")) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const eq = trimmed.indexOf("=");
            if (eq === -1) continue;
            env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
        }
    } catch {}
    return env;
}

const localEnv = loadEnv(resolve(process.cwd(), ".env.local"));
const get = (k) => localEnv[k] ?? process.env[k] ?? "";

const supabaseUrl = get("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceKey || serviceKey.includes("replace-me")) {
    console.error("❌  Supabase env vars not set properly in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "quills@admin.com";
const NEW_PASSWORD = "QuillsAdmin#" + Math.random().toString(36).slice(2, 8).toUpperCase();

const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
if (listErr) {
    console.error("❌  Could not list users:", listErr.message);
    process.exit(1);
}

const user = list.users.find((u) => u.email === EMAIL);
if (!user) {
    console.error(`❌  No user with email ${EMAIL}. Run create-admin.mjs first.`);
    process.exit(1);
}

const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
    password: NEW_PASSWORD,
});

if (updateErr) {
    console.error("❌  Failed to update password:", updateErr.message);
    process.exit(1);
}

console.log("\n✅  Password reset successfully!");
console.log(`    Email:    ${EMAIL}`);
console.log(`    Password: ${NEW_PASSWORD}`);
console.log("\n    ⚠️  Save this password — it won't be shown again.");
