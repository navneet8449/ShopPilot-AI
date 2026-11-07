# ShopPilot AI – Advanced AI-Powered Shopping Agent

ShopPilot AI is an intelligent, autonomous shopping assistant and decision engine built with **React**, **Tailwind CSS**, **Node.js/Express**, **Google Gemini 3.8 Flash with Function Calling**, and **PayPal Orders API v2**.

---

## 🚀 Key Features

### 1. 🤖 AI Shopping Assistant (Gemini Function Calling)
- Real-time conversational buyer advisor powered by `gemini-3.8-flash`.
- Multi-step server-side tool calling:
  - `search_products`: Multi-criteria catalog filtering by keywords, max price, category, and rating.
  - `compare_products`: Side-by-side technical specification analysis across 2–4 models.
  - `get_product_details`: In-depth component, warranty, and return policy inspection.
  - `recommend_products`: Personalized matching for programmers, gamers, students, and creators.
  - `add_to_cart`: Secure item addition with explicit user confirmation.
  - `calculate_cart_total`: Real-time subtotal, 18% GST, free shipping thresholds, and discounts.
  - `analyze_purchase_risk`: 4-point threat evaluation (price anomalies, link safety, fake reviews).
- Built-in **Web Speech API** dictation for voice prompts.
- Suggested one-click query chips.

### 2. 🔍 Intelligent Product Catalog (20+ Realistic Models)
- Realistic verified catalog across **Laptops**, **Smartphones**, **Audio & Headphones**, **Gaming Monitors**, and **Pro Accessories**.
- Dual-currency formatting support (**₹ INR** and **$ USD**).
- Real-time filters for Price Range, Brand, Rating (4.3+, 4.7+), and Stock Availability.
- Quick action cards with "Ask ShopPilot about this", "Add to Compare", and "Risk Audit".

### 3. ⚖️ AI Product Comparison Matrix
- Compare up to 4 models simultaneously.
- Dynamic spec mapping (CPU, RAM, Display, Battery, Codecs, Ports, Pros, Cons).
- Single-click **"Generate AI Verdict"** synthesized for specific user personas (e.g. Programming vs Gaming vs Value).

### 4. 🛡️ AI Purchase Risk Analyzer
- 4-point threat inspection:
  1. **Price Anomaly Detection** (flags extreme variance >70% below wholesale baseline).
  2. **Specification Authenticity** (flags contradictory or fake specs).
  3. **Domain & Link Safety** (detects sketchy TLDs like `.xyz`, `.top`, or unverified sellers).
  4. **Seller Reputation & Return Guarantee** (audits replacement window & GST invoices).
- Safety Score (0–100) with clear educational disclaimers.

### 5. 💳 PayPal Sandbox Integration (Orders API v2)
- Server-side order creation (`POST /api/paypal/create-order`).
- Server-side payment capture (`POST /api/paypal/capture-order`).
- **Anti-duplicate capture verification** preventing double execution.
- High-fidelity **Sandbox Simulator** for instant testing without pre-configured credentials, seamlessly upgrading to live PayPal Sandbox endpoints when `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are provided.
- Printable GST Tax Invoices and confetti celebration upon confirmation.

### 6. 🗄️ Database Architecture (MongoDB)
- Schema collections: `products`, `carts`, `orders`, `transactions`, `users`, `shopping_history`.
- In-memory persisted fallback store ensures 100% out-of-the-box functionality in dev environments without requiring an external MongoDB daemon.

---

## 📂 Project Architecture

```
├── .env.example              # Environment variables template
├── metadata.json             # AI Studio applet metadata
├── package.json              # Node.js dependencies & scripts
├── requirements.txt          # Python FastAPI dependencies
├── server.ts                 # Full-stack Express entry point with Vite middleware
├── README.md                 # Documentation & setup guide
│
├── backend/                  # Python FastAPI Reference Architecture
│   ├── main.py               # FastAPI application & endpoints
│   └── database.py           # MongoDB Motor async client config
│
├── server/                   # Node.js / Express Backend Services
│   ├── db/
│   │   └── store.ts          # MongoDB-compatible document repository
│   └── services/
│       ├── gemini.ts         # Gemini 3.8 Flash Function Calling & Tool Declarations
│       └── paypal.ts         # PayPal Orders API v2 REST client
│
└── src/                      # Frontend (React 19 + Tailwind CSS)
    ├── App.tsx               # Root component & routing
    ├── main.tsx              # React DOM entry point
    ├── index.css             # Tailwind CSS imports
    ├── types/
    │   └── index.ts          # TypeScript type definitions
    ├── data/
    │   └── catalog.ts        # 20+ verified tech products catalog
    ├── context/
    │   └── AppContext.tsx    # Global state (Cart, Compare tray, Preferences, Currency)
    ├── components/
    │   ├── Navbar.tsx        # Responsive navigation bar
    │   ├── Footer.tsx        # Footer with trust & architecture badges
    │   ├── ProductCard.tsx   # Product card with hover actions & badges
    │   └── AIAssistantDrawer.tsx # Ubiquitous floating assistant drawer
    └── views/
        ├── HomeView.tsx           # Dashboard with AI command bar & recommendations
        ├── AssistantView.tsx      # Dedicated Conversational Agent with Tool cards
        ├── CatalogView.tsx        # Filterable Product Catalog
        ├── ProductDetailView.tsx  # Deep dive specs, pros/cons & risk check
        ├── ComparisonView.tsx     # Side-by-side spec comparison table & AI verdict
        ├── CartView.tsx           # Smart cart with AI bundle optimizer
        ├── CheckoutView.tsx       # PayPal Sandbox checkout & tax invoice
        ├── OrdersView.tsx         # Past orders & capture IDs
        ├── ProfileView.tsx        # User persona & budget customization
        └── RiskAnalyzerView.tsx   # 4-point risk inspection scanner
```

---

## 🛠️ Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
GEMINI_API_KEY="your_gemini_api_key"
PAYPAL_CLIENT_ID="your_paypal_sandbox_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_sandbox_client_secret"
PAYPAL_MODE="sandbox"
MONGODB_URI="mongodb://localhost:27017/shoppilot_ai"
```

### 3. Start Development Server
```bash
npm run dev
```
The app will be available on `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send conversation to Gemini with Function Calling tools |
| `GET` | `/api/products` | Retrieve products with query, category, and price filters |
| `GET` | `/api/products/:id` | Fetch specific product details and verified specs |
| `POST` | `/api/products/compare` | Compare 2–4 products side-by-side |
| `POST` | `/api/recommendations` | Get personalized recommendations based on usage |
| `GET` | `/api/cart` | Get current cart items, subtotal, taxes, and shipping |
| `POST` | `/api/cart` | Add product to cart (supports quantity) |
| `PUT` | `/api/cart/:id` | Update cart item quantity |
| `DELETE`| `/api/cart/:id` | Remove item from cart |
| `POST` | `/api/paypal/create-order` | Create PayPal order via Orders API v2 |
| `POST` | `/api/paypal/capture-order`| Capture and verify approved PayPal payment |
| `GET` | `/api/orders` | List recorded orders with PayPal capture IDs |
| `POST` | `/api/risk/analyze` | Run 4-point AI purchase risk assessment |
| `GET` | `/api/user/profile` | Retrieve user preferences and shipping address |
| `POST` | `/api/user/preferences`| Update user budget, target usage, and brands |

---

## 🔒 Security & AI Guardrails

- **Explicit Payment Authorization**: The AI agent is never permitted to charge cards or authorize payments independently. Every transaction requires user interaction in the PayPal checkout view.
- **Server-Side Capture**: Payment capture is executed strictly on the backend after validating amount, ownership, and anti-duplicate flags.
- **Client Secret Isolation**: PayPal Client Secrets and Gemini API Keys are strictly kept in server-side environment variables.
