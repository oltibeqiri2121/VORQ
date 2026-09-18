import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser with 50mb limit for high-res logo & mockup transfers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper for Gemini client (lazy initialized)
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in the environment. Please check your AI Studio secrets."
    );
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 2. AI Mockup Generation (Generate new product shot placing logo with prompt)
app.post("/api/ai/generate-mockup", async (req, res) => {
  try {
    const { prompt, logoBase64, logoMimeType = "image/png", productType, aspectRatio = "1:1" } = req.body;

    if (!prompt && !productType) {
      return res.status(400).json({ error: "Missing prompt or product type" });
    }

    const ai = getGeminiClient();

    const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];

    if (logoBase64) {
      // Strip data URL prefix if present
      const cleanBase64 = logoBase64.replace(/^data:[^;]+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: logoMimeType,
        },
      });
    }

    const fullPrompt = [
      `Professional commercial e-commerce product mockup photography.`,
      logoBase64
        ? `Incorporate the provided logo graphic with crisp alignment and authentic surface blending onto the merchandise.`
        : ``,
      productType ? `Merchandise Product: ${productType}.` : ``,
      prompt ? `Scene Details: ${prompt}.` : ``,
      `The product must be centered with realistic fabric folds, surface textures, natural shadows, depth of field, studio-quality lighting, 4k ultra-high resolution catalog shot.`
    ].filter(Boolean).join(" ");

    parts.push({ text: fullPrompt });

    // Primary model: gemini-3.1-flash-image
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "16:9" | "9:16",
            imageSize: "1K",
          },
        },
      });
    } catch (err: any) {
      console.warn("gemini-3.1-flash-image failed, trying gemini-3.1-flash-lite-image...", err?.message);
      // Fallback to flash-lite-image
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "16:9" | "9:16",
          },
        },
      });
    }

    let generatedImageUrl: string | null = null;
    let textDescription = "";

    const candidates = response?.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textDescription += part.text + "\n";
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        error: "No image was returned by the AI model.",
        text: textDescription,
      });
    }

    return res.json({
      success: true,
      imageUrl: generatedImageUrl,
      description: textDescription.trim(),
    });
  } catch (error: any) {
    console.error("AI Mockup Generation Error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate AI mockup shot",
    });
  }
});

// 3. AI Mockup Edit (Edit an existing product shot with text instructions)
app.post("/api/ai/edit-mockup", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/png", prompt } = req.body;

    if (!imageBase64 || !prompt) {
      return res.status(400).json({ error: "Missing imageBase64 or prompt" });
    }

    const ai = getGeminiClient();
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");

    const parts = [
      {
        inlineData: {
          data: cleanBase64,
          mimeType,
        },
      },
      {
        text: `Edit this merchandise product mockup shot according to the following instruction while preserving high-end commercial quality and logo clarity: ${prompt}`,
      },
    ];

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K",
          },
        },
      });
    } catch (err: any) {
      console.warn("gemini-3.1-flash-image edit failed, trying flash-lite-image...", err?.message);
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: { parts },
      });
    }

    let editedImageUrl: string | null = null;
    let description = "";

    const candidates = response?.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          editedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          description += part.text;
        }
      }
    }

    if (!editedImageUrl) {
      return res.status(500).json({
        error: "Model did not return an edited image",
        text: description,
      });
    }

    return res.json({
      success: true,
      imageUrl: editedImageUrl,
      description,
    });
  } catch (error: any) {
    console.error("AI Mockup Edit Error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to edit mockup with AI",
    });
  }
});

// 4. AI Smart Placement & Tech Spec Recommendations (Uses gemini-3.8-flash)
app.post("/api/ai/analyze-brand", async (req, res) => {
  try {
    const { logoBase64, logoMimeType = "image/png", brandName } = req.body;
    const ai = getGeminiClient();

    const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];

    if (logoBase64) {
      const cleanBase64 = logoBase64.replace(/^data:[^;]+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: logoMimeType,
        },
      });
    }

    const systemPrompt = `You are an elite apparel & merchandise creative director and print-on-demand production engineer.
Analyze the provided logo graphic and brand context. Return a strictly valid JSON object with the following schema:
{
  "brandVibe": "string describing visual aesthetic, e.g. Minimalist Scandinavian, 90s Streetwear, Tech Vanguard, Artisan Organic",
  "paletteHex": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "recommendedGarments": [
    {
      "category": "Heavyweight Tee | Streetwear Hoodie | Dad Cap | Ceramic Mug | Tote Bag",
      "recommendedColor": "color name, e.g. Washed Vintage Black",
      "hexCode": "#hex",
      "placement": "Center Chest | Left Chest Pocket | Oversized Back | Center Wrap",
      "printTechnique": "Direct-to-Garment (DTG) | Screenprint (Discharge) | 3D Puff Embroidery | Sublimation",
      "reasoning": "brief rationale"
    }
  ],
  "printTips": ["tip 1", "tip 2", "tip 3"]
}
Only output the JSON object, no markdown codeblocks or extra text.`;

    parts.push({
      text: `${systemPrompt}\nBrand hint: ${brandName || "Modern Brand Identity"}`
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text?.trim() || "{}";
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleaned);

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("AI Brand Analysis Error:", error);
    // Provide a smart default recommendation if API is unavailable
    return res.json({
      success: false,
      fallback: true,
      data: {
        brandVibe: "Modern Minimalist Studio",
        paletteHex: ["#0F172A", "#F8FAFC", "#64748B", "#F59E0B"],
        recommendedGarments: [
          {
            category: "Heavyweight Tee",
            recommendedColor: "Jet Black",
            hexCode: "#171717",
            placement: "Center Chest (10\" width)",
            printTechnique: "Direct-to-Garment (DTG)",
            reasoning: "High contrast logo presentation with soft water-based inks."
          },
          {
            category: "Streetwear Hoodie",
            recommendedColor: "Cream Heather",
            hexCode: "#F5F2EB",
            placement: "Left Chest (3.5\" width)",
            printTechnique: "3D Puff Embroidery",
            reasoning: "Premium tactile feel suited for heavyweight fleece."
          },
          {
            category: "Ceramic Mug",
            recommendedColor: "Stoneware Off-White",
            hexCode: "#FFFFFF",
            placement: "Center Face Double-Sided",
            printTechnique: "High-Gloss Sublimation",
            reasoning: "Microwave and dishwasher safe durable print."
          }
        ],
        printTips: [
          "Export artwork at minimum 300 DPI at 100% physical scale.",
          "Keep text fonts converted to vector curves or rasterized above 24pt for embroidery.",
          "Ensure transparent PNG backgrounds to prevent rectangular box printing."
        ]
      }
    });
  }
});

// Vite middleware & Static serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MerchForge server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
