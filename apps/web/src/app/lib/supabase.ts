/**
 * Supabase browser client — used for:
 *  1. Real-time subscriptions (conversations, appointments, leads)
 *  2. Storage (avatar uploads via presigned URL)
 *
 * Auth is still handled by our FastAPI JWT — the anon key here is
 * only used for real-time channel subscriptions (read-only).
 */
import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const akey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton — reuse across components
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(url, akey, {
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
  return _client;
}

// ── Real-time helpers ─────────────────────────────────────────────────────────

type TableName = "conversations" | "appointments" | "leads";

/**
 * Subscribe to INSERT/UPDATE events on a table filtered by agency_id.
 * Returns a cleanup function to call on component unmount.
 *
 * Usage:
 *   const unsub = subscribeToTable("conversations", agencyId, (payload) => {
 *     setConversations(prev => [...prev, payload.new]);
 *   });
 *   return () => unsub();
 */
export function subscribeToTable(
  table: TableName,
  agencyId: string,
  onEvent: (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => void
): () => void {
  const client = getSupabaseClient();

  const channel: RealtimeChannel = client
    .channel(`${table}:${agencyId}`)
    .on(
      "postgres_changes",
      {
        event:  "*",
        schema: "public",
        table,
        filter: `agency_id=eq.${agencyId}`,
      },
      (payload) => onEvent(payload as any)
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

/**
 * Subscribe to a specific conversation's message updates.
 * Fires when the `messages` JSONB column is updated.
 */
export function subscribeToConversation(
  conversationId: string,
  onUpdate: (updated: Record<string, unknown>) => void
): () => void {
  const client = getSupabaseClient();

  const channel = client
    .channel(`conv:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event:  "UPDATE",
        schema: "public",
        table:  "conversations",
        filter: `id=eq.${conversationId}`,
      },
      (payload) => onUpdate(payload.new as Record<string, unknown>)
    )
    .subscribe();

  return () => { client.removeChannel(channel); };
}
