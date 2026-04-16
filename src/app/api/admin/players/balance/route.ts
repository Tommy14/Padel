import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const playerId = String(body.playerId ?? "");
  const newBalance = Number(body.newBalance ?? 0);
  const description = String(body.description ?? "Admin balance adjustment");

  if (!playerId) {
    return NextResponse.json({ error: "Player is required." }, { status: 400 });
  }

  if (Number.isNaN(newBalance)) {
    return NextResponse.json({ error: "Invalid balance value." }, { status: 400 });
  }

  const supabase = createClient();
  const { data: player, error: playerError } = await supabase
    .from("profiles")
    .select("credit_balance")
    .eq("id", playerId)
    .eq("role", "player")
    .single<{ credit_balance: number }>();

  if (playerError || !player) {
    return NextResponse.json({ error: "Player not found." }, { status: 404 });
  }

  const currentBalance = Number(player.credit_balance ?? 0);
  const delta = newBalance - currentBalance;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ credit_balance: newBalance })
    .eq("id", playerId)
    .eq("role", "player");

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  if (delta !== 0) {
    const { error: txError } = await supabase.from("credit_transactions").insert({
      player_id: playerId,
      amount: delta,
      description,
      created_by: profile.id,
    });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 400 });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/players");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sessions");

  return NextResponse.json({ ok: true, delta });
}
