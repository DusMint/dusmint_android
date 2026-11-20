/**
 * DusMint Voice AI - Multilingual Grocery Synonym & Normalizer Engine
 * Supports Hindi, Hinglish, English, Marathi, Gujarati, and local dialect terms
 */

export interface GroceryMapping {
  standardKey: string;
  primaryEnglish: string;
  category: 'fresh' | 'groceries' | 'dairy';
  keywords: string[];
  defaultUnit: string;
  sampleCatalogItem: string;
}

export interface MatchedGroceryQuery {
  matchedItemName: string;
  standardKey: string;
  category: string;
  quantity?: string;
  rawQuery: string;
  confidence: number;
}

export const MULTILINGUAL_GROCERY_DICTIONARY: GroceryMapping[] = [
  // 1. Fresh Vegetables
  {
    standardKey: 'tomato',
    primaryEnglish: 'Tomato',
    category: 'fresh',
    keywords: [
      'tamatar', 'tameta', 'tamate', 'tomato', 'tomatoes', 'tamator', 'tmatar',
      'tamater', 'desi tamatar', 'lal tamatar', 'tomato 1kg', 'tamatar 1kg'
    ],
    defaultUnit: '1 kg',
    sampleCatalogItem: 'Desi Hybrid Tomato',
  },
  {
    standardKey: 'potato',
    primaryEnglish: 'Potato',
    category: 'fresh',
    keywords: [
      'aalu', 'aloo', 'batata', 'potato', 'potatoes', 'aaloo', 'aalue',
      'jyoti aloo', 'indore aalu', 'batate', 'aloo 1kg'
    ],
    defaultUnit: '1 kg',
    sampleCatalogItem: 'Indore Jyoti Potato',
  },
  {
    standardKey: 'onion',
    primaryEnglish: 'Onion',
    category: 'fresh',
    keywords: [
      'pyaaz', 'pyaz', 'kanda', 'dungli', 'onion', 'onions', 'payaz',
      'nashik pyaaz', 'laal pyaaz', 'red onion', 'kande', 'pyaz 1kg'
    ],
    defaultUnit: '1 kg',
    sampleCatalogItem: 'Nashik Red Onion',
  },
  {
    standardKey: 'spinach',
    primaryEnglish: 'Spinach',
    category: 'fresh',
    keywords: [
      'palak', 'paalak', 'saag', 'spinach', 'hari palak', 'palak saag'
    ],
    defaultUnit: '250 g',
    sampleCatalogItem: 'Fresh Green Palak',
  },
  {
    standardKey: 'chilli',
    primaryEnglish: 'Green Chilli',
    category: 'fresh',
    keywords: [
      'mirchi', 'hari mirchi', 'chilli', 'chili', 'green chilli', 'mirch',
      'teekhi mirchi', 'harvi mirchi'
    ],
    defaultUnit: '100 g',
    sampleCatalogItem: 'Fresh Green Chillies',
  },
  {
    standardKey: 'lemon',
    primaryEnglish: 'Lemon',
    category: 'fresh',
    keywords: [
      'nimbu', 'limbu', 'lemon', 'lemons', 'khatta nimbu', 'neebu'
    ],
    defaultUnit: '4 pcs',
    sampleCatalogItem: 'Fresh Juicy Lemon',
  },
  {
    standardKey: 'ginger',
    primaryEnglish: 'Ginger',
    category: 'fresh',
    keywords: [
      'adrak', 'aadu', 'ale', 'ginger', 'adrakh'
    ],
    defaultUnit: '100 g',
    sampleCatalogItem: 'Fresh Ginger (Adrak)',
  },
  {
    standardKey: 'garlic',
    primaryEnglish: 'Garlic',
    category: 'fresh',
    keywords: [
      'lahsun', 'lasun', 'lasan', 'garlic', 'lahsan'
    ],
    defaultUnit: '100 g',
    sampleCatalogItem: 'Fresh Garlic (Lasan)',
  },
  {
    standardKey: 'coriander',
    primaryEnglish: 'Coriander',
    category: 'fresh',
    keywords: [
      'dhaniya', 'kothimbir', 'coriander', 'hara dhaniya', 'kothmir'
    ],
    defaultUnit: '100 g',
    sampleCatalogItem: 'Fresh Green Coriander',
  },

  // 2. Staples & Groceries
  {
    standardKey: 'atta',
    primaryEnglish: 'Atta',
    category: 'groceries',
    keywords: [
      'atta', 'aata', 'chakki atta', 'flour', 'wheat flour', 'gahu pith',
      'aashirvaad', 'aashirvaad atta', 'shudh chakki atta', 'atta 5kg', 'gehu ka aata'
    ],
    defaultUnit: '5 kg',
    sampleCatalogItem: 'Aashirvaad Shudh Chakki Atta',
  },
  {
    standardKey: 'oil',
    primaryEnglish: 'Refined Oil',
    category: 'groceries',
    keywords: [
      'tel', 'oil', 'refined oil', 'sarson tel', 'mitha tel', 'fortune oil',
      'cooking oil', 'soyabean tel', 'sunflower oil', 'tel 1 litre'
    ],
    defaultUnit: '1 L',
    sampleCatalogItem: 'Fortune Sunlite Refined Oil',
  },
  {
    standardKey: 'rice',
    primaryEnglish: 'Rice',
    category: 'groceries',
    keywords: [
      'chawal', 'tandool', 'chokha', 'rice', 'basmati', 'basmati rice',
      'kolam rice', 'tukda chawal', 'chawal 1kg'
    ],
    defaultUnit: '1 kg',
    sampleCatalogItem: 'India Gate Basmati Rice',
  },
  {
    standardKey: 'sugar',
    primaryEnglish: 'Sugar',
    category: 'groceries',
    keywords: [
      'cheeni', 'shakkar', 'sakhar', 'khand', 'sugar', 'chini'
    ],
    defaultUnit: '1 kg',
    sampleCatalogItem: 'Madhur Pure Sugar',
  },
  {
    standardKey: 'salt',
    primaryEnglish: 'Salt',
    category: 'groceries',
    keywords: [
      'namak', 'mith', 'salt', 'tata namak', 'iodized salt', 'sendha namak'
    ],
    defaultUnit: '1 kg',
    sampleCatalogItem: 'Tata Salt Vacuum Evaporated',
  },
  {
    standardKey: 'dal',
    primaryEnglish: 'Toor Dal',
    category: 'groceries',
    keywords: [
      'dal', 'daal', 'toor dal', 'tuvar dal', 'arhar dal', 'moong dal',
      'chana dal', 'peeli dal'
    ],
    defaultUnit: '1 kg',
    sampleCatalogItem: 'Tata Sampann Unpolished Toor Dal',
  },

  // 3. Dairy & Essentials
  {
    standardKey: 'milk',
    primaryEnglish: 'Milk',
    category: 'dairy',
    keywords: [
      'doodh', 'dudh', 'milk', 'paal', 'taaza', 'amul doodh', 'toned milk',
      'full cream', 'amul gold', 'doodh packet', 'doodh 500ml'
    ],
    defaultUnit: '500 ml',
    sampleCatalogItem: 'Amul Taaza Toned Milk',
  },
  {
    standardKey: 'paneer',
    primaryEnglish: 'Paneer',
    category: 'dairy',
    keywords: [
      'paneer', 'panir', 'fresh paneer', 'cottage cheese', 'malai paneer',
      'paneer 200g', 'amul paneer'
    ],
    defaultUnit: '200 g',
    sampleCatalogItem: 'Fresh Malai Paneer',
  },
  {
    standardKey: 'curd',
    primaryEnglish: 'Curd / Dahi',
    category: 'dairy',
    keywords: [
      'dahi', 'dahi packet', 'curd', 'yogurt', 'amul masti dahi', 'khatta dahi'
    ],
    defaultUnit: '400 g',
    sampleCatalogItem: 'Amul Masti Dahi Cup',
  },
  {
    standardKey: 'ghee',
    primaryEnglish: 'Ghee',
    category: 'dairy',
    keywords: [
      'ghee', 'desi ghee', 'tup', 'pure ghee', 'amul ghee', 'ghee 500ml'
    ],
    defaultUnit: '500 ml',
    sampleCatalogItem: 'Amul Pure Desi Ghee',
  },
  {
    standardKey: 'butter',
    primaryEnglish: 'Butter',
    category: 'dairy',
    keywords: [
      'butter', 'makkhan', 'loni', 'amul butter', 'white butter'
    ],
    defaultUnit: '100 g',
    sampleCatalogItem: 'Amul Pasteurised Butter',
  },
  {
    standardKey: 'tea',
    primaryEnglish: 'Tea',
    category: 'groceries',
    keywords: [
      'chai', 'chay', 'tea', 'chai patti', 'tata tea', 'red label', 'chai patti 250g'
    ],
    defaultUnit: '250 g',
    sampleCatalogItem: 'Tata Tea Gold Leaf Tea',
  },
];

/**
 * Extracts quantity units like 1 kg, 500g, 1L, etc. from voice query
 */
export function extractQuantityFromSpeech(speech: string): string | undefined {
  const clean = speech.toLowerCase();
  
  if (/\b(1|ek)\s*(kg|kilo|kilogram)\b/.test(clean)) return '1 kg';
  if (/\b(2|do)\s*(kg|kilo|kilogram)\b/.test(clean)) return '2 kg';
  if (/\b(5|paanch)\s*(kg|kilo|kilogram)\b/.test(clean)) return '5 kg';
  if (/\b(aadha|adha|half)\s*(kilo|kg)\b/.test(clean)) return '500 g';
  if (/\b500\s*(g|gm|gram)\b/.test(clean)) return '500 g';
  if (/\b250\s*(g|gm|gram|pav|paav)\b/.test(clean)) return '250 g';
  if (/\b100\s*(g|gm|gram)\b/.test(clean)) return '100 g';
  if (/\b(1|ek)\s*(litre|liter|ltr|l)\b/.test(clean)) return '1 L';
  if (/\b500\s*(ml|milli)\b/.test(clean)) return '500 ml';

  return undefined;
}

/**
 * Levenshtein Distance for fuzzy accent/spelling match
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = [];

  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }

  return d[m][n];
}

/**
 * Normalizes speech input and finds the best grocery item match
 */
export function matchSpeechToGrocery(speech: string): MatchedGroceryQuery | null {
  if (!speech || speech.trim().length === 0) return null;

  const rawClean = speech.toLowerCase().trim();
  const tokens = rawClean.split(/\s+/);
  const detectedQuantity = extractQuantityFromSpeech(rawClean);

  let bestMatch: GroceryMapping | null = null;
  let highestScore = 0;

  for (const item of MULTILINGUAL_GROCERY_DICTIONARY) {
    // 1. Direct Substring Check
    for (const kw of item.keywords) {
      if (rawClean.includes(kw)) {
        const score = 1.0;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      }
    }

    // 2. Token Matching & Fuzzy Matching
    if (!bestMatch || highestScore < 0.9) {
      for (const token of tokens) {
        if (token.length < 3) continue;
        for (const kw of item.keywords) {
          const kwTokens = kw.split(' ');
          for (const kt of kwTokens) {
            if (kt.length < 3) continue;
            if (token === kt) {
              const score = 0.92;
              if (score > highestScore) {
                highestScore = score;
                bestMatch = item;
              }
            } else {
              const dist = levenshteinDistance(token, kt);
              if (dist === 1 && kt.length >= 4) {
                const score = 0.82;
                if (score > highestScore) {
                  highestScore = score;
                  bestMatch = item;
                }
              }
            }
          }
        }
      }
    }
  }

  if (bestMatch && highestScore >= 0.75) {
    return {
      matchedItemName: bestMatch.sampleCatalogItem,
      standardKey: bestMatch.standardKey,
      category: bestMatch.category,
      quantity: detectedQuantity || bestMatch.defaultUnit,
      rawQuery: speech,
      confidence: highestScore,
    };
  }

  // Fallback: If no predefined item matched, return clean keyword for general search
  return {
    matchedItemName: speech.trim(),
    standardKey: 'general',
    category: 'groceries',
    quantity: detectedQuantity || '1 unit',
    rawQuery: speech,
    confidence: 0.5,
  };
}
