import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function syncAdminRole(userId: string, email: string | undefined) {
  if (!email || email.toLowerCase() !== env.adminEmail) {
    return;
  }

  const adminClient = createAdminClient();
  await adminClient.from("profiles").update({ role: "admin" }).eq("id", userId);
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  await syncAdminRole(user.id, user.email);

  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function requireAuth() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

export async function requireAdmin() {
  const profile = await requireAuth();

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return profile;
}

export async function requirePlayer() {
  const profile = await requireAuth();

  if (profile.role === "admin") {
    redirect("/admin");
  }

  return profile;
}
