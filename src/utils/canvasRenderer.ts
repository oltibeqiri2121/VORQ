import { LogoAsset, MockupTransform, PrintArea, ProductItem, Colorway } from "../types";
import JSZip from "jszip";

export interface RenderOptions {
  canvas: HTMLCanvasElement;
  product: ProductItem;
  colorway: Colorway;
  printArea: PrintArea;
  logo: LogoAsset | null;
  transform: MockupTransform;
  showGuides?: boolean;
  highResOutput?: boolean;
  outputWidth?: number;
  outputHeight?: number;
}

// Cache loaded HTMLImageElements to prevent flickering
const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (imageCache.has(src)) {
      const cached = imageCache.get(src)!;
      if (cached.complete) {
        resolve(cached);
        return;
      }
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Render the product and placed logo onto a canvas element
 */
export async function renderMockupToCanvas(options: RenderOptions): Promise<void> {
  const {
    canvas,
    product,
    colorway,
    printArea,
    logo,
    transform,
    showGuides = false,
    outputWidth = 1200,
    outputHeight = 1200,
  } = options;

  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, outputWidth, outputHeight);

  // 1. Load and draw product base image
  try {
    const productImg = await loadImage(product.imageSrc);
    ctx.drawImage(productImg, 0, 0, outputWidth, outputHeight);

    // Optional subtle colorway tint overlay if not default
    if (colorway && colorway.hex) {
      ctx.save();
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = colorway.hex;
      ctx.globalAlpha = 0.18;
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      ctx.restore();
    }
  } catch (err) {
    console.error("Error loading product image:", err);
    // Draw neutral fallback background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, outputWidth, outputHeight);
  }

  // Calculate print area bounding box in canvas pixels
  const areaLeft = (printArea.leftPct / 100) * outputWidth;
  const areaTop = (printArea.topPct / 100) * outputHeight;
  const areaWidth = (printArea.widthPct / 100) * outputWidth;
  const areaHeight = (printArea.heightPct / 100) * outputHeight;

  // 2. Draw Guides if enabled
  if (showGuides) {
    ctx.save();
    // Bounding box dashed border
    ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(areaLeft, areaTop, areaWidth, areaHeight);

    // Center crosshairs
    const centerX = areaLeft + areaWidth / 2;
    const centerY = areaTop + areaHeight / 2;
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(centerX, areaTop);
    ctx.lineTo(centerX, areaTop + areaHeight);
    ctx.moveTo(areaLeft, centerY);
    ctx.lineTo(areaLeft + areaWidth, centerY);
    ctx.stroke();

    // Safety label
    ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "rgba(245, 158, 11, 0.9)";
    ctx.fillText(`${printArea.name} (${printArea.physicalWidthInches}" x ${printArea.physicalHeightInches}")`, areaLeft + 6, areaTop + 16);
    ctx.restore();
  }

  // 3. Draw Logo if provided
  if (logo && logo.dataUrl) {
    try {
      const logoImg = await loadImage(logo.dataUrl);

      // Save state before clipping and transforms
      ctx.save();

      // Clip strictly to print area bounding box to respect physical garment limits
      ctx.beginPath();
      ctx.rect(areaLeft, areaTop, areaWidth, areaHeight);
      ctx.clip();

      // Center point of print area
      const centerX = areaLeft + areaWidth / 2 + (transform.x / 100) * areaWidth;
      const centerY = areaTop + areaHeight / 2 + (transform.y / 100) * areaHeight;

      ctx.translate(centerX, centerY);
      ctx.rotate((transform.rotation * Math.PI) / 180);
      ctx.scale(transform.scale, transform.scale);
      ctx.globalAlpha = transform.opacity;

      // Set blending mode
      ctx.globalCompositeOperation = transform.blendMode;

      // Base logo size to fit nicely in print area
      const logoAspect = logoImg.width / logoImg.height;
      let targetW = areaWidth * 0.85;
      let targetH = targetW / logoAspect;
      if (targetH > areaHeight * 0.85) {
        targetH = areaHeight * 0.85;
        targetW = targetH * logoAspect;
      }

      // Draw onto temporary canvas if color inversion, tint, or texture effect is active
      if (transform.invertColor || transform.tintColor || transform.textureEffect !== "clean") {
        const offCanvas = document.createElement("canvas");
        offCanvas.width = Math.round(targetW);
        offCanvas.height = Math.round(targetH);
        const offCtx = offCanvas.getContext("2d");

        if (offCtx) {
          offCtx.drawImage(logoImg, 0, 0, offCanvas.width, offCanvas.height);

          // Invert colors if dark shirt with black logo
          if (transform.invertColor) {
            const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] > 10) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
              }
            }
            offCtx.putImageData(imgData, 0, 0);
          }

          // Custom tint color
          if (transform.tintColor) {
            offCtx.globalCompositeOperation = "source-in";
            offCtx.fillStyle = transform.tintColor;
            offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
          }

          // Texture effects (Embroidery, Vintage Distress, Screenprint ink)
          if (transform.textureEffect === "vintage_distress") {
            offCtx.globalCompositeOperation = "destination-out";
            for (let i = 0; i < 400; i++) {
              const rx = Math.random() * offCanvas.width;
              const ry = Math.random() * offCanvas.height;
              const rw = Math.random() * 3 + 1;
              offCtx.fillStyle = "rgba(0,0,0,0.4)";
              offCtx.fillRect(rx, ry, rw, rw);
            }
          } else if (transform.textureEffect === "embroidery_stitch") {
            // Subtle stitch line overlay
            offCtx.globalCompositeOperation = "source-atop";
            offCtx.strokeStyle = "rgba(255, 255, 255, 0.18)";
            offCtx.lineWidth = 1;
            for (let y = 0; y < offCanvas.height; y += 4) {
              offCtx.beginPath();
              offCtx.moveTo(0, y);
              offCtx.lineTo(offCanvas.width, y);
              offCtx.stroke();
            }
          }

          // Cylindrical horizontal curve if tumbler or mug
          if (printArea.cylindricalWarp) {
            const slices = 20;
            const sliceW = offCanvas.width / slices;
            for (let s = 0; s < slices; s++) {
              const sx = s * sliceW;
              const progress = s / slices;
              // Cosine curvature factor
              const curve = Math.sin(progress * Math.PI);
              const dy = (1 - curve) * 4;
              ctx.drawImage(
                offCanvas,
                sx, 0, sliceW, offCanvas.height,
                -targetW / 2 + sx, -targetH / 2 + dy, sliceW, targetH - dy * 2
              );
            }
          } else {
            ctx.drawImage(offCanvas, -targetW / 2, -targetH / 2, targetW, targetH);
          }
        }
      } else {
        // Standard draw
        if (printArea.cylindricalWarp) {
          const slices = 20;
          const sliceW = targetW / slices;
          const srcSliceW = logoImg.width / slices;
          for (let s = 0; s < slices; s++) {
            const progress = s / slices;
            const curve = Math.sin(progress * Math.PI);
            const dy = (1 - curve) * 4;
            ctx.drawImage(
              logoImg,
              s * srcSliceW, 0, srcSliceW, logoImg.height,
              -targetW / 2 + s * sliceW, -targetH / 2 + dy, sliceW, targetH - dy * 2
            );
          }
        } else {
          ctx.drawImage(logoImg, -targetW / 2, -targetH / 2, targetW, targetH);
        }
      }

      ctx.restore();
    } catch (err) {
      console.error("Error drawing logo onto canvas:", err);
    }
  }
}

/**
 * Generate a 300 DPI Print-Ready Artwork File (Transparent Background PNG)
 * Exact dimensions in pixels = physicalInches * 300
 */
export async function generatePrintReadyArtwork(
  logo: LogoAsset,
  printArea: PrintArea,
  transform: MockupTransform
): Promise<Blob> {
  const DPI = 300;
  const canvasW = Math.round(printArea.physicalWidthInches * DPI);
  const canvasH = Math.round(printArea.physicalHeightInches * DPI);

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2d context");

  // Keep transparent background for true print production
  ctx.clearRect(0, 0, canvasW, canvasH);

  const logoImg = await loadImage(logo.dataUrl);

  const centerX = canvasW / 2 + (transform.x / 100) * canvasW;
  const centerY = canvasH / 2 + (transform.y / 100) * canvasH;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.scale, transform.scale);
  ctx.globalAlpha = transform.opacity;

  const logoAspect = logoImg.width / logoImg.height;
  let targetW = canvasW * 0.85;
  let targetH = targetW / logoAspect;
  if (targetH > canvasH * 0.85) {
    targetH = canvasH * 0.85;
    targetW = targetH * logoAspect;
  }

  // Draw logo
  if (transform.invertColor || transform.tintColor) {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = Math.round(targetW);
    offCanvas.height = Math.round(targetH);
    const offCtx = offCanvas.getContext("2d")!;
    offCtx.drawImage(logoImg, 0, 0, offCanvas.width, offCanvas.height);

    if (transform.invertColor) {
      const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] > 10) {
          d[i] = 255 - d[i];
          d[i + 1] = 255 - d[i + 1];
          d[i + 2] = 255 - d[i + 2];
        }
      }
      offCtx.putImageData(imgData, 0, 0);
    }

    if (transform.tintColor) {
      offCtx.globalCompositeOperation = "source-in";
      offCtx.fillStyle = transform.tintColor;
      offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
    }

    ctx.drawImage(offCanvas, -targetW / 2, -targetH / 2, targetW, targetH);
  } else {
    ctx.drawImage(logoImg, -targetW / 2, -targetH / 2, targetW, targetH);
  }

  ctx.restore();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export artwork blob"));
    }, "image/png");
  });
}

/**
 * Generate 2048px High-Res Product Mockup Image Blob
 */
export async function generateHighResMockup(
  product: ProductItem,
  colorway: Colorway,
  printArea: PrintArea,
  logo: LogoAsset | null,
  transform: MockupTransform
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await renderMockupToCanvas({
    canvas,
    product,
    colorway,
    printArea,
    logo,
    transform,
    showGuides: false,
    outputWidth: 2048,
    outputHeight: 2048,
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export mockup blob"));
    }, "image/jpeg", 0.95);
  });
}

/**
 * Export complete Production Package ZIP containing:
 * 1. Print-Ready Artwork (300 DPI PNG)
 * 2. High-Res Mockup (2048px JPEG)
 * 3. Production Spec Sheet (TXT)
 */
export async function generateProductionZip(
  product: ProductItem,
  colorway: Colorway,
  printArea: PrintArea,
  logo: LogoAsset,
  transform: MockupTransform
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Generate 300 DPI Print file
  const printBlob = await generatePrintReadyArtwork(logo, printArea, transform);
  zip.file(
    `01_PRINT_READY_300DPI_${product.id}_${printArea.id}.png`,
    printBlob
  );

  // 2. Generate 2048px Mockup
  const mockupBlob = await generateHighResMockup(
    product,
    colorway,
    printArea,
    logo,
    transform
  );
  zip.file(
    `02_COMMERCIAL_MOCKUP_2048px_${product.id}.jpg`,
    mockupBlob
  );

  // 3. Technical Production Spec Sheet
  const dpiWidth = Math.round(printArea.physicalWidthInches * 300);
  const dpiHeight = Math.round(printArea.physicalHeightInches * 300);
  const specText = `===================================================================
MERCHFORGE PRODUCTION SPECIFICATION SHEET
===================================================================
Generated: ${new Date().toISOString()}
Product: ${product.name} (${product.category})
Fabric / Material Specs: ${product.fabricSpecs}
Selected Colorway: ${colorway.name} (Hex: ${colorway.hex})

PRINT LOCATION & SIZING:
- Print Area: ${printArea.name}
- Physical Print Size: ${printArea.physicalWidthInches}" Width x ${printArea.physicalHeightInches}" Height
- Digital Resolution: 300 DPI (${dpiWidth} x ${dpiHeight} pixels)
- Recommended Print Method: ${product.recommendedTechnique}

ARTWORK DETAILS:
- Asset Name: ${logo.name}
- Original Dimensions: ${logo.width} x ${logo.height} px
- Scale Factor: ${(transform.scale * 100).toFixed(0)}%
- Rotation: ${transform.rotation}°
- Texture / Finish: ${transform.textureEffect}
- Color Inversion Applied: ${transform.invertColor ? "YES" : "NO"}
- Custom Ink Tint: ${transform.tintColor || "Original Graphic Colors"}

PRODUCTION GUIDELINES:
1. Load 01_PRINT_READY_300DPI_${product.id}_${printArea.id}.png into RIP software at 100% scale.
2. Direct-to-Garment: Apply white underbase pass for dark/colored garments.
3. Screenprint: Recommended mesh count 160-200 for fine logo detail.
4. Embroidery: Convert to .DST / .PES file, recommended underlay with satin border.
===================================================================`;

  zip.file("03_PRODUCTION_SPEC_SHEET.txt", specText);

  return zip.generateAsync({ type: "blob" });
}

// Utility to trigger browser file download
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
