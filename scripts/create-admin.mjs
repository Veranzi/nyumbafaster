// One-off script: creates the quills@admin.com admin user via Supabase Admin API.
// Run with: node scripts/create-admin.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Parse .env.local manually (no dotenv dependency needed)
function loadEnv(filePath) {
    const env = {};
    try {
        const lines = readFileSync(filePath, "utf8").split("\n");
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const eq = trimmed.indexOf("=");
            if (eq === -1) continue;
            const key = trimmed.slice(0, eq).trim();
            const value = trimmed.slice(eq + 1).trim();
            env[key] = value;
        }
    } catch {
        // file not found — fall through to process.env
    }
    return env;
}

const envPath = resolve(process.cwd(), ".env.local");
const localEnv = loadEnv(envPath);
const get = (k) => localEnv[k] ?? process.env[k] ?? "";

const supabaseUrl = get("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceKey) {
    console.error("❌  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env.local");
    process.exit(1);
}
if (serviceKey.includes("replace-me")) {
    console.error("❌  SUPABASE_SERVICE_ROLE_KEY still contains the placeholder 'replace-me'.");
    console.error("    Add real Supabase keys to .env.local first.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "quills@admin.com";
// Temporary password — change after first login
const PASSWORD = "NyumbaAdmin#" + Math.random().toString(36).slice(2, 8).toUpperCase();

async function main() {
    console.log(`Creating admin user: ${EMAIL} …`);

    const { data, error: createErr } = await supabase.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
    });

    if (createErr) {
        // If already exists, fetch the user instead
        if (createErr.message.includes("already been registered")) {
            console.log("ℹ️  User already exists — updating role to admin.");
            const { data: list } = await supabase.auth.admin.listUsers();
            const existing = list?.users?.find((u) => u.email === EMAIL);
            if (!existing) {
                console.error("❌  Could not locate existing user.");
                process.exit(1);
            }
            await setAdminRole(existing.id);
            console.log("\n✅  Role updated to admin.");
            console.log(`    Email: ${EMAIL}`);
            console.log("    (Password unchanged — use whatever you set previously.)");
            return;
        }
        console.error("❌  Failed to create user:", createErr.message);
        process.exit(1);
    }

    const userId = data.user.id;
    await setAdminRole(userId);

    console.log("\n✅  Admin account created!");
    console.log(`    Email:    ${EMAIL}`);
    console.log(`    Password: ${PASSWORD}`);
    console.log("\n    ⚠️  Save this password — it won't be shown again.");
    console.log("    Change it after your first login.");
}

async function setAdminRole(userId) {
    const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, phone: "", role: "admin", email: EMAIL }, { onConflict: "id" });
    if (error) {
        console.error("❌  Failed to set admin role:", error.message);
        process.exit(1);
    }
}

main();
