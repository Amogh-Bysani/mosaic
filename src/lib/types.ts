export type CanvasMode = "personal" | "shared";
export type Scenario = "business" | "engineering";
export type TilePriority = "primary" | "secondary" | "context";
export type Tile = { id:string; ownerName:string; applicationLabel:string; contentType:"dashboard"|"spreadsheet"|"presentation"|"code"|"preview"|"logs"; source:"zoom"|"sample"; x:number;y:number;width:number;height:number;zIndex:number;minimized:boolean;priority:TilePriority;reason?:string };
export type LayoutProposal = { layoutTitle:string;summary:string;rationale:string;focusOrder:string[];decisionPrompts:string[];tiles:Array<Pick<Tile,"id"|"x"|"y"|"width"|"height"|"zIndex"|"priority"> & {reason:string}>;source:"gpt"|"fallback" };

