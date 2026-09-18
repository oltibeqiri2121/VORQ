export type ProductCategory = "All" | "Apparel" | "Drinkware" | "Accessories";

export type PrintTechnique =
  | "Direct-to-Garment (DTG)"
  | "Screenprint (Discharge)"
  | "3D Puff Embroidery"
  | "Flat Embroidery"
  | "Sublimation"
  | "UV Direct Print";

export interface PrintArea {
  id: string;
  name: string;
  leftPct: number;   // percentage of container width
  topPct: number;    // percentage of container height
  widthPct: number;  // percentage of container width
  heightPct: number; // percentage of container height
  physicalWidthInches: number;
  physicalHeightInches: number;
  cylindricalWarp?: boolean; // for mugs / tumblers
}

export interface Colorway {
  name: string;
  hex: string;
  isDark?: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  category: "Apparel" | "Drinkware" | "Accessories";
  subtitle: string;
  imageSrc: string;
  colorways: Colorway[];
  defaultColorway: string;
  printAreas: PrintArea[];
  defaultPrintAreaId: string;
  recommendedTechnique: PrintTechnique;
  fabricSpecs: string;
  isDarkBase?: boolean;
}

export interface LogoAsset {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  mimeType: string;
  isSample?: boolean;
}

export type TextureEffect =
  | "clean"
  | "screenprint_ink"
  | "embroidery_stitch"
  | "vintage_distress"
  | "metallic_foil";

export interface MockupTransform {
  x: number; // offset px from center of print area
  y: number; // offset px from center of print area
  scale: number; // 0.2 to 2.5
  rotation: number; // degrees -180 to 180
  opacity: number; // 0.1 to 1.0
  blendMode: "source-over" | "multiply" | "screen" | "overlay" | "soft-light";
  invertColor: boolean;
  textureEffect: TextureEffect;
  tintColor: string | null;
}

export interface GeneratedAiShot {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  productType?: string;
  type: "generate" | "edit";
}

export interface BrandAnalysisResult {
  brandVibe: string;
  paletteHex: string[];
  recommendedGarments: Array<{
    category: string;
    recommendedColor: string;
    hexCode: string;
    placement: string;
    printTechnique: string;
    reasoning: string;
  }>;
  printTips: string[];
}
