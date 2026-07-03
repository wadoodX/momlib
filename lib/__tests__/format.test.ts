import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { timeAgo, parseNodeDescription, cleanNodeDescription } from "@/lib/format";

const NOW = new Date("2026-05-24T12:00:00Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

function ago(ms: number) {
  return new Date(NOW.getTime() - ms).toISOString();
}

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("timeAgo", () => {
  it("returns 'just now' under 45s", () => {
    expect(timeAgo(ago(10 * SEC))).toBe("just now");
  });
  it("formats minutes/hours/days", () => {
    expect(timeAgo(ago(5 * MIN))).toBe("5m ago");
    expect(timeAgo(ago(3 * HOUR))).toBe("3h ago");
    expect(timeAgo(ago(2 * DAY))).toBe("2d ago");
  });
  it("formats weeks/months/years", () => {
    expect(timeAgo(ago(14 * DAY))).toBe("2w ago");
    expect(timeAgo(ago(60 * DAY))).toBe("2mo ago");
    expect(timeAgo(ago(400 * DAY))).toBe("1y ago");
  });
});

describe("parseNodeDescription", () => {
  it("returns all-null for null/empty", () => {
    expect(parseNodeDescription(null)).toEqual({ status: null, coreText: null, detail: null });
    expect(parseNodeDescription("")).toEqual({ status: null, coreText: null, detail: null });
  });

  it("reads the Core/Optional module prefix", () => {
    expect(parseNodeDescription("Core Module")).toEqual({ status: "Core", coreText: null, detail: null });
    expect(parseNodeDescription("Optional Module · Short Term Course")).toEqual({
      status: "Optional",
      coreText: null,
      detail: "Short Term Course",
    });
  });

  it("extracts the core text after 'Core text(s):'", () => {
    expect(parseNodeDescription("Core Module · Core text: Al-Fiqh ul Muyassar by Maulana Shafiqur Rahman Nadvi")).toEqual({
      status: "Core",
      coreText: "Al-Fiqh ul Muyassar by Maulana Shafiqur Rahman Nadvi",
      detail: null,
    });
    expect(parseNodeDescription("Core Module · Core texts: Hidayatun Nahw (Part 1); Sarf module")).toEqual({
      status: "Core",
      coreText: "Hidayatun Nahw (Part 1); Sarf module",
      detail: null,
    });
  });

  it("extracts core text even without a Module prefix", () => {
    expect(parseNodeDescription("Core text: Arabiyyah Bayna Yadayk")).toEqual({
      status: null,
      coreText: "Arabiyyah Bayna Yadayk",
      detail: null,
    });
  });

  it("keeps a non-core-text detail segment", () => {
    expect(parseNodeDescription("Core Module · PPT Based")).toEqual({
      status: "Core",
      coreText: null,
      detail: "PPT Based",
    });
  });

  it("handles status + detail + core text together", () => {
    expect(
      parseNodeDescription("Optional Module · PPT Based · Core text: Ḥayāt aṣ-Ṣaḥābah by Shaykh Muḥammad Yūsuf"),
    ).toEqual({
      status: "Optional",
      coreText: "Ḥayāt aṣ-Ṣaḥābah by Shaykh Muḥammad Yūsuf",
      detail: "PPT Based",
    });
  });
});

describe("cleanNodeDescription", () => {
  it("returns null when there's nothing but the module/core labels or empty", () => {
    expect(cleanNodeDescription(null)).toBeNull();
    expect(cleanNodeDescription("")).toBeNull();
    expect(cleanNodeDescription("Core Module")).toBeNull();
    expect(cleanNodeDescription("Optional Module")).toBeNull();
  });

  it("strips the Core/Optional module + 'Core text:' labels, keeping the book", () => {
    expect(cleanNodeDescription("Core Module · Core text: Al-Fiqh ul Muyassar by Maulana Shafiqur Rahman Nadvi")).toBe(
      "Al-Fiqh ul Muyassar by Maulana Shafiqur Rahman Nadvi",
    );
    expect(cleanNodeDescription("Optional Module · Core text: Iḥyāʾ ʿUlūm al-Dīn by Imam Ghazālī")).toBe(
      "Iḥyāʾ ʿUlūm al-Dīn by Imam Ghazālī",
    );
  });

  it("keeps a non-core detail like 'PPT Based'", () => {
    expect(cleanNodeDescription("Core Module · PPT Based")).toBe("PPT Based");
    expect(
      cleanNodeDescription("Optional Module · PPT Based · Core text: Ḥayāt aṣ-Ṣaḥābah by Shaykh Muḥammad Yūsuf"),
    ).toBe("Ḥayāt aṣ-Ṣaḥābah by Shaykh Muḥammad Yūsuf · PPT Based");
  });
});
