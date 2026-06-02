import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// Keep the pure helpers (chunk, copySource) real; stub the backend operations
// and the enabled flag so we can assert the abstraction's routing.
vi.mock("@/lib/storage/r2", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/storage/r2")>();
  return {
    ...actual,
    r2Enabled: vi.fn(() => false),
    r2Upload: vi.fn(async () => {}),
    r2SignedUrl: vi.fn(async () => "https://r2.example/signed"),
    r2Remove: vi.fn(async () => {}),
    r2Copy: vi.fn(async () => {}),
  };
});

import { chunk, copySource, r2Enabled, r2Upload, r2SignedUrl, r2Remove, r2Copy } from "@/lib/storage/r2";
import { uploadResource, signedResourceUrl, removeResources, copyResource } from "@/lib/storage/resources";

function fakeSupabase() {
  const upload = vi.fn(async () => ({ data: { path: "k" }, error: null as null | { message: string } }));
  const remove = vi.fn(async () => ({ data: [], error: null as null | { message: string } }));
  const createSignedUrl = vi.fn(async () => ({
    data: { signedUrl: "https://supabase.example/signed" },
    error: null as null | { message: string },
  }));
  const copy = vi.fn(async () => ({ data: { path: "k" }, error: null as null | { message: string } }));
  const from = vi.fn(() => ({ upload, remove, createSignedUrl, copy }));
  const client = { storage: { from } } as unknown as Parameters<typeof uploadResource>[0];
  return { client, from, upload, remove, createSignedUrl, copy };
}

const file = new File(["x"], "x.pdf", { type: "application/pdf" });

beforeEach(() => {
  vi.clearAllMocks();
  (r2Enabled as Mock).mockReturnValue(false);
});

describe("chunk", () => {
  it("batches and handles edges", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([], 3)).toEqual([]);
    expect(chunk([1], 1000)).toEqual([[1]]);
  });
});

describe("copySource", () => {
  it("joins bucket + key, encodes spaces, keeps slashes", () => {
    expect(copySource("resources", "a/b/c.pdf")).toBe("resources/a/b/c.pdf");
    expect(copySource("resources", "a b.pdf")).toBe("resources/a%20b.pdf");
  });
});

describe("resources abstraction — Supabase fallback (R2 disabled)", () => {
  it("upload/sign/remove/copy go to Supabase, not R2", async () => {
    const s = fakeSupabase();

    await uploadResource(s.client, "k", file);
    expect(s.upload).toHaveBeenCalledWith("k", file, expect.objectContaining({ upsert: false }));
    expect(r2Upload).not.toHaveBeenCalled();

    expect(await signedResourceUrl(s.client, "k", 3600)).toBe("https://supabase.example/signed");
    expect(r2SignedUrl).not.toHaveBeenCalled();

    await removeResources(s.client, ["k1", "k2"]);
    expect(s.remove).toHaveBeenCalledWith(["k1", "k2"]);
    expect(r2Remove).not.toHaveBeenCalled();

    await copyResource(s.client, "a", "b");
    expect(s.copy).toHaveBeenCalledWith("a", "b");
    expect(r2Copy).not.toHaveBeenCalled();
  });

  it("removeResources drops empty keys and never throws on backend failure", async () => {
    const s = fakeSupabase();
    s.remove.mockRejectedValueOnce(new Error("boom"));
    await expect(removeResources(s.client, ["", "k"])).resolves.toBeUndefined();
    await expect(removeResources(s.client, [])).resolves.toBeUndefined();
  });

  it("signedResourceUrl returns null when Supabase errors", async () => {
    const s = fakeSupabase();
    s.createSignedUrl.mockResolvedValueOnce({ data: { signedUrl: "" }, error: { message: "nope" } });
    expect(await signedResourceUrl(s.client, "k", 3600)).toBeNull();
  });
});

describe("resources abstraction — R2 enabled", () => {
  beforeEach(() => (r2Enabled as Mock).mockReturnValue(true));

  it("routes every op to R2, not Supabase", async () => {
    const s = fakeSupabase();

    await uploadResource(s.client, "k", file);
    expect(r2Upload).toHaveBeenCalledWith("k", file);
    expect(s.upload).not.toHaveBeenCalled();

    expect(await signedResourceUrl(s.client, "k", 3600)).toBe("https://r2.example/signed");
    expect(r2SignedUrl).toHaveBeenCalledWith("k", 3600);

    await removeResources(s.client, ["k"]);
    expect(r2Remove).toHaveBeenCalledWith(["k"]);
    expect(s.remove).not.toHaveBeenCalled();

    await copyResource(s.client, "a", "b");
    expect(r2Copy).toHaveBeenCalledWith("a", "b");
    expect(s.copy).not.toHaveBeenCalled();
  });

  it("signedResourceUrl returns null if R2 throws", async () => {
    (r2SignedUrl as Mock).mockRejectedValueOnce(new Error("nope"));
    const s = fakeSupabase();
    expect(await signedResourceUrl(s.client, "k", 3600)).toBeNull();
  });
});
