import { z } from "zod";
import { normalizeGeometry } from "./geometry";
import type { Tile } from "./types";

const version = z.number().int().nonnegative();
export const commandSchema = z.discriminatedUnion("t", [
  z.object({ t: z.literal("tile"), v: version, id: z.string(), x: z.number(), y: z.number(), w: z.number(), h: z.number(), z: z.number().int().min(1).max(20) }),
  z.object({ t: z.literal("focus"), v: version, id: z.string() }),
  z.object({ t: z.literal("minimize"), v: version, id: z.string(), value: z.boolean() }),
  z.object({ t: z.literal("restore"), v: version }),
  z.object({ t: z.literal("publish"), v: version, ids: z.array(z.string()).max(4) }),
]);

export type CanvasCommand = z.infer<typeof commandSchema>;

export function serializeCommand(command: CanvasCommand) {
  const payload = JSON.stringify(commandSchema.parse(command));
  if (new TextEncoder().encode(payload).length > 512) {
    throw new Error("Zoom command payload exceeds 512 bytes");
  }
  return payload;
}

export function parseCommand(payload: string) {
  return commandSchema.parse(JSON.parse(payload));
}

export function applyCanvasCommand(
  tiles: Tile[],
  command: CanvasCommand,
  context: { currentVersion: number; senderIsHost: boolean },
) {
  if (command.v <= context.currentVersion) return { accepted: false as const, reason: "stale", tiles };
  if (command.t === "publish" && !context.senderIsHost) {
    return { accepted: false as const, reason: "forbidden", tiles };
  }
  if (command.t === "restore" || command.t === "publish") {
    return { accepted: true as const, version: command.v, tiles };
  }
  if (!tiles.some((tile) => tile.id === command.id)) {
    return { accepted: false as const, reason: "unknown-tile", tiles };
  }
  const next = tiles.map((tile) => {
    if (command.t === "focus") {
      return tile.id === command.id
        ? { ...tile, x: 0.05, y: 0.06, width: 0.9, height: 0.82, zIndex: 20, minimized: false }
        : { ...tile, minimized: true };
    }
    if (tile.id !== command.id) return tile;
    if (command.t === "minimize") return { ...tile, minimized: command.value };
    return { ...tile, ...normalizeGeometry({ x: command.x, y: command.y, width: command.w, height: command.h }), zIndex: command.z };
  });
  return { accepted: true as const, version: command.v, tiles: next };
}
