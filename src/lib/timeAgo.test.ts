import { describe, expect, it } from "vitest";
import { timeAgo } from "./timeAgo";

const now = new Date("2026-11-16T08:00:00Z").getTime();

describe("timeAgo", () => {
  it("speaks plainly", () => {
    expect(timeAgo("2026-11-16T07:59:30Z", now)).toBe("just now");
    expect(timeAgo("2026-11-16T07:59:00Z", now)).toBe("1 minute ago");
    expect(timeAgo("2026-11-16T07:15:00Z", now)).toBe("45 minutes ago");
    expect(timeAgo("2026-11-16T05:00:00Z", now)).toBe("3 hours ago");
    expect(timeAgo("2026-11-14T08:00:00Z", now)).toBe("2 days ago");
  });
  it("never says 'in the future' or crashes", () => {
    expect(timeAgo("2026-11-16T09:00:00Z", now)).toBe("just now");
    expect(timeAgo("not a date", now)).toBe("at an unknown time");
  });
});
