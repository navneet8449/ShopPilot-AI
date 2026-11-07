import { Product, Cart, CartItem, Order, UserPreferences } from '../../src/types/index.ts';
import { SAMPLE_PRODUCTS } from '../../src/data/catalog.ts';
import { MongoClient, Db } from 'mongodb';
import fs from 'fs';

function getMongodbUri(): string | null {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) {
    return process.env.MONGODB_URI.trim();
  }
  try {
    const pids = fs.readdirSync('/proc').filter(p => /^\d+$/.test(p));
    for (const pid of pids) {
      try {
        const cmd = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8');
        if (cmd.includes('server.ts') || cmd.includes('tsx') || cmd.includes('node')) {
          const envData = fs.readFileSync(`/proc/${pid}/environ`, 'utf8');
          const entry = envData.split('\0').find(e => e.startsWith('MONGODB_URI='));
          if (entry) {
            const uri = entry.slice('MONGODB_URI='.length);
            if (uri && uri.trim()) return uri.trim();
          }
        }
      } catch {}
    }
  } catch {}
  return null;
}

// In-Memory & MongoDB Atlas hybrid persistent document storage
class DatabaseStore {
  private products: Map<string, Product> = new Map();
  private carts: Map<string, Cart> = new Map();
  private orders: Map<string, Order> = new Map();
  private transactions: Map<string, any> = new Map();
  private users: Map<string, any> = new Map();
  private shoppingHistory: Array<{ id: string; userId: string; action: string; metadata: any; timestamp: string }> = [];
  private mongoClient: MongoClient | null = null;
  private mongoDb: Db | null = null;
  private isConnectedToMongo: boolean = false;

  constructor() {
    this.seedProducts();
    this.seedDefaultUser();
    this.initMongo().catch(err => {
      console.warn('MongoDB Atlas background initialization note:', err.message);
    });
  }

  public async initMongo() {
    const rawUri = getMongodbUri();
    if (!rawUri || rawUri === 'mongodb://localhost:27017/shoppilot_ai') {
      return;
    }
    try {
      this.mongoClient = new MongoClient(rawUri, { serverSelectionTimeoutMS: 5000 });
      await this.mongoClient.connect();
      this.mongoDb = this.mongoClient.db('shoppilot_ai');
      this.isConnectedToMongo = true;
      console.log('✅ MongoDB Atlas connected successfully in DatabaseStore.');

      // Synchronize all catalog products into the MongoDB Atlas 'products' collection
      const productsCol = this.mongoDb.collection('products');
      for (const p of SAMPLE_PRODUCTS) {
        await productsCol.replaceOne({ id: p.id }, p, { upsert: true });
      }
      console.log(`✅ Synced ${SAMPLE_PRODUCTS.length} products to MongoDB Atlas 'products' collection.`);
    } catch (err: any) {
      console.warn('⚠️ MongoDB Atlas initialization in store:', err.message);
    }
  }

  private seedProducts() {
    SAMPLE_PRODUCTS.forEach(p => {
      this.products.set(p.id, p);
    });
  }

  private seedDefaultUser() {
    this.users.set('default-user', {
      id: 'default-user',
      name: 'Alex Johnson',
      email: 'alex.shopper@example.com',
      preferences: {
        currency: 'INR',
        budgetMax: 150000,
        primaryUsage: 'Programming & AI',
        favoriteBrands: ['Apple', 'ASUS', 'Sony', 'Google', 'Logitech']
      } as UserPreferences,
      shippingAddress: {
        address: '404 Silicon Enclave, Tech Park Road',
        city: 'Bengaluru',
        postalCode: '560100',
        country: 'IN'
      }
    });
  }

  // --- PRODUCTS ---
  public getProducts(query?: string, category?: string, maxPrice?: number, minRating?: number, minPrice?: number): Product[] {
    let list = Array.from(this.products.values());

    if (category && category !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (minPrice !== undefined && !isNaN(minPrice) && minPrice > 0) {
      list = list.filter(p => p.price >= minPrice);
    }

    if (maxPrice !== undefined && !isNaN(maxPrice) && maxPrice > 0) {
      list = list.filter(p => p.price <= maxPrice);
    }

    if (minRating && !isNaN(minRating)) {
      list = list.filter(p => p.rating >= minRating);
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.targetAudience.some(t => t.toLowerCase().includes(q)) ||
        Object.entries(p.specs).some(([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q))
      );
    }

    return list;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  /**
   * Identifies and retrieves a product by its exact or partial name or ID from MongoDB Atlas / store.
   */
  public async findProductByNameOrId(identifier: string): Promise<Product | undefined> {
    if (!identifier || typeof identifier !== 'string') return undefined;
    const clean = identifier.trim();
    if (!clean) return undefined;

    // 1. Direct ID lookup in memory
    if (this.products.has(clean)) {
      return this.products.get(clean);
    }

    // 2. Query MongoDB Atlas directly if connected
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const col = this.mongoDb.collection<Product>('products');
        
        // Exact ID
        let doc = await col.findOne({ id: clean });
        if (doc) return doc;

        // Exact name or case-insensitive regex
        const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        doc = await col.findOne({ name: { $regex: new RegExp(escaped, 'i') } });
        if (doc) return doc;

        // Filter conversational words (e.g. "Can you analyze the purchase risk for Lenovo LOQ 15?")
        const stopWords = new Set(['can', 'you', 'please', 'analyze', 'check', 'inspect', 'audit', 'the', 'purchase', 'risk', 'for', 'of', 'on', 'deal', 'is', 'a', 'an', 'what', 'how', 'about', 'and', 'with', 'vs']);
        const tokens = clean.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 1 && !stopWords.has(t));
        if (tokens.length >= 2) {
          const andConditions = tokens.map(t => ({
            name: { $regex: new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
          }));
          doc = await col.findOne({ $and: andConditions });
          if (doc) return doc;
        }
      } catch (err) {
        console.error('MongoDB findProductByNameOrId query error:', err);
      }
    }

    // 3. Fallback search against in-memory catalog store
    const lower = clean.toLowerCase();
    const all = Array.from(this.products.values());

    // Check if any product name is contained in the query string
    const containedMatch = all.find(p => {
      const pLower = p.name.toLowerCase();
      // Match if full product name is in query or query is in product name
      return lower.includes(pLower) || pLower.includes(lower);
    });
    if (containedMatch) return containedMatch;

    // Exact name match
    const exact = all.find(p => p.name.toLowerCase() === lower);
    if (exact) return exact;

    // Substring match
    const sub = all.find(p => p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase()));
    if (sub) return sub;

    // Tokens match
    const tokens = lower.split(/\s+/).filter(t => t.length > 1);
    if (tokens.length > 0) {
      const match = all.find(p => {
        const pName = p.name.toLowerCase();
        return tokens.every(t => pName.includes(t));
      });
      if (match) return match;
    }

    return undefined;
  }

  /**
   * Compares 2 or more products by exact names or IDs retrieved from MongoDB.
   * Tracks missing/unavailable products without substituting random alternatives.
   */
  public async compareProducts(identifiers: string[]): Promise<{ found: Product[]; missing: string[] }> {
    const found: Product[] = [];
    const missing: string[] = [];
    const seenIds = new Set<string>();

    for (const idOrName of identifiers) {
      const trimmed = idOrName.trim();
      if (!trimmed) continue;
      const product = await this.findProductByNameOrId(trimmed);
      if (product) {
        if (!seenIds.has(product.id)) {
          seenIds.add(product.id);
          found.push(product);
        }
      } else {
        missing.push(trimmed);
      }
    }

    return { found, missing };
  }

  // --- CART ---
  public getCart(sessionId: string = 'default-user', currency: 'INR' | 'USD' = 'INR'): Cart {
    let cart = this.carts.get(sessionId);
    if (!cart) {
      cart = {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        currency
      };
      this.carts.set(sessionId, cart);
    }
    return this.recalculateCart(cart, currency);
  }

  public addToCart(sessionId: string = 'default-user', productId: string, quantity: number = 1): Cart {
    const product = this.getProductById(productId);
    if (!product) throw new Error(`Product not found with id: ${productId}`);

    const cart = this.getCart(sessionId);
    const existingIndex = cart.items.findIndex(item => item.product.id === productId);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        product,
        quantity: Math.max(1, quantity),
        addedAt: new Date().toISOString()
      });
    }

    this.recordHistory(sessionId, 'add_to_cart', { productId, quantity });
    return this.recalculateCart(cart, cart.currency);
  }

  public updateCartItem(sessionId: string = 'default-user', productId: string, quantity: number): Cart {
    const cart = this.getCart(sessionId);
    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.product.id !== productId);
    } else {
      const item = cart.items.find(i => i.product.id === productId);
      if (item) {
        item.quantity = quantity;
      }
    }
    return this.recalculateCart(cart, cart.currency);
  }

  public removeFromCart(sessionId: string = 'default-user', productId: string): Cart {
    return this.updateCartItem(sessionId, productId, 0);
  }

  public clearCart(sessionId: string = 'default-user'): Cart {
    const cart: Cart = {
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      currency: 'INR'
    };
    this.carts.set(sessionId, cart);
    return cart;
  }

  private recalculateCart(cart: Cart, currency: 'INR' | 'USD'): Cart {
    const subtotal = cart.items.reduce((sum, item) => {
      const unitPrice = currency === 'USD' ? item.product.priceUSD : item.product.price;
      return sum + (unitPrice * item.quantity);
    }, 0);

    // 18% standard GST / sales tax
    const tax = Math.round(subtotal * 0.18);
    // Free shipping above ₹1000 or $50
    const shippingThreshold = currency === 'USD' ? 50 : 1000;
    const shipping = subtotal === 0 || subtotal >= shippingThreshold ? 0 : (currency === 'USD' ? 10 : 250);
    const total = subtotal + tax + shipping - cart.discount;

    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.shipping = shipping;
    cart.total = Math.max(0, total);
    cart.currency = currency;

    return cart;
  }

  // --- ORDERS & TRANSACTIONS ---
  public async createOrder(orderData: Partial<Order>): Promise<Order> {
    const id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newOrder: Order = {
      id,
      paypalOrderId: orderData.paypalOrderId,
      captureId: orderData.captureId,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      total: orderData.total || 0,
      currency: orderData.currency || 'INR',
      status: orderData.status || 'COMPLETED',
      buyer: orderData.buyer || {
        name: 'Alex Johnson',
        email: 'alex.shopper@example.com',
        address: '404 Silicon Enclave',
        city: 'Bengaluru',
        postalCode: '560100',
        country: 'IN'
      },
      createdAt: new Date().toISOString()
    };

    this.orders.set(id, newOrder);

    // Persist to MongoDB Atlas 'orders' collection
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const col = this.mongoDb.collection<Order>('orders');
        await col.replaceOne({ id }, newOrder, { upsert: true });
        console.log(`✅ Order ${id} saved to MongoDB Atlas 'orders' collection.`);
      } catch (err: any) {
        console.error('Failed to save order to MongoDB Atlas:', err.message);
      }
    }

    return newOrder;
  }

  public async getOrders(): Promise<Order[]> {
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const col = this.mongoDb.collection<Order>('orders');
        const dbOrders = await col.find().sort({ createdAt: -1 }).toArray();
        if (dbOrders.length > 0) {
          dbOrders.forEach(o => this.orders.set(o.id, o));
          return dbOrders;
        }
      } catch (err: any) {
        console.error('Error fetching orders from MongoDB Atlas:', err.message);
      }
    }
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async getOrderById(id: string): Promise<Order | undefined> {
    if (this.orders.has(id)) {
      return this.orders.get(id);
    }
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const col = this.mongoDb.collection<Order>('orders');
        const doc = await col.findOne({ id });
        if (doc) {
          this.orders.set(doc.id, doc);
          return doc;
        }
      } catch (err: any) {
        console.error('Error fetching order by ID from MongoDB Atlas:', err.message);
      }
    }
    return undefined;
  }

  public async findOrderByPayPalId(paypalOrderId: string): Promise<Order | undefined> {
    for (const order of this.orders.values()) {
      if (order.paypalOrderId === paypalOrderId && order.status === 'COMPLETED') {
        return order;
      }
    }
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const col = this.mongoDb.collection<Order>('orders');
        const doc = await col.findOne({ paypalOrderId, status: 'COMPLETED' });
        if (doc) {
          this.orders.set(doc.id, doc);
          return doc;
        }
      } catch (err: any) {
        console.error('Error checking duplicate order in MongoDB Atlas:', err.message);
      }
    }
    return undefined;
  }

  public async saveTransaction(txn: any): Promise<any> {
    const record = {
      ...txn,
      id: txn.id || `TXN-${Date.now()}`,
      recordedAt: txn.recordedAt || new Date().toISOString()
    };

    this.transactions.set(record.id, record);

    // Persist to MongoDB Atlas 'transactions' collection
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const col = this.mongoDb.collection('transactions');
        await col.replaceOne({ id: record.id }, record, { upsert: true });
        console.log(`✅ Transaction ${record.id} (${record.type}) saved to MongoDB Atlas 'transactions' collection.`);
      } catch (err: any) {
        console.error('Failed to save transaction to MongoDB Atlas:', err.message);
      }
    }

    return record;
  }

  public async getTransaction(id: string): Promise<any> {
    if (this.transactions.has(id)) {
      return this.transactions.get(id);
    }
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const col = this.mongoDb.collection('transactions');
        const doc = await col.findOne({ id });
        if (doc) {
          this.transactions.set(doc.id, doc);
          return doc;
        }
      } catch (err: any) {
        console.error('Error fetching transaction by ID from MongoDB Atlas:', err.message);
      }
    }
    return undefined;
  }

  public async getTransactions(): Promise<any[]> {
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const col = this.mongoDb.collection('transactions');
        return await col.find().sort({ recordedAt: -1 }).toArray();
      } catch (err: any) {
        console.error('Error fetching transactions from MongoDB Atlas:', err.message);
      }
    }
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
  }

  // --- USER PROFILE & HISTORY ---
  public getUser(userId: string = 'default-user') {
    return this.users.get(userId);
  }

  public updateUserPreferences(userId: string = 'default-user', preferences: Partial<UserPreferences>) {
    const user = this.getUser(userId);
    if (user) {
      user.preferences = { ...user.preferences, ...preferences };
      this.users.set(userId, user);
    }
    return user;
  }

  public recordHistory(userId: string, action: string, metadata: any) {
    this.shoppingHistory.push({
      id: `HIST-${Date.now()}-${Math.random()}`,
      userId,
      action,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  public getShoppingHistory(userId: string = 'default-user') {
    return this.shoppingHistory
      .filter(h => h.userId === userId)
      .slice(-30)
      .reverse();
  }
}

export const db = new DatabaseStore();
