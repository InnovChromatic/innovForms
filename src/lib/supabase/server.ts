/**
 * =============================================================================
 * Supabase Server Client
 * =============================================================================
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Manages authentication cookies for SSR.
 *
 * Usage: Import and call createClient() in any server-side code.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates and returns a Supabase client configured for server-side usage.
 * Handles cookie-based session management with proper read/write operations.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Retrieves all cookies from the request.
         * Used by Supabase to read the auth session.
         */
        getAll() {
          return cookieStore.getAll();
        },

        /**
         * Sets cookies on the response.
         * Wrapped in try/catch because Server Components cannot write cookies —
         * only middleware and Server Actions can. The try/catch prevents errors
         * in Server Components while allowing middleware to manage sessions.
         */
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Silently ignore — this is called from a Server Component
            // where cookies cannot be set. Middleware handles session refresh.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client with the Service Role key.
 * This bypasses ALL Row Level Security — use only for admin operations
 * that need unrestricted database access.
 *
 * ⚠️ NEVER expose this client to the browser.
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Silently ignore in Server Components
          }
        },
      },
    }
  );
}
