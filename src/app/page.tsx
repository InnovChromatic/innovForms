/**
 * =============================================================================
 * Root Page — Redirect to Dashboard
 * =============================================================================
 * The landing page has been removed. The root URL now redirects
 * authenticated users to /dashboard and unauthenticated users to /login.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
