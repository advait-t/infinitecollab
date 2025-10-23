import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Stage, Layer, Line, Text } from "react-konva"
import Konva from "konva"
import * as Y from "yjs"
import { initY } from "../lib/yjs"
import { useUI } from "./store"
import { Stroke, TextItem, Layer as LayerType } from "./types"
import Toolbar from "../components/Toolbar"
import LayerPanel from "../components/LayerPanel"
import Cursors from "../components/Cursors"
import { downloadURI } from "../lib/download"
import { usePointerDraw } from "./usePointerDraw"
import WidthControl from "../components/WidthControl"

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function Whiteboard() {
  const { id: room } = useParams()
  const { tool } = useUI()
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [pencilDetected, setPencilDetected] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const lastDist = useRef<number | null>(null)
  const lastCenter = useRef<{ x: number; y: number } | null>(null)

  // --- Initialize Yjs shared state
  const { doc, provider, awareness } = useMemo(() => {
    const { doc, provider, awareness } = initY(room!)
    awareness.setLocalState({
      user: { name: nick(), color: randomColor() },
      cursor: { x: 0, y: 0 },
    })
    return { doc, provider, awareness }
  }, [room])

  const strokesY = useMemo(() => doc.getArray<Stroke>("strokes"), [doc])
  const textsY = useMemo(() => doc.getArray<TextItem>("texts"), [doc])
  const layersY = useMemo(() => doc.getArray<LayerType>("layers"), [doc])

  // --- Ensure at least one default layer
  useEffect(() => {
    const arr = layersY.toArray()
    if (arr.length === 0 || !arr.find((l) => l.name === "Layer 1")) {
      layersY.push([{ id: uuid(), name: "Layer 1", visible: true, order: 0 }])
    }
  }, [layersY])

  // --- Desktop zoom
  useEffect(() => {
    const container = containerRef.current!
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const stage = stageRef.current!
      const oldScale = stage.scaleX()
      const mouse = stage.getPointerPosition()!
      const direction = e.deltaY > 0 ? -1 : 1
      const scaleBy = 1.05
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
      const pointTo = {
        x: (mouse.x - stage.x()) / oldScale,
        y: (mouse.y - stage.y()) / oldScale,
      }
      stage.scale({ x: newScale, y: newScale })
      const newPos = {
        x: mouse.x - pointTo.x * newScale,
        y: mouse.y - pointTo.y * newScale,
      }
      stage.position(newPos)
      stage.batchDraw()
      setScale(newScale)
      setPos(newPos)
    }
    container.addEventListener("wheel", onWheel, { passive: false })
    return () => container.removeEventListener("wheel", onWheel)
  }, [])

  // --- iPad pinch zoom / pan
  useEffect(() => {
    const container = containerRef.current!
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const [t1, t2] = [e.touches[0], e.touches[1]]
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        const center = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        }
        const stage = stageRef.current!
        if (lastDist.current && lastCenter.current) {
          const scaleBy = dist / lastDist.current
          const newScale = scale * scaleBy
          stage.scale({ x: newScale, y: newScale })
          stage.x(stage.x() + (center.x - lastCenter.current.x))
          stage.y(stage.y() + (center.y - lastCenter.current.y))
          setScale(newScale)
          setPos({ x: stage.x(), y: stage.y() })
          stage.batchDraw()
        }
        lastDist.current = dist
        lastCenter.current = center
      }
    }
    const reset = () => {
      lastDist.current = null
      lastCenter.current = null
    }
    container.addEventListener("touchmove", onTouchMove, { passive: false })
    container.addEventListener("touchend", reset)
    container.addEventListener("touchcancel", reset)
    return () => {
      container.removeEventListener("touchmove", onTouchMove)
      container.removeEventListener("touchend", reset)
      container.removeEventListener("touchcancel", reset)
    }
  }, [scale])

  // --- Hand tool drag
  useEffect(() => {
    const stage = stageRef.current!
    stage.draggable(tool === "hand")
  }, [tool])

  const { onPointerDown, onPointerMove, onPointerUp } = usePointerDraw(stageRef, strokesY)

  const exportPNG = () => {
    const uri = stageRef.current!.toDataURL({ pixelRatio: 2 })
    downloadURI(uri, `board-${room}.png`)
  }

  const onStageClick = (e: any) => {
    if (tool !== "text") return
    const stage = stageRef.current!
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    const p = stage.getRelativePointerPosition()
    const txt: TextItem = {
      id: uuid(),
      x: p.x,
      y: p.y,
      text: "Double-click to edit",
      fontSize: 24,
      rotation: 0,
      fill: "#ffffff",
    }
    textsY.push([txt])
  }

  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [texts, setTexts] = useState<TextItem[]>([])
  const [layers, setLayers] = useState<LayerType[]>([])
  useEffect(() => {
    const update = () => {
      setStrokes(strokesY.toArray())
      setTexts(textsY.toArray())
      setLayers(layersY.toArray())
    }
    strokesY.observeDeep(update)
    textsY.observeDeep(update)
    layersY.observeDeep(update)
    update()
    return () => {
      strokesY.unobserveDeep(update)
      textsY.unobserveDeep(update)
      layersY.unobserveDeep(update)
    }
  }, [strokesY, textsY, layersY])

  // --- Pencil indicator
  useEffect(() => {
    const down = (e: PointerEvent) => {
      if (e.pointerType === "pen") setPencilDetected(true)
    }
    const up = (e: PointerEvent) => {
      if (e.pointerType === "pen")
        setTimeout(() => setPencilDetected(false), 1200)
    }
    window.addEventListener("pointerdown", down)
    window.addEventListener("pointerup", up)
    return () => {
      window.removeEventListener("pointerdown", down)
      window.removeEventListener("pointerup", up)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        touchAction: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Toolbar onExport={exportPNG} />
      <LayerPanel
        open={layersOpen}
        onToggle={() => setLayersOpen((o) => !o)}
        layersY={layersY}
      />

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        x={pos.x}
        y={pos.y}
        scaleX={scale}
        scaleY={scale}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onStageClick}
        style={{
          cursor:
            tool === "hand"
              ? "grab"
              : tool === "text"
              ? "text"
              : tool === "select"
              ? "default"
              : "crosshair",
        }}
      >
        <Layer id="drawLayer">
          {strokes.map((s) => (
            <Line
              key={s.id}
              id={`stroke-${s.id}`}
              points={s.points}
              stroke={s.color}
              strokeWidth={s.width}
              opacity={s.opacity}
              lineCap="round"
              lineJoin="round"
              tension={0}
              globalCompositeOperation={
                s.tool === "eraser" ? "destination-out" : "source-over"
              }
              listening={true}
            />
          ))}
        </Layer>
        <Layer>
          {texts.map((t) => (
            <Text
              key={t.id}
              x={t.x}
              y={t.y}
              text={t.text}
              fontSize={t.fontSize}
              rotation={t.rotation}
              fill={t.fill}
              draggable
              onDblClick={() => {
                const newText = prompt("Edit text:", t.text)
                if (newText != null) {
                  const idx = texts.findIndex((x) => x.id === t.id)
                  textsY.delete(idx, 1)
                  textsY.insert(idx, [{ ...t, text: newText }])
                }
              }}
              onDragEnd={(e) => {
                const idx = texts.findIndex((x) => x.id === t.id)
                const pos = e.target.position()
                textsY.delete(idx, 1)
                textsY.insert(idx, [{ ...t, x: pos.x, y: pos.y }])
              }}
            />
          ))}
        </Layer>
      </Stage>

      <WidthControl />
      <Cursors stage={stageRef.current} awareness={(provider as any).awareness} />
    </div>
  )
}

function nick() {
  const key = "ic-nick"
  const v = localStorage.getItem(key)
  if (v) return v
  const n = "Guest-" + Math.floor(Math.random() * 9999)
  localStorage.setItem(key, n)
  return n
}

function randomColor() {
  const hues = [200, 260, 320, 30, 150]
  const h = hues[Math.floor(Math.random() * hues.length)]
  return `hsl(${h} 90% 60%)`
}
