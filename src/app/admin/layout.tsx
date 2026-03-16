/**
 * =============================================================================
 * Admin Layout
 * =============================================================================
 * Protected layout for all admin routes. Verifies the user is authenticated
 * AND has the 'admin' role before rendering. Provides the sidebar navigation.
 *
 * Uses the service role client for profile queries to avoid RLS recursion
 * issues with the profiles table.
 */

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* ------------------------------------------------------------------
   * 1. Verify authentication using the regular (anon) client
   * ---------------------------------------------------------------- */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  /* ------------------------------------------------------------------
   * 2. Fetch profile using service role client (bypasses RLS)
   *    This avoids the infinite recursion in profiles RLS policies.
   * ---------------------------------------------------------------- */
  const adminSupabase = await createAdminClient();
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist or user isn't admin, redirect
  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  /* ------------------------------------------------------------------
   * 3. Render the admin shell with sidebar
   * ---------------------------------------------------------------- */
  return (
    <div className="app-shell">
      <Sidebar
        userRole="admin"
        userName={profile.full_name || "Admin"}
        userEmail={profile.email}
      />
      <main className="main-content">{children}</main>
    </div>
  );
}
