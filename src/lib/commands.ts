import { z } from "zod";
export const commandSchema=z.discriminatedUnion("t",[z.object({t:z.literal("tile"),id:z.string(),x:z.number(),y:z.number(),w:z.number(),h:z.number(),z:z.number().int()}),z.object({t:z.literal("focus"),id:z.string()}),z.object({t:z.literal("layout"),v:z.number().int(),ids:z.array(z.string())})]);
export type CanvasCommand=z.infer<typeof commandSchema>;
export function serializeCommand(command:CanvasCommand){const payload=JSON.stringify(commandSchema.parse(command));if(new TextEncoder().encode(payload).length>512)throw new Error("Zoom command payload exceeds 512 bytes");return payload}
export function parseCommand(payload:string){return commandSchema.parse(JSON.parse(payload))}