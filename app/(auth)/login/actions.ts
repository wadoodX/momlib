"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(value: FormDataEntryValue | null) {
  // Same-origin path only: leading "/", not "//" or "/\" (some browsers normalize
  // a backslash to a slash → off-site redirect), and no backslashes anywhere.
  if (typeof value !== "string" || !/^\/(?![/\\])/.test(value) || value.includes("\\")) {
    return "/dashboard";
  }

  return value;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNextPath(formData.get("next"));

  if (!email || !password) {
    redirect("/login?message=Email%20and%20password%20are%20required");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  redirect(next);
}

export async function signUp(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");
  const next = getSafeNextPath(formData.get("next"));

  const fail = (message: string) =>
    redirect(`/login?mode=signup&message=${encodeURIComponent(message)}`);

  if (!email || !password) {
    fail("Email and password are required.");
  }
  if (password.length < 8) {
    fail("Password must be at least 8 characters.");
  }
  if (password !== confirm) {
    fail("Passwords do not match.");
  }

  const supabase = await createClient();
  // New accounts are always students: the handle_new_user trigger inserts the
  // profile with role 'student' (and full_name from this metadata), and RLS
  // prevents a user from changing their own role.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || null } },
  });

  if (error) {
    // Don't reflect the raw Supabase error (e.g. "User already registered") back
    // to the client — that enables account enumeration. Log it, show generic copy.
    console.error(`Sign-up failed for ${email}: ${error.message}`);
    fail("We couldn't create your account. Please check your details and try again.");
  }

  if (!data.session) {
    // Email confirmation is enabled: no session yet.
    redirect(
      `/login?message=${encodeURIComponent("Account created. Check your email to confirm, then sign in.")}`,
    );
  }

  redirect(next);
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  // Neutral message regardless of whether the email exists (avoids enumeration).
  const sent = () =>
    redirect(`/login?message=${encodeURIComponent("If an account exists for that email, a reset link is on its way.")}`);

  if (!email) {
    redirect(`/login?mode=reset&message=${encodeURIComponent("Enter your email address.")}`);
  }

  // Prefer the configured site URL for the reset link so a spoofed Host header
  // can't point the recovery link off-site (host-header poisoning). Fall back to
  // the request origin only when NEXT_PUBLIC_SITE_URL isn't set (e.g. local dev).
  let origin = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (!origin) {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
    const proto = headerList.get("x-forwarded-proto") ?? "https";
    origin = host ? `${proto}://${host}` : "";
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  sent();
}
