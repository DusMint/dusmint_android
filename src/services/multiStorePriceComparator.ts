/**
 * DusMint Voice AI - Multi-Store Price Comparison Engine
 * Scans all local vendor shops in customer cluster and finds the lowest rate
 */

import { LOCAL_SHOPS, DUMMY_PRODUCTS, ProductItem } from '../screens/home/data/homeData';
import { MatchedGroceryQuery } from './voiceCatalogMatcher';

export interface StorePriceQuote {
  storeId: string;
  storeName: string;
  storeArea: string;
  distanceKm: number;
  deliveryTimeMins: number;
  score: number;
  productId: string;
  productName: string;
  quantityLabel: string;
  imageUrl: string;
  sellingPrice: number; // in Rupees
  mrp: number; // in Rupees
  discountPercent: number;
  inStock: boolean;
  savingsVsMrp: number;
}

export interface VoicePriceComparisonResult {
  query: MatchedGroceryQuery;
  winnerQuote: StorePriceQuote;
  alternativeQuotes: StorePriceQuote[];
  maxSavingsAmount: number;
  totalStoresCompared: number;
}

/**
 * Searches and compares item rates across all nearby local stores
 */
export function compareMultiStorePrices(
  query: MatchedGroceryQuery
): VoicePriceComparisonResult | null {
  const searchTerm = query.matchedItemName.toLowerCase();
  const categoryKey = query.category;

  // 1. Gather all potential product items matching this product
  let candidateProducts: ProductItem[] = [];

  // Match against local catalog items
  candidateProducts = DUMMY_PRODUCTS.filter((p) => {
    const pName = p.name.toLowerCase();
    return (
      pName.includes(searchTerm) ||
      searchTerm.includes(pName) ||
      (query.standardKey !== 'general' && p.category === categoryKey)
    );
  });

  if (candidateProducts.length === 0) {
    candidateProducts = DUMMY_PRODUCTS.slice(0, 3);
  }

  const quotes: StorePriceQuote[] = [];

  // 2. Generate quotes from different stores delivering to the user
  LOCAL_SHOPS.forEach((shop, index) => {
    // Pick the most relevant product or simulate realistic vendor catalog variance
    const baseProduct = candidateProducts[index % candidateProducts.length];
    if (!baseProduct) return;

    // Realistic multi-store price variance (e.g. Mandi Fresh offers lower on fresh, Sharma Kirana on staples)
    let priceOffset = 0;
    if (shop.category === 'vegetables' && categoryKey === 'fresh') {
      priceOffset = -4; // Direct Mandi rate discount
    } else if (shop.category === 'kirana' && categoryKey === 'groceries') {
      priceOffset = -10; // Wholesale Kirana rate discount
    } else if (index === 0) {
      priceOffset = -3;
    } else if (index === 1) {
      priceOffset = 2;
    } else {
      priceOffset = 4;
    }

    const calculatedSellingPrice = Math.max(10, baseProduct.price + priceOffset);
    const calculatedMrp = Math.max(calculatedSellingPrice + 5, baseProduct.mrp);
    const discount = Math.round(((calculatedMrp - calculatedSellingPrice) / calculatedMrp) * 100);

    quotes.push({
      storeId: shop.id,
      storeName: shop.shopName,
      storeArea: shop.areaName || 'Main Market',
      distanceKm: shop.distanceKm || 0.8,
      deliveryTimeMins: shop.deliveryTimeMins || 12,
      score: shop.score || 4.8,
      productId: `${shop.id}-${baseProduct.id}`,
      productName: baseProduct.name,
      quantityLabel: query.quantity || baseProduct.quantityLabel,
      imageUrl: baseProduct.imageUrl,
      sellingPrice: calculatedSellingPrice,
      mrp: calculatedMrp,
      discountPercent: discount,
      inStock: true,
      savingsVsMrp: calculatedMrp - calculatedSellingPrice,
    });
  });

  if (quotes.length === 0) return null;

  // 3. Sort strictly by Lowest Selling Price first
  quotes.sort((a, b) => a.sellingPrice - b.sellingPrice);

  const winner = quotes[0];
  const alternatives = quotes.slice(1);

  // Calculate highest savings compared to competitor or MRP
  const highestCompetitorPrice = alternatives.length > 0 ? alternatives[alternatives.length - 1].sellingPrice : winner.mrp;
  const maxSavings = Math.max(winner.savingsVsMrp, highestCompetitorPrice - winner.sellingPrice);

  return {
    query,
    winnerQuote: winner,
    alternativeQuotes: alternatives,
    maxSavingsAmount: maxSavings,
    totalStoresCompared: quotes.length,
  };
}
