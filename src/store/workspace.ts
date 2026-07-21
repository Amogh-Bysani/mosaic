import { create } from "zustand";
import { deterministicProposal } from "../lib/copilot";
import { normalizeGeometry } from "../lib/geometry";
import { scenarioTiles } from "../lib/layouts";
import type { CanvasMode, LayoutProposal, Scenario, Tile } from "../lib/types";

type State = {
  scenario: Scenario;
  mode: CanvasMode;
  tiles: Tile[];
  personalTiles: Tile[];
  sharedTiles: Tile[];
  publishedTiles: Tile[];
  history: Tile[][];
  personalHistory: Tile[][];
  sharedHistory: Tile[][];
  focusSnapshot?: Tile[];
  personalFocusSnapshot?: Tile[];
  sharedFocusSnapshot?: Tile[];
  proposal?: LayoutProposal;
  isHost: boolean;
  publishedVersion: number;
  setScenario: (scenario: Scenario) => void;
  setMode: (mode: CanvasMode) => void;
  updateTile: (id: string, patch: Partial<Tile>) => void;
  bringForward: (id: string) => void;
  focus: (id: string) => void;
  restoreFocus: () => void;
  reopenTile: (id: string) => void;
  resetLayout: () => void;
  applyProposal: (proposal: LayoutProposal, target?: CanvasMode) => void;
  setProposal: (proposal?: LayoutProposal) => void;
  publishSharedLayout: () => void;
  applyHostLayout: () => void;
  undo: () => void;
};

const clone = (tiles: Tile[]) => structuredClone(tiles);

function modeFields(mode: CanvasMode) {
  return mode === "personal"
    ? { tiles: "personalTiles" as const, history: "personalHistory" as const, focus: "personalFocusSnapshot" as const }
    : { tiles: "sharedTiles" as const, history: "sharedHistory" as const, focus: "sharedFocusSnapshot" as const };
}

function scopedUpdate(
  state: State,
  nextTiles: Tile[],
  options: { record?: boolean; focusSnapshot?: Tile[] | undefined } = {},
) {
  const fields = modeFields(state.mode);
  const history = options.record === false ? state.history : [...state.history, clone(state.tiles)];
  return {
    tiles: clone(nextTiles),
    [fields.tiles]: clone(nextTiles),
    history,
    [fields.history]: history,
    ...(Object.prototype.hasOwnProperty.call(options, "focusSnapshot")
      ? { focusSnapshot: options.focusSnapshot, [fields.focus]: options.focusSnapshot }
      : {}),
  };
}

const initialTiles = scenarioTiles("business");

export const useWorkspace = create<State>((set, get) => ({
  scenario: "business",
  mode: "personal",
  tiles: clone(initialTiles),
  personalTiles: clone(initialTiles),
  sharedTiles: clone(initialTiles),
  publishedTiles: clone(initialTiles),
  history: [],
  personalHistory: [],
  sharedHistory: [],
  isHost: true,
  publishedVersion: 1,

  setScenario: (scenario) => {
    const tiles = scenarioTiles(scenario);
    set({
      scenario,
      tiles: clone(tiles),
      personalTiles: clone(tiles),
      sharedTiles: clone(tiles),
      publishedTiles: clone(tiles),
      history: [],
      personalHistory: [],
      sharedHistory: [],
      focusSnapshot: undefined,
      personalFocusSnapshot: undefined,
      sharedFocusSnapshot: undefined,
      proposal: undefined,
      publishedVersion: get().publishedVersion + 1,
    });
  },

  setMode: (mode) => set((state) => {
    if (state.mode === mode) return {};
    const fields = modeFields(mode);
    return {
      mode,
      tiles: clone(state[fields.tiles]),
      history: state[fields.history],
      focusSnapshot: state[fields.focus],
      proposal: undefined,
    };
  }),

  updateTile: (id, patch) => set((state) => {
    const tiles = state.tiles.map((tile) => {
      if (tile.id !== id) return tile;
      const next = { ...tile, ...patch };
      const geometry = normalizeGeometry(next);
      return { ...next, ...geometry };
    });
    return scopedUpdate(state, tiles);
  }),

  bringForward: (id) => set((state) => {
    const current = state.tiles.find((tile) => tile.id === id);
    const max = Math.max(...state.tiles.map((tile) => tile.zIndex));
    if (!current || current.zIndex === max) return {};
    return scopedUpdate(
      state,
      state.tiles.map((tile) => tile.id === id ? { ...tile, zIndex: Math.min(20, max + 1) } : tile),
    );
  }),

  focus: (id) => set((state) => scopedUpdate(
    state,
    state.tiles.map((tile) => tile.id === id
      ? { ...tile, x: 0.05, y: 0.06, width: 0.9, height: 0.82, zIndex: 20, minimized: false }
      : { ...tile, minimized: true }),
    { focusSnapshot: clone(state.tiles) },
  )),

  restoreFocus: () => set((state) => state.focusSnapshot
    ? scopedUpdate(state, state.focusSnapshot, { focusSnapshot: undefined })
    : {}),

  reopenTile: (id) => set((state) => scopedUpdate(
    state,
    state.tiles.map((tile) => tile.id === id ? { ...tile, minimized: false } : tile),
  )),

  resetLayout: () => set((state) => scopedUpdate(
    state,
    scenarioTiles(state.scenario),
    { focusSnapshot: undefined },
  )),

  applyProposal: (proposal, target = get().mode) => {
    if (proposal.actions.some((action) => action.type === "restore")) {
      get().undo();
      set({ proposal: undefined });
      return;
    }
    if (target === "shared" && !get().isHost) return;
    if (proposal.requestedScenario && proposal.requestedScenario !== get().scenario) {
      get().setScenario(proposal.requestedScenario);
    }
    set((state) => {
      const fields = modeFields(target);
      const current = state[fields.tiles];
      const next = current.map((tile) => {
        const proposed = proposal.tiles.find((candidate) => candidate.id === tile.id);
        return proposed ? { ...tile, ...proposed } : tile;
      });
      const nextHistory = [...state[fields.history], clone(current)];
      const patch = {
        [fields.tiles]: clone(next),
        [fields.history]: nextHistory,
        proposal: undefined,
      };
      return state.mode === target
        ? { ...patch, tiles: clone(next), history: nextHistory, focusSnapshot: undefined, [fields.focus]: undefined }
        : patch;
    });
  },

  setProposal: (proposal) => set({ proposal }),

  publishSharedLayout: () => set((state) => state.isHost
    ? { publishedTiles: clone(state.sharedTiles), publishedVersion: state.publishedVersion + 1 }
    : {}),

  applyHostLayout: () => set((state) => {
    const nextHistory = [...state.personalHistory, clone(state.personalTiles)];
    const patch = {
      personalTiles: clone(state.publishedTiles),
      personalHistory: nextHistory,
      personalFocusSnapshot: undefined,
    };
    return state.mode === "personal"
      ? { ...patch, tiles: clone(state.publishedTiles), history: nextHistory, focusSnapshot: undefined }
      : patch;
  }),

  undo: () => set((state) => {
    const previous = state.history.at(-1);
    if (!previous) return {};
    const fields = modeFields(state.mode);
    const history = state.history.slice(0, -1);
    return {
      tiles: clone(previous),
      [fields.tiles]: clone(previous),
      history,
      [fields.history]: history,
      proposal: undefined,
      focusSnapshot: undefined,
      [fields.focus]: undefined,
    };
  }),
}));

export function proposeLocally(instruction: string) {
  const state = useWorkspace.getState();
  return deterministicProposal(instruction, state.scenario, state.tiles);
}
