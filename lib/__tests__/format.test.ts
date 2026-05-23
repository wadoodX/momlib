import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { timeAgo } from "@/lib/format";

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
