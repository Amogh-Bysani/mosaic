import { describe,expect,it } from "vitest";
import { fallbackProposal,scenarioTiles,validateProposal } from "../layouts";
describe("workspace layouts",()=>{it("creates an in-bounds proposal containing every tile once",()=>{const tiles=scenarioTiles("business"),p=fallbackProposal("business",tiles);expect(validateProposal(p,tiles.map(t=>t.id))).toBe(true)});it("rejects duplicate IDs",()=>{const tiles=scenarioTiles("business"),p=fallbackProposal("business",tiles);p.tiles[1].id=p.tiles[0].id;expect(validateProposal(p,tiles.map(t=>t.id))).toBe(false)});it("rejects out-of-bounds geometry",()=>{const tiles=scenarioTiles("engineering"),p=fallbackProposal("engineering",tiles);p.tiles[0].x=.9;expect(validateProposal(p,tiles.map(t=>t.id))).toBe(false)})});

