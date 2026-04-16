import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const playerId = String(body.playerId ?? "");
  const amount = Number(body.amount ?? 0);
  const description = String(body.description ?? "Credit top-up");

  const supabase = createClient();
  const { error } = await supabase.rpc("admin_add_credit", {
    p_player_id: playerId,
    p_amount: amount,
    p_description: description,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/players");
  revalidatePath("/dashboard");

  return NextResponse.json({ ok: true });
}
