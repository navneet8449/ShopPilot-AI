import { Product } from '../types/index.ts';

export const SAMPLE_PRODUCTS: Product[] = [
  // --- LAPTOPS ---
  {
    id: 'lap-001',
    name: 'Apple MacBook Pro 14" (M3 Pro)',
    brand: 'Apple',
    category: 'laptops',
    price: 199900,
    priceUSD: 2399,
    rating: 4.9,
    reviewCount: 1420,
    availability: 'in_stock',
    stockCount: 18,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    description: 'Blazing fast Apple M3 Pro chip with 12-core CPU and 18-core GPU. Liquid Retina XDR display with ProMotion 120Hz. Incredible 18-hour battery life engineered for machine learning, code compiling, and creative pros.',
    targetAudience: ['programming', 'machine_learning', 'creators', 'executives'],
    specs: {
      'Processor': 'Apple M3 Pro (12-core CPU, 18-core GPU)',
      'Unified Memory': '18 GB Unified RAM',
      'Storage': '512 GB NVMe SSD',
      'Display': '14.2" Liquid Retina XDR (3024x1964, 120Hz, 1600 nits peak)',
      'Battery Life': 'Up to 18 Hours',
      'Ports': '3x Thunderbolt 4 / USB-C, HDMI, MagSafe 3, SDXC card slot',
      'Weight': '1.61 kg'
    },
    pros: ['Unmatched performance-per-watt for ML and heavy Docker workloads', 'Industry-leading Liquid Retina XDR display', '18h real-world battery endurance', 'Silent operation with superb thermals'],
    cons: ['Non-upgradeable unified RAM and SSD', 'Premium price tag'],
    riskIndicators: {
      safetyScore: 98,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 14,
      notes: ['Official Apple Authorized distribution', 'Full AppleCare+ warranty eligible', 'Consistent MSRP pricing']
    },
    productUrl: 'https://apple.com/shop/buy-mac/macbook-pro/14-inch'
  },
  {
    id: 'lap-002',
    name: 'Lenovo IdeaPad Slim 3 (Core i5 12th Gen)',
    brand: 'Lenovo',
    category: 'laptops',
    price: 46990,
    priceUSD: 565,
    rating: 4.3,
    reviewCount: 3820,
    availability: 'in_stock',
    stockCount: 42,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80',
    description: 'Reliable student and budget productivity laptop featuring Intel Core i5-1235U with 10 cores, 16GB RAM, rapid charge, and a sleek lightweight arctic grey chassis.',
    targetAudience: ['students', 'budget', 'office', 'programming'],
    specs: {
      'Processor': 'Intel Core i5-1235U (10 Cores, up to 4.4 GHz)',
      'RAM': '16 GB DDR4 3200MHz',
      'Storage': '512 GB PCIe 4.0 NVMe M.2 SSD',
      'Display': '15.6" FHD (1920x1080) Anti-glare IPS, 300 nits',
      'Battery Life': 'Up to 7.5 Hours (Rapid Charge 80% in 1 hr)',
      'Ports': '1x USB-C 3.2, 2x USB-A, HDMI 1.4b, Audio jack',
      'Weight': '1.63 kg'
    },
    pros: ['Under ₹50,000 with 16GB dual-channel RAM', 'Sturdy build quality with tactile keyboard', 'Good everyday thermal efficiency'],
    cons: ['Color gamut is 45% NTSC (not meant for color grading)', 'Basic webcam without IR hello'],
    riskIndicators: {
      safetyScore: 96,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 7,
      notes: ['Genuine Lenovo brand warranty (1-year onsite)', 'Well-documented replacement parts']
    },
    productUrl: 'https://lenovo.com/ideapad-slim-3'
  },
  {
    id: 'lap-003',
    name: 'ASUS ROG Zephyrus G16 (RTX 4070, Core Ultra 9)',
    brand: 'ASUS',
    category: 'laptops',
    price: 184990,
    priceUSD: 2220,
    rating: 4.8,
    reviewCount: 610,
    availability: 'in_stock',
    stockCount: 11,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=80',
    description: 'Ultra-thin stealth gaming and AI workstation with CNC aluminum unibody, 2.5K 240Hz OLED ROG Nebula display, Intel Core Ultra 9 185H processor, and NVIDIA GeForce RTX 4070.',
    targetAudience: ['gaming', 'machine_learning', 'creators', 'power_users'],
    specs: {
      'Processor': 'Intel Core Ultra 9 185H (16 Cores, Intel AI Boost NPU)',
      'Graphics': 'NVIDIA GeForce RTX 4070 8GB GDDR6 (105W TGP)',
      'RAM': '32 GB LPDDR5X 7467MHz',
      'Storage': '1 TB PCIe 4.0 NVMe M.2 SSD',
      'Display': '16.0" 2.5K (2560x1600) 240Hz 0.2ms OLED ROG Nebula',
      'Battery Life': '90Wh Battery, up to 9 hours light usage',
      'Weight': '1.85 kg'
    },
    pros: ['Jaw-dropping 240Hz OLED display with G-Sync', 'Dedicated AI NPU + RTX 4070 Tensor cores for PyTorch / LLM fine-tuning', 'Sub-2cm slim CNC aluminum profile', '6-speaker array with dual force-canceling woofers'],
    cons: ['Soldered RAM (non-upgradable)', 'Fan noise during high-power Turbo mode'],
    riskIndicators: {
      safetyScore: 97,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 14,
      notes: ['ASUS Official Store direct delivery', '2-year global warranty']
    },
    productUrl: 'https://rog.asus.com/laptops/rog-zephyrus/rog-zephyrus-g16'
  },
  {
    id: 'lap-004',
    name: 'HP 15s (AMD Ryzen 5 5500U)',
    brand: 'HP',
    category: 'laptops',
    price: 41990,
    priceUSD: 505,
    rating: 4.2,
    reviewCount: 5410,
    availability: 'in_stock',
    stockCount: 65,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80',
    description: 'Best-selling value laptop under ₹45,000 powered by 6-core 12-thread AMD Ryzen 5 5500U, micro-edge anti-glare display, and fast charging for everyday college and office work.',
    targetAudience: ['students', 'budget', 'office'],
    specs: {
      'Processor': 'AMD Ryzen 5 5500U (6 Cores, 12 Threads, up to 4.0 GHz)',
      'RAM': '8 GB DDR4 (Upgradable to 16GB)',
      'Storage': '512 GB PCIe NVMe M.2 SSD',
      'Display': '15.6" Full HD (1920x1080) Micro-edge, 250 nits',
      'Battery Life': 'Up to 9 Hours with HP Fast Charge',
      'Weight': '1.69 kg'
    },
    pros: ['Very affordable 6-core Ryzen processor', 'RAM is user-upgradable with open dual slot', 'Lightweight for a 15.6-inch laptop'],
    cons: ['8GB base memory needs upgrade for heavy multitasking', 'Plastic chassis prone to flex'],
    riskIndicators: {
      safetyScore: 95,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 7,
      notes: ['HP India Verified partner', 'Includes pre-installed MS Office Home & Student']
    },
    productUrl: 'https://hp.com/in-en/shop/hp-laptop-15s'
  },
  {
    id: 'lap-005',
    name: 'ASUS Zenbook 14 OLED (Intel Core Ultra 7)',
    brand: 'ASUS',
    category: 'laptops',
    price: 99990,
    priceUSD: 1200,
    rating: 4.7,
    reviewCount: 840,
    availability: 'in_stock',
    stockCount: 20,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80',
    description: 'Premium ultraportable with 3K 120Hz ASUS Lumina OLED touchscreen, military-grade MIL-STD 810H durability, 75Wh all-day battery, and on-device AI acceleration.',
    targetAudience: ['programming', 'office', 'creators', 'travelers'],
    specs: {
      'Processor': 'Intel Core Ultra 7 155H (16 Cores, 22 Threads, Arc GPU)',
      'RAM': '16 GB LPDDR5X',
      'Storage': '1 TB M.2 NVMe PCIe 4.0 SSD',
      'Display': '14.0" 3K (2880x1800) OLED 120Hz, 100% DCI-P3, HDR 600',
      'Battery Life': 'Up to 15 Hours (75Wh battery)',
      'Weight': '1.22 kg'
    },
    pros: ['Featherweight at just 1.22 kg', 'Gorgeous 3K 120Hz Lumina OLED display', 'Thunderbolt 4 + full size HDMI 2.1 in ultra-slim body', 'Integrated Intel Arc GPU with surprising 1080p gaming performance'],
    cons: ['Glossy screen has reflections under direct sunlight', 'No dedicated SD card slot'],
    riskIndicators: {
      safetyScore: 99,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 14,
      notes: ['Direct manufacturer dispatch', 'Zero dead-pixel OLED guarantee']
    },
    productUrl: 'https://asus.com/zenbook-14-oled'
  },
  {
    id: 'lap-006',
    name: 'Lenovo LOQ 15 (Core i5 13th Gen, RTX 4050)',
    brand: 'Lenovo',
    category: 'laptops',
    price: 69990,
    priceUSD: 840,
    rating: 4.6,
    reviewCount: 1140,
    availability: 'in_stock',
    stockCount: 28,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80',
    description: 'High-performance gaming and coding laptop in the ₹65,000–₹75,000 sweet spot. Powered by 13th Gen Intel Core i5-13420H, NVIDIA GeForce RTX 4050 (6GB GDDR6, 95W TGP), 16GB DDR5 RAM, and a 144Hz G-Sync display.',
    targetAudience: ['gaming', 'programming', 'students', 'machine_learning'],
    specs: {
      'Processor': 'Intel Core i5-13420H (8 Cores, 12 Threads, up to 4.6 GHz)',
      'Graphics': 'NVIDIA GeForce RTX 4050 6GB GDDR6 (95W TGP)',
      'RAM': '16 GB DDR5 5200MHz (Upgradable to 32GB)',
      'Storage': '512 GB PCIe 4.0 NVMe SSD',
      'Display': '15.6" FHD (1920x1080) 144Hz IPS, 350 nits, G-SYNC, 100% sRGB',
      'Battery Life': '60Wh Battery with Super Rapid Charge Pro (50% in 30 mins)',
      'Weight': '2.4 kg'
    },
    pros: ['Sweet spot pricing at ₹69,990 with true RTX 4050 discrete graphics', '16GB high-speed DDR5 memory with dual user-accessible slots', 'Effective dual-fan cooling architecture with rear exhaust vents'],
    cons: ['Heavier 2.4kg chassis suitable for desk use', 'Standard 60Wh battery yields 4-5 hours off plug'],
    riskIndicators: {
      safetyScore: 97,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 14,
      notes: ['Lenovo Official Store stock', '1-year onsite warranty with accidental damage protection']
    },
    productUrl: 'https://lenovo.com/in/en/p/laptops/loq-laptops/lenovo-loq-15irh8/len101q0001'
  },
  {
    id: 'lap-007',
    name: 'HP Victus 15 (Core i5 13th Gen, RTX 3050)',
    brand: 'HP',
    category: 'laptops',
    price: 64990,
    priceUSD: 780,
    rating: 4.4,
    reviewCount: 1680,
    availability: 'in_stock',
    stockCount: 35,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80',
    description: 'Popular mainstream gaming and STEM laptop pairing 13th Gen Intel Core i5-13420H with dedicated NVIDIA GeForce RTX 3050 GPU, 144Hz IPS display, and dual B&O tuned speakers.',
    targetAudience: ['gaming', 'students', 'programming', 'creators'],
    specs: {
      'Processor': 'Intel Core i5-13420H (8 Cores, 12 Threads, up to 4.6 GHz)',
      'Graphics': 'NVIDIA GeForce RTX 3050 4GB GDDR6 (75W TGP)',
      'RAM': '16 GB DDR4 3200MHz (Dual Channel, Upgradable)',
      'Storage': '512 GB PCIe Gen4 NVMe M.2 SSD',
      'Display': '15.6" FHD (1920x1080) 144Hz IPS, 250 nits, Anti-glare Micro-edge',
      'Battery Life': '52.5Wh Battery with HP Fast Charge (50% in 30 mins)',
      'Weight': '2.29 kg'
    },
    pros: [
      'Accessible price at ₹64,990 with dedicated RTX discrete graphics',
      'Smooth 144Hz refresh rate panel for competitive gameplay',
      'Refined stealth mica silver design with B&O tuned speakers'
    ],
    cons: [
      '250 nits peak display brightness is best suited indoors',
      'Single M.2 internal storage slot limits dual SSD setups'
    ],
    riskIndicators: {
      safetyScore: 96,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 14,
      notes: ['HP India Verified partner direct shipment', '1-year official HP manufacturer onsite warranty']
    },
    productUrl: 'https://hp.com/in-en/shop/laptops/hp-victus-gaming-laptop-15'
  },

  // --- SMARTPHONES ---
  {
    id: 'ph-001',
    name: 'Google Pixel 9 Pro',
    brand: 'Google',
    category: 'smartphones',
    price: 109999,
    priceUSD: 1199,
    rating: 4.8,
    reviewCount: 1980,
    availability: 'in_stock',
    stockCount: 25,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=80',
    description: 'The pinnacle of smartphone photography and Gemini AI. Triple pro rear camera system (50MP main, 48MP ultrawide with Macro Focus, 48MP 5x telephoto with 30x Super Res Zoom). Powered by Google Tensor G4 with 16GB RAM and 7 years of OS updates.',
    targetAudience: ['photography', 'ai_enthusiasts', 'programming', 'creators'],
    specs: {
      'Processor': 'Google Tensor G4 with Titan M2 security coprocessor',
      'RAM': '16 GB LPDDR5X',
      'Storage': '256 GB UFS 3.1',
      'Camera': '50MP Octa PD main + 48MP Quad PD telephoto (5x) + 48MP ultrawide + 42MP selfie',
      'Display': '6.3" Super Actua OLED (1280x2856, 1-120Hz, 3000 nits peak)',
      'Battery': '4700 mAh, 55% charge in ~30 mins',
      'Software Support': '7 years of guaranteed OS, security, and Pixel Drop updates'
    },
    pros: ['Unrivaled natural skin tone photography and computational Night Sight', 'Deep native Gemini Pro multimodal AI integration', 'Compact 6.3" pro form factor with 3000-nit panel', '7 full years of software support'],
    cons: ['Charging speed maxes at 27W (slower than Chinese flagships)', 'Gaming benchmark scores trail Snapdragon 8 Gen 3 under heavy load'],
    riskIndicators: {
      safetyScore: 99,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 10,
      notes: ['Official Google Store stock with sealed tamper-proof packaging', 'Full warranty in India & worldwide']
    },
    productUrl: 'https://store.google.com/product/pixel_9_pro'
  },
  {
    id: 'ph-002',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'smartphones',
    price: 129999,
    priceUSD: 1410,
    rating: 4.9,
    reviewCount: 3120,
    availability: 'in_stock',
    stockCount: 19,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=80',
    description: 'Titanium-framed powerhouse with flat Dynamic AMOLED 2X display, Corning Gorilla Armor anti-reflective glass, built-in S Pen, and 200MP Quad Tele camera system with Galaxy AI.',
    targetAudience: ['power_users', 'photography', 'business', 'gamers'],
    specs: {
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy (4nm)',
      'RAM': '12 GB',
      'Storage': '512 GB',
      'Camera': '200MP Main + 50MP Periscope (5x optical) + 10MP Telephoto (3x) + 12MP Ultrawide',
      'Display': '6.8" QHD+ Dynamic AMOLED 2X (1-120Hz, 2600 nits, anti-reflective)',
      'Battery': '5000 mAh, 45W fast charging',
      'Stylus': 'Embedded S-Pen with Bluetooth gestures'
    },
    pros: ['Gorilla Armor eliminates 75% reflections, best outdoor visibility in the industry', 'Massive zoom versatility up to 100x', 'Integrated S Pen for notes and drawing', 'Beast Snapdragon 8 Gen 3 performance'],
    cons: ['Large, boxy chassis can feel hefty in smaller hands', 'No charger in box'],
    riskIndicators: {
      safetyScore: 98,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 10,
      notes: ['Samsung India Authorized Enterprise Partner', 'Verified brand serial activation']
    },
    productUrl: 'https://samsung.com/galaxy-s24-ultra'
  },
  {
    id: 'ph-003',
    name: 'OnePlus 12',
    brand: 'OnePlus',
    category: 'smartphones',
    price: 64999,
    priceUSD: 780,
    rating: 4.7,
    reviewCount: 2240,
    availability: 'in_stock',
    stockCount: 34,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
    description: 'Flagship killer with Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera System, 5400 mAh battery, and lightning fast 100W SUPERVOOC charging (1 to 100% in 26 minutes).',
    targetAudience: ['value_flagship', 'gamers', 'photography'],
    specs: {
      'Processor': 'Snapdragon 8 Gen 3 Mobile Platform',
      'RAM': '16 GB LPDDR5X',
      'Storage': '512 GB UFS 4.0',
      'Camera': '50MP Sony LYT-808 + 64MP 3x Periscope Telephoto + 48MP Ultrawide Hasselblad',
      'Display': '6.82" 2K 120Hz ProXDR LTPO AMOLED (4500 nits peak)',
      'Battery': '5400 mAh with 100W wired & 50W wireless AIRVOOC',
      'Charging': '100W fast charger included in box'
    },
    pros: ['Unbeatable flagship performance value under ₹70,000', '100W charging fills battery in under 30 mins', 'Exceptional 5400 mAh battery endurance', 'Brightest 4500-nit display'],
    cons: ['Curved edge display may trigger occasional palm touches', 'Water resistance rated IP65 rather than full IP68'],
    riskIndicators: {
      safetyScore: 96,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 10,
      notes: ['Includes 100W original adapter and case', 'OnePlus Red Cable Club warranty verified']
    },
    productUrl: 'https://oneplus.com/12'
  },
  {
    id: 'ph-004',
    name: 'Nothing Phone (2a)',
    brand: 'Nothing',
    category: 'smartphones',
    price: 23999,
    priceUSD: 289,
    rating: 4.5,
    reviewCount: 4120,
    availability: 'in_stock',
    stockCount: 50,
    image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1000&q=80',
    description: 'Iconic transparent design with customizable Glyph Interface LEDs. Custom MediaTek Dimensity 7200 Pro chipset, clean bloatware-free Nothing OS 2.5, and dual 50MP cameras.',
    targetAudience: ['budget', 'students', 'design_enthusiasts'],
    specs: {
      'Processor': 'MediaTek Dimensity 7200 Pro (4nm TSMC)',
      'RAM': '8 GB (Expandable with RAM Booster)',
      'Storage': '256 GB',
      'Camera': 'Dual 50MP Main (OIS) + 50MP Ultrawide (114° FOV)',
      'Display': '6.7" Flexible AMOLED (120Hz, 1300 nits peak)',
      'Battery': '5000 mAh with 45W charging',
      'OS': 'Nothing OS 2.6 (Zero bloatware, 3 OS updates)'
    },
    pros: ['Cleanest software experience under ₹25,000 without spam notifications', 'Unique transparent back with Glyph lighting notifications', 'Symmetric bezels and crisp 120Hz AMOLED', 'Great battery longevity'],
    cons: ['Plastic rear panel scratches easily without a case', 'No charging brick in the retail box'],
    riskIndicators: {
      safetyScore: 97,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 7,
      notes: ['Direct Nothing brand partner', 'Includes pre-applied screen protector']
    },
    productUrl: 'https://nothing.tech/products/phone-2a'
  },
  {
    id: 'ph-005',
    name: 'Vivo V30 Pro (Zeiss Optics)',
    brand: 'Vivo',
    category: 'smartphones',
    price: 41999,
    priceUSD: 505,
    rating: 4.6,
    reviewCount: 1390,
    availability: 'in_stock',
    stockCount: 22,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1000&q=80',
    description: 'The portrait photography master co-engineered with ZEISS. Features 50MP Sony IMX920 VCS true color camera, 50MP professional portrait telephoto, and Smart Aura Light for studio lighting.',
    targetAudience: ['photography', 'creators', 'social_media'],
    specs: {
      'Processor': 'MediaTek Dimensity 8200 (4nm)',
      'RAM': '12 GB LPDDR5X',
      'Storage': '512 GB UFS 3.1',
      'Camera': 'Triple 50MP Zeiss setup (Main OIS + 2x Telephoto + Ultrawide) + 50MP AF Selfie',
      'Display': '6.78" 1.5K 3D Curved AMOLED 120Hz',
      'Battery': '5000 mAh with 80W FlashCharge',
      'Lighting': 'Studio Quality Smart Aura Light'
    },
    pros: ['Best portrait camera under ₹45,000 with Zeiss cinematic bokeh styles', 'Smart Aura light provides soft fill light for dark environments', 'Slim 7.45mm body with 5000mAh battery'],
    cons: ['Single mono speaker (no stereo speakers)', 'Curved edges may not appeal to all users'],
    riskIndicators: {
      safetyScore: 95,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 7,
      notes: ['Authorized Vivo dealer with GST invoice', 'Includes 80W fast charger']
    },
    productUrl: 'https://vivo.com/in/products/v30pro'
  },

  // --- HEADPHONES & AUDIO ---
  {
    id: 'hd-001',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling',
    brand: 'Sony',
    category: 'headphones',
    price: 29990,
    priceUSD: 359,
    rating: 4.8,
    reviewCount: 6840,
    availability: 'in_stock',
    stockCount: 30,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    description: 'Industry-leading noise cancellation powered by two processors and eight microphones. Auto NC Optimizer, Hi-Res Audio wireless with LDAC, crystal clear hands-free calls with AI beamforming, and 30-hour battery.',
    targetAudience: ['audiophiles', 'travelers', 'office', 'programming'],
    specs: {
      'Driver Size': '30 mm Carbon Fiber dome',
      'Active Noise Cancellation': 'Integrated Processor V1 + HD Noise Cancelling Processor QN1',
      'Microphones': '8 Mics with AI Beamforming and wind reduction',
      'Battery Life': '30 Hours (ANC On), 40 Hours (ANC Off)',
      'Quick Charge': '3 min charge gives 3 hours playback',
      'Codecs': 'LDAC, AAC, SBC',
      'Weight': '250 g'
    },
    pros: ['The benchmark for active noise cancellation on planes and busy cafes', 'Super lightweight and comfortable for 8+ hour coding sessions', 'Superb call quality with AI noise filtering', 'Multipoint connection between phone and laptop'],
    cons: ['Headband no longer folds inward into a compact ball', 'Higher price compared to XM4 predecessor'],
    riskIndicators: {
      safetyScore: 98,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 10,
      notes: ['Sony India 1-Year replacement warranty', 'Original retail packaging with carrying case']
    },
    productUrl: 'https://sony.co.in/electronics/headband-headphones/wh-1000xm5'
  },
  {
    id: 'hd-002',
    name: 'Bose QuietComfort Ultra Headphones',
    brand: 'Bose',
    category: 'headphones',
    price: 34900,
    priceUSD: 420,
    rating: 4.7,
    reviewCount: 2310,
    availability: 'in_stock',
    stockCount: 14,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
    description: 'Groundbreaking Bose Immersive Audio spatial sound creates a wider, more natural soundstage. CustomTune technology personalizes sound to the shape of your ears. Ultra comfortable protein leather cushions.',
    targetAudience: ['audiophiles', 'executives', 'travelers'],
    specs: {
      'ANC Modes': 'Quiet Mode, Aware Mode, Immersion Mode',
      'Sound Processing': 'Bose Immersive Audio with built-in IMU head tracking',
      'Battery Life': 'Up to 24 Hours (up to 18 Hours with Immersive Audio)',
      'Connectivity': 'Bluetooth 5.3, Snapdragon Sound certified, aptX Adaptive',
      'Weight': '253 g'
    },
    pros: ['Plush ear cushions provide supreme long-haul flight comfort', 'Foldable hinges fit inside compact slim travel case', 'aptX Adaptive support for high-res low latency on Android'],
    cons: ['Battery life drops significantly with Immersive spatial audio on', 'App requires account sign-in for EQ tuning'],
    riskIndicators: {
      safetyScore: 97,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 14,
      notes: ['Bose Authorized distributor', '2-Year manufacturer warranty included']
    },
    productUrl: 'https://bose.com/quietcomfort-ultra-headphones'
  },
  {
    id: 'hd-003',
    name: 'Anker Soundcore Space Q45',
    brand: 'Anker',
    category: 'headphones',
    price: 9999,
    priceUSD: 120,
    rating: 4.6,
    reviewCount: 4520,
    availability: 'in_stock',
    stockCount: 40,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80',
    description: 'The best value ANC headphones under ₹10,000. Upgraded adaptive noise cancelling reduces noise by up to 98%. Monster 65-hour battery life (50 hours with ANC), LDAC Hi-Res Audio wireless, and customizable HearID sound.',
    targetAudience: ['budget', 'students', 'travelers', 'office'],
    specs: {
      'Driver': '40 mm Double-layer silk and ceramic diaphragm',
      'Battery Life': '65 Hours (ANC Off), 50 Hours (ANC On)',
      'Codecs': 'LDAC, AAC, SBC',
      'ANC': 'Adaptive 3-stage Noise Cancelling',
      'Weight': '292 g'
    },
    pros: ['Astonishing 50-65 hour battery life on a single charge', 'LDAC Hi-Res audio codec support under ₹10,000', 'Feature-packed Soundcore companion app with customizable 8-band EQ'],
    cons: ['Slightly heavier than Sony XM5', 'Mic can pick up background wind outdoors'],
    riskIndicators: {
      safetyScore: 96,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 7,
      notes: ['Anker official replacement guarantee', 'Includes hard travel case and aux cable']
    },
    productUrl: 'https://soundcore.com/products/space-q45'
  },
  {
    id: 'hd-004',
    name: 'Apple AirPods Max (USB-C)',
    brand: 'Apple',
    category: 'headphones',
    price: 59900,
    priceUSD: 720,
    rating: 4.8,
    reviewCount: 3890,
    availability: 'in_stock',
    stockCount: 8,
    image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80',
    description: 'Apple-designed 40mm dynamic driver, computational audio with H1 chip in each cup, best-in-class Transparency mode, Personalized Spatial Audio with dynamic head tracking, and modern USB-C charging.',
    targetAudience: ['apple_users', 'audiophiles', 'creators'],
    specs: {
      'Drivers': '40 mm Apple custom dynamic driver with neodymium ring magnet',
      'Chips': 'Dual Apple H1 headphone chips',
      'Materials': 'Stainless steel frame, breathable knit mesh canopy, anodized aluminum cups',
      'Battery Life': '20 Hours with ANC / Spatial Audio enabled',
      'Charging': 'USB-C',
      'Weight': '386 g'
    },
    pros: ['The most natural Transparency mode on any headphone ever built', 'Unmatched build luxury with cold aluminum and steel', 'Instant automatic switching across Mac, iPhone, and iPad'],
    cons: ['Heavier at 386g', 'Smart Case still lacks full-shell protection'],
    riskIndicators: {
      safetyScore: 99,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 14,
      notes: ['Apple Genuine Serialized unit', 'Direct Apple Service Center support']
    },
    productUrl: 'https://apple.com/airpods-max'
  },

  // --- MONITORS & GAMING ---
  {
    id: 'mon-001',
    name: 'Samsung Odyssey OLED G9 49" Curved Gaming Monitor',
    brand: 'Samsung',
    category: 'monitors',
    price: 139999,
    priceUSD: 1680,
    rating: 4.9,
    reviewCount: 420,
    availability: 'in_stock',
    stockCount: 6,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
    description: 'Massive 49-inch Dual QHD (5120x1440) 32:9 curved OLED monitor. 0.03ms response time, 240Hz refresh rate, Neo Quantum Processor Pro, and built-in Gaming Hub.',
    targetAudience: ['gamers', 'power_users', 'programming', 'day_traders'],
    specs: {
      'Screen Size': '49 Inch 1800R Curved (32:9 Aspect Ratio)',
      'Panel Type': 'QD-OLED',
      'Resolution': 'Dual QHD (5120 x 1440) equivalent to two 27" QHD side-by-side',
      'Refresh Rate': '240 Hz',
      'Response Time': '0.03 ms (GTG)',
      'Brightness': '250 nits typical, DisplayHDR True Black 400',
      'Ports': 'HDMI 2.1, Micro HDMI 2.1, DisplayPort 1.4, USB Hub'
    },
    pros: ['Infinite contrast ratio with true OLED blacks', 'Replaces dual monitors seamlessly without bezel gap', 'Insane 240Hz speed and 0.03ms pixel response for competitive gaming'],
    cons: ['Requires deep desk (at least 80cm depth recommended)', 'Heavy 12.9 kg with stand'],
    riskIndicators: {
      safetyScore: 97,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 10,
      notes: ['Samsung white-glove home installation included', '3-year OLED burn-in warranty']
    },
    productUrl: 'https://samsung.com/monitors/odyssey-oled-g9'
  },
  {
    id: 'mon-002',
    name: 'LG UltraFine 27" 4K Ergo Monitor (27UN880)',
    brand: 'LG',
    category: 'monitors',
    price: 36990,
    priceUSD: 445,
    rating: 4.7,
    reviewCount: 1560,
    availability: 'in_stock',
    stockCount: 22,
    image: 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?auto=format&fit=crop&w=1000&q=80',
    description: 'The ultimate programmer and creator desk setup monitor. 4K UHD IPS display with DCI-P3 95%, HDR10, USB Type-C 60W power delivery, and an innovative ergonomic C-clamp arm that swivels, tilts, rotates, and extends.',
    targetAudience: ['programming', 'office', 'creators'],
    specs: {
      'Screen Size': '27 Inch IPS Anti-Glare',
      'Resolution': '4K UHD (3840 x 2160)',
      'Color Gamut': 'DCI-P3 95% (CIE1976), HDR10',
      'Ergonomics': 'LG Ergo Arm (Extend/Retract, Swivel ±280°, Height 130mm, Pivot 90°, Tilt ±25°)',
      'Connectivity': 'USB-C with 60W PD, 2x HDMI, 1x DisplayPort, 2x USB-A 3.0',
      'Speakers': 'Dual 5W built-in stereo with MaxxAudio'
    },
    pros: ['Ergo C-clamp stand frees up 90% of desk space beneath monitor', 'Crisp 4K text rendering perfect for lines of code', 'Single USB-C cable handles display, data, and laptop charging'],
    cons: ['60Hz refresh rate (not geared for fast FPS gaming)', 'Basic 350-nit SDR brightness'],
    riskIndicators: {
      safetyScore: 98,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 14,
      notes: ['3-year LG onsite replacement warranty', 'Zero bright-dot panel warranty']
    },
    productUrl: 'https://lg.com/in/monitors/27un880'
  },
  {
    id: 'mon-003',
    name: 'Dell Alienware 27" 280Hz Fast IPS Gaming Monitor (AW2723DF)',
    brand: 'Dell',
    category: 'monitors',
    price: 48500,
    priceUSD: 580,
    rating: 4.8,
    reviewCount: 890,
    availability: 'in_stock',
    stockCount: 15,
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1000&q=80',
    description: 'QHD (2560x1440) esports monitor overclockable to 280Hz. Fast IPS technology, 1ms GTG response time, VESA DisplayHDR 600, AMD FreeSync Premium Pro, and AlienFX customizable lighting.',
    targetAudience: ['gamers', 'esports', 'power_users'],
    specs: {
      'Screen Size': '27 Inch Fast IPS',
      'Resolution': 'QHD (2560 x 1440)',
      'Refresh Rate': '240Hz native (280Hz OC)',
      'Response Time': '1ms Gray-to-Gray in Extreme Mode',
      'Sync': 'NVIDIA G-SYNC Compatible & AMD FreeSync Premium Pro',
      'HDR': 'VESA DisplayHDR 600 (600 nits peak)'
    },
    pros: ['Ultra-fluid 280Hz motion clarity with zero smearing or ghosting', 'Retains IPS color vibrancy without the TN panel color degradation', 'Alienware Legend 2.0 design with retractable headset hanger'],
    cons: ['HDR local dimming has limited zones compared to Mini-LED', 'No USB-C display input'],
    riskIndicators: {
      safetyScore: 98,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 14,
      notes: ['Dell 3-Year Advanced Exchange Service with Premium Panel Guarantee']
    },
    productUrl: 'https://dell.com/en-in/shop/alienware-27-gaming-monitor-aw2723df'
  },

  // --- ACCESSORIES ---
  {
    id: 'acc-001',
    name: 'Logitech MX Master 3S Performance Mouse',
    brand: 'Logitech',
    category: 'accessories',
    price: 8995,
    priceUSD: 108,
    rating: 4.9,
    reviewCount: 9450,
    availability: 'in_stock',
    stockCount: 55,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
    description: 'The gold standard ergonomic productivity mouse. Features Quiet Clicks (90% less click noise), 8,000 DPI Darkfield tracking that works on glass, MagSpeed electromagnetic wheel scrolling 1,000 lines per second, and thumb scroll.',
    targetAudience: ['programming', 'office', 'creators'],
    specs: {
      'Sensor': 'Darkfield high precision 8,000 DPI (tracks on glass)',
      'Scroll Wheel': 'MagSpeed SmartShift electromagnetic scroll',
      'Buttons': '7 buttons (Left/Right-click, Back/Forward, App-Switch, Wheel mode-shift, Middle click)',
      'Battery Life': 'Up to 70 days on full charge (3 hours from 1 min quick charge)',
      'Connectivity': 'Bluetooth Low Energy & Logi Bolt USB Receiver, pairs with 3 devices'
    },
    pros: ['MagSpeed wheel scrolls thousands of lines of code or spreadsheets in seconds', 'Quiet click switches allow silent late night work', 'Ergonomic palm contour eliminates wrist strain', 'Custom per-app shortcuts for VS Code, Figma, and Chrome'],
    cons: ['Right-handed contour only (not ambidextrous)', 'Weight is 141g (heavier than ultralight gaming mice)'],
    riskIndicators: {
      safetyScore: 99,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 7,
      notes: ['Logitech India Authorized Genuine Serial', 'Includes Logi Bolt Receiver & USB-C Cable']
    },
    productUrl: 'https://logitech.com/products/mice/mx-master-3s'
  },
  {
    id: 'acc-002',
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    brand: 'Keychron',
    category: 'accessories',
    price: 18499,
    priceUSD: 220,
    rating: 4.8,
    reviewCount: 920,
    availability: 'in_stock',
    stockCount: 16,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    description: '75% layout QMK/VIA wireless custom mechanical keyboard crafted from 6063 CNC aluminum. Double-gasket mount design for deep acoustic thock, hot-swappable Keychron K Pro switches, and programmable rotary knob.',
    targetAudience: ['programming', 'enthusiasts', 'office'],
    specs: {
      'Layout': '75% exploded layout with aluminum rotary volume encoder',
      'Body Material': 'Full CNC machined 6063 aluminum body',
      'Mounting': 'Double-Gasket Design with acoustic foam & silicone dampeners',
      'Switches': 'Keychron K Pro Red (Linear) / Brown (Tactile), Hot-swappable (5-pin)',
      'Connectivity': 'Bluetooth 5.1 & Type-C wired (1000Hz polling rate in wired mode)',
      'Battery': '4000 mAh rechargeable battery (up to 300 hours with backlight off)'
    },
    pros: ['Supreme custom acoustic sound profile without needing manual modding', 'Fully remappable keys and macros via browser VIA web app', 'Heavy 1.7kg solid aluminum frame does not budge on desk'],
    cons: ['Substantial weight makes it a desk anchor rather than travel keyboard', 'Premium pricing compared to plastic keyboards'],
    riskIndicators: {
      safetyScore: 98,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 14,
      notes: ['Keychron Official distributor warranty', 'Includes switch puller, keycap puller, and Mac/Windows extra keycaps']
    },
    productUrl: 'https://keychron.com/products/keychron-q1-pro-qmk-via-wireless-custom-mechanical-keyboard'
  },
  {
    id: 'acc-003',
    name: 'Anker Prime 100W 3-Port GaN Wall Charger',
    brand: 'Anker',
    category: 'accessories',
    price: 6499,
    priceUSD: 78,
    rating: 4.8,
    reviewCount: 3180,
    availability: 'in_stock',
    stockCount: 45,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80',
    description: 'Gallium Nitride (GaN) powered ultra-compact travel charger. Features 2x USB-C and 1x USB-A ports with dynamic PowerIQ 4.0 power distribution, ActiveShield 2.0 temperature monitoring, and full 100W laptop fast charging.',
    targetAudience: ['travelers', 'programming', 'creators', 'everyday'],
    specs: {
      'Total Output': '100W Max',
      'Port Configuration': '2x USB-C (100W max single port), 1x USB-A (22.5W max)',
      'Technology': 'GaNPrime with PowerIQ 4.0 and ActiveShield 2.0',
      'Size': '43% smaller than standard Apple 96W charger',
      'Weight': '183 g'
    },
    pros: ['Charges a 14" MacBook Pro and iPhone simultaneously at top speed', '43% smaller footprint than original laptop OEM bricks', 'Monitors temperature 3 million times per day for safety'],
    cons: ['USB-C charging cables not included in base pack'],
    riskIndicators: {
      safetyScore: 99,
      riskLevel: 'Safe',
      verifiedSeller: true,
      returnPolicyDays: 7,
      notes: ['Anker 24-month worry-free warranty', 'BIS certified for Indian power grids']
    },
    productUrl: 'https://anker.com/products/anker-prime-100w-wall-charger'
  }
];
