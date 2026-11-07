import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { 
  Sparkles, 
  ShoppingBag, 
  Scale, 
  ShieldCheck, 
  Layers, 
  Clock, 
  User, 
  Menu, 
  X, 
  Bot,
  Search
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    cart, 
    compareList, 
    currency, 
    setCurrency, 
    setIsAiDrawerOpen 
  } = useApp();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  interface NavItem {
    id: 'home' | 'assistant' | 'catalog' | 'compare' | 'risk' | 'orders';
    label: string;
    icon: any;
    highlight?: boolean;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: Layers },
    { id: 'assistant', label: 'AI Shopping Agent', icon: Bot, highlight: true },
    { id: 'catalog', label: 'Products', icon: Search },
    { id: 'compare', label: 'Compare', icon: Scale, badge: compareList.length },
    { id: 'risk', label: 'Risk Analyzer', icon: ShieldCheck },
    { id: 'orders', label: 'Orders', icon: Clock },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B132B]/95 backdrop-blur-md border-b border-[#1C2541] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveView('home')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  ShopPilot
                </span>
                <span className="text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-cyan-300">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wider font-medium hidden sm:block">
                Intelligent Autonomous Shopping Agent
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1C2541] text-cyan-300 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  } ${item.highlight ? 'border border-indigo-500/40 shadow-sm shadow-indigo-500/20' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500 text-white">
                      {item.badge}
                    </span>
                  ) : null}
                  {item.highlight && !isActive ? (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Currency Switcher */}
            <div className="flex items-center bg-[#1C2541] p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  currency === 'INR' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  currency === 'USD' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setActiveView('cart')}
              className={`relative p-2.5 rounded-xl transition-all border ${
                activeView === 'cart'
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-[#1C2541] border-slate-700 text-slate-200 hover:border-slate-500'
              }`}
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => setActiveView('profile')}
              className={`p-2.5 rounded-xl border transition-all ${
                activeView === 'profile'
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-[#1C2541] border-slate-700 text-slate-200 hover:border-slate-500'
              }`}
              title="User Profile"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-[#1C2541] text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1C2541] text-cyan-300'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
