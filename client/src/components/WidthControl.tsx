import { useUI } from "../board/store"
import { useEffect, useState } from "react"

export default function WidthControl() {
  const { tool, width, eraserSize, showWidthControl, setWidth, setEraserSize } = useUI()
  const [localValue, setLocalValue] = useState(width)

  useEffect(() => {
    setLocalValue(tool === "eraser" ? eraserSize : width)
  }, [tool, width, eraserSize])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setLocalValue(val)
    if (tool === "eraser") setEraserSize(val)
    else setWidth(val)
  }

  return (
    <div
      style={{
        position: "absolute",
        right: 12,
        top: showWidthControl ? "64px" : "-200px",
        transition: "top 0.3s ease",
        height: 180,
        padding: "8px",
        borderRadius: "12px",
        background: "rgba(30,30,30,0.85)",
        boxShadow: "0 0 8px rgba(0,0,0,0.4)",
        zIndex: 10000,
      }}
    >
      <input
        type="range"
        min="1"
        max="60"
        step="1"
        value={localValue}
        onChange={handleChange}
        style={{
          writingMode: "bt-lr",
          WebkitAppearance: "slider-vertical",
          width: "30px",
          height: "150px",
          accentColor: "#00b3ff",
          cursor: "pointer",
        }}
      />
    </div>
  )
}
