import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { VendorShop } from '../../../api-client/types';

interface Props {
  shop: VendorShop;
  onPress: (shop: VendorShop) => void;
}

export const ZomatoShopCard: React.FC<Props> = ({ shop, onPress }) => {
  const handleCall = (e: any) => {
    e.stopPropagation();
    if (shop.ownerPhone) {
      const cleanPhone = shop.ownerPhone.replace(/\s+/g, '');
      Linking.openURL(`tel:${cleanPhone}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => onPress(shop)}
      activeOpacity={0.92}
    >
      {/* 1. Hero Store Image with Overlay Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              shop.bannerPhotoUrl ||
              'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Featured Item Badge on Image (Zomato Style) */}
        {shop.featuredDishName && (
          <View style={styles.featuredDishBadge}>
            <View style={styles.vegDotBorder}>
              <View style={styles.vegDotInner} />
            </View>
            <Text style={styles.featuredDishText} numberOfLines={1}>
              {shop.featuredDishName}
              {shop.featuredDishPrice ? ` • ₹${shop.featuredDishPrice}` : ''}
            </Text>
          </View>
        )}

        {/* Bookmark / Favorite Action */}
        <TouchableOpacity style={styles.bookmarkButton} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Open / Closed Status Tag */}
        {!shop.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>CURRENTLY CLOSED</Text>
          </View>
        )}
      </View>

      {/* 2. Shop Details Body */}
      <View style={styles.contentBody}>
        {/* Row 1: Shop Name & Rating Badge */}
        <View style={styles.headerRow}>
          <Text style={styles.shopName} numberOfLines={1}>
            {shop.shopName}
          </Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              {shop.score ? Number(shop.score).toFixed(1) : '4.5'}
            </Text>
            <Ionicons name="star" size={11} color="#FFFFFF" style={{ marginLeft: 3 }} />
          </View>
        </View>

        {/* Row 2: Delivery Meta (Time, Distance, Delivery Fee) */}
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color="#64748B" />
          <Text style={styles.metaText}>
            {shop.deliveryTimeMins || 15}-{Number(shop.deliveryTimeMins || 15) + 5} mins
          </Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.metaText}>
            {shop.distanceKm ? `${shop.distanceKm} km` : '0.8 km'}
          </Text>
          <Text style={styles.dotSeparator}>•</Text>
          <MaterialCommunityIcons name="moped" size={15} color="#16A34A" />
          <Text style={[styles.metaText, { color: '#16A34A', fontWeight: '700' }]}>
            FREE
          </Text>
        </View>

        {/* Row 3: Discount Offer Strip (Zomato Blue Ribbon) */}
        {shop.offersText && (
          <View style={styles.offerRow}>
            <View style={styles.offerBadgeIcon}>
              <MaterialCommunityIcons name="brightness-percent" size={14} color="#2563EB" />
            </View>
            <Text style={styles.offerText} numberOfLines={1}>
              {shop.offersText}
            </Text>
          </View>
        )}

        {/* Row 4: Tags & Direct Phone Call Action */}
        <View style={styles.footerRow}>
          <View style={styles.tagsContainer}>
            {(shop.tags || ['Kirana Store', 'Verified']).slice(0, 2).map((tag, idx) => (
              <View key={idx} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {shop.ownerPhone && (
            <TouchableOpacity
              style={styles.callShopButton}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={12} color="#0F172A" />
              <Text style={styles.callShopText}>Call Store</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  featuredDishBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '75%',
  },
  vegDotBorder: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#22C55E',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#FFFFFF',
  },
  vegDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  featuredDishText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  contentBody: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
    letterSpacing: -0.3,
  },
  ratingBadge: {
    backgroundColor: '#15803D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 4,
  },
  dotSeparator: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 6,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  offerBadgeIcon: {
    marginRight: 6,
  },
  offerText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '700',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  callShopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  callShopText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
});
