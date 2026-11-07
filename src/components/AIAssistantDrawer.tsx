import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Bot, Sparkles, X, Send, ChevronRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Product } from '../types/index.ts';

export const AIAssistantDrawer: React.FC = () => {
  const { 
    isAiDrawerOpen, 
    setIsAiDrawerOpen, 
    setActiveView, 
    formatPrice, 
    addToCart 
  } = useApp();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; products?: Product[] }>>([
    {
      role: 'assistant',
      text: 'Hi! I am ShopPilot AI. Ask me for laptop recommendations, phone camera reviews, or deal risk checks!'
    }
  ]);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const query = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat({ role: 'user', text: query }).map(m => ({
            role: m.role,
            content: m.text
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            text: data.text,
            products: data.productCards?.slice(0, 2)
          }
        ]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I ran into an error. Please ask in the full assistant page.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button on Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#0B132B] via-indigo-900 to-[#0B132B] text-white font-bold text-xs shadow-2xl shadow-indigo-900/50 border border-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-cyan-300 group-hover:rotate-12 transition-transform" />
          </div>
          <span>ShopPilot AI</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        </button>
      </div>

      {/* Slide-over Drawer */}
      {isAiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 bg-[#0B132B] text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">ShopPilot Mini</h3>
                <span className="text-[10px] text-cyan-300 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Gemini Tool Calling Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsAiDrawerOpen(false);
                  setActiveView('assistant');
                }}
                className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-white/10 rounded-lg"
                title="Open Dedicated Full Chat View"
              >
                Expand
              </button>
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs'
                }`}>
                  <div className="whitespace-pre-line">{m.text}</div>
                </div>

                {/* Inline mini products if returned */}
                {m.products && m.products.length > 0 && (
                  <div className="mt-2 space-y-2 w-full max-w-[90%]">
                    {m.products.map(p => (
                      <div key={p.id} className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">{p.name}</span>
                            <span className="text-indigo-600 font-extrabold text-[11px]">{formatPrice(p.price, p.priceUSD)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(p.id, 1)}
                          className="px-2 py-1 rounded-lg bg-[#0B132B] text-white text-[10px] font-bold shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                <span>ShopPilot evaluating tools...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Drawer Input */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder="Ask ShopPilot..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-[#0B132B] hover:bg-indigo-600 disabled:opacity-50 text-white transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
