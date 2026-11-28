import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VendorShop } from '../../../api-client/types';
import { useWishlistStore } from '../../../state/useWishlistStore';
import { AppTypography, AppTextColors } from '../../../ui/theme/appTypography';

interface Props {
  shop: VendorShop;
  onPress: (shop: VendorShop) => void;
  highlightItemLabel?: string;
  highlightItemPriceRupees?: number;
  highlightItemImageUrl?: string;
  startingPriceRupees?: number;
  isClosedMuted?: boolean;
}

export const ZomatoShopCard: React.FC<Props> = ({
  shop,
  onPress,
  highlightItemLabel,
  highlightItemPriceRupees,
  highlightItemImageUrl,
  startingPriceRupees,
  isClosedMuted = false,
}) => {
  const isWishlisted = useWishlistStore((s) => s.isShopWishlisted(shop.id));
  const toggleShop = useWishlistStore((s) => s.toggleShop);

  const handleBookmark = (e: any) => {
    e.stopPropagation();
    toggleShop({
      id: shop.id,
      shopName: shop.shopName,
      areaName: shop.areaName,
      distanceKm: shop.distanceKm,
      deliveryTimeMins: shop.deliveryTimeMins,
      score: shop.score,
      ratingCount: shop.ratingCount,
      bannerPhotoUrl: shop.bannerPhotoUrl,
      category: shop.category,
      address: (shop as any).address || shop.areaName,
      isOpen: shop.isOpen,
    });
  };

  const heroUri =
    highlightItemImageUrl ||
    shop.bannerPhotoUrl ||
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800';
  const muted = isClosedMuted || !shop.isOpen;

  return (
    <TouchableOpacity
      style={[styles.cardContainer, muted && styles.cardMuted]}
      onPress={() => onPress(shop)}
      activeOpacity={0.92}
    >
      {/* 1. Hero Store Image with Modern Overlay Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: heroUri }}
          style={[styles.heroImage, muted && styles.heroImageMuted]}
          resizeMode="cover"
        />

        {/* Matched Produce Highlight Pill (Top-Left, Zomato-style item badge) */}
        {highlightItemLabel ? (
          <View style={styles.itemMatchPill}>
            <View
              style={[
                styles.dietDotOuter,
                shop.category === 'meat'
                  ? styles.dietDotNonVegBorder
                  : styles.dietDotVegBorder,
              ]}
            >
              <View
                style={[
                  styles.dietDotInner,
                  shop.category === 'meat'
                    ? styles.dietDotNonVegFill
                    : styles.dietDotVegFill,
                ]}
              />
            </View>
            <Text style={styles.itemMatchText} numberOfLines={1}>
              {highlightItemLabel}
              {highlightItemPriceRupees !== undefined
                ? ` · ₹${highlightItemPriceRupees}`
                : ''}
            </Text>
          </View>
        ) : null}

        {/* Minimal Heart / Favorite Action */}
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmark}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            isWishlisted ? 'Remove shop from favorites' : 'Save shop to favorites'
          }
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={17}
            color={isWishlisted ? '#EF4444' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Open / Closed Status Tag */}
        {!shop.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>CURRENTLY CLOSED</Text>
          </View>
        )}
      </View>

      {/* 2. Shop Details Body (Tier-1 Clean Typography) */}
      <View style={styles.contentBody}>
        {/* Row 1: Shop Name (Left) & Distance + Locality (Right) */}
        <View style={styles.headerRow}>
          <Text
            style={[styles.shopName, muted && styles.mutedText]}
            numberOfLines={1}
          >
            {shop.shopName}
          </Text>
          <View style={styles.locationContainer}>
            <Text style={styles.distanceText}>
              {shop.distanceKm ? `${shop.distanceKm.toFixed(2)} km` : '0.40 km'}
            </Text>
            <Text style={styles.areaText} numberOfLines={1}>
              {shop.areaName || 'Indore'}
            </Text>
          </View>
        </View>

        {/* Row 2: Rating with Count & Delivery Time with Flash Icon */}
        <View style={styles.ratingAndSpeedRow}>
          <View style={styles.ratingInline}>
            <Ionicons
              name="star"
              size={13}
              color={muted ? '#64748B' : '#15803D'}
              style={{ marginRight: 3 }}
            />
            <Text style={[styles.ratingScore, muted && styles.mutedText]}>
              {shop.score ? Number(shop.score).toFixed(1) : '4.8'}
            </Text>
            <Text style={styles.ratingCount}>
              ({shop.ratingCount || 250}+)
            </Text>
          </View>

          <Text style={styles.bulletSeparator}>•</Text>

          <View style={styles.speedInline}>
            <Ionicons
              name="flash"
              size={12}
              color={muted ? '#64748B' : '#0F172A'}
              style={{ marginRight: 3 }}
            />
            <Text style={styles.deliveryTimeText}>
              {shop.deliveryTimeMins || 12} mins
            </Text>
          </View>
        </View>

        {/* Row 3 (Optional): Starting Price Row for Item-Filtered Shop Feeds */}
        {startingPriceRupees !== undefined ? (
          <View style={styles.startingPriceRow}>
            <Ionicons
              name="pricetag-outline"
              size={13}
              color="#2563EB"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.startingPriceText}>
              Items starting at ₹{startingPriceRupees}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  cardMuted: {
    opacity: 0.78,
    borderColor: '#E2E8F0',
  },
  imageContainer: {
    width: '100%',
    height: 184,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageMuted: {
    opacity: 0.65,
  },
  itemMatchPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    maxWidth: '72%',
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  dietDotOuter: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  dietDotVegBorder: {
    borderColor: '#15803D',
  },
  dietDotNonVegBorder: {
    borderColor: '#B91C1C',
  },
  dietDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dietDotVegFill: {
    backgroundColor: '#15803D',
  },
  dietDotNonVegFill: {
    backgroundColor: '#B91C1C',
  },
  itemMatchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  topBadgePill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  topBadgeText: {
    ...AppTypography.badgeText,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(28, 28, 28, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 28, 28, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: {
    ...AppTypography.sectionLabel,
    color: '#FFFFFF',
  },
  contentBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  shopName: {
    ...AppTypography.cardTitle,
    flex: 1,
    marginRight: 10,
  },
  mutedText: {
    color: '#64748B',
  },
  locationContainer: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  distanceText: {
    ...AppTypography.cardMetaStrong,
    fontVariant: ['tabular-nums'],
  },
  areaText: {
    ...AppTypography.cardMeta,
    marginTop: 1,
    maxWidth: 110,
  },
  ratingAndSpeedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScore: {
    ...AppTypography.ratingText,
    color: AppTextColors.brandGreen,
  },
  ratingCount: {
    ...AppTypography.cardMeta,
    marginLeft: 3,
  },
  bulletSeparator: {
    fontSize: 12,
    color: AppTextColors.tertiary,
    marginHorizontal: 7,
  },
  speedInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTimeText: {
    ...AppTypography.cardMetaStrong,
  },
  startingPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  startingPriceText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  minOrderText: {
    ...AppTypography.cardMeta,
  },
  pipeSeparator: {
    fontSize: 11,
    color: AppTextColors.tertiary,
    marginHorizontal: 6,
  },
  categoriesText: {
    ...AppTypography.cardMeta,
    flex: 1,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginTop: 9,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  offerText: {
    ...AppTypography.offerText,
    flex: 1,
  },
});
