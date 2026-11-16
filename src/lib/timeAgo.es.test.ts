import { describe, expect, it } from "vitest";
import { timeAgo } from "./timeAgo";

describe("timeAgo in Spanish", () => {
  const now = Date.parse("2026-11-16T10:00:00Z");
  it("says hace …", () => {
    expect(timeAgo("2026-11-16T09:59:30Z", now, "es")).toBe("hace un momento");
    expect(timeAgo("2026-11-16T09:59:00Z", now, "es")).toBe("hace 1 minuto");
    expect(timeAgo("2026-11-16T07:00:00Z", now, "es")).toBe("hace 3 horas");
    expect(timeAgo("2026-11-14T10:00:00Z", now, "es")).toBe("hace 2 días");
    expect(timeAgo("2026-11-16T07:00:00Z", now)).toBe("3 hours ago");
  });
});
