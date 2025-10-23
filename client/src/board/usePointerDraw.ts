import { RefObject, useRef, useState } from "react"
import Konva from "konva"
import * as Y from "yjs"
import { Stroke } from "./types"
import { useUI } from "./store"

// --- Helper: pointer position relative to transform
const getTransformedPointer = (stage: Konva.Stage) => {
  const pointer = stage.getPointerPosition()
  if (!pointer) return { x: 0, y: 0 }
  const transform = stage.getAbsoluteTransform().copy().invert()
  return transform.point(pointer)
}

export function usePointerDraw(stageRef: RefObject<Konva.Stage>, strokesY: Y.Array<Stroke>) {
  const { tool, color, width, opacity, eraserSize } = useUI()
  const [drawing, setDrawing] = useState(false)
  const currentStroke = useRef<Stroke | null>(null)
  const isZooming = useRef(false)

  // --- Detect multi-touch (pinch / zoom)
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      isZooming.current = true
      setDrawing(false)
      currentStroke.current = null
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      // Gesture ended, allow drawing again
      isZooming.current = false
    }
  }

  // Attach once globally
  if (typeof window !== "undefined") {
    window.removeEventListener("touchstart", handleTouchStart)
    window.removeEventListener("touchend", handleTouchEnd)
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })
  }

  // --- Pointer Down
  const onPointerDown = (e: any) => {
    if (isZooming.current) return // 🚫 Skip during pinch
    const stage = stageRef.current
    if (!stage || !["pen", "highlighter", "eraser"].includes(tool)) return

    const p = getTransformedPointer(stage)
    const id = Math.random().toString(36).slice(2)
    const stroke: Stroke = {
      id,
      tool,
      color: tool === "highlighter" ? "rgba(255,255,0,0.35)" : color,
      width: tool === "eraser" ? eraserSize : width,
      opacity: tool === "eraser" ? 1 : opacity,
      points: [p.x, p.y],
    }
    currentStroke.current = stroke
    setDrawing(true)
    strokesY.push([stroke])
  }

  // --- Pointer Move
  const onPointerMove = (e: any) => {
    if (isZooming.current || !drawing) return // 🚫 Skip zoom
    const stage = stageRef.current
    if (!stage || !currentStroke.current) return

    const p = getTransformedPointer(stage)
    const stroke = currentStroke.current
    const points = [...stroke.points, p.x, p.y]

    const idx = strokesY.toArray().findIndex((s) => s.id === stroke.id)
    if (idx >= 0) {
      const updated = { ...stroke, points }
      strokesY.delete(idx, 1)
      strokesY.insert(idx, [updated])
      currentStroke.current = updated
    }
  }

  // --- Pointer Up
  const onPointerUp = (e: any) => {
    if (isZooming.current) return
    setDrawing(false)
    currentStroke.current = null
  }

  return { onPointerDown, onPointerMove, onPointerUp }
}
