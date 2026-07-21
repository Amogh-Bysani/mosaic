export type CanvasMode = "personal" | "shared";
export type Scenario = "business" | "engineering";
export type TilePriority = "primary" | "secondary" | "context";
export type TileContentType =
  | "dashboard"
  | "spreadsheet"
  | "presentation"
  | "code"
  | "preview"
  | "logs";

export type Tile = {
  id: string;
  ownerName: string;
  applicationLabel: string;
  contentType: TileContentType;
  source: "zoom" | "sample";
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  priority: TilePriority;
  reason?: string;
};

export type ProposalAction = {
  type: "arrange" | "focus" | "minimize" | "restore" | "switch-scenario";
  tileId?: string;
  description: string;
};

export type ProposalTile = Pick<
  Tile,
  "id" | "x" | "y" | "width" | "height" | "zIndex" | "priority" | "minimized"
> & { reason: string };

export type LayoutProposal = {
  layoutTitle: string;
  summary: string;
  rationale: string;
  affectedSources: string[];
  actions: ProposalAction[];
  focusOrder: string[];
  decisionPrompts: string[];
  tiles: ProposalTile[];
  requestedScenario?: Scenario;
  source: "gpt" | "fallback";
};
