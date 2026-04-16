import { endOfWeek, format, startOfToday, startOfWeek } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import type { Court, Profile } from "@/lib/types";

export type SessionPlayerWithProfile = {
  id: string;
  fee: number;
  player: Profile | null;
};

export type SessionWithRelations = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_cost: number;
  court: Court | null;
  session_players: SessionPlayerWithProfile[];
};

export type PlayerSessionEntry = {
  id: string;
  fee: number;
  session: SessionWithRelations | null;
};

export async function getAdminDashboardData() {
  const supabase = createClient();
  const today = startOfToday();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const [{ count: playerCount }, { count: weekSessionCount }, { data: creditRows }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "player"),
    supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .gte("date", format(weekStart, "yyyy-MM-dd"))
      .lte("date", format(weekEnd, "yyyy-MM-dd")),
    supabase.from("profiles").select("credit_balance").eq("role", "player"),
  ]);

  const totalCreditsHeld = (creditRows ?? []).reduce((sum, row) => sum + Number(row.credit_balance ?? 0), 0);

  return {
    playerCount: playerCount ?? 0,
    upcomingThisWeek: weekSessionCount ?? 0,
    totalCreditsHeld,
  };
}

export async function getPlayers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "player")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Profile[];
}

export async function getCourts() {
  const supabase = createClient();
  const { data, error } = await supabase.from("courts").select("*").order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Court[];
}

export async function getSessions() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
        *,
        court:courts(*),
        session_players(
          *,
          player:profiles(*)
        )
      `,
    )
    .order("date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as SessionWithRelations[];
}

export async function getSessionById(sessionId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
        *,
        court:courts(*),
        session_players(
          *,
          player:profiles(*)
        )
      `,
    )
    .eq("id", sessionId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as SessionWithRelations;
}

export async function getPlayerDashboardData(playerId: string) {
  const supabase = createClient();
  const today = format(startOfToday(), "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("session_players")
    .select(
      `
        *,
        session:sessions(
          *,
          court:courts(*),
          session_players(
            *,
            player:profiles(*)
          )
        )
      `,
    )
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as PlayerSessionEntry[];
  const upcoming = rows.filter((row) => {
    const sessionDate = row.session?.date;
    return Boolean(sessionDate && sessionDate >= today);
  });
  const past = rows.filter((row) => {
    const sessionDate = row.session?.date;
    return Boolean(sessionDate && sessionDate < today);
  });

  return { upcoming, past, all: rows };
}
