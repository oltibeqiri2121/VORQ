import React, { useState } from "react";
import { Shirt, Coffee, ShoppingBag, Layers, Check } from "lucide-react";
import { ProductItem, ProductCategory, Colorway, PrintArea } from "../types";
import { PRODUCTS } from "../data/products";

interface ProductSelectorProps {
  selectedProduct: ProductItem;
  onSelectProduct: (product: ProductItem) => void;
  selectedColorway: Colorway;
  onSelectColorway: (colorway: Colorway) => void;
  selectedPrintArea: PrintArea;
  onSelectPrintArea: (area: PrintArea) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProduct,
  onSelectProduct,
  selectedColorway,
  onSelectColorway,
  selectedPrintArea,
  onSelectPrintArea,
}) => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("All");

  const categories: Array<{ id: ProductCategory; label: string; icon: React.ReactNode }> = [
    { id: "All", label: "All Items", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "Apparel", label: "Apparel", icon: <Shirt className="w-3.5 h-3.5" /> },
    { id: "Drinkware", label: "Drinkware", icon: <Coffee className="w-3.5 h-3.5" /> },
    { id: "Accessories", label: "Accessories", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  ];

  const filteredProducts =
    activeCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
      {/* Category Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 bg-neutral-950/80 p-1 rounded-xl border border-neutral-800 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <span className="text-[11px] text-neutral-500 font-mono hidden md:block">
          {filteredProducts.length} Blank Templates
        </span>
      </div>

      {/* Product Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
        {filteredProducts.map((product) => {
          const isSelected = selectedProduct.id === product.id;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                onSelectProduct(product);
                // Reset to product default colorway and print area
                const defaultCol =
                  product.colorways.find((c) => c.name === product.defaultColorway) ||
                  product.colorways[0];
                onSelectColorway(defaultCol);
                const defaultArea =
                  product.printAreas.find((a) => a.id === product.defaultPrintAreaId) ||
                  product.printAreas[0];
                onSelectPrintArea(defaultArea);
              }}
              className={`group relative rounded-xl border p-2 text-left transition-all flex flex-col gap-2 ${
                isSelected
                  ? "border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10 ring-1 ring-amber-500"
                  : "border-neutral-800/80 bg-neutral-950/50 hover:bg-neutral-950 hover:border-neutral-700"
              }`}
            >
              <div className="aspect-square w-full rounded-lg bg-neutral-900 overflow-hidden relative border border-neutral-800/50">
                <img
                  src={product.imageSrc}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-neutral-950/80 backdrop-blur-sm text-neutral-300 border border-neutral-700/50">
                  {product.category}
                </span>
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-white tracking-tight truncate">
                  {product.name}
                </h3>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                  {product.recommendedTechnique}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Product Controls: Colorways & Print Areas */}
      <div className="pt-3 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Colorway Swatches */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 font-mono">
            Garment Color:
            <span className="text-amber-400 font-sans font-medium">
              {selectedColorway.name}
            </span>
          </span>
          <div className="flex items-center gap-2">
            {selectedProduct.colorways.map((col) => {
              const isActive = selectedColorway.name === col.name;
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => onSelectColorway(col)}
                  className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                    isActive
                      ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-neutral-900 scale-110"
                      : "opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                >
                  {isActive && (
                    <Check
                      className={`w-3.5 h-3.5 ${
                        col.isDark ? "text-white" : "text-neutral-950"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Print Area Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-neutral-300 font-mono">
            Print Location & Size:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedProduct.printAreas.map((area) => {
              const isActive = selectedPrintArea.id === area.id;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => onSelectPrintArea(area)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "border-amber-500 bg-amber-500/10 text-white shadow-sm"
                      : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span>{area.name}</span>
                  <span className="text-[10px] font-mono text-neutral-400 px-1 py-0.2 rounded bg-neutral-900">
                    {area.physicalWidthInches}"×{area.physicalHeightInches}"
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
