import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Sparkles, Shield, Cpu, CreditCard, Database, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <footer className="bg-[#0B132B] text-slate-400 border-t border-[#1C2541] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">ShopPilot AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous AI Shopping Agent empowering consumers with real-time specification analysis, Gemini tool calling, objective product comparisons, and PayPal-verified checkouts.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Agent Online: Gemini 3.8 Flash
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">ShopPilot Hub</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveView('assistant')} className="hover:text-cyan-300 transition-colors">
                  AI Conversational Agent
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('catalog')} className="hover:text-cyan-300 transition-colors">
                  Product Catalog
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('compare')} className="hover:text-cyan-300 transition-colors">
                  Specification Comparison Matrix
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('risk')} className="hover:text-cyan-300 transition-colors">
                  AI Purchase Risk Analyzer
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Architecture</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Google Gemini Function Calling</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                <span>PayPal Orders API v2 (Sandbox)</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>MongoDB Document Schema</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Dual-layer Payment Verification</span>
              </div>
            </div>
          </div>

          {/* Col 4: AI & Security Advisory */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Safety & Trust</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              ShopPilot AI adheres to strict e-commerce safety principles. Payments are NEVER automatically charged by the AI agent; explicit human authorization is required for every checkout.
            </p>
            <div className="p-2.5 rounded-xl bg-[#1C2541]/70 border border-slate-700/60 text-[10px] text-slate-300">
              Verified Sandbox Environment • Real REST API Handshake
            </div>
          </div>

        </div>

        {/* Bottom Credits & Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} ShopPilot AI. All rights reserved. Demo sample catalog for evaluation.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Strictly no fabricated live prices or reviews</span>
            <span>•</span>
            <span className="text-slate-400">Powered by Gemini 3.8 Flash</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
