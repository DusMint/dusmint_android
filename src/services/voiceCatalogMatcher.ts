import { dusmintApi } from '../api-client';
import { CatalogueItem } from '../api-client/types';
import { DUMMY_PRODUCTS, LOCAL_SHOPS, ProductItem, resolveProductVendor } from '../screens/home/data/homeData';

/**
 * Universal Multilingual Pan-India Synonym Map
 * Maps diverse regional dialects (Hindi, Marathi, Gujarati, English, Hinglish, etc.)
 * to canonical conceptual terms.
 */
export const MULTILINGUAL_SYNONYMS: Record<string, string[]> = {
  tomato: ['tamatar', 'tameta', 'tamate', 'tomato', 'tamator', 'tmatar', 'टमाटर', 'टोमॅटो', 'ટમેટા'],
  potato: ['aalu', 'aloo', 'batata', 'potato', 'alu', 'aaloo', 'आलू', 'बटाटा', 'બટાટા'],
  onion: ['pyaaz', 'pyaz', 'kanda', 'dungli', 'onion', 'piaz', 'प्याज', 'कांदा', 'ડુંગળી'],
  flour: ['atta', 'aata', 'chakki atta', 'flour', 'wheat flour', 'gahu pith', 'aashirvaad', 'आटा', 'गहू पीठ', 'ઘઉંનો લોટ'],
  milk: ['doodh', 'dudh', 'milk', 'paal', 'dudha', 'taaza', 'toned milk', 'दूध', 'દૂધ'],
  oil: ['tel', 'oil', 'refined oil', 'sarson tel', 'mustard oil', 'sunflower oil', 'mitha tel', 'fortune tel', 'तेल', 'તેલ'],
  sugar: ['cheeni', 'shakkar', 'sakhar', 'sugar', 'khand', 'chini', 'चीनी', 'शक्कर', 'साखर', 'ખાંડ'],
  ghee: ['ghee', 'desi ghee', 'tup', 'amul ghee', 'घी', 'तूप', 'ઘી'],
  paneer: ['paneer', 'panir', 'cottage cheese', 'पनीर', 'પનીર'],
  curd: ['dahi', 'curd', 'yogurt', 'दही'],
  rice: ['chawal', 'rice', 'tandool', 'chokha', 'basmati', 'kolam', 'चावल', 'तांदूळ', 'ચોખા'],
  dal: ['dal', 'daal', 'toor dal', 'moong dal', 'chana dal', 'urad dal', 'masoor dal', 'दाल', 'દાળ'],
  ginger: ['adrak', 'ginger', 'ale', 'aadu', 'अदरक', 'आले', 'આદુ'],
  garlic: ['lahsun', 'lasan', 'garlic', 'लहसुन', 'લસણ'],
  lemon: ['nimbu', 'limbu', 'lemon', 'नींबू', 'लिंबू', 'લીંબુ'],
  chilli: ['mirchi', 'hari mirch', 'chilli', 'chili', 'green chilli', 'मिर्ची', 'हरी मिर्च', 'મરચાં'],
  coriander: ['dhaniya', 'coriander', 'kothimbir', 'kothmir', 'धनिया', 'कोथिंबीर', 'કોથમીર'],
  spinach: ['palak', 'spinach', 'पालक'],
  salt: ['namak', 'salt', 'mith', 'मीठ', 'नमक', 'મીઠું'],
  tea: ['chai', 'tea', 'chay', 'patti', 'चाय', 'ચા'],
  coffee: ['coffee', 'कॉफी'],
  bread: ['bread', 'pav', 'paav', 'ब्रेड', 'पाव'],
  butter: ['butter', 'makhan', 'maska', 'makkhan', 'मक्खन', 'માખણ'],
  biscuit: ['biscuit', 'biscuits', 'cookies', 'बिस्कुट'],
  soap: ['sabun', 'soap', 'bathing soap', 'साबुन', 'સાબુ'],
  detergent: ['surf', 'detergent', 'washing powder', 'सर्फ'],
  egg: ['anda', 'ande', 'egg', 'eggs', 'अंडा', 'ઈંડા'],
};

/**
 * Filler stop words in Hinglish/Hindi to strip before matching
 */
const FILLER_STOP_WORDS = new Set([
  'chahiye', 'dedo', 'bhejo', 'lao', 'mangwana', 'mangwa', 'do', 'de',
  'karo', 'mujhe', 'humko', 'kya', 'rate', 'bhav', 'price', 'sasta',
  'sabse', 'kamm', 'low', 'best', 'store', 'dukan', 'give', 'me',
  'please', 'want', 'need', 'send', 'dikhao', 'show', 'hai', 'ki',
  'ka', 'ke', 'aur', 'and', 'with', 'ek', 'do', 'teen',
]);

/**
 * Levenshtein Distance for fuzzy typo tolerance
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Normalizes string similarity between 0 and 1
 */
export function calculateSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;

  return (longerLength - calculateLevenshteinDistance(longer, shorter)) / longerLength;
}

export interface ExtractedQuery {
  rawQuery: string;
  cleanedQuery: string;
  tokens: string[];
  quantityStr?: string;
  canonicalConcepts: string[];
}

/**
 * Extracts quantity and canonical concepts from user voice/text query
 */
export function parseVoiceQuery(input: string): ExtractedQuery {
  const raw = (input || '').trim().toLowerCase();

  // 1. Extract Quantity (e.g. 1 kg, 500g, 2 litre, 5 pcs)
  const quantityRegex = /(\d+(?:\.\d+)?)\s*(kg|kilo|kilos|g|gm|gms|gram|grams|l|litre|litres|liter|liters|ml|packet|packets|pkt|pkts|pc|pcs|piece|pieces)\b/i;
  const quantityMatch = raw.match(quantityRegex);
  const quantityStr = quantityMatch ? quantityMatch[0] : undefined;

  // 2. Strip quantity and punctuation from search string
  let withoutQuantity = raw.replace(quantityRegex, ' ').replace(/[^\w\s\u0900-\u097F\u0A80-\u0AFF]/g, ' ');

  // 3. Tokenize & filter stop words
  const rawTokens = withoutQuantity.split(/\s+/).filter(Boolean);
  const filteredTokens = rawTokens.filter((t) => !FILLER_STOP_WORDS.has(t));

  // 4. Resolve Canonical Concepts from Synonym Map
  const canonicalConcepts: string[] = [];
  const searchTokens = filteredTokens.length > 0 ? filteredTokens : rawTokens;

  for (const token of searchTokens) {
    for (const [concept, synonyms] of Object.entries(MULTILINGUAL_SYNONYMS)) {
      if (concept === token || synonyms.some((s) => s === token || calculateSimilarity(s, token) >= 0.85)) {
        if (!canonicalConcepts.includes(concept)) {
          canonicalConcepts.push(concept);
        }
      }
    }
  }

  return {
    rawQuery: raw,
    cleanedQuery: searchTokens.join(' '),
    tokens: searchTokens,
    quantityStr,
    canonicalConcepts,
  };
}

export interface MatchedCatalogItem {
  item: CatalogueItem;
  storeName: string;
  distanceKm: number;
  deliveryTimeMins: number;
  matchScore: number;
}

/**
 * Dynamically indexes live items and ranks them against the query
 */
export async function matchCatalogItems(queryText: string): Promise<MatchedCatalogItem[]> {
  const parsed = parseVoiceQuery(queryText);
  if (!parsed.cleanedQuery && parsed.canonicalConcepts.length === 0) {
    return [];
  }

  // 1. Fetch live items from backend (with local fallback)
  let allItems: CatalogueItem[] = [];
  try {
    const live = await dusmintApi.getAllItems();
    if (live && live.length > 0) {
      allItems = live;
    }
  } catch {
    // fallback
  }

  if (allItems.length === 0) {
    // Generate robust catalog dynamically from DUMMY_PRODUCTS and LOCAL_SHOPS
    allItems = DUMMY_PRODUCTS.map((p) => {
      const shop = resolveProductVendor(p);
      return {
        id: p.id,
        vendorId: shop.id,
        vendorName: shop.shopName,
        categoryId: p.category,
        nameEn: p.name,
        nameHi: undefined,
        unit: p.quantityLabel,
        stepQuantity: 1,
        pricePaise: p.price * 100,
        mrpPaise: p.mrp * 100,
        photoUrl: p.imageUrl,
        isInStock: p.inStock,
      };
    });
  }

  // 2. Score each catalog item against parsed concepts & query tokens
  const results: MatchedCatalogItem[] = [];

  for (const item of allItems) {
    if (item.isInStock === false) continue;

    const nameEn = (item.nameEn || '').toLowerCase();
    const nameHi = (item.nameHi || '').toLowerCase();
    const vendorName = (item.vendorName || 'Local Dukandar');

    let score = 0;

    // Check direct substring matches
    for (const token of parsed.tokens) {
      if (nameEn.includes(token)) score += 3.0;
      if (nameHi.includes(token)) score += 3.0;
    }

    // Check canonical concept matches
    for (const concept of parsed.canonicalConcepts) {
      const synonyms = MULTILINGUAL_SYNONYMS[concept] || [];
      if (nameEn.includes(concept)) score += 4.0;
      if (nameHi.includes(concept)) score += 4.0;

      for (const syn of synonyms) {
        if (nameEn.includes(syn) || nameHi.includes(syn)) {
          score += 3.5;
          break;
        }
      }
    }

    // Fuzzy similarity against item words
    const words = `${nameEn} ${nameHi}`.split(/\s+/);
    for (const token of parsed.tokens) {
      for (const w of words) {
        const sim = calculateSimilarity(token, w);
        if (sim >= 0.8) {
          score += sim * 2.0;
        }
      }
    }

    if (score >= 1.5) {
      // Resolve store distance and delivery time
      const foundShop = LOCAL_SHOPS.find((s) => s.id === item.vendorId || s.shopName === item.vendorName);
      const distanceKm = foundShop?.distanceKm || 0.4;
      const deliveryTimeMins = foundShop?.deliveryTimeMins || 12;

      results.push({
        item,
        storeName: foundShop?.shopName || vendorName,
        distanceKm,
        deliveryTimeMins,
        matchScore: score,
      });
    }
  }

  // Sort by highest match score
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
