import Link from "next/link";
import { Reveal } from "./reveal";

// Static marketing showcase of the curriculum. The landing page is public
// (unauthenticated), so this is hand-written content rather than real course
// data; each card invites the visitor to sign up. Plain-ASCII per the app's
// title convention (no Arabic glyph, diacritics dropped).
const SCIENCES = [
  { n: "01", title: "Arabic Grammar", body: "Sentence structure and case endings, from al-Ajurrumiyya to Hidayat al-Nahw." },
  { n: "02", title: "Morphology", body: "The patterns and derivation of words — the science of sarf." },
  { n: "03", title: "Arabic Language", body: "Vocabulary, reading, and expression toward living command." },
  { n: "04", title: "Quran", body: "Tafsir and the Quranic sciences, beginner to advanced." },
  { n: "05", title: "Hadith", body: "The Prophetic traditions and the sciences of their study." },
  { n: "06", title: "Seerah", body: "The life of the Prophet ﷺ and the early Islamic story." },
  { n: "07", title: "Tazkiyah", body: "Purification of the heart and the inward sciences." },
  { n: "08", title: "Fiqh", body: "Islamic jurisprudence and its guiding principles." },
];

export function Sciences() {
  return (
    <section id="sciences" className="scroll-mt-20 px-6 py-28 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">The curriculum</p>
          <h2 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl">
            The eight sciences
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted">
            Each one built from foundation to depth — explore at your own pace.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
            {SCIENCES.map((s) => (
              <Link
                key={s.n}
                href="/login?mode=signup"
                className="group relative flex items-start gap-4 rounded-3xl border border-line bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-sage hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)]"
              >
                <span className="font-display text-lg font-semibold tabular-nums text-gold">{s.n}</span>
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-semibold leading-snug text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{s.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
