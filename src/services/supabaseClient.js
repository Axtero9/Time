import { createClient } from "@supabase/supabase-js";

// Supabase Configuration for Time Moves Slow
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://beweahoqznbeuklgbrxp.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Sign up a new user with email, password, and full name
 */
export async function signUpUser(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split("@")[0],
        avatar: "👤"
      }
    }
  });
  if (error) throw error;
  return data;
}

/**
 * Sign in an existing user
 */
export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
