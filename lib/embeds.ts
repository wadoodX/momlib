/**
 * Pure helpers for external-link / embed handling (Gamma today). Kept
 * dependency-free so both the server actions and the preview UI can share them,
 * and so they're straightforward to unit-test.
 */

/** True for any gamma.app URL (drives the Gamma link-out / embed treatment). */
export function isGammaUrl(value: string): boolean {
  try {
    const hostname = new URL(value).hostname;
    return hostname === "gamma.app" || hostname.endsWith(".gamma.app");
  } catch {
    return false;
  }
}

/**
 * Gamma's dedicated embed URL (gamma.app/embed/…). Unlike a normal Gamma doc
 * link, this one is designed to be iframed, so it can be shown inline.
 */
export function isGammaEmbedUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (u.hostname === "gamma.app" || u.hostname.endsWith(".gamma.app")) && u.pathname.startsWith("/embed/");
  } catch {
    return false;
  }
}

/**
 * If `raw` is a pasted `<iframe … src="…">` embed snippet, return just the `src`
 * URL; otherwise return the trimmed input. Only the extracted URL is ever stored
 * or rendered — the raw HTML is never used.
 */
export function extractEmbedUrl(raw: string): string {
  const value = raw.trim();
  const match = value.match(/<iframe[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
  return match ? match[1].trim() : value;
}
