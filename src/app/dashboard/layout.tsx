/**
 * =============================================================================
 * User Dashboard Layout
 * =============================================================================
 * Protected layout for the user dashboard. Verifies authentication
 * and provides the sidebar navigation for regular users.
 *
 * Uses the service role client for profile queries to avoid RLS recursion.
 */

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* ------------------------------------------------------------------
   * 1. Verify authentication
   * ---------------------------------------------------------------- */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  /* ------------------------------------------------------------------
   * 2. Fetch user profile using service role (bypasses RLS)
   * ---------------------------------------------------------------- */
  const adminSupabase = await createAdminClient();
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  /* ------------------------------------------------------------------
   * 3. If user is admin, redirect to admin panel
   * ---------------------------------------------------------------- */
  if (profile?.role === "admin") {
    redirect("/admin");
  }

  /* ------------------------------------------------------------------
   * 4. Render dashboard shell
   * ---------------------------------------------------------------- */
  return (
    <div className="app-shell">
      <Sidebar
        userRole="user"
        userName={profile?.full_name || "User"}
        userEmail={profile?.email || user.email || ""}
      />
      <main className="main-content">{children}</main>
    </div>
  );
}
