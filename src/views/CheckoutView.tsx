import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Order } from '../types/index.ts';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Truck, 
  User, 
  Mail, 
  MapPin, 
  FileText,
  Printer,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const { cart, formatPrice, setActiveView, refreshOrders, refreshCart } = useApp();

  const [step, setStep] = useState<'review' | 'approving' | 'success'>('review');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buyer information form
  const [buyer, setBuyer] = useState({
    name: 'Alex Johnson',
    email: 'alex.shopper@example.com',
    address: '404 Silicon Enclave, Tech Park Road',
    city: 'Bengaluru',
    postalCode: '560100',
    country: 'IN'
  });

  const [createdPaypalOrder, setCreatedPaypalOrder] = useState<any>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Step 1: Create Order on Backend
  const handleInitiatePayPalOrder = async () => {
    if (cart.items.length === 0) {
      setError('Cannot checkout with an empty cart.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer,
          currency: cart.currency
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to initialize PayPal order');
      }

      const orderData = await res.json();
      setCreatedPaypalOrder(orderData);
      setStep('approving');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with PayPal REST API');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Authorize & Capture on Backend
  const handleConfirmAndCapture = async () => {
    if (!createdPaypalOrder?.id) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdPaypalOrder.id,
          buyer
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server payment capture failed.');
      }

      const data = await res.json();
      setCompletedOrder(data.order);
      setStep('success');

      // Refresh cart and order history
      await refreshOrders();
      await refreshCart();

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Payment capture failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={() => setActiveView('cart')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: REVIEW & BUYER INFO */}
      {step === 'review' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Buyer Details Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <User className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Shipping & Buyer Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={buyer.name}
                    onChange={e => setBuyer({ ...buyer, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={buyer.email}
                    onChange={e => setBuyer({ ...buyer, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Street Address</label>
                  <input
                    type="text"
                    value={buyer.address}
                    onChange={e => setBuyer({ ...buyer, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={buyer.city}
                    onChange={e => setBuyer({ ...buyer, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Postal Code</label>
                  <input
                    type="text"
                    value={buyer.postalCode}
                    onChange={e => setBuyer({ ...buyer, postalCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* PayPal Security Note */}
            <div className="p-4 rounded-2xl bg-[#0070BA]/5 border border-[#0070BA]/20 flex items-start gap-3">
              <img 
                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
                alt="PayPal" 
                className="w-9 rounded mt-0.5 shrink-0"
              />
              <div className="text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-900 block">PayPal Sandbox Orders API v2</span>
                <p>
                  Clicking "Continue to PayPal Approval" creates an authenticated order on the backend. You will review and authorize payment before final capture.
                </p>
              </div>
            </div>
          </div>

          {/* Cart Summary Column */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Order Review ({cart.items.length} items)
              </h4>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {cart.items.map(i => (
                  <div key={i.product.id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={i.product.image} alt={i.product.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{i.product.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0 ml-2">
                      {i.quantity}x {formatPrice(i.product.price, i.product.priceUSD)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal, Math.round(cart.subtotal / 83))}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%)</span>
                  <span>{formatPrice(cart.tax, Math.round(cart.tax / 83))}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">{cart.shipping === 0 ? 'FREE' : formatPrice(cart.shipping, Math.round(cart.shipping / 83))}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>Total Due</span>
                  <span className="text-base text-[#0B132B]">{formatPrice(cart.total, Math.round(cart.total / 83))}</span>
                </div>
              </div>

              <button
                onClick={handleInitiatePayPalOrder}
                disabled={loading || cart.items.length === 0}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5 text-amber-300" />
                <span>{loading ? 'Initializing Order...' : 'Continue to PayPal Approval'}</span>
              </button>

            </div>
          </div>

        </div>
      )}

      {/* STEP 2: USER PAYPAL APPROVAL / SANDBOX MODAL */}
      {step === 'approving' && createdPaypalOrder && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#0070BA]/10 text-[#0070BA] flex items-center justify-center mx-auto">
              <CreditCard className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              PayPal Checkout Authorization
            </h2>
            <p className="text-xs text-slate-500">
              Order ID created on PayPal Sandbox: <span className="font-mono font-bold text-slate-800">{createdPaypalOrder.id}</span>
            </p>
          </div>

          {/* Verification Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Merchant:</span>
              <span className="font-bold text-slate-900">ShopPilot AI (Verified Merchant)</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Amount to Authorize:</span>
              <span className="text-base font-extrabold text-[#0070BA]">
                ${createdPaypalOrder.amount} {createdPaypalOrder.currency} (~{formatPrice(cart.total, Math.round(cart.total / 83))})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Recipient / Buyer:</span>
              <span className="font-bold text-slate-800">{buyer.name} ({buyer.email})</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Strict Security Check:</span>
            </div>
            <p>
              As required by security guidelines, final payment capture is executed strictly by the server after your explicit consent. No AI agent can trigger this independently.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setStep('review')}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmAndCapture}
              disabled={loading}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#0070BA] hover:bg-[#005ea6] text-white text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>{loading ? 'Verifying & Capturing...' : 'Authorize & Pay with PayPal'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PAYMENT CAPTURED SUCCESS RECEIPT */}
      {step === 'success' && completedOrder && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl space-y-8">
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Payment Confirmed & Verified!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your transaction has been securely captured on the server and archived in MongoDB.
            </p>
          </div>

          {/* Receipt Card */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Order Number</span>
                <span className="text-sm font-mono font-bold text-slate-900">{completedOrder.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">PayPal Capture ID</span>
                <span className="text-sm font-mono font-bold text-[#0070BA]">{completedOrder.captureId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Date</span>
                <span className="text-xs font-semibold text-slate-700">{new Date(completedOrder.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Purchased Items</h4>
              <div className="divide-y divide-slate-200">
                {completedOrder.items.map(item => (
                  <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{item.product.name}</div>
                        <div className="text-[11px] text-slate-500">Qty: {item.quantity} • {item.product.brand}</div>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      {formatPrice(item.product.price * item.quantity, item.product.priceUSD * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment Summary */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Delivery Address:</span>
                <p className="text-slate-600">
                  {completedOrder.buyer.name}<br />
                  {completedOrder.buyer.address}<br />
                  {completedOrder.buyer.city}, {completedOrder.buyer.postalCode}<br />
                  {completedOrder.buyer.email}
                </p>
              </div>

              <div className="space-y-1 text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{formatPrice(completedOrder.subtotal, Math.round(completedOrder.subtotal / 83))}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18%):</span>
                  <span>{formatPrice(completedOrder.tax, Math.round(completedOrder.tax / 83))}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-[#0B132B] pt-2 border-t border-slate-200">
                  <span>Total Paid via PayPal:</span>
                  <span>{formatPrice(completedOrder.total, Math.round(completedOrder.total / 83))}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrintReceipt}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Invoice</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('orders')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
              >
                View Order History
              </button>
              <button
                onClick={() => setActiveView('catalog')}
                className="px-5 py-2.5 rounded-xl bg-[#0B132B] hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md"
              >
                Continue Shopping
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
