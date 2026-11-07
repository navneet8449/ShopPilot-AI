import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Cart, UserPreferences, Order } from '../types/index.ts';

interface AppContextType {
  activeView: 'home' | 'assistant' | 'catalog' | 'detail' | 'compare' | 'cart' | 'checkout' | 'orders' | 'profile' | 'risk';
  setActiveView: (view: 'home' | 'assistant' | 'catalog' | 'detail' | 'compare' | 'cart' | 'checkout' | 'orders' | 'profile' | 'risk') => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  cart: Cart;
  cartLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartQty: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  compareList: string[]; // product IDs
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  currency: 'INR' | 'USD';
  setCurrency: (c: 'INR' | 'USD') => void;
  formatPrice: (inr: number, usd: number) => string;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  userPreferences: UserPreferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  orders: Order[];
  refreshOrders: () => Promise<void>;
  initialChatPrompt: string | null;
  setInitialChatPrompt: (prompt: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<'home' | 'assistant' | 'catalog' | 'detail' | 'compare' | 'cart' | 'checkout' | 'orders' | 'profile' | 'risk'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | null>(null);

  const [compareList, setCompareList] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    currency: 'INR',
    budgetMax: 150000,
    primaryUsage: 'Programming & AI',
    favoriteBrands: ['Apple', 'ASUS', 'Sony', 'Google', 'Logitech']
  });

  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    currency: 'INR'
  });
  const [cartLoading, setCartLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const refreshCart = async () => {
    try {
      setCartLoading(true);
      const res = await fetch(`/api/cart?currency=${currency}`);
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    } finally {
      setCartLoading(false);
    }
  };

  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    }
  };

  useEffect(() => {
    refreshCart();
    refreshOrders();
  }, [currency]);

  const addToCart = async (productId: string, quantity = 1) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
        showToast(`Added to cart!`, 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add to cart', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const updateCartQty = async (productId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const res = await fetch(`/api/cart/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
        showToast('Item removed from cart', 'info');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch('/api/cart/clear', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
        showToast('Cart cleared', 'info');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addToCompare = (productId: string) => {
    if (compareList.includes(productId)) {
      showToast('Already added to comparison', 'info');
      return;
    }
    if (compareList.length >= 4) {
      showToast('You can compare at most 4 items at once', 'error');
      return;
    }
    setCompareList([...compareList, productId]);
    showToast('Added to comparison matrix', 'success');
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(compareList.filter(id => id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const formatPrice = (inr: number, usd: number) => {
    if (currency === 'USD') {
      return `$${usd.toLocaleString('en-US')}`;
    }
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedProductId,
        setSelectedProductId,
        cart,
        cartLoading,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        refreshCart,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        currency,
        setCurrency,
        formatPrice,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        toast,
        showToast,
        userPreferences,
        setUserPreferences,
        orders,
        refreshOrders,
        initialChatPrompt,
        setInitialChatPrompt
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
