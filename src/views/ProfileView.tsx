import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { UserPreferences } from '../types/index.ts';
import { 
  User, 
  Settings, 
  Sparkles, 
  Check, 
  Clock, 
  ShieldCheck, 
  Save, 
  Sliders,
  DollarSign
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { 
    userPreferences, 
    setUserPreferences, 
    currency, 
    setCurrency, 
    formatPrice, 
    showToast 
  } = useApp();

  const [name, setName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex.shopper@example.com');
  const [budget, setBudget] = useState(userPreferences.budgetMax);
  const [usage, setUsage] = useState(userPreferences.primaryUsage);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(userPreferences.favoriteBrands);
  const [history, setHistory] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const availableBrands = [
    'Apple', 'ASUS', 'Sony', 'Google', 'Samsung', 'Lenovo', 'HP', 'OnePlus', 'Logitech', 'Keychron', 'Anker', 'Bose'
  ];

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/history');
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadHistory();
  }, []);

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const newPrefs: UserPreferences = {
        currency,
        budgetMax: budget,
        primaryUsage: usage,
        favoriteBrands: selectedBrands
      };

      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs)
      });

      if (res.ok) {
        setUserPreferences(newPrefs);
        showToast('Preferences updated! ShopPilot AI will personalize future suggestions.', 'success');
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to save preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Profile & AI Preferences
          </h1>
          <p className="text-xs text-slate-500">
            Tune your shopping persona so ShopPilot AI tailors recommendations directly to your hardware requirements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card & Preferences Form */}
        <div className="md:col-span-2 space-y-6">
          
          <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
            
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                AI Shopping Persona Configuration
              </h3>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
              </div>
            </div>

            {/* Currency Preference */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Default Currency</label>
              <div className="flex gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrency('INR')}
                  className={`px-4 py-2 rounded-xl font-bold border transition-all ${
                    currency === 'INR'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ₹ Indian Rupee (INR)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-4 py-2 rounded-xl font-bold border transition-all ${
                    currency === 'USD'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  $ US Dollar (USD)
                </button>
              </div>
            </div>

            {/* Primary Usage */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Primary Intended Usage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  'Programming & AI',
                  'Gaming',
                  'Content Creation',
                  'Business & Office',
                  'Everyday & Student'
                ].map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUsage(u as any)}
                    className={`p-2.5 rounded-xl font-semibold border text-left transition-all ${
                      usage === u
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Budget Ceiling */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700">Preferred Budget Threshold:</label>
                <span className="font-extrabold text-indigo-600">
                  {formatPrice(budget, Math.round(budget / 83))}
                </span>
              </div>
              <input
                type="range"
                min="20000"
                max="250000"
                step="5000"
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹20,000</span>
                <span>₹1,20,000</span>
                <span>₹2,50,000</span>
              </div>
            </div>

            {/* Favorite Brands */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Preferred Brands (ShopPilot weights these higher)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableBrands.map(brand => {
                  const isFav = selectedBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isFav
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isFav && <Check className="w-3 h-3 inline mr-1" />}
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#0B132B] hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save AI Preferences'}</span>
              </button>
            </div>

          </form>

        </div>

        {/* Right: AI Persona Summary & Shopping Activity */}
        <div className="space-y-6">
          
          <div className="bg-[#0B132B] text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Active Agent Persona</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block">Target Workflow:</span>
                <span className="font-extrabold text-white text-sm">{usage}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Budget Ceiling:</span>
                <span className="font-extrabold text-cyan-300 text-sm">{formatPrice(budget, Math.round(budget / 83))}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Top Brands:</span>
                <span className="text-slate-200">{selectedBrands.join(', ')}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300">
              When you prompt ShopPilot AI, these guidelines are automatically injected into tool parameters.
            </div>
          </div>

          {/* Activity Ledger */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Clock className="w-4 h-4 text-slate-500" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Recent Activity Ledger</h4>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No recent activity recorded.</p>
            ) : (
              <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1">
                {history.slice(0, 5).map(h => (
                  <div key={h.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 capitalize block">{h.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      MongoDB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
