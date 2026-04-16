import { createClient } from "@supabase/supabase-js";

import { assertServerEnv, env } from "@/lib/env";

export function createAdminClient() {
  assertServerEnv();

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
