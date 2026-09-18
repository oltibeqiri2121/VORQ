import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Info,
  Loader2,
  Cpu,
  Layers,
  Palette,
} from "lucide-react";
import { BrandAnalysisResult, Colorway, LogoAsset, MockupTransform, PrintArea, ProductItem } from "../types";

interface PrintTechSpecsProps {
  product: ProductItem;
  colorway: Colorway;
  printArea: PrintArea;
  logo: LogoAsset | null;
  transform: MockupTransform;
}

export const PrintTechSpecs: React.FC<PrintTechSpecsProps> = ({
  product,
  colorway,
  printArea,
  logo,
  transform,
}) => {
  const [analysis, setAnalysis] = useState<BrandAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Compute physical placement and resolution
  const placedWidthInches = (printArea.physicalWidthInches * transform.scale * 0.85).toFixed(1);
  const placedHeightInches = (printArea.physicalHeightInches * transform.scale * 0.85).toFixed(1);

  const placedPixelWidth300Dpi = Math.round(parseFloat(placedWidthInches) * 300);
  const placedPixelHeight300Dpi = Math.round(parseFloat(placedHeightInches) * 300);

  const effectiveDpi = logo
    ? Math.round(logo.width / (parseFloat(placedWidthInches) || 1))
    : 300;

  const isVector = logo?.mimeType === "image/svg+xml";

  // Trigger brand analysis via Gemini
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoBase64: logo?.dataUrl || undefined,
          logoMimeType: logo?.mimeType || "image/png",
          brandName: logo?.name || "Independent Brand",
        }),
      });
      const json = await res.json();
      if (json.data) {
        setAnalysis(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Auto run analysis once on mount or when logo changes
    if (logo && !analysis) {
      runAnalysis();
    }
  }, [logo?.id]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Printability & DPI Grade */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isVector || effectiveDpi >= 300
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : effectiveDpi >= 150
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {isVector || effectiveDpi >= 300 ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {isVector
                  ? "Infinite Vector Scale (Optimal Quality)"
                  : effectiveDpi >= 300
                  ? "Commercial 300+ DPI Quality"
                  : effectiveDpi >= 150
                  ? "Acceptable Standard DPI (~150-299)"
                  : "Low Resolution Warning (<150 DPI)"}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-neutral-800 text-neutral-300">
                {isVector ? "SVG Vector" : `${effectiveDpi} DPI`}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">
              {isVector
                ? "Your graphic is scalable vector artwork (SVG). It will render with zero raster artifacts at any physical scale for DTG or screenprinting."
                : effectiveDpi >= 300
                ? "Your logo resolution is crisp and meets or exceeds professional direct-to-garment (DTG), silk-screen, and sublimation standards."
                : "Your source graphic may experience softness if printed larger. For best results, use an SVG vector or high-resolution PNG above 2000px."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors border border-neutral-700/60 shrink-0"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Analyzing Brand...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Refresh AI Brand Fit</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of Technical Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Physical Print Sizing & Coordinates */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Physical Print Coordinates
              </h4>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              100% Sizing
            </span>
          </div>

          <div className="divide-y divide-neutral-800/80 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Target Product:</span>
              <span className="font-semibold text-white">{product.name}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Garment Material:</span>
              <span className="font-medium text-neutral-300 truncate max-w-[220px]">
                {product.fabricSpecs}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Selected Colorway:</span>
              <div className="flex items-center gap-2 font-medium text-white">
                <span
                  className="w-3 h-3 rounded-full border border-neutral-700"
                  style={{ backgroundColor: colorway.hex }}
                />
                <span>
                  {colorway.name} ({colorway.hex})
                </span>
              </div>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Print Area Name:</span>
              <span className="font-medium text-neutral-200">
                {printArea.name}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Effective Graphic Size:</span>
              <span className="font-mono font-bold text-amber-400">
                {placedWidthInches}" W × {placedHeightInches}" H
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Export Canvas Resolution:</span>
              <span className="font-mono text-neutral-300">
                {placedPixelWidth300Dpi} × {placedPixelHeight300Dpi} px @ 300 DPI
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Recommended POD Method:</span>
              <span className="font-bold text-emerald-400">
                {product.recommendedTechnique}
              </span>
            </div>
          </div>
        </div>

        {/* AI Brand & Styling Recommendations */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                AI Brand Styling Intelligence
              </h4>
            </div>
            <span className="text-[10px] font-mono text-amber-400">
              gemini-3.8-flash
            </span>
          </div>

          {analysis ? (
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <span className="text-[11px] text-neutral-400 uppercase font-mono tracking-wide">
                  Detected Aesthetic Vibe:
                </span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {analysis.brandVibe}
                </p>
              </div>

              {/* Recommended Color Palette */}
              {analysis.paletteHex && analysis.paletteHex.length > 0 && (
                <div>
                  <span className="text-[11px] text-neutral-400 font-mono mb-1.5 block">
                    Harmonious Garment Colorways:
                  </span>
                  <div className="flex items-center gap-2">
                    {analysis.paletteHex.map((hex, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-950 border border-neutral-800"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-neutral-700"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="font-mono text-[10px] text-neutral-300">
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Garment Recommendations */}
              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[11px] text-neutral-400 font-mono">
                  Recommended POD Form Factors:
                </span>
                <div className="flex flex-col gap-1.5">
                  {analysis.recommendedGarments.slice(0, 2).map((rec, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-white font-semibold">
                          {rec.category} • {rec.recommendedColor}
                        </strong>
                        <span className="text-amber-400 font-mono text-[10px]">
                          {rec.printTechnique}
                        </span>
                      </div>
                      <p className="text-neutral-400 leading-relaxed">
                        {rec.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Production Tips */}
              {analysis.printTips && analysis.printTips.length > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-neutral-300">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Production Tip:</span>
                  </div>
                  <p className="text-neutral-400">{analysis.printTips[0]}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-neutral-500 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <p className="text-xs">
                Generating smart placement and garment analysis...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
