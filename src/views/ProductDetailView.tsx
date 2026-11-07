import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../types/index.ts';
import { 
  ArrowLeft, 
  Star, 
  ShoppingBag, 
  Scale, 
  ShieldCheck, 
  Check, 
  X, 
  Bot, 
  Truck, 
  RotateCcw, 
  Cpu, 
  Sparkles,
  ExternalLink,
  Plus,
  Minus
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const { 
    selectedProductId, 
    setActiveView, 
    formatPrice, 
    addToCart, 
    compareList, 
    addToCompare, 
    removeFromCompare,
    setInitialChatPrompt 
  } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      if (!selectedProductId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${selectedProductId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [selectedProductId]);

  if (loading || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-xs text-slate-500">Loading verified product details...</p>
      </div>
    );
  }

  const isCompared = compareList.includes(product.id);

  const handleAskAI = () => {
    setInitialChatPrompt(`I am looking at the ${product.name}. Analyze if it's the right choice for me, its key competitors, and whether there are any hidden drawbacks.`);
    setActiveView('assistant');
  };

  const handleAddToCartWithQty = () => {
    addToCart(product.id, quantity);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('catalog')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-xl bg-white border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Catalog</span>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="font-semibold text-slate-700">{product.brand}</span>
        </div>
      </div>

      {/* Main Product Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* Left: Product Image & Badges */}
        <div className="space-y-4">
          <div className="relative aspect-4/3 w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-white shadow">
                {product.brand}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white shadow">
                {product.availability === 'in_stock' ? 'In Stock' : 'Limited Stock'}
              </span>
            </div>

            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white/95 backdrop-blur-md text-emerald-700 shadow-sm border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{product.riskIndicators.safetyScore}% Safe Listing</span>
              </span>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">Express Delivery</div>
                <div className="text-[11px] text-slate-500">Free above ₹1,000 / $50</div>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">{product.riskIndicators.returnPolicyDays} Days Return</div>
                <div className="text-[11px] text-slate-500">Hassle-free replacement</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Details, Price, and Buy Actions */}
        <div className="space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                {product.category}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1 text-slate-700 font-bold text-xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount} verified ratings)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed mt-3">
              {product.description}
            </p>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Total Price (incl. GST)</span>
              <div className="text-3xl font-extrabold text-[#0B132B] tracking-tight">
                {formatPrice(product.price, product.priceUSD)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 block">
                Standard OEM Price
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">PayPal Sandbox Protected</span>
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleAddToCartWithQty}
                className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-[#0B132B] hover:bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart ({quantity})</span>
              </button>

              <button
                onClick={() => isCompared ? removeFromCompare(product.id) : addToCompare(product.id)}
                className={`w-full sm:w-auto py-3 px-4 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
                  isCompared
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isCompared ? <Check className="w-4 h-4 text-indigo-600" /> : <Scale className="w-4 h-4" />}
                <span>{isCompared ? 'In Compare Tray' : 'Compare'}</span>
              </button>
            </div>
          </div>

          {/* Ask AI Agent Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-cyan-50/50 to-slate-50 border border-indigo-200/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B132B] text-cyan-400 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Want an AI Consultation on this?</h4>
                <p className="text-[11px] text-slate-600">
                  ShopPilot evaluates whether this device fits your specific software stack or usage.
                </p>
              </div>
            </div>
            <button
              onClick={handleAskAI}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
            >
              Ask AI
            </button>
          </div>

        </div>

      </div>

      {/* Specifications & AI Deep Dive Tabs / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Full Specifications */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Verified Technical Specifications
            </h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {Object.entries(product.specs).map(([key, val]) => (
              <div key={key} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-slate-500 sm:w-1/3">{key}</span>
                <span className="font-bold text-slate-900 sm:w-2/3">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Pros & Cons Analysis & Risk Report */}
        <div className="space-y-6">
          
          {/* Pros & Cons Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <h4 className="font-bold text-slate-900 text-sm">AI Evaluation Breakdown</h4>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  Key Strengths
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {product.pros.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
                  Trade-offs & Considerations
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {product.cons.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Risk Verification Badge Card */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-xs">Seller & Safety Audit</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {product.riskIndicators.riskLevel}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              {product.riskIndicators.notes.map((note, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{note}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200">
              <a
                href={product.productUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View Official Manufacturer Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
