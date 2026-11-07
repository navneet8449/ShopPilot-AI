import React from 'react';
import { Product } from '../types/index.ts';
import { useApp } from '../context/AppContext.tsx';
import { 
  Star, 
  ShoppingBag, 
  Scale, 
  ShieldCheck, 
  Bot, 
  Check, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { 
    formatPrice, 
    addToCart, 
    compareList, 
    addToCompare, 
    removeFromCompare, 
    setSelectedProductId, 
    setActiveView,
    setInitialChatPrompt
  } = useApp();

  const isCompared = compareList.includes(product.id);

  const handleOpenDetail = () => {
    setSelectedProductId(product.id);
    setActiveView('detail');
  };

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInitialChatPrompt(`Tell me about the ${product.name}. Is it worth ${formatPrice(product.price, product.priceUSD)} and what are the main pros and cons?`);
    setActiveView('assistant');
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  return (
    <div 
      onClick={handleOpenDetail}
      className={`group relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col cursor-pointer overflow-hidden ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      {/* Top Media Container */}
      <div className="relative aspect-4/3 w-full bg-slate-50 rounded-xl overflow-hidden mb-3.5">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category & Availability Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white shadow-sm">
            {product.category}
          </span>
          {product.availability === 'in_stock' ? (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/90 text-white shadow-sm">
              In Stock
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/90 text-white shadow-sm">
              Limited Stock
            </span>
          )}
        </div>

        {/* Safety Score Pill */}
        <div className="absolute top-2.5 right-2.5">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 backdrop-blur-md text-emerald-700 shadow-sm border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            {product.riskIndicators.safetyScore}% Safe
          </span>
        </div>

        {/* Quick Ask AI Overlay on hover */}
        <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
          <button
            onClick={handleAskAI}
            className="flex-1 py-1.5 px-2 bg-[#0B132B]/90 backdrop-blur-md hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ask ShopPilot</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-indigo-600 text-[11px]">{product.brand}</span>
            <div className="flex items-center gap-1 text-slate-700 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-[10px] text-slate-400 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors mb-2">
            {product.name}
          </h3>

          {!compact && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          {/* Quick specs pill */}
          <div className="flex flex-wrap gap-1 mb-3">
            {Object.entries(product.specs).slice(0, 2).map(([key, val]) => (
              <span key={key} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium truncate max-w-[170px]">
                {val}
              </span>
            ))}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-base sm:text-lg font-extrabold text-[#0B132B] tracking-tight">
              {formatPrice(product.price, product.priceUSD)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Compare Toggle */}
            <button
              onClick={handleToggleCompare}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                isCompared
                  ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
              title={isCompared ? 'Remove from compare' : 'Add to compare'}
            >
              {isCompared ? <Check className="w-4 h-4 text-indigo-600" /> : <Scale className="w-4 h-4" />}
            </button>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="px-3 py-2 rounded-xl bg-[#0B132B] hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
