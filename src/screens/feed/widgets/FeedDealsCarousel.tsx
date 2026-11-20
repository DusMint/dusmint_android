import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTypography } from '../../../ui/theme/appTypography';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { useCartStore } from '../../../state/useCartStore';
import { DUMMY_PRODUCTS, resolveProductVendor, ProductItem } from '../../home/data/homeData';

interface Props {
  onExploreMore?: () => void;
  onProductPress?: (product: ProductItem) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(270, SCREEN_WIDTH * 0.74);

export const FeedDealsCarousel: React.FC<Props> = ({
  onExploreMore,
  onProductPress,
}) => {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  // Top curated savings deals
  const deals = DUMMY_PRODUCTS.slice(0, 5);

  const handleAddToCart = (product: ProductItem, e: any) => {
    e.stopPropagation();
    const resolvedShop = resolveProductVendor(product);
    const targetVendorId = resolvedShop.id;
    const targetVendorName = resolvedShop.shopName;

    const cart = useCartStore.getState();
    if (cart.items.length > 0 && cart.currentVendorId && cart.currentVendorId !== targetVendorId) {
      const existingVendorName = cart.currentVendorName || 'another store';
      Alert.alert(
        'Replace cart items?',
        `Your cart contains items from ${existingVendorName}. Do you want to discard them and add items from ${targetVendorName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace Cart',
            style: 'destructive',
            onPress: () => {
              cart.clearCart();
              addItem({
                id: product.id,
                vendorId: targetVendorId,
                vendorName: targetVendorName,
                categoryId: product.category,
                nameEn: product.name,
                unit: product.quantityLabel,
                stepQuantity: 1,
                pricePaise: product.price * 100,
                photoUrl: product.imageUrl,
                isInStock: product.inStock,
              });
            },
          },
        ]
      );
      return;
    }

    addItem({
      id: product.id,
      vendorId: targetVendorId,
      vendorName: targetVendorName,
      categoryId: product.category,
      nameEn: product.name,
      unit: product.quantityLabel,
      stepQuantity: 1,
      pricePaise: product.price * 100,
      photoUrl: product.imageUrl,
      isInStock: product.inStock,
    });
  };

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>
          Best savings deals in your area
        </Text>
        <Text style={styles.sectionSubtitle}>
          that you might like
        </Text>
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 14}
        decelerationRate="fast"
      >
        {deals.map((deal) => {
          const shop = resolveProductVendor(deal);
          const quantity = useCartStore.getState().getItemQuantity(deal.id);

          return (
            <TouchableOpacity
              key={deal.id}
              style={styles.card}
              onPress={() => onProductPress?.(deal)}
              activeOpacity={0.9}
            >
              {/* Product Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: deal.imageUrl }}
                  style={styles.productImage}
                  resizeMode="cover"
                />

                {/* Top Discount Tag */}
                {deal.mrp > deal.price && (
                  <View style={styles.discountPill}>
                    <Text style={styles.discountPillText}>
                      {Math.round(((deal.mrp - deal.price) / deal.mrp) * 100)}% OFF
                    </Text>
                  </View>
                )}
              </View>

              {/* Body */}
              <View style={styles.cardBody}>
                {/* Veg Indicator + Title */}
                <View style={styles.nameRow}>
                  <View style={styles.vegBorder}>
                    <View style={styles.vegDot} />
                  </View>
                  <Text style={styles.productName} numberOfLines={1}>
                    {deal.name}
                  </Text>
                </View>

                {/* Store Name */}
                <Text style={styles.storeName} numberOfLines={1}>
                  {shop.shopName}
                </Text>

                {/* Rating & Delivery Time */}
                <View style={styles.metaRow}>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>4.8</Text>
                    <Ionicons name="star" size={10} color="#FFFFFF" style={{ marginLeft: 2 }} />
                  </View>
                  <Text style={styles.pipeDivider}>|</Text>
                  <Ionicons name="flash" size={11} color="#059669" />
                  <Text style={styles.deliveryTimeText}>{deal.deliveryMins || '9-12 mins'}</Text>
                </View>

                {/* Price and Add Button */}
                <View style={styles.footerRow}>
                  <View style={styles.priceCol}>
                    <Text style={styles.priceText}>₹{deal.price}</Text>
                    {deal.mrp > deal.price && (
                      <Text style={styles.mrpText}>₹{deal.mrp}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.addBtn,
                      quantity > 0 && styles.addBtnActive,
                    ]}
                    onPress={(e) => handleAddToCart(deal, e)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.addBtnText, quantity > 0 && styles.addBtnTextActive]}>
                      {quantity > 0 ? `ADDED (${quantity})` : 'ADD +'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Explore More Button */}
      <View style={styles.exploreMoreContainer}>
        <TouchableOpacity
          style={styles.exploreMoreBtn}
          onPress={onExploreMore}
          activeOpacity={0.8}
        >
          <Text style={styles.exploreMoreText}>Explore more</Text>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    ...AppTypography.cardTitle,
    fontSize: 18,
    color: '#1C1C1C',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionSubtitle: {
    ...AppTypography.cardMeta,
    fontSize: 14,
    color: '#696969',
    textAlign: 'center',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountPillText: {
    ...AppTypography.badgeText,
    color: '#FFFFFF',
    fontSize: 10,
  },
  cardBody: {
    padding: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vegBorder: {
    width: 13,
    height: 13,
    borderWidth: 1.5,
    borderColor: '#16A34A',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  productName: {
    ...AppTypography.cardTitle,
    fontSize: 14,
    flex: 1,
  },
  storeName: {
    ...AppTypography.cardMeta,
    fontSize: 11.5,
    color: '#696969',
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  ratingText: {
    ...AppTypography.ratingText,
    fontSize: 11,
  },
  pipeDivider: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  deliveryTimeText: {
    ...AppTypography.cardMetaStrong,
    fontSize: 11,
    color: '#059669',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  priceText: {
    ...AppTypography.priceText,
    fontSize: 16,
  },
  mrpText: {
    ...AppTypography.mrpText,
    fontSize: 11,
  },
  addBtn: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  addBtnText: {
    ...AppTypography.buttonText,
    fontSize: 12,
    color: '#E11D48',
  },
  addBtnTextActive: {
    color: '#FFFFFF',
  },
  exploreMoreContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  exploreMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exploreMoreText: {
    ...AppTypography.buttonText,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
