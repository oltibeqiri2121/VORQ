import React from "react";
import { Download, Sparkles, Layers, Sliders, CheckCircle2 } from "lucide-react";
import { LogoAsset } from "../types";

interface HeaderProps {
  activeTab: "studio" | "ai_scene" | "specs";
  setActiveTab: (tab: "studio" | "ai_scene" | "specs") => void;
  logo: LogoAsset | null;
  onOpenExport: () => void;
  hasAiKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  logo,
  onOpenExport,
  hasAiKey = true,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-extrabold text-xl shadow-lg shadow-amber-500/20">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight font-sans">
                MerchForge
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold tracking-wider">
                POD Studio
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              On-demand AI mockups & 300 DPI print-ready exporter
            </p>
          </div>
        </div>

        {/* Studio View Navigation */}
        <div className="flex items-center gap-1 bg-neutral-950/80 p-1 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "studio"
                ? "bg-amber-500 text-neutral-950 shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Mockup Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai_scene")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "ai_scene"
                ? "bg-amber-500 text-neutral-950 shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Product Shots</span>
            <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-amber-500/20 text-amber-300">
              Gemini
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "specs"
                ? "bg-amber-500 text-neutral-950 shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Print Specs</span>
          </button>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {logo && (
            <div className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-neutral-800/60 border border-neutral-700/60 text-xs text-neutral-300">
              <div className="w-5 h-5 rounded bg-neutral-950 p-0.5 overflow-hidden flex items-center justify-center">
                <img
                  src={logo.dataUrl}
                  alt={logo.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="truncate max-w-[100px] font-medium">{logo.name}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
          )}

          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Print Files</span>
          </button>
        </div>
      </div>
    </header>
  );
};
