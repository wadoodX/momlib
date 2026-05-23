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
