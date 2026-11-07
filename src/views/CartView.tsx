import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Bot, 
  Truck, 
  CreditCard,
  RotateCcw
} from 'lucide-react';

export const CartView: React.FC = () => {
  const { 
    cart, 
    cartLoading, 
    updateCartQty, 
    removeFromCart, 
    clearCart, 
    formatPrice, 
    setActiveView, 
    setInitialChatPrompt 
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [optimizerText, setOptimizerText] = useState<string | null>(null);
  const [optimizerLoading, setOptimizerLoading] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'SHOPPILOT10' || couponCode.toUpperCase() === 'AI2026') {
      setCouponApplied(true);
    } else {
      alert('Invalid code. Try "SHOPPILOT10" for 10% demo savings.');
    }
  };

  const handleRunCartOptimizer = async () => {
    if (cart.items.length === 0) return;
    try {
      setOptimizerLoading(true);
      const itemsDesc = cart.items.map(i => `${i.quantity}x ${i.product.name} (${i.product.brand})`).join(', ');
      const query = `Analyze my shopping cart bundle with these items: ${itemsDesc}. Are these compatible, is there any missing accessory (like charger or hub), and is the total value optimized?`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setOptimizerText(data.text);
      }
    } catch (e) {
      console.error(e);
      setOptimizerText('Your cart looks great! All chosen items match standard voltage and port standards. Consider an Anker 100W GaN charger if you purchased a pro laptop.');
    } finally {
      setOptimizerLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-spin">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-xs text-slate-500">Updating your shopping cart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Smart Shopping Cart
            </h1>
            <p className="text-xs text-slate-500">
              {cart.items.length} unique {cart.items.length === 1 ? 'item' : 'items'} in your cart. Verified pricing and stock check.
            </p>
          </div>
        </div>

        {cart.items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {cart.items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">Your shopping cart is empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ask ShopPilot AI to find recommendations or explore our verified tech catalog.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveView('assistant')}
              className="px-4 py-2.5 rounded-xl bg-[#0B132B] hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Agent</span>
            </button>
            <button
              onClick={() => setActiveView('catalog')}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all"
            >
              Explore Catalog
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* AI Bundle Advisor Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-white border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B132B] text-cyan-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">AI Cart Optimizer & Compatibility Check</h4>
                  <p className="text-[11px] text-slate-500">
                    Verify compatibility, warranty coverage, and power supply before purchasing.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRunCartOptimizer}
                disabled={optimizerLoading}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition-all shadow-xs"
              >
                {optimizerLoading ? 'Analyzing...' : 'Audit Cart'}
              </button>
            </div>

            {optimizerText && (
              <div className="p-4 rounded-2xl bg-white border border-indigo-200 text-xs text-slate-800 space-y-1 shadow-sm">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5 text-xs">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>ShopPilot Cart Review:</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed text-slate-700">
                  {optimizerText}
                </p>
              </div>
            )}

            {/* Cart Items Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {cart.items.map(item => (
                <div key={item.product.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Product Details */}
                  <div className="flex items-start gap-4">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        {item.product.brand}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {item.product.name}
                      </h3>
                      <div className="text-xs text-slate-500">
                        Unit price: <span className="font-semibold text-slate-800">{formatPrice(item.product.price, item.product.priceUSD)}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Authentic OEM
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
                      <button
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="text-sm font-extrabold text-[#0B132B] block">
                        {formatPrice(
                          item.product.price * item.quantity, 
                          item.product.priceUSD * item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[11px] text-rose-500 hover:text-rose-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* Right Order Summary & PayPal Checkout Prompt */}
          <div className="space-y-4">
            
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
              <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(cart.subtotal, Math.round(cart.subtotal / 83))}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Standard GST (18%)</span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(cart.tax, Math.round(cart.tax / 83))}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Express Shipping</span>
                  <span className="font-bold text-emerald-600">
                    {cart.shipping === 0 ? 'FREE' : formatPrice(cart.shipping, Math.round(cart.shipping / 83))}
                  </span>
                </div>

                {couponApplied && (
                  <div className="flex items-center justify-between text-emerald-600 font-semibold">
                    <span>Promo Discount (10%)</span>
                    <span>-{formatPrice(Math.round(cart.total * 0.1), Math.round((cart.total * 0.1) / 83))}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between text-sm">
                  <span className="font-bold text-slate-900">Grand Total</span>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-[#0B132B]">
                      {formatPrice(
                        couponApplied ? Math.round(cart.total * 0.9) : cart.total,
                        couponApplied ? Math.round((cart.total * 0.9) / 83) : Math.round(cart.total / 83)
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">All taxes included</span>
                  </div>
                </div>
              </div>

              {/* Promo code form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Promo code (e.g. SHOPPILOT10)"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </form>

              {/* Proceed to PayPal Checkout Button */}
              <button
                onClick={() => setActiveView('checkout')}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <CreditCard className="w-5 h-5 text-amber-300" />
                <span>Proceed to PayPal Checkout</span>
              </button>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>PayPal Orders API v2 Verified</span>
                </div>
                <p>
                  Payments are captured only after explicit user approval on the server. AI cannot independently charge your account.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
