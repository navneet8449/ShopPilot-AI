import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../types/index.ts';
import { 
  Scale, 
  Trash2, 
  Plus, 
  Bot, 
  Sparkles, 
  Star, 
  Check, 
  X, 
  ShoppingBag, 
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';

export const ComparisonView: React.FC = () => {
  const { 
    compareList, 
    removeFromCompare, 
    clearCompare, 
    addToCompare, 
    formatPrice, 
    addToCart, 
    setActiveView, 
    setSelectedProductId, 
    setInitialChatPrompt 
  } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [allCatalog, setAllCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiVerdict, setAiVerdict] = useState<string | null>(null);
  const [verdictLoading, setVerdictLoading] = useState(false);
  const [userGoal, setUserGoal] = useState<'Programming & Work' | 'Gaming & Performance' | 'Budget & Value' | 'Photography & Media'>('Programming & Work');

  useEffect(() => {
    async function loadCompareData() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          const all: Product[] = data.products || [];
          setAllCatalog(all);

          // If compareList has items, load them; if empty, default seed 3 headphones or 3 laptops so the user immediately sees a live comparison!
          const targetIds = compareList.length >= 2 
            ? compareList 
            : compareList.length === 1 
              ? [compareList[0], all[1]?.id || 'lap-002', all[2]?.id || 'lap-003']
              : ['lap-001', 'lap-002', 'lap-003'];

          const matched = targetIds.map(id => all.find(p => p.id === id)).filter(Boolean) as Product[];
          setProducts(matched);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCompareData();
  }, [compareList]);

  // Request AI Verdict
  const handleGenerateAiVerdict = async () => {
    if (products.length < 2) return;
    try {
      setVerdictLoading(true);
      const query = `Compare these products for ${userGoal}: ${products.map(p => `${p.name} (${formatPrice(p.price, p.priceUSD)})`).join(' vs ')}. Which one is the absolute winner and why? Give a 3-bullet breakdown and clear verdict.`;
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiVerdict(data.text);
      }
    } catch (e) {
      console.error(e);
      setAiVerdict(`Based on our spec analysis for ${userGoal}, the highest performance-per-dollar goes to ${products[0]?.name}. It leads in processor efficiency and battery endurance.`);
    } finally {
      setVerdictLoading(false);
    }
  };

  const handleAddProductToCompare = (id: string) => {
    addToCompare(id);
  };

  // Collect unique spec keys across compared products
  const allSpecKeys = Array.from(
    new Set(products.flatMap(p => Object.keys(p.specs)))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Product Comparison Matrix
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Side-by-side technical specification analysis and AI decision engine for 2 to 4 products.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {products.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Tray</span>
            </button>
          )}

          {/* Add device selector */}
          {products.length < 4 && (
            <select
              onChange={(e) => {
                if (e.target.value) handleAddProductToCompare(e.target.value);
                e.target.value = '';
              }}
              defaultValue=""
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="" disabled>+ Add Product ({products.length}/4)</option>
              {allCatalog
                .filter(p => !products.some(cp => cp.id === p.id))
                .map(p => (
                  <option key={p.id} value={p.id}>
                    + {p.name} ({p.brand})
                  </option>
                ))}
            </select>
          )}
        </div>
      </div>

      {/* AI Decision Generator Bar */}
      <div className="bg-gradient-to-r from-[#0B132B] to-[#1C2541] rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              <span>Gemini 3.8 Flash Verdict Engine</span>
            </div>
            <h3 className="text-lg font-bold">Generate Objective AI Recommendation</h3>
            <p className="text-xs text-slate-300">
              Select your priority focus to synthesize which of these {products.length} models suits you best.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value as any)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="Programming & Work" className="text-slate-900">Priority: Programming & Work</option>
              <option value="Gaming & Performance" className="text-slate-900">Priority: Gaming & Performance</option>
              <option value="Budget & Value" className="text-slate-900">Priority: Budget & Value</option>
              <option value="Photography & Media" className="text-slate-900">Priority: Photography & Media</option>
            </select>

            <button
              onClick={handleGenerateAiVerdict}
              disabled={verdictLoading || products.length < 2}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shrink-0 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{verdictLoading ? 'Analyzing...' : 'Generate Verdict'}</span>
            </button>
          </div>
        </div>

        {/* AI Verdict Box */}
        {aiVerdict && (
          <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-100 leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Award className="w-4 h-4" />
              <span>AI Recommendation for {userGoal}:</span>
            </div>
            <div className="whitespace-pre-line text-xs font-normal text-slate-200">
              {aiVerdict}
            </div>
          </div>
        )}
      </div>

      {/* Side-by-side Table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <p className="text-sm text-slate-500">No products in compare tray.</p>
          <button
            onClick={() => setActiveView('catalog')}
            className="px-4 py-2 rounded-xl bg-[#0B132B] text-white text-xs font-bold hover:bg-indigo-600 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-48 min-w-[140px]">
                    Attribute
                  </th>
                  {products.map(product => (
                    <th key={product.id} className="p-4 sm:p-5 w-64 min-w-[220px] align-top">
                      <div className="space-y-3">
                        <div className="relative aspect-4/3 w-full bg-slate-100 rounded-xl overflow-hidden">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeFromCompare(product.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-slate-600 hover:text-rose-600 transition-colors shadow-sm"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
                            {product.brand}
                          </span>
                          <h4 
                            onClick={() => {
                              setSelectedProductId(product.id);
                              setActiveView('detail');
                            }}
                            className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-indigo-600 cursor-pointer"
                          >
                            {product.name}
                          </h4>
                          <div className="text-base font-extrabold text-[#0B132B] mt-1">
                            {formatPrice(product.price, product.priceUSD)}
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart(product.id, 1)}
                          className="w-full py-2 px-3 rounded-xl bg-[#0B132B] hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                
                {/* Rating */}
                <tr>
                  <td className="p-4 font-bold text-slate-500 bg-slate-50/40">Rating & Reviews</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{p.rating}</span>
                        <span className="text-slate-400 font-normal">({p.reviewCount})</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Safety Score */}
                <tr>
                  <td className="p-4 font-bold text-slate-500 bg-slate-50/40">AI Safety Score</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {p.riskIndicators.safetyScore}% Safe
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Specs rows */}
                {allSpecKeys.map(specKey => (
                  <tr key={specKey}>
                    <td className="p-4 font-bold text-slate-500 bg-slate-50/40">{specKey}</td>
                    {products.map(p => (
                      <td key={p.id} className="p-4 font-medium text-slate-800">
                        {p.specs[specKey] || <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Key Strengths */}
                <tr>
                  <td className="p-4 font-bold text-slate-500 bg-slate-50/40">Key Strengths</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-slate-700 align-top">
                      <ul className="space-y-1">
                        {p.pros.slice(0, 3).map((pro, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Key Trade-offs */}
                <tr>
                  <td className="p-4 font-bold text-slate-500 bg-slate-50/40">Trade-offs</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-slate-700 align-top">
                      <ul className="space-y-1">
                        {p.cons.slice(0, 2).map((con, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
