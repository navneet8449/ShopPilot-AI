export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'laptops' | 'smartphones' | 'headphones' | 'monitors' | 'accessories';
  price: number; // in INR
  priceUSD: number; // in USD
  rating: number;
  reviewCount: number;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockCount: number;
  image: string;
  description: string;
  targetAudience: string[];
  specs: Record<string, string>;
  pros: string[];
  cons: string[];
  riskIndicators: {
    safetyScore: number; // 0 to 100 (100 = verified safe)
    riskLevel: 'Safe' | 'Low Risk' | 'Moderate' | 'Moderate Risk' | 'High Risk';
    verifiedSeller: boolean;
    returnPolicyDays: number;
    notes: string[];
  };
  productUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: 'INR' | 'USD';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  toolCalls?: {
    name: string;
    args: any;
    result?: any;
  }[];
  suggestedActions?: {
    label: string;
    action: string;
    payload?: any;
  }[];
  productCards?: Product[];
  comparisonData?: {
    products: Product[];
    verdict?: string;
    winnerId?: string;
    missing?: string[];
    focusCriteria?: string;
  };
  cartConfirmation?: {
    product: Product;
    quantity: number;
    action: 'add' | 'remove';
  };
  riskReport?: RiskAnalysisResult;
}

export interface RiskAnalysisResult {
  urlOrName: string;
  safetyScore?: number | null; // 0 - 100 or null when unverified
  riskLevel: 'Safe' | 'Low Risk' | 'Moderate' | 'Moderate Risk' | 'High Risk' | 'Unverified';
  unverified?: boolean;
  flags: {
    category: 'Price Anomaly' | 'Specification Check' | 'Domain & Link' | 'Seller Reputation';
    severity: 'pass' | 'warning' | 'alert';
    message: string;
  }[];
  marketMedianPrice?: number | null;
  priceDiscrepancyPercent?: number | null;
  verdict: string;
  recommendation: string;
}

export interface Order {
  id: string;
  paypalOrderId?: string;
  captureId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: 'INR' | 'USD';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  buyer: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
}

export interface UserPreferences {
  currency: 'INR' | 'USD';
  budgetMax: number;
  primaryUsage: 'Programming & AI' | 'Gaming' | 'Content Creation' | 'Business & Office' | 'Everyday & Student';
  favoriteBrands: string[];
}
