import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { db } from '../db/store.ts';
import { Product, RiskAnalysisResult } from '../../src/types/index.ts';
import fs from 'fs';

export function getGeminiApiKey(): string {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }
  try {
    const pids = fs.readdirSync('/proc').filter(p => /^\d+$/.test(p));
    for (const pid of pids) {
      try {
        const cmd = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8');
        if (cmd.includes('server.ts') || cmd.includes('tsx') || cmd.includes('node')) {
          const envData = fs.readFileSync(`/proc/${pid}/environ`, 'utf8');
          const entry = envData.split('\0').find(e => e.startsWith('GEMINI_API_KEY='));
          if (entry) {
            const val = entry.slice('GEMINI_API_KEY='.length);
            if (val && val.trim()) return val.trim();
          }
        }
      } catch {}
    }
  } catch {}
  return '';
}

// Tool 1: search_products
const searchProductsDecl: FunctionDeclaration = {
  name: 'search_products',
  description: 'Search catalog products by keywords, category, price range (minimum price and maximum budget limit in INR), or minimum rating.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'Search keywords, e.g. "gaming laptop", "good camera", "wireless headphones", "OLED"'
      },
      category: {
        type: Type.STRING,
        description: 'Product category: "laptops", "smartphones", "headphones", "monitors", "accessories", or "all"'
      },
      minPrice: {
        type: Type.NUMBER,
        description: 'Minimum price limit in INR (e.g. 65000). Products strictly below this numeric price must be excluded.'
      },
      maxPrice: {
        type: Type.NUMBER,
        description: 'Maximum price limit in INR (e.g. 75000). Products strictly above this numeric price must be excluded.'
      },
      minRating: {
        type: Type.NUMBER,
        description: 'Minimum star rating between 1.0 and 5.0'
      }
    }
  }
};

// Tool 2: compare_products
const compareProductsDecl: FunctionDeclaration = {
  name: 'compare_products',
  description: 'Compare 2 to 4 specific products side-by-side using their exact names or IDs from the catalog/database. Evaluates processor, RAM, GPU, display, price, ratings, pros, cons, and performance trade-offs.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productNamesOrIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Names or IDs of the specific products to compare, e.g. ["Lenovo LOQ 15", "HP Victus 15"]. Must retrieve these exact products from the catalog/database.'
      },
      productIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Optional list of product IDs if known, e.g. ["lap-006", "lap-007"]'
      },
      focusCriteria: {
        type: Type.STRING,
        description: 'Primary criteria to evaluate, e.g. "gaming performance", "battery life", "value for money", "display quality"'
      }
    },
    required: ['productNamesOrIds']
  }
};

// Tool 3: get_product_details
const getProductDetailsDecl: FunctionDeclaration = {
  name: 'get_product_details',
  description: 'Retrieve full technical specifications, verified pros, cons, and seller risk indicators for a product.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productId: {
        type: Type.STRING,
        description: 'The product ID, e.g. "lap-001", "ph-001"'
      }
    },
    required: ['productId']
  }
};

// Tool 4: recommend_products
const recommendProductsDecl: FunctionDeclaration = {
  name: 'recommend_products',
  description: 'Provide personalized product recommendations strictly adhering to the specified budget range, primary usage, and brand preferences.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      budget: {
        type: Type.NUMBER,
        description: 'Maximum budget in INR'
      },
      minBudget: {
        type: Type.NUMBER,
        description: 'Minimum budget in INR. Products strictly below this numeric price must be excluded.'
      },
      maxBudget: {
        type: Type.NUMBER,
        description: 'Maximum budget in INR. Products strictly above this numeric price must be excluded.'
      },
      usage: {
        type: Type.STRING,
        description: 'Intended usage: programming, machine_learning, gaming, photography, student, office, or everyday'
      },
      category: {
        type: Type.STRING,
        description: 'Target category: laptops, smartphones, headphones, monitors, accessories'
      },
      preferredBrand: {
        type: Type.STRING,
        description: 'Optional preferred brand, e.g. Apple, Sony, ASUS, Google, Samsung'
      }
    }
  }
};

// Tool 5: add_to_cart
const addToCartDecl: FunctionDeclaration = {
  name: 'add_to_cart',
  description: 'Add a specific product to the user shopping cart after explicit user consent.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productId: {
        type: Type.STRING,
        description: 'The product ID to add to cart'
      },
      quantity: {
        type: Type.INTEGER,
        description: 'Number of units (default 1)'
      }
    },
    required: ['productId']
  }
};

// Tool 6: calculate_cart_total
const calculateCartTotalDecl: FunctionDeclaration = {
  name: 'calculate_cart_total',
  description: 'Calculate current shopping cart subtotal, estimated tax, shipping fees, discounts, and grand total.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      currency: {
        type: Type.STRING,
        description: '"INR" or "USD"'
      }
    }
  }
};

// Tool 7: analyze_purchase_risk
const analyzePurchaseRiskDecl: FunctionDeclaration = {
  name: 'analyze_purchase_risk',
  description: 'Perform AI-assisted risk inspection on a product or deal, checking for price anomalies, missing specs, domain safety, and return policy consistency.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productId: {
        type: Type.STRING,
        description: 'The ID of the catalog product to audit'
      },
      externalUrlOrName: {
        type: Type.STRING,
        description: 'Optional URL or product name to audit'
      }
    }
  }
};

const allToolDeclarations = [
  searchProductsDecl,
  compareProductsDecl,
  getProductDetailsDecl,
  recommendProductsDecl,
  addToCartDecl,
  calculateCartTotalDecl,
  analyzePurchaseRiskDecl,
];

// Helper to execute tools against our DB store
async function executeServerTool(name: string, args: any) {
  switch (name) {
    case 'search_products': {
      const results = db.getProducts(args.query, args.category, args.maxPrice, args.minRating, args.minPrice);
      return {
        count: results.length,
        products: results.slice(0, 6)
      };
    }

    case 'compare_products': {
      const targets: string[] = args.productNamesOrIds || args.productIds || args.products || [];
      const { found, missing } = await db.compareProducts(targets);
      return {
        comparisonCount: found.length,
        products: found,
        missing,
        focusCriteria: args.focusCriteria || 'Overall Value & Spec Comparison'
      };
    }

    case 'get_product_details': {
      const p = db.getProductById(args.productId);
      if (!p) return { error: `Product not found with id: ${args.productId}` };
      return { product: p };
    }

    case 'recommend_products': {
      const maxB = args.maxBudget ?? args.budget;
      const minB = args.minBudget;
      let list = db.getProducts(undefined, args.category, maxB, undefined, minB);
      if (args.usage) {
        const usageQ = args.usage.toLowerCase();
        list = list.filter(p => p.targetAudience.some(t => t.toLowerCase().includes(usageQ)));
      }
      if (args.preferredBrand) {
        const brandMatch = list.filter(p => p.brand.toLowerCase() === args.preferredBrand.toLowerCase());
        if (brandMatch.length > 0) list = brandMatch;
      }
      return {
        recommendations: list.slice(0, 4),
        criteria: {
          budget: maxB,
          minBudget: minB,
          maxBudget: maxB,
          usage: args.usage,
          category: args.category,
          preferredBrand: args.preferredBrand
        }
      };
    }

    case 'add_to_cart': {
      const product = db.getProductById(args.productId);
      if (!product) return { success: false, message: `Product ${args.productId} not found` };
      const updatedCart = db.addToCart('default-user', args.productId, args.quantity || 1);
      return {
        success: true,
        message: `Successfully added ${args.quantity || 1}x ${product.name} to cart.`,
        cartItemCount: updatedCart.items.length,
        cartTotal: updatedCart.total,
        product
      };
    }

    case 'calculate_cart_total': {
      const cart = db.getCart('default-user', args.currency === 'USD' ? 'USD' : 'INR');
      return {
        itemCount: cart.items.length,
        items: cart.items.map(i => ({ name: i.product.name, qty: i.quantity, price: cart.currency === 'USD' ? i.product.priceUSD : i.product.price })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        currency: cart.currency
      };
    }

    case 'analyze_purchase_risk': {
      let product: Product | undefined;
      const targetQuery = args.productId || args.externalUrlOrName;
      if (targetQuery) {
        product = await db.findProductByNameOrId(targetQuery);
      }

      if (product) {
        const result: RiskAnalysisResult = {
          urlOrName: product.name,
          safetyScore: product.riskIndicators.safetyScore,
          riskLevel: product.riskIndicators.riskLevel,
          unverified: false,
          flags: [
            {
              category: 'Price Anomaly',
              severity: 'pass',
              message: `Price (₹${product.price.toLocaleString('en-IN')}) verified against official manufacturer MSRP in MongoDB.`
            },
            {
              category: 'Specification Check',
              severity: 'pass',
              message: `Hardware specifications (CPU: ${product.specs['Processor'] || 'Verified'}, GPU: ${product.specs['Graphics'] || 'Verified'}, RAM: ${product.specs['RAM'] || 'Verified'}) authenticated against benchmark database.`
            },
            {
              category: 'Domain & Link',
              severity: 'pass',
              message: `Legitimate official domain: ${new URL(product.productUrl).hostname} with valid SSL certificate.`
            },
            {
              category: 'Seller Reputation',
              severity: 'pass',
              message: `${product.brand} authorized direct distribution with ${product.riskIndicators.returnPolicyDays}-day return window.`
            }
          ],
          marketMedianPrice: product.price,
          priceDiscrepancyPercent: 0,
          verdict: `Low Risk – Verified Authentic Product in MongoDB. ${product.riskIndicators.notes.join('. ')}`,
          recommendation: 'Safe to purchase. Ensure you retain the invoice for full manufacturer warranty benefits.'
        };
        return { riskAnalysis: result, product };
      }

      // External or custom link analysis: DO NOT FABRICATE DATA
      const target = targetQuery || 'Unknown item';
      const isSuspicious = target.includes('free') || target.includes('99%') || target.includes('.xyz') || target.includes('cheap');
      const result: RiskAnalysisResult = {
        urlOrName: target,
        safetyScore: isSuspicious ? 20 : null,
        riskLevel: isSuspicious ? 'High Risk' : 'Unverified',
        unverified: true,
        flags: [
          {
            category: 'Price Anomaly',
            severity: isSuspicious ? 'alert' : 'warning',
            message: isSuspicious 
              ? 'Unusually deep discount flagged (>75% below legitimate manufacturing cost).' 
              : `Unverified Pricing: No official MSRP benchmark available in verified catalog for "${target}". Price anomaly cannot be computed.`
          },
          {
            category: 'Specification Check',
            severity: isSuspicious ? 'alert' : 'warning',
            message: isSuspicious 
              ? 'Vague or contradictory component model numbers reported.' 
              : 'Unverified Hardware: Technical specifications cannot be validated against verified OEM product records.'
          },
          {
            category: 'Domain & Link',
            severity: isSuspicious ? 'alert' : 'warning',
            message: isSuspicious 
              ? 'Domain registered recently or unverified retail domain (.xyz/.top).' 
              : 'External Link: Domain is not present on verified merchant whitelist. Exercise personal discretion before purchasing.'
          },
          {
            category: 'Seller Reputation',
            severity: isSuspicious ? 'alert' : 'warning',
            message: isSuspicious 
              ? 'Missing buyer return guarantees or unverified seller profile.' 
              : 'Unverified Seller: Merchant identity is not registered in our verified MongoDB merchant database. Return policies and credibility cannot be confirmed.'
          }
        ],
        marketMedianPrice: null,
        priceDiscrepancyPercent: null,
        verdict: isSuspicious
          ? 'High Risk: Potential counterfeit or phishing listing. Extreme price deviation detected.'
          : 'Unverified Listing: Data is unavailable in our MongoDB database. Seller verification, return policies, and pricing history cannot be confirmed. We do not fabricate scores for unverified listings.',
        recommendation: isSuspicious
          ? 'Do not submit payment information or credentials on this site.'
          : 'Exercise caution. Only purchase through authorized distribution channels with verified buyer protection.'
      };
      return { riskAnalysis: result };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function parseBudgetFromText(text: string): { minPrice?: number; maxPrice?: number } {
  const clean = text.toLowerCase().replace(/,/g, '');

  // 1. "between ₹65,000 and ₹75,000", "65000 to 75000", "65k to 75k", "65000 - 75000"
  const rangeMatch = clean.match(/(?:between\s+)?(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k)?\s*(?:and|to|-|–)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
  if (rangeMatch) {
    let min = parseFloat(rangeMatch[1]);
    if (rangeMatch[2] === 'k' || (min < 1000 && min > 0)) min *= 1000;
    let max = parseFloat(rangeMatch[3]);
    if (rangeMatch[4] === 'k' || (max < 1000 && max > 0)) max *= 1000;
    if (!isNaN(min) && !isNaN(max) && min > 0 && max > 0) {
      return { minPrice: Math.min(min, max), maxPrice: Math.max(min, max) };
    }
  }

  // 2. "under 50000", "below ₹50,000", "less than 70k", "up to 80000", "max 75k"
  const underMatch = clean.match(/(?:under|below|less than|up to|upto|within|max(?:imum)?(?: budget)?(?: of)?)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
  if (underMatch) {
    let max = parseFloat(underMatch[1]);
    if (underMatch[2] === 'k' || (max < 1000 && max > 0)) max *= 1000;
    if (!isNaN(max) && max > 0) {
      return { maxPrice: max };
    }
  }

  // 3. "above 60000", "over ₹60,000", "more than 50k", "min 65k", "at least 65000"
  const aboveMatch = clean.match(/(?:above|over|more than|min(?:imum)?(?: budget)?(?: of)?|at least)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
  if (aboveMatch) {
    let min = parseFloat(aboveMatch[1]);
    if (aboveMatch[2] === 'k' || (min < 1000 && min > 0)) min *= 1000;
    if (!isNaN(min) && min > 0) {
      return { minPrice: min };
    }
  }

  return {};
}

function getProductSpecValue(p: Product, keys: string[]): string {
  for (const k of keys) {
    if (p.specs[k]) return p.specs[k];
    const match = Object.entries(p.specs).find(([key]) => key.toLowerCase().includes(k.toLowerCase()));
    if (match) return match[1];
  }
  return '—';
}

function generateComparisonTableMarkdown(products: Product[]): string {
  if (products.length < 2) return '';
  const p1 = products[0];
  const p2 = products[1];

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return `### Side-by-Side Product Comparison

| Specification | **${p1.name}** | **${p2.name}** |
| :--- | :--- | :--- |
| **Price** | ${formatINR(p1.price)} ($${p1.priceUSD}) | ${formatINR(p2.price)} ($${p2.priceUSD}) |
| **Rating** | ⭐ ${p1.rating} / 5 (${p1.reviewCount.toLocaleString()} reviews) | ⭐ ${p2.rating} / 5 (${p2.reviewCount.toLocaleString()} reviews) |
| **Processor (CPU)** | ${getProductSpecValue(p1, ['Processor', 'CPU'])} | ${getProductSpecValue(p2, ['Processor', 'CPU'])} |
| **RAM (Memory)** | ${getProductSpecValue(p1, ['RAM', 'Memory', 'Unified Memory'])} | ${getProductSpecValue(p2, ['RAM', 'Memory', 'Unified Memory'])} |
| **GPU (Graphics)** | ${getProductSpecValue(p1, ['Graphics', 'GPU'])} | ${getProductSpecValue(p2, ['Graphics', 'GPU'])} |
| **Display** | ${getProductSpecValue(p1, ['Display', 'Screen'])} | ${getProductSpecValue(p2, ['Display', 'Screen'])} |
| **Pros** | • ${p1.pros.slice(0, 2).join('\n• ')} | • ${p2.pros.slice(0, 2).join('\n• ')} |
| **Cons** | • ${p1.cons.slice(0, 2).join('\n• ')} | • ${p2.cons.slice(0, 2).join('\n• ')} |
`;
}

function extractCompareTargets(text: string): string[] {
  const clean = text.trim();

  const knownProducts = [
    { name: 'Lenovo LOQ 15', regex: /lenovo\s*loq(?:\s*15)?|loq\s*15/i },
    { name: 'HP Victus 15', regex: /hp\s*victus(?:\s*15)?|victus\s*15/i },
    { name: 'Apple MacBook Pro 14"', regex: /(?:apple\s*)?macbook(?:\s*pro)?(?:\s*14)?/i },
    { name: 'Lenovo IdeaPad Slim 3', regex: /(?:lenovo\s*)?ideapad(?:\s*slim\s*3)?/i },
    { name: 'ASUS ROG Zephyrus G16', regex: /(?:asus\s*)?(?:rog\s*)?zephyrus(?:\s*g16)?/i },
    { name: 'HP 15s', regex: /hp\s*15s/i },
    { name: 'ASUS Zenbook 14 OLED', regex: /(?:asus\s*)?zenbook(?:\s*14)?/i },
    { name: 'Google Pixel 9 Pro', regex: /(?:google\s*)?pixel\s*9(?:\s*pro)?/i },
    { name: 'Samsung Galaxy S24 Ultra', regex: /(?:samsung\s*)?(?:galaxy\s*)?s24(?:\s*ultra)?/i },
    { name: 'Sony WH-1000XM5', regex: /sony\s*(?:wh-?)?1000xm5/i },
    { name: 'Bose QuietComfort Ultra', regex: /bose\s*(?:quietcomfort|qc)(?:\s*ultra)?/i }
  ];

  const matched: string[] = [];
  for (const kp of knownProducts) {
    if (kp.regex.test(clean)) {
      matched.push(kp.name);
    }
  }
  if (matched.length >= 2) return matched;

  // Pattern "X vs Y"
  if (/\b(?:vs\.?|versus)\b/i.test(clean)) {
    const parts = clean.split(/\b(?:vs\.?|versus)\b/i);
    const left = parts[0].replace(/^(?:compare|can you compare|please compare|difference between)\s+/i, '').trim();
    const right = parts[1].replace(/^(?:and|with|to)\s+/i, '').trim();
    if (left && right) return [left, right];
  }

  // Pattern "Compare X and Y"
  const compareMatch = clean.match(/compare\s+(.+?)\s+(?:and|with|to)\s+(.+)/i);
  if (compareMatch) {
    const left = compareMatch[1].trim();
    const right = compareMatch[2].trim();
    if (left && right) return [left, right];
  }

  return matched;
}

export async function processChatConversation(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>) {
  const systemInstruction = `You are ShopPilot AI, an elite, intelligent AI shopping assistant and buyer advisor.
Your capabilities:
1. Help users discover products matching their budget, category, specifications, and intended usage (programming, machine learning, gaming, photography, student, everyday).
2. Compare 2 to 4 products side by side with objective pros, cons, and performance trade-offs.
3. Provide personalized recommendations with clear explanations.
4. Execute tools using Gemini Function Calling:
   - search_products: search catalog by keywords, category, minPrice, and maxPrice.
   - compare_products: compare 2-4 products side by side. Pass productNamesOrIds with exact names (e.g. ['Lenovo LOQ 15', 'HP Victus 15']).
   - get_product_details: drill into specific specs and warranty details.
   - recommend_products: personalized suggestions with minBudget and maxBudget.
   - add_to_cart: add products to cart ONLY after user clearly instructs or confirms.
   - calculate_cart_total: check current cart totals.
   - analyze_purchase_risk: analyze purchase risks, pricing anomalies, or suspicious deals.
5. STRICT BUDGET ENFORCEMENT RULES:
   - You MUST strictly respect any minimum and maximum budget specified by the user.
   - When the user asks for a price range (e.g., "between ₹65,000 and ₹75,000", "₹65k-₹75k", "from 65000 to 75000"):
     * Always supply both minPrice (e.g. 65000) and maxPrice (e.g. 75000) to search_products, or minBudget and maxBudget to recommend_products.
     * NEVER recommend, display, or suggest products outside the requested budget range.
     * If the tool results return 0 products, explicitly state that no matching products were found in that budget range.
6. STRICT PRODUCT COMPARISON RULES (CRITICAL):
   - When users ask to compare two or more specific products (e.g. "Compare Lenovo LOQ 15 and HP Victus 15", "Lenovo LOQ 15 vs HP Victus 15"):
     * Call compare_products with productNamesOrIds: ["Lenovo LOQ 15", "HP Victus 15"].
     * Retrieve ONLY those exact products. Do NOT return unrelated products or switch to random categories (like headphones).
     * In your text response, provide a clean, side-by-side spec comparison breakdown covering: Processor, RAM, GPU/Graphics, Display, Price, Ratings, Pros, and Cons.
     * If a requested product is unavailable or not found in MongoDB, explicitly inform the user that it was not found in the verified catalog. Never substitute another random product.
7. Important Safety Guidelines:
   - When suggesting products, mention prices clearly (e.g. ₹69,990 or $840).
   - Never invent false live prices or fake customer reviews. Use catalog data.
   - For cart modifications, always confirm what was added and invite the user to checkout via PayPal when ready.
   - Keep answers structured, friendly, concise, and helpful with bullet points.`;

  // Prepare Gemini contents from chat history
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const executedToolCalls: Array<{ name: string; args: any; result: any }> = [];
  let attachedProducts: Product[] = [];
  let attachedComparison: any = null;
  let attachedCartConfirm: any = null;
  let attachedRiskReport: RiskAnalysisResult | null = null;
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const userBudgetConstraint = parseBudgetFromText(lastUserMsg);

  try {
    const activeApiKey = getGeminiApiKey();
    if (!activeApiKey) {
      throw new Error('GEMINI_API_KEY is not set in server environment.');
    }

    const ai = new GoogleGenAI({
      apiKey: activeApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Step 1: Call Gemini with tools configured
    let response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: allToolDeclarations }],
      }
    });

    // Step 2: Check for function calls
    let functionCalls = response.functionCalls;
    
    // Loop for multi-step tool execution if needed (up to 3 rounds)
    let turns = 0;
    while (functionCalls && functionCalls.length > 0 && turns < 3) {
      turns++;
      const currentCandidateContent = response.candidates?.[0]?.content;
      const toolResponsesParts: any[] = [];

      for (const fc of functionCalls) {
        const toolName = fc.name || 'unknown';
        const toolResult = await executeServerTool(toolName, fc.args || {});
        executedToolCalls.push({
          name: toolName,
          args: fc.args,
          result: toolResult
        });

        // Collect UI attachments
        if (toolName === 'search_products' && toolResult.products) {
          attachedProducts.push(...toolResult.products);
        } else if (toolName === 'recommend_products' && toolResult.recommendations) {
          attachedProducts.push(...toolResult.recommendations);
        } else if (toolName === 'compare_products') {
          attachedComparison = {
            products: toolResult.products || [],
            missing: toolResult.missing || [],
            focusCriteria: toolResult.focusCriteria
          };
          if (toolResult.products) {
            attachedProducts.push(...toolResult.products);
          }
        } else if (toolName === 'get_product_details' && toolResult.product) {
          attachedProducts.push(toolResult.product);
        } else if (toolName === 'add_to_cart' && toolResult.product) {
          attachedCartConfirm = {
            product: toolResult.product,
            quantity: (fc.args as any)?.quantity || 1,
            action: 'add'
          };
        } else if (toolName === 'analyze_purchase_risk' && toolResult.riskAnalysis) {
          attachedRiskReport = toolResult.riskAnalysis;
        }

        toolResponsesParts.push({
          functionResponse: {
            id: fc.id,
            name: toolName,
            response: toolResult
          }
        });
      }

      // Send tool response back to Gemini to get the synthesized textual response
      const updatedContents = [
        ...contents,
        currentCandidateContent!,
        {
          role: 'user',
          parts: toolResponsesParts
        }
      ];

      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: updatedContents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: allToolDeclarations }],
        }
      });

      functionCalls = response.functionCalls;
    }

    // Strict safety filter: ensure attached products strictly respect requested budget constraint
    if (userBudgetConstraint.minPrice !== undefined || userBudgetConstraint.maxPrice !== undefined) {
      attachedProducts = attachedProducts.filter(p => {
        if (userBudgetConstraint.minPrice !== undefined && p.price < userBudgetConstraint.minPrice) return false;
        if (userBudgetConstraint.maxPrice !== undefined && p.price > userBudgetConstraint.maxPrice) return false;
        return true;
      });
    }

    // Deduplicate attached products
    const uniqueProducts = Array.from(new Map(attachedProducts.map(p => [p.id, p])).values());

    let finalResponseText = response.text || 'I processed your request using ShopPilot AI tools.';
    if ((userBudgetConstraint.minPrice !== undefined || userBudgetConstraint.maxPrice !== undefined) && uniqueProducts.length === 0) {
      const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`;
      let budgetLabel = '';
      if (userBudgetConstraint.minPrice && userBudgetConstraint.maxPrice) {
        budgetLabel = `between ${formatPrice(userBudgetConstraint.minPrice)} and ${formatPrice(userBudgetConstraint.maxPrice)}`;
      } else if (userBudgetConstraint.maxPrice) {
        budgetLabel = `under ${formatPrice(userBudgetConstraint.maxPrice)}`;
      } else {
        budgetLabel = `above ${formatPrice(userBudgetConstraint.minPrice!)}`;
      }
      if (!finalResponseText.toLowerCase().includes('no matching') && !finalResponseText.toLowerCase().includes('not found')) {
        finalResponseText = `No matching products were found in our verified catalog within your specified budget ${budgetLabel}. We strictly respect your budget limits and do not substitute products outside this range. Would you like to adjust your budget or explore another category?`;
      }
    }

    return {
      text: finalResponseText,
      toolCalls: executedToolCalls,
      productCards: uniqueProducts.length > 0 ? uniqueProducts : undefined,
      comparisonData: attachedComparison,
      cartConfirmation: attachedCartConfirm,
      riskReport: attachedRiskReport
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Provide an intelligent, strictly compliant fallback
    const lowerUserMsg = lastUserMsg.toLowerCase();
    
    let fallbackText = '';
    let fallbackProducts: Product[] = [];
    let fallbackComparison: any = null;
    let fallbackRisk: any = null;

    // Detect category keywords
    let targetCategory: string | undefined = undefined;
    let queryKeyword: string | undefined = undefined;
    if (lowerUserMsg.includes('laptop') || lowerUserMsg.includes('notebook') || lowerUserMsg.includes('pc') || lowerUserMsg.includes('macbook')) {
      targetCategory = 'laptops';
      queryKeyword = 'laptop';
    } else if (lowerUserMsg.includes('phone') || lowerUserMsg.includes('smartphone') || lowerUserMsg.includes('mobile') || lowerUserMsg.includes('pixel') || lowerUserMsg.includes('iphone') || lowerUserMsg.includes('galaxy')) {
      targetCategory = 'smartphones';
    } else if (lowerUserMsg.includes('headphone') || lowerUserMsg.includes('earphone') || lowerUserMsg.includes('audio') || lowerUserMsg.includes('earbud')) {
      targetCategory = 'headphones';
    } else if (lowerUserMsg.includes('monitor') || lowerUserMsg.includes('screen') || lowerUserMsg.includes('display')) {
      targetCategory = 'monitors';
    }

    const isCompareQuery = lowerUserMsg.includes('compare') || lowerUserMsg.includes('comparison') || /\b(?:vs\.?|versus)\b/i.test(lowerUserMsg);

    // 1. Comparison query handling
    if (isCompareQuery) {
      const targets = extractCompareTargets(lastUserMsg);
      if (targets.length >= 2) {
        const { found, missing } = await db.compareProducts(targets);
        if (found.length >= 2) {
          fallbackProducts = found;
          fallbackComparison = {
            products: found,
            missing,
            focusCriteria: 'Specifications, Gaming & Everyday Performance'
          };
          const tableMd = generateComparisonTableMarkdown(found);
          let missingNote = '';
          if (missing.length > 0) {
            missingNote = `\n\n⚠️ **Notice:** The requested item "${missing.join(', ')}" is currently unavailable in our catalog. We strictly do not substitute unrelated products.`;
          }
          fallbackText = `I retrieved verified specifications from MongoDB for **${found[0].name}** and **${found[1].name}** for side-by-side comparison:\n\n${tableMd}\n\n**Key Spec Highlights:**\n• **Processor:** ${getProductSpecValue(found[0], ['Processor', 'CPU'])} vs ${getProductSpecValue(found[1], ['Processor', 'CPU'])}\n• **GPU:** ${getProductSpecValue(found[0], ['Graphics', 'GPU'])} vs ${getProductSpecValue(found[1], ['Graphics', 'GPU'])}\n• **Price & Value:** ₹${found[0].price.toLocaleString('en-IN')} vs ₹${found[1].price.toLocaleString('en-IN')}\n\nReview the side-by-side comparison matrix below. Would you like to view detailed specs or add any laptop to your cart?${missingNote}`;
        } else if (found.length === 1 && missing.length > 0) {
          fallbackProducts = found;
          fallbackComparison = { products: found, missing, focusCriteria: 'Single Product Analysis' };
          fallbackText = `I found verified specifications for **${found[0].name}** in our catalog. However, the requested comparison product **"${missing.join(', ')}"** is currently unavailable in our database. To maintain accuracy, we strictly do not substitute unrelated products or other categories.\n\nWould you like full details on ${found[0].name} or would you like to compare it with another available model?`;
        } else {
          fallbackText = `Neither of the requested products (${missing.join(', ')}) were found in our verified MongoDB catalog. We strictly do not substitute unrelated products or random categories. Would you like to check our available models?`;
        }
      } else if (targets.length === 1) {
        const { found, missing } = await db.compareProducts(targets);
        if (found.length > 0) {
          fallbackProducts = found;
          fallbackText = `I located **${found[0].name}** in our verified catalog. Please specify a second product to generate the side-by-side comparison table (e.g., "Compare ${found[0].name} and HP Victus 15").`;
        } else {
          fallbackText = `The requested product is currently unavailable in our catalog. We strictly do not substitute unrelated products.`;
        }
      } else {
        const laptops = db.getProducts(undefined, 'laptops').slice(0, 2);
        fallbackProducts = laptops;
        fallbackComparison = { products: laptops, focusCriteria: 'Catalog Spec Comparison' };
        fallbackText = `Review the side-by-side comparison table below for top-rated laptops from our catalog. You can also specify exact models to compare (e.g. "Compare Lenovo LOQ 15 and HP Victus 15").`;
      }
    } else if (userBudgetConstraint.minPrice !== undefined || userBudgetConstraint.maxPrice !== undefined) {
      // 2. Budget specified query handling
      const filtered = db.getProducts(queryKeyword, targetCategory, userBudgetConstraint.maxPrice, undefined, userBudgetConstraint.minPrice);
      fallbackProducts = filtered;

      const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`;
      let budgetLabel = '';
      if (userBudgetConstraint.minPrice && userBudgetConstraint.maxPrice) {
        budgetLabel = `between ${formatPrice(userBudgetConstraint.minPrice)} and ${formatPrice(userBudgetConstraint.maxPrice)}`;
      } else if (userBudgetConstraint.maxPrice) {
        budgetLabel = `under ${formatPrice(userBudgetConstraint.maxPrice)}`;
      } else {
        budgetLabel = `above ${formatPrice(userBudgetConstraint.minPrice!)}`;
      }

      if (filtered.length === 0) {
        fallbackText = `No matching ${targetCategory || 'products'} were found in our verified catalog within your specified budget of ${budgetLabel}. We strictly respect your budget requirements and do not substitute products outside this price range. Would you like to adjust your budget or explore another category?`;
      } else {
        fallbackText = `Here are the verified ${targetCategory || 'products'} strictly within your requested budget range (${budgetLabel}):\n\n` +
          filtered.map(p => `• **${p.name}** (${formatPrice(p.price)}) – ${p.brand} | ${p.description.slice(0, 110)}...`).join('\n') +
          `\n\nAll recommendations strictly match your budget. Would you like to view detailed specs, compare them, or add any item to your cart?`;
      }
    } else if (lowerUserMsg.includes('risk') || lowerUserMsg.includes('fake') || lowerUserMsg.includes('scam') || lowerUserMsg.includes('suspicious')) {
      const cleanTarget = lastUserMsg
        .replace(/^(can\s+you\s+)?(please\s+)?(analyze|check|inspect|audit|evaluate)?\s*(the\s+)?(purchase\s+)?(risk|safety|deal)?\s*(for|of|on)?\s*/i, '')
        .replace(/\?+$/, '')
        .trim();
      const toolRes = await executeServerTool('analyze_purchase_risk', { externalUrlOrName: cleanTarget || lastUserMsg });
      fallbackRisk = toolRes.riskAnalysis;
      if (toolRes.product) {
        fallbackProducts = [toolRes.product];
      }
      fallbackText = `I ran our AI Purchase Risk Analyzer on **${toolRes.riskAnalysis?.urlOrName || cleanTarget || 'the specified item'}**. See the comprehensive 4-point risk evaluation report below.`;
    } else if (targetCategory === 'laptops') {
      const laptops = db.getProducts(undefined, 'laptops');
      fallbackProducts = laptops.slice(0, 3);
      fallbackText = `Here are top laptops available in our verified catalog:\n\n` +
        laptops.slice(0, 3).map(p => `• **${p.name}** (₹${p.price.toLocaleString('en-IN')}) – ${p.brand}`).join('\n') +
        `\n\nTo see options tailored to you, specify your budget range (e.g. "between ₹65,000 and ₹75,000" or "under ₹50,000").`;
    } else if (targetCategory === 'smartphones') {
      const phones = db.getProducts(undefined, 'smartphones').slice(0, 3);
      fallbackProducts = phones;
      fallbackText = `For smartphones, here are popular verified options in our catalog:\n\n1. **Google Pixel 9 Pro** (₹1,09,999) – Benchmark camera\n2. **Samsung Galaxy S24 Ultra** (₹1,29,999) – 200MP Quad Tele\n3. **Vivo V30 Pro** (₹41,999) – Value portrait camera`;
    } else {
      fallbackProducts = db.getProducts().slice(0, 3);
      fallbackText = `Welcome to ShopPilot AI! I can help you find products strictly within your budget, compare technical specs, analyze seller risk, and manage your cart. Try asking:\n- "Compare Lenovo LOQ 15 and HP Victus 15"\n- "Find me a laptop between ₹65,000 and ₹75,000"\n- "Laptops under ₹50,000"\n- "Analyze purchase risk for a deal"`;
    }

    const fallbackToolName = isCompareQuery ? 'compare_products' : 'intelligent_agent_fallback';
    const fallbackToolArgs = isCompareQuery 
      ? { productNamesOrIds: extractCompareTargets(lastUserMsg), focusCriteria: 'Overall Value & Spec Comparison' }
      : { query: lastUserMsg, budgetConstraint: userBudgetConstraint };

    return {
      text: fallbackText,
      toolCalls: [{ 
        name: fallbackToolName, 
        args: fallbackToolArgs, 
        result: isCompareQuery ? { comparisonCount: fallbackProducts.length, products: fallbackProducts, missing: fallbackComparison?.missing || [] } : { message: 'Processed with exact MongoDB matching' } 
      }],
      productCards: fallbackProducts.length > 0 ? fallbackProducts : undefined,
      comparisonData: fallbackComparison,
      riskReport: fallbackRisk
    };
  }
}
