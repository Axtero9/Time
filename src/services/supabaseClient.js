import { createClient } from "@supabase/supabase-js";

// Supabase Configuration with safe fallbacks for Vercel
const DEFAULT_URL = "https://beweahoqznbeuklgbrxp.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJld2VhaG9xem5iZXVrbGdicnhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTQyMTYsImV4cCI6MjEwMjQ3MDIxNn0.EUt-ScjldUa3TljuCbKWsjSSiILLqYeOKnxUWFJfIOo";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

function initSupabase() {
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    console.warn("Failed to initialize Supabase client:", err);
    // Return dummy client to prevent app crashing
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({ data: null, error: new Error("Supabase key missing") }),
        signInWithPassword: async () => ({ data: null, error: new Error("Supabase key missing") }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
      })
    };
  }
}

export const supabase = initSupabase();

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
