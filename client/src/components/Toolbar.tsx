import { useState, useEffect, useRef } from "react"
import { useUI } from "../board/store"
import { Pencil, Type, Eraser, MousePointer, Highlighter, Move, MoreHorizontal } from "lucide-react"

export default function Toolbar({ onExport }: { onExport: () => void }) {
  const {
    tool,
    setTool,
    color,
    setColor,
    width,
    setWidth,
    opacity,
    setOpacity,
    eraserSize,
    setEraserSize,
  } = useUI()

  const [widthMenuOpen, setWidthMenuOpen] = useState(false)
  const [opacityMenuOpen, setOpacityMenuOpen] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const widthMenuRef = useRef<HTMLDivElement>(null)
  const opacityMenuRef = useRef<HTMLDivElement>(null)

  // --- Responsive ---
  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  // --- Close menus on outside click ---
  useEffect(() => {
    const close = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (widthMenuRef.current && !widthMenuRef.current.contains(t)) setWidthMenuOpen(false)
      if (opacityMenuRef.current && !opacityMenuRef.current.contains(t)) setOpacityMenuOpen(false)
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("touchstart", close)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("touchstart", close)
    }
  }, [])

  const currentWidth = tool === "eraser" ? eraserSize : width
  const handleWidthChange = (v: number) => {
    if (tool === "eraser") setEraserSize(v)
    else setWidth(v)
    setWidthMenuOpen(false)
  }
  const handleOpacityChange = (v: number) => {
    setOpacity(v / 100)
    setOpacityMenuOpen(false)
  }

  // --- Shared Button Styles ---
  const buttonBase: React.CSSProperties = {
    height: 36,
    minWidth: 40,
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "0 10px",
    transition: "all 0.25s ease",
  }

  const tools = [
    { id: "hand", label: "Hand", icon: <Move size={18} /> },
    { id: "select", label: "Select", icon: <MousePointer size={18} /> },
    { id: "pen", label: "Pen", icon: <Pencil size={18} /> },
    { id: "highlighter", label: "Highlight", icon: <Highlighter size={18} /> },
    { id: "eraser", label: "Erase", icon: <Eraser size={18} /> },
    { id: "text", label: "Text", icon: <Type size={18} /> },
  ] as const

  return (
    <>
      <style>
        {`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes slideUpFade {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        `}
      </style>

      <div
        style={{
          position: "fixed",
          ...(isMobile
            ? { bottom: 10, left: "50%", transform: "translateX(-50%)" }
            : { top: 10, left: "50%", transform: "translateX(-50%)" }),
          background:
            "linear-gradient(135deg, rgba(90,130,255,0.45), rgba(180,80,255,0.45), rgba(100,180,255,0.45))",
          backgroundSize: "400% 400%",
          animation: "shimmer 12s ease-in-out infinite",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRadius: 16,
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "nowrap",
          gap: "0.5rem",
          padding: isMobile ? "8px 10px" : "8px 14px",
          zIndex: 1000,
          width: isMobile ? "calc(100vw - 20px)" : "auto",
          maxWidth: "880px",
        }}
      >
        {/* --- Main Row --- */}
        {tools.slice(0, isMobile ? 3 : tools.length).map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            title={t.label}
            style={{
              ...buttonBase,
              background:
                tool === t.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
              color: tool === t.id ? "#000" : "#fff",
              boxShadow: tool === t.id ? "0 0 10px rgba(255,255,255,0.4)" : "none",
            }}
          >
            {t.icon}
            {!isMobile && t.label}
          </button>
        ))}

        {/* --- More Button (Mobile Only) --- */}
        {isMobile && (
          <button
            onClick={() => setShowMore((v) => !v)}
            style={{
              ...buttonBase,
              background: showMore
                ? "rgba(255,255,255,0.9)"
                : "rgba(255,255,255,0.15)",
              color: showMore ? "#000" : "#fff",
            }}
          >
            <MoreHorizontal size={18} />
          </button>
        )}

        {/* --- Expanded Panel --- */}
        {(showMore || !isMobile) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: isMobile ? "wrap" : "nowrap",
              gap: "0.5rem",
              marginTop: isMobile ? 6 : 0,
              animation: isMobile ? "slideUpFade 0.25s ease-out" : undefined,
              background: isMobile ? "rgba(25,25,25,0.8)" : "transparent",
              backdropFilter: isMobile ? "blur(25px)" : "none",
              borderRadius: isMobile ? 14 : 0,
              padding: isMobile ? "10px 12px" : 0,
              boxShadow: isMobile ? "0 10px 25px rgba(0,0,0,0.35)" : "none",
            }}
          >
            {isMobile &&
              tools.slice(3).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  title={t.label}
                  style={{
                    ...buttonBase,
                    background:
                      tool === t.id
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.15)",
                    color: tool === t.id ? "#000" : "#fff",
                  }}
                >
                  {t.icon}
                </button>
              ))}

            {/* Color Picker */}
            <label style={{ ...buttonBase }}>
              {!isMobile && "Color"}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: 22,
                  height: 22,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  marginLeft: isMobile ? 0 : 6,
                  padding: 0,
                }}
              />
            </label>

            {/* Width */}
            <div style={{ position: "relative" }} ref={widthMenuRef}>
              <button onClick={() => setWidthMenuOpen((o) => !o)} style={buttonBase}>
                {isMobile ? "W" : `Width (${currentWidth})`}
              </button>
              {widthMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    bottom: isMobile ? "110%" : "auto",
                    top: isMobile ? "auto" : "110%",
                    left: 0,
                    background: "rgba(25,25,25,0.95)",
                    borderRadius: 10,
                    padding: "6px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                    backdropFilter: "blur(10px)",
                    maxHeight: 200,
                    overflowY: "auto",
                    zIndex: 9999,
                  }}
                >
                  {Array.from({ length: 50 }, (_, i) => (i + 1) * 2).map((v) => (
                    <div
                      key={v}
                      onClick={() => handleWidthChange(v)}
                      style={{
                        padding: "4px 10px",
                        color: currentWidth === v ? "#fff" : "#ccc",
                        background:
                          currentWidth === v
                            ? "rgba(255,255,255,0.1)"
                            : "transparent",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      {v}px
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Opacity */}
            <div style={{ position: "relative" }} ref={opacityMenuRef}>
              <button onClick={() => setOpacityMenuOpen((o) => !o)} style={buttonBase}>
                {isMobile ? "O" : `Opacity (${Math.round(opacity * 100)}%)`}
              </button>
              {opacityMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    bottom: isMobile ? "110%" : "auto",
                    top: isMobile ? "auto" : "110%",
                    left: 0,
                    background: "rgba(25,25,25,0.95)",
                    borderRadius: 10,
                    padding: "6px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                    backdropFilter: "blur(10px)",
                    zIndex: 9999,
                  }}
                >
                  {[10, 25, 50, 75, 90, 100].map((v) => (
                    <div
                      key={v}
                      onClick={() => handleOpacityChange(v)}
                      style={{
                        padding: "4px 10px",
                        color: Math.round(opacity * 100) === v ? "#fff" : "#ccc",
                        background:
                          Math.round(opacity * 100) === v
                            ? "rgba(255,255,255,0.1)"
                            : "transparent",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      {v}%
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export */}
            <button
              onClick={onExport}
              style={{
                ...buttonBase,
                background: "linear-gradient(135deg, #4f80ff, #b06cff)",
                color: "#fff",
                fontWeight: 600,
                boxShadow: "0 0 8px rgba(100,100,255,0.5)",
                minWidth: 80,
              }}
            >
              Export
            </button>
          </div>
        )}
      </div>
    </>
  )
}
