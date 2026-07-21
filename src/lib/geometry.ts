import type { Tile } from "./types";

export const MIN_TILE_WIDTH = 0.16;
export const MIN_TILE_HEIGHT = 0.16;

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function normalizeGeometry(
  geometry: Pick<Tile, "x" | "y" | "width" | "height">,
) {
  const width = Math.min(1, Math.max(MIN_TILE_WIDTH, geometry.width));
  const height = Math.min(1, Math.max(MIN_TILE_HEIGHT, geometry.height));
  return {
    x: Math.min(1 - width, clamp01(geometry.x)),
    y: Math.min(1 - height, clamp01(geometry.y)),
    width,
    height,
  };
}

export function toPixels(
  geometry: Pick<Tile, "x" | "y" | "width" | "height">,
  bounds: { width: number; height: number },
) {
  return {
    x: geometry.x * bounds.width,
    y: geometry.y * bounds.height,
    width: geometry.width * bounds.width,
    height: geometry.height * bounds.height,
  };
}

export function fromPixels(
  geometry: { x: number; y: number; width: number; height: number },
  bounds: { width: number; height: number },
) {
  if (bounds.width <= 0 || bounds.height <= 0) {
    throw new Error("Canvas bounds must be positive");
  }
  return normalizeGeometry({
    x: geometry.x / bounds.width,
    y: geometry.y / bounds.height,
    width: geometry.width / bounds.width,
    height: geometry.height / bounds.height,
  });
}

export function overlapRatio(
  a: Pick<Tile, "x" | "y" | "width" | "height">,
  b: Pick<Tile, "x" | "y" | "width" | "height">,
) {
  const width = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const height = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const intersection = width * height;
  return intersection / Math.min(a.width * a.height, b.width * b.height);
}
