import { fallbackProposal, scenarioTiles } from "./layouts";
import type { LayoutProposal, Scenario, Tile } from "./types";

const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

export function deterministicProposal(
  instruction: string,
  scenario: Scenario,
  tiles: Tile[],
): LayoutProposal {
  const command = instruction.toLowerCase().trim();
  const requestedScenario = command.includes("engineering")
    ? "engineering"
    : command.includes("business")
      ? "business"
      : undefined;

  if (requestedScenario && requestedScenario !== scenario) {
    const proposal = fallbackProposal(requestedScenario, scenarioTiles(requestedScenario));
    return {
      ...proposal,
      layoutTitle: requestedScenario === "engineering" ? "Switch to engineering debug" : "Switch to business review",
      summary: `Switch presets and arrange the ${requestedScenario} sources.`,
      requestedScenario,
      actions: [{ type: "switch-scenario", description: `Switch to the ${requestedScenario} preset.` }],
    };
  }

  if (includesAny(command, ["restore", "previous layout", "undo"])) {
    return {
      ...fallbackProposal(scenario, tiles),
      layoutTitle: "Restore previous layout",
      summary: "Return to the last accepted canvas state.",
      rationale: "This proposal uses the canvas history and does not move anything until accepted.",
      affectedSources: [],
      actions: [{ type: "restore", description: "Restore the previous canvas snapshot." }],
      tiles: tiles.map((tile) => ({ ...tile, reason: "Preserved until restore is accepted" })),
    };
  }

  const target = tiles.find((tile) =>
    command.includes(tile.id) ||
    command.includes(tile.ownerName.toLowerCase()) ||
    command.includes(tile.applicationLabel.toLowerCase()) ||
    (command.includes("dashboard") && tile.contentType === "dashboard") ||
    (command.includes("review deck") && tile.contentType === "presentation"),
  );

  if (target && includesAny(command, ["minimize", "hide"])) {
    return {
      ...fallbackProposal(scenario, tiles),
      layoutTitle: `Minimize ${target.applicationLabel}`,
      summary: `Keep ${target.applicationLabel} available in the source tray while clearing the canvas.`,
      rationale: "The source remains one click away and can be reopened without changing other tiles.",
      affectedSources: [target.id],
      actions: [{ type: "minimize", tileId: target.id, description: `Minimize ${target.applicationLabel}.` }],
      tiles: tiles.map((tile) => ({
        ...tile,
        minimized: tile.id === target.id ? true : tile.minimized,
        reason: tile.id === target.id ? "Moved to the source tray" : "Unchanged",
      })),
    };
  }

  if (target && includesAny(command, ["main view", "focus", "primary"])) {
    return {
      ...fallbackProposal(scenario, tiles),
      layoutTitle: `Focus ${target.applicationLabel}`,
      summary: `Make ${target.applicationLabel} the main view and move the other sources to the tray.`,
      rationale: "A single-source focus reduces visual competition while preserving fast restoration.",
      affectedSources: tiles.map((tile) => tile.id),
      actions: [{ type: "focus", tileId: target.id, description: `Focus ${target.applicationLabel}.` }],
      focusOrder: [target.id, ...tiles.filter((tile) => tile.id !== target.id).map((tile) => tile.id)],
      tiles: tiles.map((tile) => ({
        id: tile.id,
        x: tile.id === target.id ? 0.05 : tile.x,
        y: tile.id === target.id ? 0.06 : tile.y,
        width: tile.id === target.id ? 0.9 : tile.width,
        height: tile.id === target.id ? 0.82 : tile.height,
        zIndex: tile.id === target.id ? 20 : tile.zIndex,
        priority: tile.id === target.id ? "primary" : "context",
        minimized: tile.id !== target.id,
        reason: tile.id === target.id ? "Primary attention target" : "Available in the source tray",
      })),
    };
  }

  return fallbackProposal(scenario, tiles);
}
