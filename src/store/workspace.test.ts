import { beforeEach, describe, expect, it } from "vitest";
import { deterministicProposal } from "../lib/copilot";
import { useWorkspace } from "./workspace";

describe("workspace store", () => {
  beforeEach(() => {
    useWorkspace.getState().setScenario("business");
    useWorkspace.getState().setMode("personal");
  });

  it("isolates Personal Canvas from Shared Canvas", () => {
    useWorkspace.getState().updateTile("revenue", { x: 0.2 });
    expect(useWorkspace.getState().personalTiles[0].x).toBe(0.2);
    expect(useWorkspace.getState().sharedTiles[0].x).not.toBe(0.2);
  });

  it("publishes shared state and applies it explicitly to personal", () => {
    useWorkspace.getState().setMode("shared");
    useWorkspace.getState().updateTile("revenue", { x: 0.25 });
    useWorkspace.getState().publishSharedLayout();
    useWorkspace.getState().setMode("personal");
    expect(useWorkspace.getState().tiles[0].x).not.toBe(0.25);
    useWorkspace.getState().applyHostLayout();
    expect(useWorkspace.getState().tiles[0].x).toBe(0.25);
  });

  it("supports focus, restore, minimize, reopen, and undo", () => {
    const original = structuredClone(useWorkspace.getState().tiles);
    useWorkspace.getState().focus("forecast");
    expect(useWorkspace.getState().tiles.filter((tile) => tile.minimized)).toHaveLength(2);
    useWorkspace.getState().restoreFocus();
    expect(useWorkspace.getState().tiles).toEqual(original);
    useWorkspace.getState().updateTile("deck", { minimized: true });
    useWorkspace.getState().reopenTile("deck");
    expect(useWorkspace.getState().tiles.find((tile) => tile.id === "deck")?.minimized).toBe(false);
    useWorkspace.getState().undo();
    expect(useWorkspace.getState().tiles.find((tile) => tile.id === "deck")?.minimized).toBe(true);
  });

  it("applies a proposal only after acceptance and resets scenarios", () => {
    const state = useWorkspace.getState();
    const proposal = deterministicProposal("Make the forecast the main view", state.scenario, state.tiles);
    expect(useWorkspace.getState().tiles.filter((tile) => tile.minimized)).toHaveLength(0);
    useWorkspace.getState().applyProposal(proposal, "personal");
    expect(useWorkspace.getState().tiles.filter((tile) => tile.minimized)).toHaveLength(2);
    useWorkspace.getState().setScenario("engineering");
    expect(useWorkspace.getState().tiles.map((tile) => tile.id)).toEqual(["editor", "preview", "logs"]);
    expect(useWorkspace.getState().history).toHaveLength(0);
  });
});
