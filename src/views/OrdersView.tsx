import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  Printer, 
  ShoppingBag, 
  ArrowRight,
  ShieldCheck,
  Package
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, refreshOrders, formatPrice, setActiveView } = useApp();

  useEffect(() => {
    refreshOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Order History & Transactions
            </h1>
            <p className="text-xs text-slate-500">
              Archived orders verified with PayPal Orders API v2 & MongoDB records.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('catalog')}
          className="px-4 py-2 rounded-xl bg-[#0B132B] hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
        >
          Explore More Products
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No previous orders found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once you checkout with PayPal Sandbox, your permanent order invoice and capture ID will be recorded here.
            </p>
          </div>
          <button
            onClick={() => setActiveView('catalog')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div 
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6"
            >
              {/* Order Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{order.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{order.status}</span>
                    </span>
                  </div>
                  <div className="text-slate-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {order.paypalOrderId && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">
                        PayPal Order ID
                      </span>
                      <span className="font-mono font-semibold text-slate-700">
                        {order.paypalOrderId}
                      </span>
                    </div>
                  )}
                  {order.captureId && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">
                        Capture ID
                      </span>
                      <span className="font-mono font-semibold text-[#0070BA]">
                        {order.captureId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Purchased Items ({order.items.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.map(item => (
                    <div 
                      key={item.product.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-xs"
                    >
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase block">{item.product.brand}</span>
                        <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                        <div className="text-slate-500">
                          {item.quantity} unit{item.quantity > 1 ? 's' : ''} • {formatPrice(item.product.price, item.product.priceUSD)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Footer & Total */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="text-slate-500">
                  Delivered to <strong className="text-slate-800">{order.buyer.name}</strong>, {order.buyer.city}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Grand Total Paid:</span>
                    <span className="text-base font-extrabold text-[#0B132B]">
                      {formatPrice(order.total, Math.round(order.total / 83))}
                    </span>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
