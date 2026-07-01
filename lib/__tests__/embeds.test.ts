import { describe, it, expect } from "vitest";
import { isGammaUrl, isGammaEmbedUrl, extractEmbedUrl } from "@/lib/embeds";

describe("isGammaUrl", () => {
  it("accepts gamma.app and its subdomains", () => {
    expect(isGammaUrl("https://gamma.app/docs/Foo-abc123")).toBe(true);
    expect(isGammaUrl("https://gamma.app/embed/abc123")).toBe(true);
    expect(isGammaUrl("https://app.gamma.app/docs/x")).toBe(true);
  });

  it("rejects other hosts and invalid input", () => {
    expect(isGammaUrl("https://example.com/embed/x")).toBe(false);
    expect(isGammaUrl("https://notgamma.app.evil.com/embed/x")).toBe(false);
    expect(isGammaUrl("not a url")).toBe(false);
    expect(isGammaUrl("")).toBe(false);
  });
});

describe("isGammaEmbedUrl", () => {
  it("is true only for the /embed/ path on gamma", () => {
    expect(isGammaEmbedUrl("https://gamma.app/embed/huh6uvqw4guiis0")).toBe(true);
    expect(isGammaEmbedUrl("https://app.gamma.app/embed/x")).toBe(true);
  });

  it("is false for normal Gamma doc links and non-gamma hosts", () => {
    expect(isGammaEmbedUrl("https://gamma.app/docs/Foo-abc123")).toBe(false);
    expect(isGammaEmbedUrl("https://gamma.app/")).toBe(false);
    expect(isGammaEmbedUrl("https://example.com/embed/x")).toBe(false);
    expect(isGammaEmbedUrl("garbage")).toBe(false);
  });
});

describe("extractEmbedUrl", () => {
  it("pulls the src out of a pasted <iframe> snippet", () => {
    const snippet =
      '<iframe src="https://gamma.app/embed/huh6uvqw4guiis0" style="width: 700px; max-width: 100%; height: 450px" allow="fullscreen" title=" 1.01-Quran Studies-Chapter-01 - Complete"></iframe>';
    expect(extractEmbedUrl(snippet)).toBe("https://gamma.app/embed/huh6uvqw4guiis0");
  });

  it("handles single quotes and attributes before src", () => {
    expect(extractEmbedUrl("<iframe allow='fullscreen' src='https://gamma.app/embed/xy'></iframe>")).toBe(
      "https://gamma.app/embed/xy",
    );
  });

  it("returns a plain URL unchanged (trimmed)", () => {
    expect(extractEmbedUrl("  https://gamma.app/embed/abc  ")).toBe("https://gamma.app/embed/abc");
    expect(extractEmbedUrl("https://example.com/x")).toBe("https://example.com/x");
  });
});
