import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Keeps a Postgres table in sync with local React state.
 * - Loads the user's rows once.
 * - Subscribes to postgres_changes (INSERT/UPDATE/DELETE) for realtime multi-device sync.
 * - Exposes insert/update/remove helpers that write through to Supabase.
 */
export function useCloudCollection(table, userId, orderBy = "created_at") {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId)
        .order(orderBy, { ascending: false });

      if (!cancelled) {
        if (error) console.error(`load ${table} failed`, error);
        setRows(data || []);
        setLoading(false);
      }
    })();

    const channel = supabase
      .channel(`${table}-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `user_id=eq.${userId}` },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === "INSERT") {
              if (prev.some((r) => r.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((r) => (r.id === payload.new.id ? payload.new : r));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((r) => r.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      cancelled = true;
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [table, userId, orderBy]);

  const insert = useCallback(
    async (row) => {
      const { data, error } = await supabase
        .from(table)
        .insert({ ...row, user_id: userId })
        .select()
        .single();
      if (error) {
        console.error(`insert ${table} failed`, error);
        return { error };
      }
      setRows((prev) => (prev.some((r) => r.id === data.id) ? prev : [data, ...prev]));
      return { data };
    },
    [table, userId]
  );

  const insertMany = useCallback(
    async (rowsToInsert) => {
      const withUser = rowsToInsert.map((r) => ({ ...r, user_id: userId }));
      const { data, error } = await supabase.from(table).insert(withUser).select();
      if (error) {
        console.error(`bulk insert ${table} failed`, error);
        return { error };
      }
      setRows((prev) => [...data, ...prev]);
      return { data };
    },
    [table, userId]
  );

  const update = useCallback(
    async (id, patch) => {
      const { data, error } = await supabase
        .from(table)
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        console.error(`update ${table} failed`, error);
        return { error };
      }
      setRows((prev) => prev.map((r) => (r.id === id ? data : r)));
      return { data };
    },
    [table]
  );

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      console.error(`delete from ${table} failed`, error);
      return { error };
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    return {};
  }, [table]);

  return { rows, loading, insert, insertMany, update, remove };
}
