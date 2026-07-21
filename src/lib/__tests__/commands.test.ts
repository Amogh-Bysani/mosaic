import { describe, expect, it } from "vitest";
import { applyCanvasCommand, parseCommand, serializeCommand } from "../commands";
import { scenarioTiles } from "../layouts";

describe("canvas commands", () => {
  it("round trips compact tile state", () => {
    const command = { t: "tile" as const, v: 2, id: "forecast", x: 0.1, y: 0.2, w: 0.5, h: 0.6, z: 4 };
    expect(parseCommand(serializeCommand(command))).toEqual(command);
  });

  it("stays below the command payload limit", () => {
    const payload = serializeCommand({ t: "focus", v: 1, id: "revenue" });
    expect(new TextEncoder().encode(payload).length).toBeLessThanOrEqual(512);
  });

  it("rejects malformed messages", () => {
    expect(() => parseCommand('{"t":"focus","v":1}')).toThrow();
  });

  it("rejects stale versions and non-host publication", () => {
    const tiles = scenarioTiles("business");
    expect(applyCanvasCommand(tiles, { t: "focus", v: 2, id: "revenue" }, { currentVersion: 2, senderIsHost: true }).accepted).toBe(false);
    expect(applyCanvasCommand(tiles, { t: "publish", v: 3, ids: tiles.map((tile) => tile.id) }, { currentVersion: 2, senderIsHost: false }).accepted).toBe(false);
  });
});
