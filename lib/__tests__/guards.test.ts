import { describe, it, expect, beforeEach, vi } from "vitest";

// Shared mutable state the mocked Supabase client reads. Declared via vi.hoisted
// so it's available inside the (hoisted) vi.mock factories below.
const mocks = vi.hoisted(() => ({
  state: {
    user: null as null | { id: string; email?: string },
    profile: null as unknown,
    profileError: null as null | { message: string },
  },
}));

// redirect() throws in Next.js (NEXT_REDIRECT); model that with a recognizable error.
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

// Minimal fake of the SSR Supabase client: auth.getUser() + the
// from(profiles).select().eq().maybeSingle() chain that requireUser() uses.
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: mocks.state.user } }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: mocks.state.profile, error: mocks.state.profileError }),
        }),
      }),
    }),
  }),
}));

// requireUser is wrapped in React cache() (memoizes per call). Re-import a fresh
// module per test so each case starts with an empty cache.
async function loadGuards() {
  vi.resetModules();
  return import("@/lib/auth/guards");
}

const studentProfile = { id: "u1", role: "student", full_name: "A", theme: "system", created_at: "t" };
const adminProfile = { id: "u1", role: "admin", full_name: "A", theme: "system", created_at: "t" };

beforeEach(() => {
  mocks.state = { user: { id: "u1", email: "a@b.c" }, profile: null, profileError: null };
});

describe("requireUser", () => {
  it("redirects to /login when not authenticated", async () => {
    mocks.state.user = null;
    const { requireUser } = await loadGuards();
    await expect(requireUser()).rejects.toThrow("REDIRECT:/login");
  });

  it("throws on a profile-load error rather than silently downgrading the role", async () => {
    mocks.state.profileError = { message: "column profiles.theme does not exist" };
    const { requireUser } = await loadGuards();
    await expect(requireUser()).rejects.toThrow(/Failed to load profile/);
  });

  it("throws when the profile row is missing (prevents silent admin lockout)", async () => {
    mocks.state.profile = null;
    mocks.state.profileError = null;
    const { requireUser } = await loadGuards();
    await expect(requireUser()).rejects.toThrow(/No profile row/);
  });

  it("returns the user and profile on success", async () => {
    mocks.state.profile = studentProfile;
    const { requireUser } = await loadGuards();
    const res = await requireUser();
    expect(res.user.id).toBe("u1");
    expect(res.profile?.role).toBe("student");
  });
});

describe("requireAdmin", () => {
  it("redirects a student to /dashboard", async () => {
    mocks.state.profile = studentProfile;
    const { requireAdmin } = await loadGuards();
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/dashboard");
  });

  it("returns the session for an admin", async () => {
    mocks.state.profile = adminProfile;
    const { requireAdmin } = await loadGuards();
    const res = await requireAdmin();
    expect(res.profile?.role).toBe("admin");
  });
});
