import React, { useState } from "react";
import {
  Sparkles,
  Wand2,
  Download,
  Send,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Maximize2,
} from "lucide-react";
import { GeneratedAiShot, LogoAsset, ProductItem } from "../types";
import { downloadBlob } from "../utils/canvasRenderer";

interface AiMockupPanelProps {
  product: ProductItem;
  logo: LogoAsset | null;
  history: GeneratedAiShot[];
  onAddShot: (shot: GeneratedAiShot) => void;
  onSelectAiShotAsBase?: (imageUrl: string) => void;
}

export const AiMockupPanel: React.FC<AiMockupPanelProps> = ({
  product,
  logo,
  history,
  onAddShot,
  onSelectAiShotAsBase,
}) => {
  const [prompt, setPrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [activeShot, setActiveShot] = useState<GeneratedAiShot | null>(
    history.length > 0 ? history[0] : null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<"generate" | "edit">("generate");

  const promptSuggestions = [
    `Streetwear model wearing this ${product.name} on a neon-lit Tokyo street at night, cinematic 35mm film photography`,
    `Clean minimalist studio shoot on warm oak tabletop with soft morning golden hour shadows, 4k e-commerce photo`,
    `Urban skateboarder wearing this item in an industrial warehouse with dramatic rim lighting`,
    `Cozy Scandinavian cafe interior setting with natural window light and aesthetic neutral props`,
    `High-fashion editorial lookbook shoot with monochrome background and crisp typography focus`,
  ];

  const editSuggestions = [
    "Change background to a sunlit minimalist apartment with oak floors",
    "Add dramatic cinematic studio rim lighting with soft shadows",
    "Add retro 35mm film grain and warm analog color tones",
    "Make the garment vintage acid-washed with distressed edges",
    "Place the product on a rugged granite mountain cliff at sunrise",
  ];

  // Generate new AI mockup shot
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg("Please enter a scene description prompt.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/ai/generate-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          productType: `${product.name} (${product.category})`,
          logoBase64: logo?.dataUrl || undefined,
          logoMimeType: logo?.mimeType || "image/png",
          aspectRatio: "1:1",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate AI product shot.");
      }

      const newShot: GeneratedAiShot = {
        id: `ai_${Date.now()}`,
        imageUrl: data.imageUrl,
        prompt: prompt.trim(),
        timestamp: Date.now(),
        productType: product.name,
        type: "generate",
      };

      onAddShot(newShot);
      setActiveShot(newShot);
      setPrompt("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Edit active shot with natural language
  const handleEdit = async () => {
    if (!activeShot) {
      setErrorMsg("Please select or generate a product shot first.");
      return;
    }
    if (!editPrompt.trim()) {
      setErrorMsg("Please enter an edit instruction.");
      return;
    }

    setIsEditing(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/ai/edit-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: activeShot.imageUrl,
          mimeType: "image/png",
          prompt: editPrompt.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to edit mockup with AI.");
      }

      const newShot: GeneratedAiShot = {
        id: `ai_edit_${Date.now()}`,
        imageUrl: data.imageUrl,
        prompt: `Edit: ${editPrompt.trim()}`,
        timestamp: Date.now(),
        productType: activeShot.productType,
        type: "edit",
      };

      onAddShot(newShot);
      setActiveShot(newShot);
      setEditPrompt("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to edit mockup with AI.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDownload = async (shot: GeneratedAiShot) => {
    const res = await fetch(shot.imageUrl);
    const blob = await res.blob();
    downloadBlob(blob, `AI_Mockup_${shot.id}.png`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Left: Interactive AI Generator / Editor Form */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        {/* Mode Toggle Tabs */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
            <button
              type="button"
              onClick={() => setMode("generate")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === "generate"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create New Shot</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === "edit"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Active Shot</span>
            </button>
          </div>

          {/* Model Badge */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 border-b border-neutral-800/80 pb-2">
            <span>Model: gemini-3.1-flash-image</span>
            <span className="text-amber-400 font-semibold">1024 × 1024</span>
          </div>

          {mode === "generate" ? (
            /* Generate Mode */
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  Describe Product Shot Scene:
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`E.g. Streetwear model wearing this ${product.name} at golden hour in a concrete brutalist plaza...`}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Inspiration Chips */}
              <div>
                <span className="text-[11px] font-medium text-neutral-400 block mb-1.5">
                  Prompt Inspiration:
                </span>
                <div className="flex flex-col gap-1.5">
                  {promptSuggestions.slice(0, 3).map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(s)}
                      className="text-left text-[11px] p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/70 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors line-clamp-2"
                    >
                      "{s}"
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={isGenerating || !prompt.trim()}
                onClick={handleGenerate}
                className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-amber-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rendering AI Mockup Shot...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate AI Product Shot</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Edit Mode */
            <div className="flex flex-col gap-3">
              {!activeShot ? (
                <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 text-center">
                  <p className="text-xs text-neutral-400">
                    Generate or pick a product shot from the right to edit.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300">
                    <img
                      src={activeShot.imageUrl}
                      alt="Source"
                      className="w-10 h-10 rounded-lg object-cover border border-neutral-700/50 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-white truncate">
                        Editing Selected Shot
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate">
                        {activeShot.prompt}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                      Enter In-Place Edit Instruction:
                    </label>
                    <textarea
                      rows={3}
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="E.g. Change lighting to dramatic sunset golden hour with lens flare..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Edit Inspiration Chips */}
                  <div>
                    <span className="text-[11px] font-medium text-neutral-400 block mb-1.5">
                      Quick Edit Presets:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {editSuggestions.slice(0, 3).map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditPrompt(s)}
                          className="text-left text-[11px] p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/70 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors line-clamp-1"
                        >
                          "{s}"
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isEditing || !editPrompt.trim()}
                    onClick={handleEdit}
                    className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-amber-500/20"
                  >
                    {isEditing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Applying AI Edits...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Apply AI Edits</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Active Shot Showcase & Gallery */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Main Display Stage */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider font-mono">
              AI Mockup Preview
            </span>
            {activeShot && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(activeShot)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Shot</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 flex items-center justify-center bg-neutral-950/70 min-h-[380px]">
            {activeShot ? (
              <div className="relative max-w-[500px] w-full rounded-xl overflow-hidden shadow-2xl border border-neutral-800 group">
                <img
                  src={activeShot.imageUrl}
                  alt={activeShot.prompt}
                  className="w-full h-auto aspect-square object-cover block"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 text-xs text-neutral-200 backdrop-blur-[2px]">
                  <p className="font-medium line-clamp-2">
                    {activeShot.prompt}
                  </p>
                  <span className="text-[10px] font-mono text-amber-400 mt-1 block">
                    {activeShot.productType} • 1024x1024 High-Res
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-sm flex flex-col items-center gap-3 p-6 text-neutral-500">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400/80">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-300">
                    No AI Mockup Generated Yet
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Type a prompt on the left to generate on-demand product shots placing your logo into cinematic real-world scenes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Strip of Generated Shots */}
        {history.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Generated Shots Archive ({history.length})
            </span>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {history.map((shot) => {
                const isSelected = activeShot?.id === shot.id;
                return (
                  <button
                    key={shot.id}
                    type="button"
                    onClick={() => setActiveShot(shot)}
                    className={`relative aspect-square w-20 rounded-xl overflow-hidden border shrink-0 transition-all ${
                      isSelected
                        ? "border-amber-500 ring-2 ring-amber-500 ring-offset-2 ring-offset-neutral-900 scale-105"
                        : "border-neutral-800 opacity-70 hover:opacity-100 hover:border-neutral-600"
                    }`}
                  >
                    <img
                      src={shot.imageUrl}
                      alt={shot.prompt}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[8px] font-mono text-white">
                      {shot.type === "edit" ? "Edit" : "Gen"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
