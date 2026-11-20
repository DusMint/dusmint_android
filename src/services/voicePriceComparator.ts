import { CatalogueItem } from '../api-client/types';
import { MatchedCatalogItem, matchCatalogItems } from './voiceCatalogMatcher';

export interface StorePriceOption {
  item: CatalogueItem;
  storeName: string;
  distanceKm: number;
  deliveryTimeMins: number;
  priceRupees: number;
  mrpRupees: number;
  discountPercent: number;
  savingsVsCompetitorRupees: number;
  isLowestPrice: boolean;
}

export interface PriceComparisonResult {
  winner: StorePriceOption;
  competitors: StorePriceOption[];
  totalStoresCount: number;
  searchQuery: string;
  productName: string;
}

/**
 * Compares prices across all nearby stores for the searched item
 * and ranks the store with the lowest rate at the top.
 */
export async function comparePricesForQuery(query: string): Promise<PriceComparisonResult | null> {
  const matches: MatchedCatalogItem[] = await matchCatalogItems(query);
  if (!matches || matches.length === 0) {
    return null;
  }

  // 1. Convert matches to structured store price options
  const options: StorePriceOption[] = matches.map((m) => {
    const priceRupees = Math.round(m.item.pricePaise / 100);
    const mrpRupees = m.item.mrpPaise ? Math.round(m.item.mrpPaise / 100) : Math.round(priceRupees * 1.25);
    const discountPercent = mrpRupees > priceRupees ? Math.round(((mrpRupees - priceRupees) / mrpRupees) * 100) : 0;

    return {
      item: m.item,
      storeName: m.storeName,
      distanceKm: m.distanceKm,
      deliveryTimeMins: m.deliveryTimeMins,
      priceRupees,
      mrpRupees,
      discountPercent,
      savingsVsCompetitorRupees: 0,
      isLowestPrice: false,
    };
  });

  // 2. Sort by price ascending (Lowest price first)
  options.sort((a, b) => a.priceRupees - b.priceRupees);

  // 3. Mark the Winner Store (Lowest Price)
  const winner = options[0];
  winner.isLowestPrice = true;

  // 4. Calculate savings compared to other stores in the market
  const competitors = options.slice(1);
  if (competitors.length > 0) {
    const highestCompetitorPrice = Math.max(...competitors.map((c) => c.priceRupees));
    winner.savingsVsCompetitorRupees = Math.max(0, highestCompetitorPrice - winner.priceRupees);
  } else if (winner.mrpRupees > winner.priceRupees) {
    winner.savingsVsCompetitorRupees = winner.mrpRupees - winner.priceRupees;
  }

  return {
    winner,
    competitors,
    totalStoresCount: options.length,
    searchQuery: query,
    productName: winner.item.nameEn,
  };
}
