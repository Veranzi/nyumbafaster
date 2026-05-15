import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const ESTATE_NAMES = [
    "Kilimani", "Kileleshwa", "Lavington", "Westlands", "Parklands",
    "Spring Valley", "South B", "South C", "Buruburu", "Donholm",
    "Umoja", "Kasarani", "Ruaka", "Ongata Rongai", "Syokimau", "Kahawa Sukari",
];

const SYSTEM_PROMPT = `You are a Kenyan rental listing data extractor. Given unstructured text about a rental property, extract the details and return ONLY a valid JSON object with exactly these fields. Do not include any explanation or markdown — pure JSON only.

Fields to extract:
{
  "title": string (catchy listing title, max 140 chars — generate one if not given),
  "description": string (full description, min 30 chars — use the input text),
  "property_type": one of: "bedsitter" | "single" | "studio" | "one_bed" | "two_bed" | "three_bed" | "four_plus_bed" | "sq" | "maisonette" | "townhouse" | "standalone" | "commercial",
  "bedrooms": integer 0–12 (0 = bedsitter/studio),
  "bathrooms": integer 1–8,
  "furnishing": "none" | "semi" | "full",
  "rent_kes": integer (monthly rent in KES — extract number only, no commas),
  "deposit_months": integer 0–6 (default 2 if not stated),
  "viewing_fee_kes": integer 0–5000 (default 0 if not stated),
  "estate": one of these exact names: ${ESTATE_NAMES.join(", ")} — pick the closest match,
  "address_line": string | null (street or road name if mentioned),
  "amenity_water_24h": boolean,
  "amenity_parking": boolean,
  "amenity_wifi": boolean,
  "amenity_security_24h": boolean,
  "amenity_backup_water": boolean
}

Rules:
- For rent: "45k" = 45000, "45,000" = 45000
- For property_type: "1 bedroom" = "one_bed", "2 bed" = "two_bed", "bedsitter"/"bedsit" = "bedsitter", "SQ" = "sq"
- For furnishing: "furnished" without qualifier = "full", "semi-furnished" = "semi", "unfurnished"/"bare" = "none"
- If a field cannot be determined, use a sensible default (0 for fees, false for amenities, "Kilimani" for estate)`;

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!env.anthropic.apiKey) {
        return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in .env.local" }, { status: 503 });
    }

    const body = await request.json().catch(() => null);
    const text: string = body?.text ?? "";

    if (!text || text.trim().length < 10) {
        return NextResponse.json({ error: "Provide at least a sentence of listing details." }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: env.anthropic.apiKey });

    const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
            {
                role: "user",
                content: `Extract listing details from this text:\n\n${text}`,
            },
        ],
        system: SYSTEM_PROMPT,
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    let parsed: Record<string, unknown>;
    try {
        // Strip any accidental markdown fences
        const clean = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        parsed = JSON.parse(clean);
    } catch {
        return NextResponse.json({ error: "AI returned unparseable response.", raw }, { status: 502 });
    }

    return NextResponse.json({ listing: parsed });
}
