import { z } from "zod";
import { overlapRatio } from "./geometry";
import type { LayoutProposal, Scenario, Tile } from "./types";

const actionSchema = z.object({
  type: z.enum(["arrange", "focus", "minimize", "restore", "switch-scenario"]),
  tileId: z.string().optional(),
  description: z.string().min(1).max(180),
});

export const proposalSchema = z.object({
  layoutTitle: z.string().min(1).max(80),
  summary: z.string().min(1).max(180),
  rationale: z.string().min(1).max(500),
  affectedSources: z.array(z.string()).max(4),
  actions: z.array(actionSchema).min(1).max(8),
  focusOrder: z.array(z.string()).max(4),
  decisionPrompts: z.array(z.string()).max(3),
  requestedScenario: z.enum(["business", "engineering"]).optional(),
  tiles: z
    .array(
      z.object({
        id: z.string(),
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
        width: z.number().min(0.16).max(1),
        height: z.number().min(0.16).max(1),
        zIndex: z.number().int().min(1).max(20),
        priority: z.enum(["primary", "secondary", "context"]),
        minimized: z.boolean(),
        reason: z.string().min(1).max(180),
      }),
    )
    .min(1)
    .max(4),
});

const business: Tile[] = [
  { id: "revenue", ownerName: "Jordan", applicationLabel: "Revenue Performance", contentType: "dashboard", source: "sample", x: 0.055, y: 0.09, width: 0.43, height: 0.53, zIndex: 3, minimized: false, priority: "primary" },
  { id: "forecast", ownerName: "Maya", applicationLabel: "Q4 Forecast Model", contentType: "spreadsheet", source: "sample", x: 0.42, y: 0.36, width: 0.47, height: 0.49, zIndex: 4, minimized: false, priority: "primary" },
  { id: "deck", ownerName: "Amogh", applicationLabel: "Q3 Review Deck", contentType: "presentation", source: "sample", x: 0.56, y: 0.06, width: 0.35, height: 0.36, zIndex: 2, minimized: false, priority: "context" },
];

const engineering: Tile[] = [
  { id: "editor", ownerName: "Amogh", applicationLabel: "Code Editor", contentType: "code", source: "sample", x: 0.05, y: 0.08, width: 0.52, height: 0.72, zIndex: 3, minimized: false, priority: "primary" },
  { id: "preview", ownerName: "Maya", applicationLabel: "Application Preview", contentType: "preview", source: "sample", x: 0.59, y: 0.08, width: 0.36, height: 0.4, zIndex: 2, minimized: false, priority: "secondary" },
  { id: "logs", ownerName: "Jordan", applicationLabel: "Service Logs", contentType: "logs", source: "sample", x: 0.59, y: 0.52, width: 0.36, height: 0.28, zIndex: 4, minimized: false, priority: "secondary" },
];

export const scenarioTiles = (scenario: Scenario) =>
  structuredClone(scenario === "business" ? business : engineering);

export function fallbackProposal(scenario: Scenario, tiles: Tile[]): LayoutProposal {
  const geometry = scenario === "business"
    ? [[0.03, 0.08, 0.49, 0.78], [0.54, 0.08, 0.43, 0.56], [0.54, 0.67, 0.43, 0.21]]
    : [[0.03, 0.08, 0.58, 0.82], [0.63, 0.08, 0.34, 0.48], [0.63, 0.59, 0.34, 0.31]];
  return {
    layoutTitle: scenario === "business" ? "Revenue variance decision view" : "Debugging triage view",
    summary: scenario === "business"
      ? "Compare actual revenue with the forecast while preserving strategic context."
      : "Prioritize source code while keeping output and logs visible.",
    rationale: scenario === "business"
      ? "Revenue evidence and forecast assumptions are placed side by side for direct comparison. The review deck stays visible as supporting context."
      : "The editor is primary for diagnosis; the preview and logs remain visible for rapid validation.",
    affectedSources: tiles.map((tile) => tile.id),
    actions: [{ type: "arrange", description: "Arrange every active source into a bounded decision view." }],
    focusOrder: tiles.map((tile) => tile.id),
    decisionPrompts: scenario === "business"
      ? ["Which segment drove the variance?", "Which Q4 assumption should change?"]
      : ["Where does the callback diverge?", "Do the logs confirm the fix?"],
    tiles: tiles.map((tile, index) => ({
      id: tile.id,
      x: geometry[index][0],
      y: geometry[index][1],
      width: geometry[index][2],
      height: geometry[index][3],
      zIndex: 5 - index,
      priority: index < 2 ? "primary" : "context",
      minimized: false,
      reason: index < 2 ? "Directly supports the decision" : "Kept visible for context",
    })),
    source: "fallback",
  };
}

export function validateProposal(proposal: LayoutProposal, activeIds: string[]) {
  const parsed = proposalSchema.safeParse(proposal);
  if (!parsed.success) return false;
  const ids = parsed.data.tiles.map((tile) => tile.id);
  const references = [
    ...parsed.data.affectedSources,
    ...parsed.data.focusOrder,
    ...parsed.data.actions.flatMap((action) => action.tileId ? [action.tileId] : []),
  ];
  const contradictory = parsed.data.actions.some((action, index, actions) =>
    action.tileId && actions.some((other, otherIndex) =>
      otherIndex !== index && other.tileId === action.tileId &&
      ((action.type === "focus" && other.type === "minimize") ||
        (action.type === "minimize" && other.type === "focus")),
    ),
  );
  const severeOverlap = parsed.data.tiles.some((tile, index, tiles) =>
    !tile.minimized && tiles.slice(index + 1).some((other) =>
      !other.minimized && overlapRatio(tile, other) > 0.65,
    ),
  );
  return (
    new Set(ids).size === ids.length &&
    ids.length === activeIds.length &&
    !ids.some((id) => !activeIds.includes(id)) &&
    !activeIds.some((id) => !ids.includes(id)) &&
    !references.some((id) => !activeIds.includes(id)) &&
    parsed.data.tiles.every((tile) => tile.x + tile.width <= 1.001 && tile.y + tile.height <= 1.001) &&
    !contradictory &&
    !severeOverlap
  );
}
