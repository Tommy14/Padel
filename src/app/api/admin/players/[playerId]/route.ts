import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { playerId: string } },
) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      name: String(body.name ?? ""),
      phone: String(body.phone ?? ""),
    })
    .eq("id", params.playerId)
    .eq("role", "player");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidatePath("/admin/players");
  revalidatePath("/dashboard");

  return NextResponse.json({ ok: true });
}
