import { describe, it, expect } from "vitest";
import { queryTerms, titleMatches, rowMatchesQuery, escapeIlikePattern, ilikeOrFilters } from "@/lib/search-match";

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

describe("escapeIlikePattern", () => {
  it("leaves ordinary terms untouched", () => {
    expect(escapeIlikePattern("salah")).toBe("salah");
  });
  it("escapes ILIKE wildcards and the escape char so they match literally", () => {
    expect(escapeIlikePattern("50%")).toBe("50\\%");
    expect(escapeIlikePattern("a_b")).toBe("a\\_b");
    expect(escapeIlikePattern("c\\d")).toBe("c\\\\d");
  });
});

describe("ilikeOrFilters", () => {
  it("emits one OR group per term, across every column", () => {
    expect(ilikeOrFilters(["wudu"], ["title", "description", "file_name"])).toEqual([
      'title.ilike."%wudu%",description.ilike."%wudu%",file_name.ilike."%wudu%"',
    ]);
  });

  it("produces one group per term (AND-ed when applied via separate .or() calls)", () => {
    expect(ilikeOrFilters(["wudu", "basics"], ["title"])).toEqual([
      'title.ilike."%wudu%"',
      'title.ilike."%basics%"',
    ]);
  });

  it("double-escapes for both ILIKE and PostgREST so reserved chars stay literal", () => {
    // a comma would otherwise split the OR group; a quote/backslash would break quoting
    expect(ilikeOrFilters(["a,b"], ["title"])).toEqual(['title.ilike."%a,b%"']);
    expect(ilikeOrFilters(['x"y'], ["title"])).toEqual(['title.ilike."%x\\"y%"']);
    expect(ilikeOrFilters(["50%"], ["title"])).toEqual(['title.ilike."%50\\\\%%"']);
  });

  it("returns nothing for no terms", () => {
    expect(ilikeOrFilters([], ["title"])).toEqual([]);
  });
});
