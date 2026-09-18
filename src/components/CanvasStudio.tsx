import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  EyeOff,
  Move,
  RotateCw,
  Sliders,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  RotateCcw,
  Sparkles,
  Layers,
} from "lucide-react";
import { Colorway, LogoAsset, MockupTransform, PrintArea, ProductItem } from "../types";
import { renderMockupToCanvas } from "../utils/canvasRenderer";

interface CanvasStudioProps {
  product: ProductItem;
  colorway: Colorway;
  printArea: PrintArea;
  logo: LogoAsset | null;
  transform: MockupTransform;
  onUpdateTransform: (updates: Partial<MockupTransform>) => void;
  onOpenAiScene: () => void;
}

export const CanvasStudio: React.FC<CanvasStudioProps> = ({
  product,
  colorway,
  printArea,
  logo,
  transform,
  onUpdateTransform,
  onOpenAiScene,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showGuides, setShowGuides] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  // Render on canvas whenever properties change
  const render = useCallback(async () => {
    if (!canvasRef.current) return;
    await renderMockupToCanvas({
      canvas: canvasRef.current,
      product,
      colorway,
      printArea,
      logo,
      transform,
      showGuides,
      outputWidth: 1200,
      outputHeight: 1200,
    });
  }, [product, colorway, printArea, logo, transform, showGuides]);

  useEffect(() => {
    render();
  }, [render]);

  // Drag to move logo on canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!logo) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: transform.x,
      initY: transform.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !logo) return;
    const deltaX = (e.clientX - dragStartRef.current.startX) / (zoomLevel * 3.5);
    const deltaY = (e.clientY - dragStartRef.current.startY) / (zoomLevel * 3.5);

    onUpdateTransform({
      x: Math.max(-50, Math.min(50, dragStartRef.current.initX + deltaX)),
      y: Math.max(-50, Math.min(50, dragStartRef.current.initY + deltaY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  };

  // Calculate actual printed physical dimensions and effective DPI
  const placedWidthInches = (printArea.physicalWidthInches * transform.scale * 0.85).toFixed(1);
  const placedHeightInches = (printArea.physicalHeightInches * transform.scale * 0.85).toFixed(1);
  const effectiveDpi = logo
    ? Math.round(logo.width / (parseFloat(placedWidthInches) || 1))
    : 300;

  const dpiStatus =
    effectiveDpi >= 300
      ? { label: "Optimal 300+ DPI", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" }
      : effectiveDpi >= 150
      ? { label: "Good ~150-299 DPI", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" }
      : { label: "Low DPI (<150)", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Left Stage Container */}
      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col">
        {/* Stage Toolbar */}
        <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase tracking-wider font-mono">
              Live Mockup Stage
            </span>
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium ${dpiStatus.color}`}>
              {dpiStatus.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Guides */}
            <button
              type="button"
              onClick={() => setShowGuides(!showGuides)}
              className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[11px] font-medium ${
                showGuides
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                  : "border-neutral-800 text-neutral-400 hover:text-neutral-200"
              }`}
              title="Toggle Print Bounds & Alignment Guides"
            >
              {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Guides</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
                className="p-1 rounded text-neutral-400 hover:text-white"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-[10px] font-mono text-neutral-300 font-semibold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
                className="p-1 rounded text-neutral-400 hover:text-white"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded text-neutral-400 hover:text-white"
                title="Reset zoom"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Canvas Viewport */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`relative flex-1 min-h-[420px] sm:min-h-[500px] flex items-center justify-center p-4 bg-neutral-950/90 select-none overflow-hidden ${
            logo ? "cursor-grab active:cursor-grabbing" : "cursor-default"
          }`}
        >
          {/* Subtle Stage Grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Actual Rendered Canvas */}
          <div
            className="transition-transform duration-75 relative shadow-2xl rounded-xl overflow-hidden border border-neutral-800/80 max-w-[500px] w-full"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-auto block aspect-square bg-neutral-900"
            />
          </div>

          {/* Floating Drag Hint */}
          {logo && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 backdrop-blur-md text-[11px] text-neutral-400 pointer-events-none flex items-center gap-1.5 shadow-lg">
              <Move className="w-3 h-3 text-amber-400" />
              <span>Click & drag logo to reposition within safety bounds</span>
            </div>
          )}
        </div>

        {/* Stage Bottom Bar */}
        <div className="px-4 py-2 bg-neutral-950 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
            <span>
              Target Size:{" "}
              <strong className="text-white">
                {placedWidthInches}" × {placedHeightInches}"
              </strong>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Max Bound: {printArea.physicalWidthInches}" × {printArea.physicalHeightInches}"
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAiScene}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate In-Context AI Lifestyle Shot &rarr;</span>
          </button>
        </div>
      </div>

      {/* Right Controls Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Transform & Placement
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateTransform({
                  x: 0,
                  y: 0,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                })
              }
              className="text-[11px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Quick Alignment Helpers */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdateTransform({ x: 0 })}
              className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <AlignHorizontalDistributeCenter className="w-3.5 h-3.5 text-amber-400" />
              <span>Center Horiz.</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateTransform({ y: 0 })}
              className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <AlignVerticalDistributeCenter className="w-3.5 h-3.5 text-amber-400" />
              <span>Center Vert.</span>
            </button>
          </div>

          {/* Scale Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium">Scale Size</span>
              <span className="font-mono text-amber-400 font-semibold">
                {Math.round(transform.scale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.05"
              value={transform.scale}
              onChange={(e) =>
                onUpdateTransform({ scale: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
          </div>

          {/* Rotation Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-neutral-400" /> Rotation
              </span>
              <span className="font-mono text-amber-400 font-semibold">
                {transform.rotation}°
              </span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={transform.rotation}
              onChange={(e) =>
                onUpdateTransform({ rotation: parseInt(e.target.value, 10) })
              }
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
          </div>

          {/* Opacity Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium">Ink Opacity</span>
              <span className="font-mono text-amber-400 font-semibold">
                {Math.round(transform.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={transform.opacity}
              onChange={(e) =>
                onUpdateTransform({ opacity: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
          </div>

          {/* Blend Mode Selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <span>Garment Blending:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {[
                { id: "source-over", label: "Normal Direct" },
                { id: "multiply", label: "Multiply (Ink Bleed)" },
                { id: "screen", label: "Screen (Light Prints)" },
                { id: "soft-light", label: "Soft Light (Fabric Blend)" },
              ].map((bm) => (
                <button
                  key={bm.id}
                  type="button"
                  onClick={() =>
                    onUpdateTransform({
                      blendMode: bm.id as MockupTransform["blendMode"],
                    })
                  }
                  className={`px-2 py-1.5 rounded-lg border text-left font-medium transition-all ${
                    transform.blendMode === bm.id
                      ? "border-amber-500 bg-amber-500/10 text-white font-bold"
                      : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {bm.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fabric & Product Specs Snapshot */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-300 font-mono">
              Product Overview
            </span>
            <span className="text-amber-400 font-mono text-[11px]">
              {product.category}
            </span>
          </div>
          <p className="text-neutral-400 leading-relaxed text-[11px]">
            {product.fabricSpecs}
          </p>
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px]">
            <span className="text-neutral-500">Recommended POD Method:</span>
            <span className="font-semibold text-neutral-200">
              {product.recommendedTechnique}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
