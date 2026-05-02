// Locale-aware formatters. We ONLY format KES — no other currencies at MVP.
// Phone normalization is brutal in Kenya because users type variants like
// "0712345678", "254712345678", "+254712345678", "0712-345-678".

const KES = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
});

const KES_COMPACT = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    notation: "compact",
    maximumFractionDigits: 1,
});

export function formatKES(amount: number, opts: { compact?: boolean } = {}): string {
    if (!Number.isFinite(amount)) return "—";
    return (opts.compact ? KES_COMPACT : KES).format(amount);
}

/**
 * Normalize Kenyan mobile to E.164 (+2547XXXXXXXX or +2541XXXXXXXX).
 * Returns null if it doesn't look like a valid Safaricom/Airtel/Telkom mobile.
 *
 * Why so strict: we only need mobiles (M-Pesa-capable) for OTP and STK push.
 */
export function normalizeKenyanMobile(input: string): string | null {
    const digits = input.replace(/\D+/g, "");
    let local: string;

    if (digits.startsWith("2547") || digits.startsWith("2541")) {
        local = digits.slice(3);
    } else if (digits.startsWith("07") || digits.startsWith("01")) {
        local = digits.slice(1);
    } else if (digits.startsWith("7") || digits.startsWith("1")) {
        local = digits;
    } else {
        return null;
    }

    if (local.length !== 9) return null;
    if (!/^[71]\d{8}$/.test(local)) return null;

    return `+254${local}`;
}

export function maskPhone(e164: string): string {
    // +254712345678 → +254 712 ••• 678
    const m = e164.match(/^(\+254)(\d{3})(\d{3})(\d{3})$/);
    if (!m) return e164;
    return `${m[1]} ${m[2]} ••• ${m[4]}`;
}

// "₦ 65,000 / month" feels off for KES. We render rent like "KES 65,000".
export function formatRent(rentKes: number): string {
    return formatKES(rentKes);
}
