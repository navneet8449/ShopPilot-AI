import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { 
  Bot, 
  Sparkles, 
  Search, 
  ArrowRight, 
  Laptop, 
  Smartphone, 
  Headphones, 
  Monitor, 
  SlidersHorizontal, 
  ShieldCheck, 
  Scale, 
  Zap, 
  TrendingUp, 
  CheckCircle,
  CreditCard,
  ShoppingBag
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { 
    setActiveView, 
    setInitialChatPrompt, 
    cart, 
    formatPrice, 
    userPreferences 
  } = useApp();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          const all: Product[] = data.products || [];
          setFeaturedProducts(all.slice(0, 4));

          // Recommended tailored to user preference
          const recRes = await fetch('/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              budget: userPreferences.budgetMax,
              usage: userPreferences.primaryUsage,
            })
          });
          if (recRes.ok) {
            const recData = await recRes.json();
            setRecommendedProducts(recData.recommendations || all.slice(4, 8));
          } else {
            setRecommendedProducts(all.slice(4, 8));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userPreferences]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setInitialChatPrompt(searchQuery);
    setActiveView('assistant');
  };

  const handleCategoryClick = (cat: string) => {
    setActiveView('catalog');
  };

  const categories = [
    { id: 'laptops', name: 'Laptops & Workstations', icon: Laptop, count: '6 models', desc: 'M3 Pro, RTX 4070, Core Ultra' },
    { id: 'smartphones', name: 'Smartphones', icon: Smartphone, count: '5 flagships', desc: 'Pixel 9 Pro, Galaxy S24, Zeiss' },
    { id: 'headphones', name: 'Audio & ANC', icon: Headphones, count: '4 headphones', desc: 'Sony XM5, Bose Ultra, AirPods' },
    { id: 'monitors', name: 'Displays & Gaming', icon: Monitor, count: '3 monitors', desc: '49" OLED G9, 4K Ergo, 280Hz' },
    { id: 'accessories', name: 'Pro Accessories', icon: SlidersHorizontal, count: '3 accessories', desc: 'MX Master 3S, Keychron Q1' },
  ];

  const quickPrompts = [
    'Find me a laptop under ₹50,000',
    'Suggest a smartphone with a good camera',
    'Compare top 3 wireless headphones',
    'Best monitor for coding and Mac setup',
    'Analyze purchase risk for a 70% off deal'
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section with Deep Navy Canvas & AI Command Bar */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          
          {/* Top AI Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Autonomous AI Shopping Agent with Gemini 3.8 Flash Tool Calling</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none">
            Meet <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-indigo-400 bg-clip-text text-transparent">ShopPilot AI</span>.
            <br className="hidden sm:inline" /> Your Intelligent Buyer Companion.
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            No more endless tabs or sponsored reviews. ShopPilot uses real tool-calling to discover verified devices, inspect seller risks, compare real specs, and checkout safely via PayPal.
          </p>

          {/* Natural Language Search / Command Box */}
          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl shadow-indigo-950/40 border border-slate-200">
              <div className="pl-3 text-slate-400">
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ask anything: 'Find laptop for ML under ₹1.5L' or 'Camera phone under ₹45k'..."
                className="w-full px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0B132B] hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0 active:scale-95"
              >
                <span>Ask Agent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Prompt Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Try asking:</span>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setInitialChatPrompt(prompt);
                  setActiveView('assistant');
                }}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-slate-200 hover:text-white transition-all backdrop-blur-sm"
              >
                "{prompt}"
              </button>
            ))}
          </div>

          {/* Architecture Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-8 border-t border-slate-800/80 text-left">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Gemini Tools</div>
                <div className="text-[10px] text-slate-400">Multi-step Function Calling</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5">
              <Scale className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Spec Comparison</div>
                <div className="text-[10px] text-slate-400">Objective Pros & Cons</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Risk Analyzer</div>
                <div className="text-[10px] text-slate-400">Price & Link Authenticity</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5">
              <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">PayPal Sandbox</div>
                <div className="text-[10px] text-slate-400">Verified Orders API v2</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Popular Categories Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Curated Tech Categories
              </h2>
              <p className="text-xs text-slate-500">
                Explore verified products tested across developer, creator, and productivity benchmarks.
              </p>
            </div>
            <button
              onClick={() => setActiveView('catalog')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="group bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-600 flex items-center justify-center transition-colors mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      {cat.count}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Personalized AI Recommendations Section */}
        <section className="space-y-4 bg-gradient-to-tr from-slate-50 to-indigo-50/40 p-6 rounded-3xl border border-indigo-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Personalized AI Recommendations
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                    For {userPreferences.primaryUsage}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Tailored based on your budget threshold ({formatPrice(userPreferences.budgetMax, Math.round(userPreferences.budgetMax / 83))}) and preferences.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('profile')}
                className="px-3 py-1.5 rounded-xl bg-white text-xs font-semibold text-slate-700 border border-slate-200 hover:border-slate-300 transition-all shadow-xs"
              >
                Tweak Profile
              </button>
              <button
                onClick={() => {
                  setInitialChatPrompt(`Give me top recommendations for ${userPreferences.primaryUsage} under budget ${userPreferences.budgetMax}`);
                  setActiveView('assistant');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#0B132B] hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ask AI Advisor</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {recommendedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Featured Flagships & Power Devices */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Top Rated Benchmark Devices
              </h2>
              <p className="text-xs text-slate-500">
                Direct OEM authorized models with 95%+ safety scores and confirmed warranties.
              </p>
            </div>
            <button
              onClick={() => setActiveView('catalog')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All 20+ Models</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Live Cart Snapshot & Shopping Activity Banner */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cart Snapshot Widget */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Cart Summary</h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {cart.items.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                  <p>Your shopping cart is currently empty.</p>
                  <button
                    onClick={() => setActiveView('catalog')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Browse catalog to add items
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {cart.items.slice(0, 3).map(item => (
                    <div key={item.product.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={item.product.image} alt={item.product.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{item.product.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0 ml-2">
                        {item.quantity}x {formatPrice(item.product.price, item.product.priceUSD)}
                      </span>
                    </div>
                  ))}
                  {cart.items.length > 3 && (
                    <div className="text-[11px] text-slate-400 text-center">
                      +{cart.items.length - 3} more items in cart
                    </div>
                  )}
                </div>
              )}
            </div>

            {cart.items.length > 0 && (
              <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">Total (inc. tax):</span>
                  <span className="font-extrabold text-base text-[#0B132B]">
                    {formatPrice(cart.total, Math.round(cart.total / 83))}
                  </span>
                </div>
                <button
                  onClick={() => setActiveView('cart')}
                  className="w-full py-2.5 rounded-xl bg-[#0B132B] hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Review Cart & Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* AI Security & Purchase Risk Widget */}
          <div className="lg:col-span-2 bg-[#0B132B] text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>AI Purchase Risk Analyzer Module</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Protect yourself against counterfeit deals and pricing traps.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Our AI scans product links, compares market price medians, verifies return policies, and validates authentic manufacturer specifications before you spend money.
              </p>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveView('risk')}
                className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-extrabold transition-all shadow-md flex items-center gap-2"
              >
                <span>Launch Risk Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setInitialChatPrompt("What red flags should I look for when buying refurbished electronics online?");
                  setActiveView('assistant');
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all"
              >
                Ask Agent about Safe Shopping
              </button>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
};
