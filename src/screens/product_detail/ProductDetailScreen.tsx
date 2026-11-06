import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  getProductDetailById,
  ProductVariantDetail,
  ProductDetailModel,
  SAMPLE_TENDER_COCONUT,
} from './data/productDetailData';
import { DetailHeroGallery } from './widgets/DetailHeroGallery';
import { DetailCollapsedAppBar } from './widgets/DetailCollapsedAppBar';
import { ProductInfoCard } from './widgets/ProductInfoCard';
import { PaymentOffersCard } from './widgets/PaymentOffersCard';
import { TrustStripCard } from './widgets/TrustStripCard';
import { ProductAttributesCard } from './widgets/ProductAttributesCard';
import { SimilarProductsSection } from './widgets/SimilarProductsSection';
import { DetailBottomBar } from './widgets/DetailBottomBar';
import { ProductItem } from '../home/data/homeData';
import { dusmintApi } from '@dusmint/api-client';
import { useWishlistStore } from '../../state/useWishlistStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId, initialVariantId } = route.params;
  const [product, setProduct] = useState<ProductDetailModel>(() => getProductDetailById(productId));

  // Selected Variant State
  const initialVariant =
    product.variants.find((v) => v.id === initialVariantId) ||
    product.variants[0] || {
      id: 'var-default',
      label: '1 unit',
      price: 50,
      mrp: 60,
      unitPriceLabel: '₹50/unit',
      inStock: true,
    };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDetail>(initialVariant);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(productId));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const [isCollapsedBarVisible, setIsCollapsedBarVisible] = useState(false);

  const handleWishlistToggle = () => {
    toggleWishlist({
      id: productId,
      vendorId: 'vendor-detail',
      categoryId: product.categoryId || 'cat-fresh',
      nameEn: product.name,
      unit: selectedVariant.label,
      stepQuantity: 1,
      pricePaise: selectedVariant.price * 100,
      mrpPaise: selectedVariant.mrp * 100,
      photoUrl: product.images?.[0],
      isInStock: selectedVariant.inStock,
      deliveryMins: product.deliveryMins,
    });
  };

  useEffect(() => {
    let active = true;
    dusmintApi.getAllItems().then((items) => {
      const match = items.find((i) => i.id === productId);
      if (match && active) {
        const price = Math.round(match.pricePaise / 100);
        const mrp = match.mrpPaise ? Math.round(match.mrpPaise / 100) : Math.round(price * 1.25);
        const updatedVariant: ProductVariantDetail = {
          id: match.id,
          label: match.unit,
          price,
          mrp,
          unitPriceLabel: `₹${price}/${match.unit}`,
          inStock: match.isInStock,
          discountPercent: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : undefined,
        };
        setSelectedVariant(updatedVariant);
        setProduct({
          id: match.id,
          name: match.nameEn,
          shortDescription:
            (match as any).descriptionEn ||
            'Farm fresh high quality product sourced directly from local verified mandi merchants.',
          categoryId: match.categorySlug || 'groceries',
          categoryName: match.categoryName || 'Groceries & Kitchen',
          images: [match.photoUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'],
          deliveryMins: '9 MINS',
          variants: [updatedVariant],
          offers: SAMPLE_TENDER_COCONUT.offers,
          attributes: SAMPLE_TENDER_COCONUT.attributes,
          similarProducts: SAMPLE_TENDER_COCONUT.similarProducts,
        });
      }
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, [productId]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsCollapsedBarVisible(offsetY > 220);
  };

  const handleCategoryLink = () => {
    navigation.navigate('ItemList', {
      categoryId: product.categoryId,
      title: product.categoryName,
    });
  };

  const handleOffersPress = () => {
    Alert.alert(
      'Available Payment Offers',
      '1. Flat ₹150 OFF on orders above ₹499 via Mandi Saver.\n2. 5% Instant cashback on UPI payments.\n3. Free Delivery automatically applied above ₹99.',
      [{ text: 'Great!' }]
    );
  };

  const handleSimilarProductPress = (simProduct: ProductItem) => {
    navigation.push('ProductDetail', {
      productId: simProduct.id,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* 1. Collapsed Pinned App Bar (revealed on scroll) */}
      <DetailCollapsedAppBar
        visible={isCollapsedBarVisible}
        productName={product.name}
        isWishlisted={isWishlisted}
        onBackPress={() => navigation.goBack()}
        onWishlistToggle={handleWishlistToggle}
      />

      {/* 2. Scrollable Detail Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Gallery with Image Carousel & Floating Top Buttons */}
        <DetailHeroGallery
          images={product.images}
          deliveryMins={product.deliveryMins}
          productName={product.name}
          isWishlisted={isWishlisted}
          onBackPress={() => navigation.goBack()}
          onWishlistToggle={handleWishlistToggle}
        />

        {/* Info Card with Title, Description, Quantity & Variant Selector */}
        <ProductInfoCard
          product={product}
          selectedVariant={selectedVariant}
          onSelectVariant={(v) => setSelectedVariant(v)}
          onCategoryLinkPress={handleCategoryLink}
        />

        {/* Payment Offers Card */}
        <PaymentOffersCard
          offers={product.offers}
          onOffersPress={handleOffersPress}
        />

        {/* Trust Strip Card (48H Refund, Fast Delivery, 24/7 Support) */}
        <TrustStripCard />

        {/* Product Attributes Tabs Card (Highlights, Description, Benefits, Storage) */}
        <ProductAttributesCard tabs={product.attributes} />

        {/* Similar Products Carousel */}
        <SimilarProductsSection
          products={product.similarProducts}
          onProductPress={handleSimilarProductPress}
        />

        {/* Bottom spacer so content is never hidden behind the bottom bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 3. Pinned Detail Bottom Bar with Floating Cart Strip */}
      <DetailBottomBar
        variant={selectedVariant}
        productName={product.name}
        productImage={product.images[0] || ''}
        onViewCart={() => navigation.navigate('Cart')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F8',
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

