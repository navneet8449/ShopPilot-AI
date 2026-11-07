/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AIAssistantDrawer } from './components/AIAssistantDrawer.tsx';

// Views
import { HomeView } from './views/HomeView.tsx';
import { AssistantView } from './views/AssistantView.tsx';
import { CatalogView } from './views/CatalogView.tsx';
import { ProductDetailView } from './views/ProductDetailView.tsx';
import { ComparisonView } from './views/ComparisonView.tsx';
import { CartView } from './views/CartView.tsx';
import { CheckoutView } from './views/CheckoutView.tsx';
import { OrdersView } from './views/OrdersView.tsx';
import { ProfileView } from './views/ProfileView.tsx';
import { RiskAnalyzerView } from './views/RiskAnalyzerView.tsx';

import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, toast } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-indigo-950 text-white border-indigo-800'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      {/* Dynamic View Container */}
      <main className="flex-1">
        {activeView === 'home' && <HomeView />}
        {activeView === 'assistant' && <AssistantView />}
        {activeView === 'catalog' && <CatalogView />}
        {activeView === 'detail' && <ProductDetailView />}
        {activeView === 'compare' && <ComparisonView />}
        {activeView === 'cart' && <CartView />}
        {activeView === 'checkout' && <CheckoutView />}
        {activeView === 'orders' && <OrdersView />}
        {activeView === 'profile' && <ProfileView />}
        {activeView === 'risk' && <RiskAnalyzerView />}
      </main>

      {/* Floating AI Assistant Drawer */}
      <AIAssistantDrawer />

      {/* Global Footer */}
      <Footer />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
