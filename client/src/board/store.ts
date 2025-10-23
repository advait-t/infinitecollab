import { create } from "zustand"

interface UIState {
  tool: "pen" | "highlighter" | "eraser" | "hand" | "text" | "select"
  color: string
  width: number
  opacity: number
  eraserSize: number
  showWidthControl: boolean
  setTool: (t: UIState["tool"]) => void
  setColor: (c: string) => void
  setWidth: (w: number) => void
  setOpacity: (o: number) => void
  setEraserSize: (s: number) => void
  toggleWidthControl: () => void
  hideWidthControl: () => void
}

export const useUI = create<UIState>((set) => ({
  tool: "pen",
  color: "#ffffff",
  width: 4,
  opacity: 1,
  eraserSize: 20,
  showWidthControl: false,
  setTool: (t) => set({ tool: t }),
  setColor: (c) => set({ color: c }),
  setWidth: (w) => set({ width: w }),
  setOpacity: (o) => set({ opacity: o }),
  setEraserSize: (s) => set({ eraserSize: s }),
  toggleWidthControl: () => set((s) => ({ showWidthControl: !s.showWidthControl })),
  hideWidthControl: () => set({ showWidthControl: false }),
}))
