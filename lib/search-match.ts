// Pure, dependency-free search matchers (no server imports) so they can be
// unit-tested directly. Used by the search data layer in lib/db/content.ts.

export function queryTerms(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

/** Every term must appear somewhere in the provided text. */
export function titleMatches(title: string, terms: string[]): boolean {
  if (terms.length === 0) return false;
  const haystack = title.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export type MatchableRow = {
  title: string;
  description: string | null;
  file_name: string | null;
};

/** A resource matches on its OWN fields only (title/description/file name);
 *  parent (course/subject/chapter) name matches surface as their own results. */
export function rowMatchesQuery(row: MatchableRow, query: string): boolean {
  const terms = queryTerms(query);
  if (terms.length === 0) return false;
  const haystack = [row.title, row.description, row.file_name].filter(Boolean).join(" ").toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/** Escape a user term so it is treated literally inside a SQL ILIKE pattern
 *  (backslash is ILIKE's default escape character). */
export function escapeIlikePattern(term: string): string {
  return term.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/**
 * Build PostgREST `.or()` filter strings — one per query term — that match the
 * term as a case-insensitive substring of ANY of `columns`. Apply each string
 * via its own `.or()` call: chained `.or()` groups are AND-ed together, so
 * every term must match (mirrors {@link rowMatchesQuery}/{@link titleMatches}).
 *
 * Because terms never contain whitespace, a per-column substring OR is
 * equivalent to substring-matching the space-joined fields — so moving this
 * filter into the database returns exactly the rows the JS matchers would.
 *
 * Patterns are wrapped in double quotes and escaped for both ILIKE (% _ \) and
 * PostgREST's filter grammar (" \) so commas, parens, etc. stay literal.
 */
export function ilikeOrFilters(terms: string[], columns: string[]): string[] {
  return terms.map((term) => {
    const pattern = `%${escapeIlikePattern(term)}%`;
    const value = `"${pattern.replace(/["\\]/g, (ch) => `\\${ch}`)}"`;
    return columns.map((col) => `${col}.ilike.${value}`).join(",");
  });
}
