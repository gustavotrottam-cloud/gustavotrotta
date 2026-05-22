import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components (browser-side).
 * Reads session from cookies set by `@supabase/ssr` on the server.
 */
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
