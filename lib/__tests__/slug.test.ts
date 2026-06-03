import { describe, it, expect } from "vitest";
import { slugify, uniqueSlug, nextOrderIndex } from "@/lib/admin/slug";

describe("slugify", () => {
  it("lowercases, trims, and hyphenates", () => {
    expect(slugify("  Fiqh of Salah!  ")).toBe("fiqh-of-salah");
    expect(slugify("Tajwīd 101")).toBe("tajw-d-101");
  });
  it("falls back to 'untitled' when empty", () => {
    expect(slugify("   ")).toBe("untitled");
    expect(slugify("!!!")).toBe("untitled");
  });
});

/** Minimal fake Supabase query builder for the slug/order helpers, which only
 *  use .from().select().or()/.order().limit()/.eq() then await the result. */
function fakeClient(rows: Record<string, unknown>[]) {
  const builder: Record<string, unknown> = {};
  for (const m of ["select", "or", "like", "order", "limit", "eq"]) {
    builder[m] = () => builder;
  }
  // awaiting the builder resolves to { data }
  (builder as { then: unknown }).then = (resolve: (v: { data: Record<string, unknown>[] }) => void) =>
    resolve({ data: rows });
  return { from: () => builder } as never;
}

describe("uniqueSlug", () => {
  it("returns the base slug when free", async () => {
    expect(await uniqueSlug(fakeClient([]), "courses", "Fiqh")).toBe("fiqh");
  });
  it("appends -2, -3 on collision", async () => {
    expect(await uniqueSlug(fakeClient([{ slug: "fiqh" }, { slug: "fiqh-2" }]), "courses", "Fiqh")).toBe("fiqh-3");
  });
});

describe("nextOrderIndex", () => {
  it("is 0 when empty", async () => {
    expect(await nextOrderIndex(fakeClient([]), "courses")).toBe(0);
  });
  it("is max + 1 otherwise", async () => {
    expect(await nextOrderIndex(fakeClient([{ order_index: 4 }]), "courses")).toBe(5);
  });
});
