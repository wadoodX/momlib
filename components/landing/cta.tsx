import Link from "next/link";
import { Reveal } from "./reveal";

export function CallToAction() {
  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-6xl px-6 pb-32">
        <Reveal>
          <div className="border-t border-line pt-20 text-center">
            <h2 className="font-display mx-auto max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-6xl">
              Pick up where you left off.
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-8 text-muted">
              Sign in to open your notes and keep learning.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center rounded-md bg-sage px-8 py-4 text-sm font-semibold text-paper transition-colors hover:bg-sage-deep"
              >
                Sign in
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
