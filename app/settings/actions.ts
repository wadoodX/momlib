"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, type Theme } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

const THEMES: Theme[] = ["light", "dark", "system"];

function back(message: string) {
  redirect(`/settings?message=${encodeURIComponent(message)}`);
}

export async function updateProfile(formData: FormData) {
  const { user } = await requireUser();
  const fullName = String(formData.get("full_name") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName || null })
    .eq("id", user.id);

  if (error) {
    back(error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  back("Profile updated.");
}

export async function updatePassword(formData: FormData) {
  await requireUser();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) {
    back("Password must be at least 8 characters.");
  }

  if (password !== confirm) {
    back("Passwords do not match.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    back(error.message);
  }

  back("Password updated.");
}

export async function updateTheme(theme: Theme) {
  if (!THEMES.includes(theme)) {
    return;
  }

  const { user } = await requireUser();
  const supabase = await createClient();
  await supabase.from("profiles").update({ theme }).eq("id", user.id);
  revalidatePath("/settings");
}
