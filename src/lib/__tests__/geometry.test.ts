import { describe, expect, it } from "vitest";
import { fromPixels, normalizeGeometry, overlapRatio, toPixels } from "../geometry";

describe("normalized geometry", () => {
  it("round trips through pixels", () => {
    const geometry = { x: 0.1, y: 0.2, width: 0.4, height: 0.5 };
    expect(fromPixels(toPixels(geometry, { width: 1000, height: 600 }), { width: 1000, height: 600 })).toEqual(geometry);
  });

  it("enforces bounds and minimum dimensions", () => {
    expect(normalizeGeometry({ x: 0.95, y: -1, width: 0.05, height: 2 })).toEqual({ x: 0.84, y: 0, width: 0.16, height: 1 });
  });

  it("measures severe overlap", () => {
    expect(overlapRatio({ x: 0, y: 0, width: 0.5, height: 0.5 }, { x: 0.1, y: 0.1, width: 0.5, height: 0.5 })).toBeGreaterThan(0.6);
  });
});
