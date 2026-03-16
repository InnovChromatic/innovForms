/**
 * =============================================================================
 * Supabase Browser Client
 * =============================================================================
 * Creates a Supabase client instance for use in Client Components (browser).
 * Uses the public anon key and relies on Row Level Security (RLS) for access control.
 *
 * Usage: Import and call createClient() in any client component.
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates and returns a Supabase client configured for browser-side usage.
 * This client uses cookies for session management automatically.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
