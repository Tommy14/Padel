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
  const supabase = createClient();
  const { error } = await supabase.from("courts").insert({
    name: String(body.name ?? ""),
    location: String(body.location ?? ""),
    hourly_rate: Number(body.hourlyRate ?? 0),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidatePath("/admin/courts");
  revalidatePath("/admin/sessions/new");

  return NextResponse.json({ ok: true });
}
