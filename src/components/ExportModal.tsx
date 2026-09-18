import React, { useState } from "react";
import {
  X,
  Download,
  FileArchive,
  Image as ImageIcon,
  Check,
  Copy,
  Layers,
  Loader2,
  FileText,
} from "lucide-react";
import { Colorway, LogoAsset, MockupTransform, PrintArea, ProductItem } from "../types";
import {
  generatePrintReadyArtwork,
  generateHighResMockup,
  generateProductionZip,
  downloadBlob,
} from "../utils/canvasRenderer";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem;
  colorway: Colorway;
  printArea: PrintArea;
  logo: LogoAsset | null;
  transform: MockupTransform;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  product,
  colorway,
  printArea,
  logo,
  transform,
}) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [copiedSpecs, setCopiedSpecs] = useState(false);

  if (!isOpen) return null;

  const placedWidthInches = (printArea.physicalWidthInches * transform.scale * 0.85).toFixed(1);
  const placedHeightInches = (printArea.physicalHeightInches * transform.scale * 0.85).toFixed(1);
  const dpiWidth = Math.round(printArea.physicalWidthInches * 300);
  const dpiHeight = Math.round(printArea.physicalHeightInches * 300);

  // 1. Export 300 DPI Print File
  const handleExportPrintArtwork = async () => {
    if (!logo) return;
    setIsExporting("artwork");
    try {
      const blob = await generatePrintReadyArtwork(logo, printArea, transform);
      downloadBlob(
        blob,
        `PRINT_READY_300DPI_${product.id}_${printArea.id}.png`
      );
    } catch (err) {
      console.error("Failed to export artwork:", err);
      alert("Failed to export print-ready artwork.");
    } finally {
      setIsExporting(null);
    }
  };

  // 2. Export 2048px Mockup
  const handleExportMockup = async () => {
    setIsExporting("mockup");
    try {
      const blob = await generateHighResMockup(
        product,
        colorway,
        printArea,
        logo,
        transform
      );
      downloadBlob(
        blob,
        `COMMERCIAL_MOCKUP_2048px_${product.id}_${colorway.name.replace(/\s+/g, "_")}.jpg`
      );
    } catch (err) {
      console.error("Failed to export mockup:", err);
      alert("Failed to export mockup.");
    } finally {
      setIsExporting(null);
    }
  };

  // 3. Export Full ZIP Production Bundle
  const handleExportZip = async () => {
    if (!logo) return;
    setIsExporting("zip");
    try {
      const zipBlob = await generateProductionZip(
        product,
        colorway,
        printArea,
        logo,
        transform
      );
      downloadBlob(
        zipBlob,
        `MERCHFORGE_PRODUCTION_PACK_${product.id}.zip`
      );
    } catch (err) {
      console.error("Failed to export ZIP package:", err);
      alert("Failed to generate ZIP package.");
    } finally {
      setIsExporting(null);
    }
  };

  // 4. Copy Tech Specs to Clipboard
  const handleCopySpecs = () => {
    const text = `MERCHFORGE PRODUCTION SPECS:
Product: ${product.name} (${product.category})
Garment: ${product.fabricSpecs}
Colorway: ${colorway.name} (${colorway.hex})
Print Location: ${printArea.name}
Print Dimensions: ${placedWidthInches}" W x ${placedHeightInches}" H
DPI Resolution: 300 DPI (${dpiWidth} x ${dpiHeight} px)
Technique: ${product.recommendedTechnique}`;
    navigator.clipboard.writeText(text);
    setCopiedSpecs(true);
    setTimeout(() => setCopiedSpecs(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Export Suite
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              300 DPI Standard
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Export Print-Ready Assets
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Download production-ready print artwork, e-commerce mockups, or full printer packages.
          </p>
        </div>

        {/* Export Options Grid */}
        <div className="flex flex-col gap-3">
          {/* Option 1: Full Production Bundle (ZIP) */}
          <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 shadow-md">
                <FileArchive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Full Production Pack (.ZIP)
                  </h3>
                  <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                  Contains 300 DPI transparent print PNG + 2048px mockup photo + printer tech spec sheet.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isExporting !== null}
              onClick={handleExportZip}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs tracking-wide transition-all shadow-md shrink-0 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isExporting === "zip" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Packaging...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ZIP</span>
                </>
              )}
            </button>
          </div>

          {/* Option 2: 300 DPI Transparent Print PNG */}
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950/60 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-amber-400 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  300 DPI Print Artwork (PNG)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                  Transparent background, exact physical print dimensions ({dpiWidth} × {dpiHeight} px).
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isExporting !== null || !logo}
              onClick={handleExportPrintArtwork}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs tracking-wide transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isExporting === "artwork" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Export PNG</span>
            </button>
          </div>

          {/* Option 3: 2048px Mockup JPG */}
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950/60 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-cyan-400 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  High-Res Product Mockup (2048px JPG)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                  Clean e-commerce studio shot for your store catalog, Etsy, Shopify, or ads.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isExporting !== null}
              onClick={handleExportMockup}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs tracking-wide transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isExporting === "mockup" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Export JPG</span>
            </button>
          </div>
        </div>

        {/* Quick Copy Specs Button */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <FileText className="w-3.5 h-3.5 text-neutral-500" />
            <span>Target: {product.name} ({placedWidthInches}" × {placedHeightInches}")</span>
          </div>

          <button
            type="button"
            onClick={handleCopySpecs}
            className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            {copiedSpecs ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Specs Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
