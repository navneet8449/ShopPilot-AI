import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Product, RiskAnalysisResult } from '../types/index.ts';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Shield, 
  AlertTriangle, 
  Search, 
  Sparkles, 
  ExternalLink, 
  CheckCircle, 
  Info,
  DollarSign,
  Link as LinkIcon,
  HelpCircle
} from 'lucide-react';

export const RiskAnalyzerView: React.FC = () => {
  const { formatPrice, setActiveView, setInitialChatPrompt } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<RiskAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products', {
          headers: { 'Accept': 'application/json' }
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error(`Server returned non-JSON response (HTTP ${res.status}) while loading products.`);
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || `Failed to fetch products (HTTP ${res.status})`);
        }
        const data = await res.json();
        const list: Product[] = data.products || [];
        setProducts(list);
        if (list.length > 0) {
          // Prefer Lenovo LOQ 15 if available, else first product
          const target = list.find(p => p.name.toLowerCase().includes('lenovo loq')) || list[0];
          setSelectedProductId(target.id);
          handleAnalyze(target.id, '');
        }
      } catch (e: any) {
        console.error('Failed to load products for Risk Analyzer:', e);
        setError(e.message || 'Unable to connect to product catalog');
      }
    }
    loadProducts();
  }, []);

  const handleAnalyze = async (prodId?: string, queryInput?: string) => {
    const idToUse = prodId !== undefined ? prodId : selectedProductId;
    const inputToUse = queryInput !== undefined ? queryInput : customInput;

    if (!idToUse && !inputToUse.trim()) {
      setError('Please select a catalog product or enter a product name/deal URL to analyze.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/risk/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          productId: idToUse || undefined,
          queryUrlOrName: inputToUse || undefined
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const raw = await res.text();
        throw new Error(`Server returned non-JSON response (HTTP ${res.status}): ${raw.slice(0, 120)}...`);
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Analysis request failed with status ${res.status}`);
      }

      if (!data.analysis) {
        throw new Error('Analysis payload missing in server response.');
      }

      setAnalysisResult(data.analysis);
    } catch (e: any) {
      console.error('Risk Analysis error:', e);
      setError(e.message || 'Failed to complete risk analysis');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetScam = () => {
    const scamQuery = 'https://super-cheap-macbook-90off.xyz/buy-now';
    setCustomInput(scamQuery);
    setSelectedProductId('');
    handleAnalyze('', scamQuery);
  };

  const handlePresetLenovo = () => {
    const lenovo = products.find(p => p.name.toLowerCase().includes('lenovo loq'));
    if (lenovo) {
      setSelectedProductId(lenovo.id);
      setCustomInput('');
      handleAnalyze(lenovo.id, '');
    } else {
      setSelectedProductId('');
      setCustomInput('Lenovo LOQ 15');
      handleAnalyze('', 'Lenovo LOQ 15');
    }
  };

  const handlePresetHP = () => {
    const hp = products.find(p => p.name.toLowerCase().includes('hp victus'));
    if (hp) {
      setSelectedProductId(hp.id);
      setCustomInput('');
      handleAnalyze(hp.id, '');
    } else {
      setSelectedProductId('');
      setCustomInput('HP Victus 15');
      handleAnalyze('', 'HP Victus 15');
    }
  };

  const handlePresetUnverified = () => {
    const unverifiedName = 'Quantum X Gaming Laptop 2026';
    setSelectedProductId('');
    setCustomInput(unverifiedName);
    handleAnalyze('', unverifiedName);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#0B132B] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Autonomous AI Purchase Risk Analyzer</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Verify Deal Authenticity Before You Pay
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Our AI model inspects price deviations, missing component specifications, suspicious link domains, and return policy consistency to safeguard buyers against counterfeit hardware.
        </p>

        {/* Disclaimer as required */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 flex items-start gap-2 max-w-2xl">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Disclaimer:</strong> ShopPilot AI provides advisory risk evaluations based on comparative retail data and pattern analysis. AI evaluation does not guarantee seller legitimacy or prevent all fraud. Always exercise personal discretion.
          </span>
        </div>
      </div>

      {/* Input Selector Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
        <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">
          Run Real-time Risk Audit
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          
          {/* Catalog Product Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Audit a Verified Catalog Product:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setCustomInput('');
                handleAnalyze(e.target.value, '');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="" disabled>Select a catalog item...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatPrice(p.price, p.priceUSD)})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Link or Deal Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Or Paste External Deal URL / Headline:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={e => {
                  setCustomInput(e.target.value);
                  setSelectedProductId('');
                }}
                placeholder="e.g. https://cheap-deals.xyz/laptop-80-off"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleAnalyze('', customInput)}
                disabled={loading || !customInput.trim()}
                className="px-4 py-2 rounded-xl bg-[#0B132B] hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs"
              >
                Scan
              </button>
            </div>
          </div>

        </div>

        {/* Demo Test Triggers */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick Demo Audits:</span>
          <button
            onClick={handlePresetLenovo}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Lenovo LOQ 15 (MongoDB)</span>
          </button>
          <button
            onClick={handlePresetHP}
            className="px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold hover:bg-cyan-100 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />
            <span>HP Victus 15 (MongoDB)</span>
          </button>
          <button
            onClick={handlePresetScam}
            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Suspicious 90% Off Phishing Deal</span>
          </button>
          <button
            onClick={handlePresetUnverified}
            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Uncataloged External Product</span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-xs uppercase tracking-wider block">Risk Analysis Error</span>
            <p className="text-xs text-rose-800 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Audit Report Result */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-spin">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Querying MongoDB catalog, evaluating domain integrity and specs...</p>
        </div>
      ) : analysisResult ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Header & Overall Safety Score */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Audited Subject
                </span>
                {!analysisResult.unverified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    MongoDB Verified
                  </span>
                )}
                {analysisResult.unverified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <HelpCircle className="w-3 h-3 text-amber-600" />
                    Uncataloged / External
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {analysisResult.urlOrName}
              </h2>
              {analysisResult.marketMedianPrice !== null && analysisResult.marketMedianPrice !== undefined && (
                <p className="text-xs text-slate-500">
                  Official Verified Price: <strong className="text-slate-800 font-bold">₹{analysisResult.marketMedianPrice.toLocaleString('en-IN')}</strong>
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 block">AI Safety Rating</span>
                <span className={`text-2xl font-black ${
                  analysisResult.safetyScore === null || analysisResult.safetyScore === undefined
                    ? 'text-amber-600'
                    : analysisResult.safetyScore >= 80 
                      ? 'text-emerald-600' 
                      : analysisResult.safetyScore >= 60 
                        ? 'text-amber-600' 
                        : 'text-rose-600'
                }`}>
                  {analysisResult.safetyScore !== null && analysisResult.safetyScore !== undefined 
                    ? `${analysisResult.safetyScore}/100` 
                    : 'Unrated'}
                </span>
                {analysisResult.safetyScore === null && (
                  <span className="text-[10px] text-slate-400 block font-medium">No score fabricated</span>
                )}
              </div>

              <div className={`p-3 rounded-2xl ${
                analysisResult.safetyScore === null || analysisResult.safetyScore === undefined
                  ? 'bg-amber-50 text-amber-600'
                  : analysisResult.safetyScore >= 80 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : analysisResult.safetyScore >= 60 
                      ? 'bg-amber-50 text-amber-600' 
                      : 'bg-rose-50 text-rose-600'
              }`}>
                {analysisResult.safetyScore === null || analysisResult.safetyScore === undefined ? (
                  <HelpCircle className="w-8 h-8" />
                ) : analysisResult.safetyScore >= 80 ? (
                  <ShieldCheck className="w-8 h-8" />
                ) : (
                  <ShieldAlert className="w-8 h-8" />
                )}
              </div>
            </div>
          </div>

          {/* Verdict Box */}
          <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-1 ${
            analysisResult.riskLevel === 'Unverified' || analysisResult.safetyScore === null || analysisResult.safetyScore === undefined
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : analysisResult.safetyScore >= 80
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}>
            <div className="font-extrabold flex items-center gap-2">
              <span>Audit Verdict:</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-white/80 shadow-2xs">
                {analysisResult.riskLevel}
              </span>
            </div>
            <p className="text-xs font-normal opacity-90">{analysisResult.verdict}</p>
          </div>

          {/* 4 Pillars Inspection Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              4-Point Threat & Authenticity Vectors
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {analysisResult.flags.map((flag, idx) => (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                    flag.severity === 'pass'
                      ? 'bg-slate-50 border-slate-200/80 text-slate-800'
                      : flag.severity === 'warning'
                        ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                        : 'bg-rose-50/60 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {flag.severity === 'pass' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : flag.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold block">{flag.category}</span>
                    <p className="text-[11px] leading-relaxed opacity-90">{flag.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Recommendation & Action */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-900 block">Recommended Action:</span>
              <p className="text-slate-600 mt-0.5">{analysisResult.recommendation}</p>
            </div>

            <button
              onClick={() => {
                setInitialChatPrompt(`Explain this risk audit finding in detail: ${analysisResult.verdict}`);
                setActiveView('assistant');
              }}
              className="px-4 py-2 rounded-xl bg-[#0B132B] hover:bg-indigo-600 text-white font-bold transition-all shrink-0 shadow-xs"
            >
              Consult ShopPilot
            </button>
          </div>

        </div>
      ) : null}

    </div>
  );
};
