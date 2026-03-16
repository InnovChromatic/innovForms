/**
 * =============================================================================
 * Diagnostic API Route — Test Supabase Connection
 * =============================================================================
 * Hit /api/test-connection to verify Supabase is reachable.
 * Uses the service role key to bypass RLS policies.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check if env vars are loaded
  if (!url || !serviceKey) {
    return NextResponse.json({
      status: "error",
      message: "Environment variables not loaded",
      url: url ? "SET" : "MISSING",
      serviceKey: serviceKey ? "SET" : "MISSING",
    });
  }

  try {
    // Use service role key to bypass RLS entirely
    const supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Test 1: Check if profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .limit(5);

    // Test 2: Check if forms table exists
    const { data: forms, error: formsError } = await supabase
      .from("forms")
      .select("id")
      .limit(1);

    return NextResponse.json({
      status: "ok",
      message: "Supabase connection successful!",
      url: url,
      tables: {
        profiles: profilesError
          ? { error: profilesError.message }
          : { count: profiles?.length || 0, data: profiles },
        forms: formsError
          ? { error: formsError.message }
          : { count: forms?.length || 0 },
      },
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      message: "Connection exception",
      error: String(err),
    });
  }
}
