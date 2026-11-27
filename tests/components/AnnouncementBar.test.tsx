import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import AnnouncementBar, { ANNOUNCEMENTS, ROTATE_MS } from "@/app/components/AnnouncementBar";

describe("AnnouncementBar", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("starts on the first announcement and rotates through all of them, then loops", () => {
    vi.useFakeTimers();
    render(<AnnouncementBar />);
    for (const text of ANNOUNCEMENTS) {
      expect(screen.getByText(text)).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(ROTATE_MS));
    }
    expect(screen.getByText(ANNOUNCEMENTS[0])).toBeInTheDocument();
  });
});
