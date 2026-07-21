import { describe, expect, it } from "vitest";
import { deterministicProposal } from "../copilot";
import { scenarioTiles, validateProposal } from "../layouts";

describe("deterministic Copilot", () => {
  it("focuses the forecast without mutating immediately", () => {
    const tiles = scenarioTiles("business");
    const proposal = deterministicProposal("Make the forecast the main view", "business", tiles);
    expect(proposal.actions[0]).toMatchObject({ type: "focus", tileId: "forecast" });
    expect(tiles.every((tile) => !tile.minimized)).toBe(true);
    expect(validateProposal(proposal, tiles.map((tile) => tile.id))).toBe(true);
  });

  it("minimizes the review deck", () => {
    const tiles = scenarioTiles("business");
    const proposal = deterministicProposal("Minimize the review deck", "business", tiles);
    expect(proposal.tiles.find((tile) => tile.id === "deck")?.minimized).toBe(true);
  });

  it("proposes a scenario switch", () => {
    const proposal = deterministicProposal("Switch to engineering debug", "business", scenarioTiles("business"));
    expect(proposal.requestedScenario).toBe("engineering");
    expect(proposal.tiles.map((tile) => tile.id)).toEqual(["editor", "preview", "logs"]);
  });
});
