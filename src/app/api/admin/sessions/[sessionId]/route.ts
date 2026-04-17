import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: { sessionId: string } }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const supabase = createClient();
  const { data, error } = await supabase.rpc("admin_update_session", {
    p_session_id: params.sessionId,
    p_court_id: String(body.courtId ?? ""),
    p_date: String(body.date ?? ""),
    p_start_time: String(body.startTime ?? ""),
    p_end_time: String(body.endTime ?? ""),
    p_notes: String(body.notes ?? ""),
    p_player_ids: Array.isArray(body.playerIds) ? body.playerIds : [],
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidateAdminPaths();
  return NextResponse.json({ ok: true, sessionId: data });
}

export async function DELETE(_request: Request, { params }: { params: { sessionId: string } }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createClient();
  const { error } = await supabase.rpc("admin_delete_session", {
    p_session_id: params.sessionId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidateAdminPaths();
  return NextResponse.json({ ok: true });
}

function revalidateAdminPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/sessions");
  revalidatePath("/admin/sessions/new");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sessions");
}
