export type CaptionState = "idle" | "capturing" | "processing" | "proposed" | "applied" | "dismissed";

export const CAPTION_WORD_LIMIT = 28;
export const CAPTION_BUFFER_LIMIT = 240;

export function trimCaptionBuffer(value: string) {
  return value.trim().slice(-CAPTION_BUFFER_LIMIT);
}

export function extractWakeCommand(value: string) {
  const match = trimCaptionBuffer(value).match(/(?:^|[.!?]\s*)hey mosaic,?\s+(.+)$/i);
  if (!match) return undefined;
  return match[1].trim().split(/\s+/).slice(0, CAPTION_WORD_LIMIT).join(" ");
}

export function isCaptionComplete(value: string) {
  return /[.!?]$/.test(value.trim()) || value.trim().split(/\s+/).length >= CAPTION_WORD_LIMIT;
}
