import React, { useRef, useState } from "react";
import { Upload, Sparkles, Image as ImageIcon, RotateCcw, Palette, RefreshCw } from "lucide-react";
import { LogoAsset, MockupTransform, TextureEffect } from "../types";
import { SAMPLE_LOGOS } from "../data/sampleLogos";

interface LogoUploaderProps {
  logo: LogoAsset | null;
  onSelectLogo: (logo: LogoAsset) => void;
  transform: MockupTransform;
  onUpdateTransform: (updates: Partial<MockupTransform>) => void;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  logo,
  onSelectLogo,
  transform,
  onUpdateTransform,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle uploaded file
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, SVG, JPG, WebP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const newAsset: LogoAsset = {
          id: `upload_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          dataUrl,
          width: img.width || 800,
          height: img.height || 800,
          mimeType: file.type,
          isSample: false,
        };
        onSelectLogo(newAsset);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const tintColors = [
    { label: "Original", value: null },
    { label: "Pure White", value: "#FFFFFF" },
    { label: "Solid Black", value: "#111111" },
    { label: "Metallic Gold", value: "#F59E0B" },
    { label: "Neon Cyan", value: "#06B6D4" },
    { label: "Crimson Red", value: "#EF4444" },
  ];

  const textureEffects: Array<{ id: TextureEffect; label: string }> = [
    { id: "clean", label: "Smooth Clean" },
    { id: "screenprint_ink", label: "Screenprint Ink" },
    { id: "embroidery_stitch", label: "Embroidery" },
    { id: "vintage_distress", label: "Vintage Wash" },
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Logo & Artwork
          </h2>
        </div>
        <span className="text-[11px] text-neutral-400 font-mono">
          PNG • SVG • JPG (300 DPI ready)
        </span>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? "border-amber-500 bg-amber-500/10 scale-[0.99]"
            : "border-neutral-700/80 hover:border-neutral-500 bg-neutral-950/60 hover:bg-neutral-950"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/svg+xml, image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-amber-400">
          <Upload className="w-5 h-5" />
        </div>

        <div>
          <p className="text-xs font-semibold text-neutral-200">
            Click to upload your logo or drag and drop
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Transparent PNG or SVG recommended for optimal quality
          </p>
        </div>
      </div>

      {/* Sample Logos Quick Picker */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-neutral-400">
            Or test with sample logos:
          </span>
          <span className="text-[10px] text-amber-400/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> 1-Click presets
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_LOGOS.map((sample) => {
            const isSelected = logo?.id === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectLogo(sample)}
                className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/10 text-white"
                    : "border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={sample.dataUrl}
                    alt={sample.name}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-xs font-semibold truncate">
                  {sample.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Artwork Adjustments & Controls */}
      {logo && (
        <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 font-mono uppercase tracking-wide">
              Print Adjustments
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateTransform({
                  invertColor: false,
                  tintColor: null,
                  textureEffect: "clean",
                  blendMode: "source-over",
                })
              }
              className="text-[11px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset ink
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Invert Logo Colors Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <div>
                <p className="text-xs font-medium text-neutral-200">
                  Invert Colors
                </p>
                <p className="text-[10px] text-neutral-500">
                  For dark or light garment contrast
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateTransform({ invertColor: !transform.invertColor })
                }
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  transform.invertColor ? "bg-amber-500" : "bg-neutral-800"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    transform.invertColor ? "translate-x-4.5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Finish / Texture Effect */}
            <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex flex-col gap-1.5">
              <span className="text-xs font-medium text-neutral-200">
                Texture / Finish
              </span>
              <div className="grid grid-cols-2 gap-1">
                {textureEffects.map((tex) => (
                  <button
                    key={tex.id}
                    type="button"
                    onClick={() =>
                      onUpdateTransform({ textureEffect: tex.id })
                    }
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                      transform.textureEffect === tex.id
                        ? "bg-amber-500 text-neutral-950 font-bold"
                        : "bg-neutral-900 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {tex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color Tint Palette */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Palette className="w-3 h-3 text-neutral-400" />
              <span className="text-xs text-neutral-400 font-medium">
                Ink Color Override:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tintColors.map((color) => {
                const isActive = transform.tintColor === color.value;
                return (
                  <button
                    key={color.label}
                    type="button"
                    onClick={() => onUpdateTransform({ tintColor: color.value })}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                      isActive
                        ? "border-amber-500 bg-amber-500/10 text-white"
                        : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-neutral-600 shrink-0"
                      style={{
                        backgroundColor: color.value || "transparent",
                        background: color.value
                          ? color.value
                          : "conic-gradient(red, yellow, green, cyan, blue, magenta, red)",
                      }}
                    />
                    <span>{color.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
