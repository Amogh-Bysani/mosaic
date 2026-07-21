import { describe, expect, it } from "vitest";
import { CAPTION_BUFFER_LIMIT, CAPTION_WORD_LIMIT, extractWakeCommand, isCaptionComplete, trimCaptionBuffer } from "../captions";

describe("caption command capture", () => {
  it("requires an explicit wake phrase", () => {
    expect(extractWakeCommand("We should compare revenue.")).toBeUndefined();
    expect(extractWakeCommand("Hey Mosaic, compare revenue.")).toBe("compare revenue.");
  });

  it("bounds the rolling buffer and captured command", () => {
    expect(trimCaptionBuffer("x".repeat(400))).toHaveLength(CAPTION_BUFFER_LIMIT);
    const command = extractWakeCommand(`Hey Mosaic, ${"word ".repeat(40)}`);
    expect(command?.split(/\s+/)).toHaveLength(CAPTION_WORD_LIMIT);
  });

  it("recognizes punctuation and word-count completion", () => {
    expect(isCaptionComplete("Compare revenue.")).toBe(true);
    expect(isCaptionComplete("word ".repeat(CAPTION_WORD_LIMIT))).toBe(true);
    expect(isCaptionComplete("compare revenue")).toBe(false);
  });
});
