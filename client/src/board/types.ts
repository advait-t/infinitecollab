export type Tool = 'pen'|'highlighter'|'eraser'|'select'|'text'|'hand'
export interface Stroke { id:string; points:number[]; color:string; width:number; opacity:number; tool:Tool; }
export interface TextItem { id:string; x:number; y:number; text:string; fontSize:number; rotation:number; fill:string; }
export interface Layer { id:string; name:string; visible:boolean; order:number; }
