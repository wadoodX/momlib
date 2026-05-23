import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "student";

export type Theme = "light" | "dark" | "system";

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  theme: Theme;
  created_at: string;
};

// Wrapped in React cache() so multiple calls within a single request (e.g. a
// page and its PageShell/AdminShell) dedupe to one getUser + profile read.
export const requireUser = cache(async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, theme, created_at")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  // Fail loudly rather than silently treating the user as a role-less student.
  // A swallowed error here (e.g. a pending migration removing a selected column)
  // would strip every user of their role and quietly downgrade admins.
  if (error) {
    throw new Error(`Failed to load profile for ${user.id}: ${error.message}`);
  }

  return {
    user,
    profile,
  };
});

export async function requireAdmin() {
  const session = await requireUser();

  if (session.profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}
