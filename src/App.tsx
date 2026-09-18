import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ProductSelector } from "./components/ProductSelector";
import { LogoUploader } from "./components/LogoUploader";
import { CanvasStudio } from "./components/CanvasStudio";
import { AiMockupPanel } from "./components/AiMockupPanel";
import { PrintTechSpecs } from "./components/PrintTechSpecs";
import { ExportModal } from "./components/ExportModal";
import { PRODUCTS } from "./data/products";
import { SAMPLE_LOGOS } from "./data/sampleLogos";
import {
  Colorway,
  GeneratedAiShot,
  LogoAsset,
  MockupTransform,
  PrintArea,
  ProductItem,
} from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"studio" | "ai_scene" | "specs">("studio");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem>(PRODUCTS[0]);
  const [selectedColorway, setSelectedColorway] = useState<Colorway>(
    PRODUCTS[0].colorways[0]
  );
  const [selectedPrintArea, setSelectedPrintArea] = useState<PrintArea>(
    PRODUCTS[0].printAreas[0]
  );

  // Pre-load with sample logo so the user immediately sees a live mockup
  const [logo, setLogo] = useState<LogoAsset | null>(SAMPLE_LOGOS[0]);

  const [transform, setTransform] = useState<MockupTransform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
    blendMode: "source-over",
    invertColor: false,
    textureEffect: "clean",
    tintColor: null,
  });

  const [aiHistory, setAiHistory] = useState<GeneratedAiShot[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(true);

  // Check health on startup
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasGeminiKey === "boolean") {
          setHasGeminiKey(data.hasGeminiKey);
        }
      })
      .catch(() => {
        // Dev fallback
      });
  }, []);

  const handleUpdateTransform = (updates: Partial<MockupTransform>) => {
    setTransform((prev) => ({ ...prev, ...updates }));
  };

  const handleAddAiShot = (shot: GeneratedAiShot) => {
    setAiHistory((prev) => [shot, ...prev]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logo={logo}
        onOpenExport={() => setIsExportModalOpen(true)}
        hasAiKey={hasGeminiKey}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Tab 1: Core Interactive Mockup Studio */}
        {activeTab === "studio" && (
          <div className="flex flex-col gap-6">
            {/* Top Row: Product Selector */}
            <ProductSelector
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              selectedColorway={selectedColorway}
              onSelectColorway={setSelectedColorway}
              selectedPrintArea={selectedPrintArea}
              onSelectPrintArea={setSelectedPrintArea}
            />

            {/* Middle: Interactive Canvas Stage & Sizing Controls */}
            <CanvasStudio
              product={selectedProduct}
              colorway={selectedColorway}
              printArea={selectedPrintArea}
              logo={logo}
              transform={transform}
              onUpdateTransform={handleUpdateTransform}
              onOpenAiScene={() => setActiveTab("ai_scene")}
            />

            {/* Bottom: Logo Uploader & Finish Adjustments */}
            <LogoUploader
              logo={logo}
              onSelectLogo={setLogo}
              transform={transform}
              onUpdateTransform={handleUpdateTransform}
            />
          </div>
        )}

        {/* Tab 2: AI Scene & Lifestyle Mockup Generator */}
        {activeTab === "ai_scene" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  AI Product Shot Generator
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                  Generate in-context commercial lifestyle shots placing your logo onto models and studio sets with Gemini.
                </p>
              </div>
            </div>

            <AiMockupPanel
              product={selectedProduct}
              logo={logo}
              history={aiHistory}
              onAddShot={handleAddAiShot}
            />
          </div>
        )}

        {/* Tab 3: Print Production Specifications */}
        {activeTab === "specs" && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Print Production Specifications
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                Technical DPI analysis, physical bounding boxes, and AI-recommended colorways for print-on-demand fulfillment.
              </p>
            </div>

            <PrintTechSpecs
              product={selectedProduct}
              colorway={selectedColorway}
              printArea={selectedPrintArea}
              logo={logo}
              transform={transform}
            />
          </div>
        )}
      </main>

      {/* Export Suite Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        product={selectedProduct}
        colorway={selectedColorway}
        printArea={selectedPrintArea}
        logo={logo}
        transform={transform}
      />
    </div>
  );
}
