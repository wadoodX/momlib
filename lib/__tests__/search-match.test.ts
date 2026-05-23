import { describe, it, expect } from "vitest";
import { queryTerms, titleMatches, rowMatchesQuery } from "@/lib/search-match";

describe("queryTerms", () => {
  it("lowercases and splits on whitespace, dropping empties", () => {
    expect(queryTerms("  Fiqh   of  Salah ")).toEqual(["fiqh", "of", "salah"]);
    expect(queryTerms("")).toEqual([]);
  });
});

describe("titleMatches", () => {
  it("requires every term to appear", () => {
    expect(titleMatches("Introduction to Tajweed", ["intro", "tajweed"])).toBe(true);
    expect(titleMatches("Introduction to Tajweed", ["intro", "fiqh"])).toBe(false);
  });
  it("is false with no terms", () => {
    expect(titleMatches("anything", [])).toBe(false);
  });
});

describe("rowMatchesQuery", () => {
  const row = { title: "Wudu basics", description: "How to perform ablution", file_name: "wudu.pdf" };

  it("matches the resource's own fields", () => {
    expect(rowMatchesQuery(row, "wudu")).toBe(true);
    expect(rowMatchesQuery(row, "ablution")).toBe(true);
    expect(rowMatchesQuery(row, "wudu.pdf")).toBe(true);
  });

  it("requires all terms (multi-term)", () => {
    expect(rowMatchesQuery(row, "wudu basics")).toBe(true);
    expect(rowMatchesQuery(row, "wudu salah")).toBe(false);
  });

  it("does NOT match on parent titles (regression for the search bug)", () => {
    // A course/subject/chapter name is intentionally absent from the haystack.
    expect(rowMatchesQuery(row, "fiqh")).toBe(false);
  });

  it("tolerates null description/file_name", () => {
    expect(rowMatchesQuery({ title: "Seerah", description: null, file_name: null }, "seerah")).toBe(true);
  });
});
