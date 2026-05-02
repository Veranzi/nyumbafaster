import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    type Row = {
        id: string;
        property_id: string;
        tenant_id: string;
        owner_id: string;
        last_message_at: string | null;
        tenant_unread: number;
        owner_unread: number;
        property: { title: string; estate: string } | { title: string; estate: string }[] | null;
    };

    const { data: convos } = await supabase
        .from("conversations")
        .select("id,property_id,tenant_id,owner_id,last_message_at,tenant_unread,owner_unread," +
                "property:properties(title,estate)")
        .or(`tenant_id.eq.${user!.id},owner_id.eq.${user!.id}`)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(50)
        .returns<Row[]>();

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Messages</h1>

            {(!convos || convos.length === 0) ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                    <p className="text-zinc-500">No conversations yet.</p>
                    <p className="mt-1 text-xs text-zinc-400">
                        Open a listing and tap "Message host" to start a chat.
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
                    {convos.map((c) => {
                        const isTenant = c.tenant_id === user!.id;
                        const unread = isTenant ? c.tenant_unread : c.owner_unread;
                        const property = Array.isArray(c.property) ? c.property[0] : c.property ?? null;
                        return (
                            <li key={c.id}>
                                <Link href={`/dashboard/messages/${c.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                    <div className="min-w-0">
                                        <div className="line-clamp-1 font-medium">{property?.title ?? "—"}</div>
                                        <div className="text-xs text-zinc-500">{property?.estate}</div>
                                    </div>
                                    {unread > 0 && (
                                        <span className="rounded-full bg-gold-600 px-2 py-0.5 text-xs font-medium text-white">
                                            {unread}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
