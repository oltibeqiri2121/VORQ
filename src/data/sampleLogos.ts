import { LogoAsset } from "../types";

// Helper to convert inline SVG string to data URL
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const APEX_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
  <defs>
    <linearGradient id="apexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#EF4444" />
    </linearGradient>
  </defs>
  <g fill="none" stroke="none">
    <path d="M200 40 L340 180 L280 180 L200 100 L120 180 L60 180 Z" fill="url(#apexGrad)"/>
    <path d="M200 120 L310 230 L260 230 L200 170 L140 230 L90 230 Z" fill="#FFFFFF"/>
    <polygon points="200,190 270,260 230,260 200,230 170,260 130,260" fill="#E2E8F0"/>
    <text x="200" y="320" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="36" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">APEX</text>
    <text x="200" y="350" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#94A3B8" text-anchor="middle" letter-spacing="8">ATHLETICS CLUB</text>
  </g>
</svg>`;

const SOLARIS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
  <g fill="none" stroke="#E2E8F0" stroke-width="3">
    <!-- Outer circle and sunburst -->
    <circle cx="200" cy="200" r="160" stroke="#F59E0B" stroke-width="4" stroke-dasharray="6,6"/>
    <circle cx="200" cy="200" r="140" stroke="#E2E8F0" stroke-width="2"/>
    <circle cx="200" cy="180" r="50" fill="#F59E0B" stroke="none"/>
    <path d="M120 220 Q200 170 280 220 L280 240 Q200 210 120 240 Z" fill="#E2E8F0" stroke="none"/>
    <!-- Sun rays -->
    <line x1="200" y1="90" x2="200" y2="110" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
    <line x1="140" y1="115" x2="155" y2="130" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
    <line x1="260" y1="115" x2="245" y2="130" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
    <line x1="110" y1="175" x2="130" y2="175" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
    <line x1="290" y1="175" x2="270" y2="175" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
    <text x="200" y="285" font-family="serif" font-weight="bold" font-size="28" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">SOLARIS</text>
    <text x="200" y="310" font-family="sans-serif" font-weight="600" font-size="12" fill="#F59E0B" text-anchor="middle" letter-spacing="5">COFFEE ROASTERS</text>
    <text x="200" y="328" font-family="sans-serif" font-size="10" fill="#94A3B8" text-anchor="middle">EST. 2024 • OAKLAND, CA</text>
  </g>
</svg>`;

const CYBER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
  <defs>
    <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06B6D4" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
  </defs>
  <!-- Isometric Cube Mesh -->
  <polygon points="200,60 310,125 200,190 90,125" fill="none" stroke="url(#neonCyan)" stroke-width="6" stroke-linejoin="round"/>
  <polygon points="90,125 200,190 200,320 90,255" fill="none" stroke="#06B6D4" stroke-width="5" stroke-linejoin="round"/>
  <polygon points="310,125 200,190 200,320 310,255" fill="none" stroke="#3B82F6" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="200" cy="190" r="14" fill="#06B6D4"/>
  <text x="200" y="365" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="24" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">NEO//LABS</text>
</svg>`;

const BOTANICA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
  <!-- Minimalist Botanical Emblem -->
  <g fill="none" stroke="#A7F3D0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="200" cy="170" rx="90" ry="130" stroke="#34D399" stroke-width="2" stroke-dasharray="4,4"/>
    <path d="M200 240 C200 170 160 140 140 100 C180 120 200 150 200 240 Z" fill="#10B981" fill-opacity="0.25"/>
    <path d="M200 240 C200 170 240 140 260 100 C220 120 200 150 200 240 Z" fill="#34D399" fill-opacity="0.35"/>
    <path d="M200 250 L200 80"/>
    <circle cx="200" cy="70" r="4" fill="#A7F3D0"/>
    <text x="200" y="325" font-family="serif" font-weight="bold" font-size="26" fill="#ECFDF5" text-anchor="middle" letter-spacing="5">BOTANICA</text>
    <text x="200" y="350" font-family="sans-serif" font-size="11" fill="#6EE7B7" text-anchor="middle" letter-spacing="6">PURE ORGANICS</text>
  </g>
</svg>`;

export const SAMPLE_LOGOS: LogoAsset[] = [
  {
    id: "sample_apex",
    name: "Apex Athletics",
    dataUrl: svgToDataUrl(APEX_SVG),
    width: 800,
    height: 800,
    mimeType: "image/svg+xml",
    isSample: true,
  },
  {
    id: "sample_solaris",
    name: "Solaris Coffee",
    dataUrl: svgToDataUrl(SOLARIS_SVG),
    width: 800,
    height: 800,
    mimeType: "image/svg+xml",
    isSample: true,
  },
  {
    id: "sample_cyber",
    name: "Neo//Labs",
    dataUrl: svgToDataUrl(CYBER_SVG),
    width: 800,
    height: 800,
    mimeType: "image/svg+xml",
    isSample: true,
  },
  {
    id: "sample_botanica",
    name: "Botanica Organics",
    dataUrl: svgToDataUrl(BOTANICA_SVG),
    width: 800,
    height: 800,
    mimeType: "image/svg+xml",
    isSample: true,
  },
];
