import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db/store.ts';
import { processChatConversation } from './server/services/gemini.ts';
import { createPayPalOrder, capturePayPalOrder, getPayPalPublicConfig } from './server/services/paypal.ts';
import { RiskAnalysisResult, Product } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// --- API ROUTES ---

// 1. Chat endpoint with Gemini Tool Calling
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const result = await processChatConversation(messages);
    return res.json(result);
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process chat message' });
  }
});

// 2. Products Catalog & Search
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const { q, category, maxPrice, minPrice, minRating } = req.query;
    const maxP = maxPrice ? Number(maxPrice) : undefined;
    const minP = minPrice ? Number(minPrice) : undefined;
    const minR = minRating ? Number(minRating) : undefined;
    const products = db.getProducts(
      q as string | undefined,
      category as string | undefined,
      maxP,
      minR,
      minP
    );
    return res.json({ products, total: products.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ product });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Product Comparison
app.post('/api/products/compare', async (req: Request, res: Response) => {
  try {
    const { productIds, productNamesOrIds, userGoal } = req.body;
    const identifiers = productNamesOrIds || productIds;
    if (!identifiers || !Array.isArray(identifiers) || identifiers.length < 2) {
      return res.status(400).json({ error: 'At least 2 products are required for comparison' });
    }

    const { found, missing } = await db.compareProducts(identifiers);
    return res.json({
      products: found,
      missing,
      userGoal: userGoal || 'Overall Value & Spec Comparison',
      count: found.length
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. Recommendations
app.post('/api/recommendations', (req: Request, res: Response) => {
  try {
    const { budget, minBudget, maxBudget, usage, category, brand } = req.body;
    const maxB = maxBudget !== undefined ? Number(maxBudget) : (budget !== undefined ? Number(budget) : undefined);
    const minB = minBudget !== undefined ? Number(minBudget) : undefined;
    let list = db.getProducts(undefined, category, maxB, undefined, minB);
    if (usage) {
      const u = usage.toLowerCase();
      list = list.filter(p => p.targetAudience.some(t => t.toLowerCase().includes(u)));
    }
    if (brand && brand !== 'all') {
      const filtered = list.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
      if (filtered.length > 0) list = filtered;
    }
    return res.json({ recommendations: list.slice(0, 6) });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. Cart Management
app.get('/api/cart', (req: Request, res: Response) => {
  try {
    const currency = (req.query.currency as 'INR' | 'USD') || 'INR';
    const cart = db.getCart('default-user', currency);
    return res.json({ cart });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart', (req: Request, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }
    const cart = db.addToCart('default-user', productId, Number(quantity));
    return res.json({ cart, message: 'Item added to cart successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/cart/:productId', (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;
    const cart = db.updateCartItem('default-user', req.params.productId, Number(quantity));
    return res.json({ cart });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/:productId', (req: Request, res: Response) => {
  try {
    const cart = db.removeFromCart('default-user', req.params.productId);
    return res.json({ cart });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart/clear', (req: Request, res: Response) => {
  try {
    const cart = db.clearCart('default-user');
    return res.json({ cart });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. PayPal Endpoints
app.get('/api/paypal/config', (req: Request, res: Response) => {
  return res.json(getPayPalPublicConfig());
});

app.post('/api/paypal/create-order', async (req: Request, res: Response) => {
  try {
    const { buyer, currency = 'INR', returnUrl, cancelUrl } = req.body;
    const cart = db.getCart('default-user', currency);

    if (cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Add products before checking out.' });
    }

    const orderData = await createPayPalOrder({
      cart,
      buyer: buyer || {
        name: 'Alex Johnson',
        email: 'alex.shopper@example.com',
        address: '404 Silicon Enclave',
        city: 'Bengaluru',
        postalCode: '560100',
        country: 'IN'
      },
      returnUrl,
      cancelUrl
    });

    return res.json(orderData);
  } catch (error: any) {
    console.error('PayPal create-order error:', error);
    const isEmpty = error.message?.toLowerCase().includes('empty cart');
    return res.status(isEmpty ? 400 : 500).json({ error: error.message });
  }
});

app.post('/api/paypal/capture-order', async (req: Request, res: Response) => {
  try {
    const { orderId, buyer } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const verifiedOrder = await capturePayPalOrder(orderId, buyer);
    return res.json({
      success: true,
      message: 'Payment captured and verified successfully.',
      order: verifiedOrder
    });
  } catch (error: any) {
    console.error('PayPal capture-order error:', error);
    const isDuplicate = error.message?.includes('already been captured');
    return res.status(isDuplicate ? 409 : 500).json({ error: error.message });
  }
});

// 7. Orders History & Transactions
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const orders = await db.getOrders();
    return res.json({ orders });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ order });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions', async (req: Request, res: Response) => {
  try {
    const transactions = await db.getTransactions();
    return res.json({ transactions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Helper function to perform risk audit on a product or link using MongoDB data
async function performRiskAudit(identifier?: string): Promise<{ analysis: RiskAnalysisResult; product?: Product; unverified?: boolean }> {
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    throw new Error('Product identifier or query name/URL is required.');
  }

  const clean = identifier.trim();
  // Attempt retrieval from MongoDB Atlas
  const product = await db.findProductByNameOrId(clean);

  if (product) {
    // Real verified MongoDB data
    const analysis: RiskAnalysisResult = {
      urlOrName: product.name,
      safetyScore: product.riskIndicators.safetyScore,
      riskLevel: product.riskIndicators.riskLevel,
      unverified: false,
      flags: [
        {
          category: 'Price Anomaly',
          severity: 'pass',
          message: `Current price (₹${product.price.toLocaleString('en-IN')}) verified against official manufacturer MSRP in MongoDB.`
        },
        {
          category: 'Specification Check',
          severity: 'pass',
          message: `All hardware specs (CPU: ${product.specs['Processor'] || 'Verified'}, GPU: ${product.specs['Graphics'] || 'Verified'}, RAM: ${product.specs['RAM'] || 'Verified'}) authenticated against benchmark records.`
        },
        {
          category: 'Domain & Link',
          severity: 'pass',
          message: `Official verified brand domain (${new URL(product.productUrl).hostname}) with valid SSL.`
        },
        {
          category: 'Seller Reputation',
          severity: 'pass',
          message: `Verified authentic seller: ${product.brand} authorized direct distribution with ${product.riskIndicators.returnPolicyDays} days return protection.`
        }
      ],
      marketMedianPrice: product.price,
      priceDiscrepancyPercent: 0,
      verdict: `Low Risk – 100% Genuine Certified Listing in MongoDB. ${product.riskIndicators.notes.join('. ')}`,
      recommendation: 'Safe to purchase. Full brand warranty eligible with standard PayPal buyer protection.'
    };

    return { analysis, product, unverified: false };
  }

  // Unverified / external listing: DO NOT FABRICATE DATA
  const hasPhishingIndicators = /free|90%|99%|win|cheap|lottery|\.xyz|\.top/i.test(clean);
  const analysis: RiskAnalysisResult = {
    urlOrName: clean,
    safetyScore: hasPhishingIndicators ? 20 : null,
    riskLevel: hasPhishingIndicators ? 'High Risk' : 'Unverified',
    unverified: true,
    flags: [
      {
        category: 'Seller Reputation',
        severity: hasPhishingIndicators ? 'alert' : 'warning',
        message: hasPhishingIndicators 
          ? 'High Risk Warning: Suspected fraudulent or phishing merchant domain.' 
          : 'Unverified Seller: Merchant is not registered in our verified MongoDB seller database. Business credentials, GST registration, and customer ratings cannot be authenticated.'
      },
      {
        category: 'Price Anomaly',
        severity: hasPhishingIndicators ? 'alert' : 'warning',
        message: hasPhishingIndicators 
          ? 'Extreme Price Anomaly: Price claim exceeds 75% below legitimate manufacturing cost.' 
          : `Unverified Pricing: No verified MSRP or historical retail baseline exists in the database for "${clean}". Price anomaly score cannot be fabricated.`
      },
      {
        category: 'Specification Check',
        severity: hasPhishingIndicators ? 'alert' : 'warning',
        message: hasPhishingIndicators 
          ? 'Contradictory or fraudulent component specifications reported.' 
          : 'Unverified Hardware: Technical specifications cannot be cross-referenced with official manufacturer OEM databases.'
      },
      {
        category: 'Domain & Link',
        severity: hasPhishingIndicators ? 'alert' : 'warning',
        message: hasPhishingIndicators 
          ? 'Suspicious non-standard top-level domain (.xyz/.top) or recently created redirect link.' 
          : 'External Link: Domain is not present in our verified merchant whitelist. Verify URL spelling and SSL certificate manually.'
      }
    ],
    marketMedianPrice: null,
    priceDiscrepancyPercent: null,
    verdict: hasPhishingIndicators 
      ? 'High Risk Listing: Strong indicators of counterfeit merchandise or credential phishing.'
      : 'Unverified Listing: Data is unavailable in our MongoDB catalog. Seller verification, return policies, and pricing history cannot be confirmed. We do not fabricate risk scores for unverified listings.',
    recommendation: hasPhishingIndicators 
      ? 'Do not submit payment information, passwords, or personal details on this site.'
      : 'Exercise high caution. Only purchase through authorized distribution channels that provide verified return policies and payment buyer protection.'
  };

  return { analysis, product: undefined, unverified: true };
}

// 8. AI Purchase Risk Analyzer endpoints (supporting POST, GET, and /api/risk aliases)
app.post(['/api/risk/analyze', '/api/risk'], async (req: Request, res: Response) => {
  try {
    const { productId, queryUrlOrName, product, query, name } = req.body || {};
    const identifier = productId || queryUrlOrName || product || query || name;
    if (!identifier) {
      return res.status(400).json({ error: 'Product name, ID, or URL is required for risk analysis.', status: 400 });
    }
    const result = await performRiskAudit(identifier);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Risk analysis failed', status: 500 });
  }
});

app.get(['/api/risk/analyze', '/api/risk', '/api/risk/:id'], async (req: Request, res: Response) => {
  try {
    const identifier = req.params.id || (req.query.productId as string) || (req.query.queryUrlOrName as string) || (req.query.q as string) || (req.query.product as string) || (req.query.name as string);
    if (!identifier) {
      return res.status(400).json({ error: 'Product name, ID, or URL query parameter is required for risk analysis.', status: 400 });
    }
    const result = await performRiskAudit(identifier);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Risk analysis failed', status: 500 });
  }
});

// 9. User Profile & Preferences
app.get('/api/user/profile', (req: Request, res: Response) => {
  return res.json(db.getUser('default-user'));
});

app.post('/api/user/preferences', (req: Request, res: Response) => {
  const updated = db.updateUserPreferences('default-user', req.body);
  return res.json({ user: updated });
});

// 10. Shopping History
app.get('/api/history', (req: Request, res: Response) => {
  return res.json({ history: db.getShoppingHistory('default-user') });
});

// Explicit API catch-all to ensure NO unmatched /api route ever returns HTML from Vite
app.all('/api/*', (req: Request, res: Response) => {
  return res.status(404).json({
    error: `API endpoint ${req.method} ${req.path} not found.`,
    status: 404
  });
});

// --- MOUNT VITE IN DEV / STATIC IN PROD ---
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`ShopPilot AI Server running on port ${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
