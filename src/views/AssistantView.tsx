import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ChatMessage, Product, RiskAnalysisResult } from '../types/index.ts';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  ShoppingBag, 
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Layers,
  Cpu,
  Star
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard.tsx';

export const AssistantView: React.FC = () => {
  const { 
    formatPrice, 
    addToCart, 
    setActiveView, 
    setSelectedProductId, 
    initialChatPrompt, 
    setInitialChatPrompt 
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am **ShopPilot AI**, your autonomous shopping advisor powered by Google Gemini 3.8 Flash.

I have direct access to our verified product database, side-by-side spec comparison tools, purchase risk evaluation engines, and PayPal checkout integration.

How can I help you find the right device today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '💻 Laptop under ₹50,000', action: 'query', payload: 'Find me a laptop under ₹50,000' },
        { label: '📸 Best Camera Smartphone', action: 'query', payload: 'Suggest a smartphone with a good camera' },
        { label: '🎧 Compare Top 3 Headphones', action: 'query', payload: 'Compare top 3 wireless headphones' },
        { label: '⚡ Programming & ML Laptop', action: 'query', payload: 'Recommend a laptop for programming and machine learning' },
        { label: '🛡️ Check Deal Risk', action: 'query', payload: 'Analyze purchase risk for a 75% discounted laptop link' }
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle incoming initial prompt if redirected from a product card
  useEffect(() => {
    if (initialChatPrompt) {
      sendMessage(initialChatPrompt);
      setInitialChatPrompt(null);
    }
  }, [initialChatPrompt]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation payload for API
      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: data.toolCalls,
        productCards: data.productCards,
        comparisonData: data.comparisonData,
        cartConfirmation: data.cartConfirmation,
        riskReport: data.riskReport,
        suggestedActions: [
          { label: '🛒 View Cart', action: 'view_cart' },
          { label: '🔍 Browse All Products', action: 'view_catalog' }
        ]
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `I encountered an issue processing your request: ${err.message}. You can try asking again or rephrase your budget/category query.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Voice dictation using browser Web Speech API
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleActionClick = (action: string, payload?: any) => {
    if (action === 'query' && payload) {
      sendMessage(payload);
    } else if (action === 'view_cart') {
      setActiveView('cart');
    } else if (action === 'view_catalog') {
      setActiveView('catalog');
    } else if (action === 'view_compare') {
      setActiveView('compare');
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. What device or gear are you shopping for?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B132B] flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                ShopPilot AI Assistant
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Gemini Tool Calling Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ask natural language queries for real-time catalog search, spec comparisons, risk audits, and cart updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-all"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-[650px] overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[85%]">
                
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-[#0B132B] text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-3">
                  {/* Message Bubble */}
                  <div 
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line prose prose-sm max-w-none prose-slate">
                      {msg.text}
                    </div>

                    <span className={`text-[10px] block mt-2 text-right ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Tool Invocations Badge / Execution Steps */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="space-y-1.5">
                      {msg.toolCalls.map((tc, idx) => (
                        <div 
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono flex items-center gap-2"
                        >
                          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="font-semibold text-indigo-700">Executed Tool:</span>
                          <span className="font-bold text-slate-900">{tc.name}</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-xs">
                            {JSON.stringify(tc.args)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Attached Product Cards */}
                  {msg.productCards && msg.productCards.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Suggested Catalog Products ({msg.productCards.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                        {msg.productCards.map(p => (
                          <ProductCard key={p.id} product={p} compact />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Comparison Matrix Card */}
                  {msg.comparisonData && msg.comparisonData.products && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-indigo-200 shadow-md max-w-3xl overflow-hidden">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                        <div className="flex items-center gap-2">
                          <Scale className="w-5 h-5 text-indigo-600" />
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">Side-by-Side Product Comparison</h4>
                        </div>
                        <button
                          onClick={() => setActiveView('compare')}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <span>Full Studio Matrix</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {msg.comparisonData.missing && msg.comparisonData.missing.length > 0 && (
                        <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>
                            <strong>Notice:</strong> &quot;{msg.comparisonData.missing.join(', ')}&quot; was not found in our catalog. Showing verified matches without substitutions.
                          </span>
                        </div>
                      )}

                      {msg.comparisonData.products.length >= 2 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="py-3 px-3 font-bold text-slate-600 w-32 shrink-0">
                                  Specification
                                </th>
                                {msg.comparisonData.products.map((p: Product) => (
                                  <th key={p.id} className="py-3 px-3 bg-indigo-50/40 font-bold text-slate-900 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                                      <div className="truncate">
                                        <span className="text-[10px] uppercase font-bold text-indigo-600 block">{p.brand}</span>
                                        <span className="font-bold text-slate-900 block truncate">{p.name}</span>
                                      </div>
                                    </div>
                                    <div className="text-sm font-black text-slate-900">
                                      {formatPrice(p.price, p.priceUSD)}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              <tr>
                                <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50/50">Price</td>
                                {msg.comparisonData.products.map((p: Product) => (
                                  <td key={p.id} className="py-2.5 px-3 font-bold text-emerald-700">
                                    {formatPrice(p.price, p.priceUSD)}
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50/50">Rating</td>
                                {msg.comparisonData.products.map((p: Product) => (
                                  <td key={p.id} className="py-2.5 px-3">
                                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                      <span>{p.rating} / 5</span>
                                      <span className="text-[10px] text-slate-400">({p.reviewCount.toLocaleString()})</span>
                                    </div>
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50/50">Processor (CPU)</td>
                                {msg.comparisonData.products.map((p: Product) => {
                                  const proc = p.specs['Processor'] || p.specs['CPU'] || Object.entries(p.specs).find(([k]) => k.toLowerCase().includes('proc') || k.toLowerCase().includes('cpu'))?.[1] || '—';
                                  return (
                                    <td key={p.id} className="py-2.5 px-3 text-slate-800 font-medium">
                                      {proc}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr>
                                <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50/50">RAM (Memory)</td>
                                {msg.comparisonData.products.map((p: Product) => {
                                  const ram = p.specs['RAM'] || p.specs['Unified Memory'] || p.specs['Memory'] || Object.entries(p.specs).find(([k]) => k.toLowerCase().includes('ram') || k.toLowerCase().includes('memory'))?.[1] || '—';
                                  return (
                                    <td key={p.id} className="py-2.5 px-3 text-slate-800 font-medium">
                                      {ram}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr>
                                <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50/50">GPU (Graphics)</td>
                                {msg.comparisonData.products.map((p: Product) => {
                                  const gpu = p.specs['Graphics'] || p.specs['GPU'] || Object.entries(p.specs).find(([k]) => k.toLowerCase().includes('graph') || k.toLowerCase().includes('gpu'))?.[1] || 'Integrated Graphics';
                                  return (
                                    <td key={p.id} className="py-2.5 px-3 text-slate-800 font-medium">
                                      {gpu}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr>
                                <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50/50">Display</td>
                                {msg.comparisonData.products.map((p: Product) => {
                                  const disp = p.specs['Display'] || p.specs['Screen'] || Object.entries(p.specs).find(([k]) => k.toLowerCase().includes('disp') || k.toLowerCase().includes('screen'))?.[1] || '—';
                                  return (
                                    <td key={p.id} className="py-2.5 px-3 text-slate-800 font-medium">
                                      {disp}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr>
                                <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50/50 align-top">Pros</td>
                                {msg.comparisonData.products.map((p: Product) => (
                                  <td key={p.id} className="py-2.5 px-3 text-slate-700 align-top">
                                    <ul className="space-y-1">
                                      {p.pros.slice(0, 2).map((pro, i) => (
                                        <li key={i} className="flex items-start gap-1 text-[11px]">
                                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                          <span>{pro}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50/50 align-top">Cons</td>
                                {msg.comparisonData.products.map((p: Product) => (
                                  <td key={p.id} className="py-2.5 px-3 text-slate-700 align-top">
                                    <ul className="space-y-1">
                                      {p.cons.slice(0, 2).map((con, i) => (
                                        <li key={i} className="flex items-start gap-1 text-[11px] text-slate-600">
                                          <span className="text-amber-500 font-bold shrink-0">⚠</span>
                                          <span>{con}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="py-2.5 px-3 bg-slate-50/50 font-semibold text-slate-500">Actions</td>
                                {msg.comparisonData.products.map((p: Product) => (
                                  <td key={p.id} className="py-2.5 px-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => addToCart(p.id)}
                                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition-colors shadow-xs"
                                      >
                                        Add to Cart
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedProductId(p.id);
                                          setActiveView('detail');
                                        }}
                                        className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 rounded-lg font-bold text-[11px] transition-colors"
                                      >
                                        Details
                                      </button>
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-3 text-xs text-slate-600 bg-slate-50 rounded-xl">
                          At least 2 verified products are needed to display the side-by-side spec comparison table.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline Cart Confirmation Card */}
                  {msg.cartConfirmation && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm max-w-md flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                            Cart Updated via Agent
                          </span>
                          <div className="text-xs font-bold text-slate-900 line-clamp-1">
                            {msg.cartConfirmation.quantity}x {msg.cartConfirmation.product.name}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveView('cart')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>View Cart</span>
                      </button>
                    </div>
                  )}

                  {/* Inline Risk Inspection Card */}
                  {msg.riskReport && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md max-w-xl">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          {(msg.riskReport.safetyScore ?? 0) >= 80 ? (
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ShieldAlert className="w-5 h-5 text-amber-600" />
                          )}
                          <h4 className="font-bold text-slate-900 text-sm">AI Purchase Risk Inspection</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          msg.riskReport.safetyScore !== null && msg.riskReport.safetyScore !== undefined && msg.riskReport.safetyScore >= 80 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : msg.riskReport.safetyScore === null || msg.riskReport.safetyScore === undefined
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}>
                          {msg.riskReport.safetyScore !== null && msg.riskReport.safetyScore !== undefined 
                            ? `Score: ${msg.riskReport.safetyScore}/100 • ` 
                            : 'Unrated • '}
                          {msg.riskReport.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium mb-3">
                        {msg.riskReport.verdict}
                      </p>
                      <div className="space-y-1.5 text-xs">
                        {msg.riskReport.flags.map((flag, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-600">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                              flag.severity === 'pass' ? 'bg-emerald-500' : flag.severity === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                            }`} />
                            <span className="font-semibold text-slate-800">{flag.category}:</span>
                            <span>{flag.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Prompt Chips */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act.action, act.payload)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-xs font-semibold shadow-xs transition-all active:scale-95"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </div>
          ))}

          {/* Typing / Tool Execution Indicator */}
          {loading && (
            <div className="flex items-center gap-3 text-slate-500 text-xs font-medium pl-2">
              <div className="w-8 h-8 rounded-xl bg-[#0B132B] flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                <span>ShopPilot is evaluating catalog data & tools...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2">
            
            {/* Mic voice dictation */}
            <button
              onClick={toggleSpeechRecognition}
              className={`p-3 rounded-2xl border transition-all ${
                isListening 
                  ? 'bg-rose-500 border-rose-600 text-white animate-pulse' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isListening ? 'Listening...' : 'Voice Search with Speech API'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Main Text Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ShopPilot: 'Laptop for programming under ₹60k', 'Compare pixel vs s24'..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="p-3 rounded-2xl bg-[#0B132B] hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-[#0B132B] text-white transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
              title="Send to Gemini"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Autonomous agent with tool invocation & PayPal validation</span>
            <span>Gemini 3.8 Flash • Enterprise Guardrails</span>
          </div>
        </div>

      </div>

    </div>
  );
};
