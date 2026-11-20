import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTypography, AppTextColors } from '../../../ui/theme/appTypography';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { VoiceWaveformVisualizer } from './VoiceWaveformVisualizer';
import { matchSpeechToGrocery } from '../../../services/voiceCatalogMatcher';
import {
  compareMultiStorePrices,
  VoicePriceComparisonResult,
} from '../../../services/multiStorePriceComparator';
import { useCartStore } from '../../../state/useCartStore';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface Props {
  visible: boolean;
  onClose: () => void;
  onItemAdded?: (storeName: string, productName: string) => void;
}

const QUICK_SUGGESTIONS = [
  '1 kg Tamatar',
  'Aashirvaad Atta 5kg',
  'Amul Doodh',
  'Fortune Tel 1L',
  'Nashik Pyaaz',
  'Fresh Paneer',
];

export const VoicePriceSaverModal: React.FC<Props> = ({
  visible,
  onClose,
  onItemAdded,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('Boliyen aapko kya chahiye?');
  const [comparisonResult, setComparisonResult] = useState<VoicePriceComparisonResult | null>(null);
  const [showCompetitors, setShowCompetitors] = useState(false);

  // References to prevent race conditions during native speech callbacks
  const latestTranscriptRef = useRef('');
  const hasProcessedRef = useRef(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Cart Store
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  // Process recognised speech and find lowest price
  const processRecognizedSpeech = useCallback((spokenText: string) => {
    if (!spokenText || spokenText.trim().length === 0) return;

    setTranscript(spokenText);
    setStatusMessage('Dukano ke rates scan ho rahe hain...');
    setIsListening(false);

    setTimeout(() => {
      const match = matchSpeechToGrocery(spokenText);
      if (match) {
        const result = compareMultiStorePrices(match);
        if (result) {
          setComparisonResult(result);
          setStatusMessage('Sabse sasta rate mil gaya!');
        } else {
          setStatusMessage('Koyi matching store nahi mila.');
        }
      } else {
        setStatusMessage('Samajh nahi aaya, kripya fir se bolein.');
      }
    }, 400);
  }, []);

  // Event Listeners for Native Speech Recognizer
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setStatusMessage('Sun rahe hain... Boliyen (Kisi bhi language mein)');
  });

  useSpeechRecognitionEvent('speechstart', () => {
    setStatusMessage('Awaaz detect hui... Bolte rahiye');
  });

  useSpeechRecognitionEvent('result', (event) => {
    const spoken = event.results[0]?.transcript;
    if (spoken) {
      latestTranscriptRef.current = spoken;
      setTranscript(spoken);
      if (event.isFinal && !hasProcessedRef.current) {
        hasProcessedRef.current = true;
        processRecognizedSpeech(spoken);
      }
    }
  });

  useSpeechRecognitionEvent('speechend', () => {
    if (latestTranscriptRef.current) {
      setStatusMessage('Dukano ke rates scan ho rahe hain...');
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    if (latestTranscriptRef.current && !hasProcessedRef.current) {
      hasProcessedRef.current = true;
      processRecognizedSpeech(latestTranscriptRef.current);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.warn('Speech recognition error event:', event.error, event.message);
    setIsListening(false);
    if (event.error === 'no-speech' || event.error === 'speech-timeout') {
      setStatusMessage('Awaaz sunai nahi di. Kripya fir se bolein ya tap karein.');
    } else if (event.error === 'not-allowed') {
      setStatusMessage('Microphone permission enable karein.');
      Alert.alert(
        'Microphone Permission Required',
        'Voice se sabse sasta rate dhoondhne ke liye kripya microphone permission allow karein.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Allow',
            onPress: async () => {
              try {
                await ExpoSpeechRecognitionModule.requestPermissionsAsync();
              } catch (_) {}
            },
          },
        ]
      );
    } else if (event.error === 'network') {
      setStatusMessage('Network issue. Kripya internet check karein.');
    } else {
      setStatusMessage('Boliyen aapko kya chahiye? (Tap mic to retry)');
    }
  });

  // Pulse ring animation when mic is active
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isListening) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      animation?.stop();
    };
  }, [isListening, pulseAnim]);

  // Modal slide animation
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();

      // Automatically start listening when modal opens
      startListeningSession();
    } else {
      slideAnim.setValue(300);
      stopListeningSession();
      setComparisonResult(null);
      setTranscript('');
      latestTranscriptRef.current = '';
      hasProcessedRef.current = false;
    }
  }, [visible]);

  // Native Speech Recognition Handler
  const startListeningSession = async () => {
    setComparisonResult(null);
    setTranscript('');
    latestTranscriptRef.current = '';
    hasProcessedRef.current = false;
    setStatusMessage('Sun rahe hain... Boliyen (Kisi bhi language mein)');
    setIsListening(true);

    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setIsListening(false);
        setStatusMessage('Microphone permission allow karein');
        Alert.alert(
          'Microphone Permission',
          'Voice se sabse sasta rate dhoondhne ke liye kripya microphone permission allow karein.'
        );
        return;
      }

      // Abort any ongoing session first to start clean
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch (_) {}

      ExpoSpeechRecognitionModule.start({
        lang: 'hi-IN', // Multilingual Indian recognition
        interimResults: true,
        maxAlternatives: 5,
        continuous: false,
        requiresOnDeviceRecognition: false,
        androidIntentOptions: {
          EXTRA_LANGUAGE_MODEL: 'free_form',
        },
      });
    } catch (err) {
      console.warn('Speech recognition module start error:', err);
      setIsListening(false);
      setStatusMessage('Mic start nahi ho saka. Tap to retry.');
    }
  };

  const stopListeningSession = () => {
    setIsListening(false);
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (e) {}
  };

  const handleSuggestionPress = (suggestion: string) => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch (_) {}
    setIsListening(false);
    hasProcessedRef.current = true;
    processRecognizedSpeech(suggestion);
  };

  const handleAddToCart = () => {
    if (!comparisonResult) return;
    const winner = comparisonResult.winnerQuote;

    // Multi-vendor cart check
    if (cartItems.length > 0) {
      const activeVendorId = cartItems[0].item.vendorId;
      if (activeVendorId && activeVendorId !== winner.storeId) {
        const activeVendorName = cartItems[0].item.vendorName || 'another store';
        Alert.alert(
          'Replace cart items?',
          `Your cart contains items from ${activeVendorName}. Do you want to discard them and add lowest price item from ${winner.storeName}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Replace & Add',
              style: 'destructive',
              onPress: () => {
                useCartStore.getState().clearCart();
                addItem({
                  id: winner.productId,
                  vendorId: winner.storeId,
                  vendorName: winner.storeName,
                  categoryId: comparisonResult.query.category,
                  nameEn: winner.productName,
                  unit: winner.quantityLabel,
                  stepQuantity: 1,
                  pricePaise: winner.sellingPrice * 100,
                  photoUrl: winner.imageUrl,
                  isInStock: true,
                });
                onItemAdded?.(winner.storeName, winner.productName);
                onClose();
              },
            },
          ]
        );
        return;
      }
    }

    addItem({
      id: winner.productId,
      vendorId: winner.storeId,
      vendorName: winner.storeName,
      categoryId: comparisonResult.query.category,
      nameEn: winner.productName,
      unit: winner.quantityLabel,
      stepQuantity: 1,
      pricePaise: winner.sellingPrice * 100,
      photoUrl: winner.imageUrl,
      isInStock: true,
    });

    onItemAdded?.(winner.storeName, winner.productName);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalSheet,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              {/* Top Drag Indicator */}
              <View style={styles.dragPill} />

              {/* 1. Header Row */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleWrap}>
                  <View style={styles.sparkleIconBox}>
                    <MaterialCommunityIcons name="star-four-points" size={17} color="#7C3AED" />
                  </View>
                  <Text style={styles.modalTitle}>Voice Price-Saver AI</Text>
                </View>

                {/* Multilingual Active Pill */}
                <View style={styles.langBadgePill}>
                  <Ionicons name="globe-outline" size={12} color="#15803D" style={{ marginRight: 4 }} />
                  <Text style={styles.langBadgeText}>All Languages</Text>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color="#696969" />
                </TouchableOpacity>
              </View>

              {/* 2. Audio Visualizer & Mic Section (When Listening or Searching) */}
              {!comparisonResult && (
                <View style={styles.listeningContainer}>
                  {/* Glowing Mic Button */}
                  <Animated.View
                    style={[
                      styles.micOuterPulse,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.micCircleButton}
                      onPress={isListening ? stopListeningSession : startListeningSession}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name={isListening ? 'mic' : 'mic-outline'}
                        size={32}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </Animated.View>

                  {/* 5-Bar Live Waveform */}
                  <View style={{ marginTop: 16 }}>
                    <VoiceWaveformVisualizer isListening={isListening} color="#8B5CF6" />
                  </View>

                  {/* Status Message */}
                  <Text style={styles.statusText}>{statusMessage}</Text>

                  {/* Real-Time Transcript Preview */}
                  {transcript ? (
                    <View style={styles.transcriptBubble}>
                      <Text style={styles.transcriptText}>"{transcript}"</Text>
                    </View>
                  ) : (
                    <Text style={styles.subtitleHint}>
                      Kisi bhi sabzi ya kirana item ka naam bolein
                    </Text>
                  )}

                  {/* Quick Suggestion Pills */}
                  <View style={styles.suggestionsSection}>
                    <Text style={styles.suggestionsHeader}>OR TAP TO SEARCH LOWEST RATE:</Text>
                    <View style={styles.suggestionPillsRow}>
                      {QUICK_SUGGESTIONS.map((s, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.suggestionChip}
                          onPress={() => handleSuggestionPress(s)}
                          activeOpacity={0.75}
                        >
                          <Ionicons name="sparkles" size={11} color="#7C3AED" style={{ marginRight: 4 }} />
                          <Text style={styles.suggestionChipText}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* 3. Lowest Price Result Winner Card */}
              {comparisonResult && (
                <View style={styles.resultContainer}>
                  {/* Top Guarantee Strip */}
                  <View style={styles.guaranteeStrip}>
                    <View style={styles.guaranteeLeft}>
                      <Ionicons name="checkmark-circle" size={14} color="#15803D" style={{ marginRight: 4 }} />
                      <Text style={styles.guaranteeText}>
                        LOWEST PRICE FOUND ACROSS {comparisonResult.totalStoresCompared} STORES
                      </Text>
                    </View>
                    <Text style={styles.savingsPill}>
                      Bachayein ₹{comparisonResult.maxSavingsAmount}
                    </Text>
                  </View>

                  {/* Winner Store Card */}
                  <View style={styles.winnerCard}>
                    <View style={styles.winnerHeader}>
                      <View style={styles.winnerStoreInfo}>
                        <View style={styles.storeBadgeRow}>
                          <Text style={styles.winnerStoreLabel}>SABSE SASTA STORE</Text>
                          <View style={styles.greenStarPill}>
                            <Ionicons name="star" size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
                            <Text style={styles.greenStarText}>
                              {comparisonResult.winnerQuote.score.toFixed(1)}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.winnerStoreName} numberOfLines={1}>
                          {comparisonResult.winnerQuote.storeName}
                        </Text>
                        <Text style={styles.winnerMetaText}>
                          {comparisonResult.winnerQuote.deliveryTimeMins} mins • {comparisonResult.winnerQuote.distanceKm.toFixed(2)} km away
                        </Text>
                      </View>
                    </View>

                    {/* Product Details Inside Winner Store */}
                    <View style={styles.productRow}>
                      <Image
                        source={{ uri: comparisonResult.winnerQuote.imageUrl }}
                        style={styles.productPhoto}
                        resizeMode="cover"
                      />
                      <View style={styles.productInfoCol}>
                        <Text style={styles.productTitle} numberOfLines={1}>
                          {comparisonResult.winnerQuote.productName}
                        </Text>
                        <Text style={styles.productUnit}>
                          Pack: {comparisonResult.winnerQuote.quantityLabel}
                        </Text>
                        <View style={styles.priceRow}>
                          <Text style={styles.winnerPrice}>
                            ₹{comparisonResult.winnerQuote.sellingPrice}
                          </Text>
                          {comparisonResult.winnerQuote.mrp > comparisonResult.winnerQuote.sellingPrice && (
                            <Text style={styles.winnerMrp}>
                              ₹{comparisonResult.winnerQuote.mrp}
                            </Text>
                          )}
                          <View style={styles.discountTag}>
                            <Text style={styles.discountTagText}>
                              {comparisonResult.winnerQuote.discountPercent}% OFF
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Direct Add to Cart Action Button */}
                    <TouchableOpacity
                      style={styles.addToCartBtn}
                      onPress={handleAddToCart}
                      activeOpacity={0.88}
                    >
                      <Ionicons name="bag-add" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.addToCartBtnText}>
                        ADD AT LOWEST PRICE (₹{comparisonResult.winnerQuote.sellingPrice})
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 4. Multi-Store Comparison Accordion */}
                  <TouchableOpacity
                    style={styles.comparisonToggleRow}
                    onPress={() => setShowCompetitors((prev) => !prev)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.comparisonToggleText}>
                      {showCompetitors ? 'Hide other store prices' : `Compare with ${comparisonResult.alternativeQuotes.length} other nearby stores`}
                    </Text>
                    <Ionicons
                      name={showCompetitors ? 'chevron-up' : 'chevron-down'}
                      size={15}
                      color="#696969"
                    />
                  </TouchableOpacity>

                  {showCompetitors && (
                    <View style={styles.competitorList}>
                      {comparisonResult.alternativeQuotes.map((quote) => (
                        <View key={quote.storeId} style={styles.competitorRow}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.competitorStoreName} numberOfLines={1}>
                              {quote.storeName}
                            </Text>
                            <Text style={styles.competitorMeta}>
                              {quote.deliveryTimeMins} mins • {quote.distanceKm} km
                            </Text>
                          </View>
                          <View style={styles.competitorPriceCol}>
                            <Text style={styles.competitorPrice}>₹{quote.sellingPrice}</Text>
                            <Text style={styles.higherDiffText}>
                              (+₹{quote.sellingPrice - comparisonResult.winnerQuote.sellingPrice} mehenga)
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Bottom Retry Button */}
                  <TouchableOpacity
                    style={styles.retryRow}
                    onPress={startListeningSession}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="mic" size={15} color="#7C3AED" style={{ marginRight: 5 }} />
                    <Text style={styles.retryText}>Fir se kuch aur bolein</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    maxHeight: '85%',
  },
  dragPill: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...AppTypography.cardTitle,
    fontSize: 16,
    lineHeight: 20,
  },
  langBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  langBadgeText: {
    ...AppTypography.badgeText,
    fontSize: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  micOuterPulse: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micCircleButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  statusText: {
    ...AppTypography.cardTitle,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 14,
  },
  subtitleHint: {
    ...AppTypography.cardMeta,
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
  },
  transcriptBubble: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  transcriptText: {
    ...AppTypography.cardMetaStrong,
    color: '#6B21A8',
    fontSize: 14,
  },
  suggestionsSection: {
    width: '100%',
    marginTop: 22,
  },
  suggestionsHeader: {
    ...AppTypography.sectionLabel,
    fontSize: 10.5,
    marginBottom: 8,
  },
  suggestionPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suggestionChipText: {
    ...AppTypography.chipText,
    fontSize: 11.5,
    color: '#334155',
  },
  resultContainer: {
    paddingVertical: 12,
  },
  guaranteeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  guaranteeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  guaranteeText: {
    ...AppTypography.badgeText,
    fontSize: 9.5,
    color: '#15803D',
  },
  savingsPill: {
    ...AppTypography.cardMetaStrong,
    fontSize: 11,
    color: '#15803D',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  winnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#22C55E',
    padding: 14,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  winnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  winnerStoreInfo: {
    flex: 1,
  },
  storeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  winnerStoreLabel: {
    ...AppTypography.sectionLabel,
    color: '#15803D',
    fontSize: 9.5,
    letterSpacing: 0.8,
  },
  greenStarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  greenStarText: {
    ...AppTypography.ratingText,
    fontSize: 10,
  },
  winnerStoreName: {
    ...AppTypography.cardTitle,
    fontSize: 15,
  },
  winnerMetaText: {
    ...AppTypography.cardMeta,
    fontSize: 11,
    marginTop: 1,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  productPhoto: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  productInfoCol: {
    flex: 1,
  },
  productTitle: {
    ...AppTypography.cardTitle,
    fontSize: 14,
  },
  productUnit: {
    ...AppTypography.cardMeta,
    fontSize: 11,
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  winnerPrice: {
    ...AppTypography.priceText,
    fontSize: 18,
    color: '#15803D',
  },
  winnerMrp: {
    ...AppTypography.mrpText,
    fontSize: 12,
  },
  discountTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  discountTagText: {
    ...AppTypography.badgeText,
    fontSize: 9.5,
  },
  addToCartBtn: {
    backgroundColor: '#15803D',
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartBtnText: {
    ...AppTypography.buttonText,
    fontSize: 13,
  },
  comparisonToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 6,
  },
  comparisonToggleText: {
    ...AppTypography.cardMetaStrong,
    fontSize: 11.5,
    color: '#696969',
  },
  competitorList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  competitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  competitorStoreName: {
    ...AppTypography.bodyText,
    fontWeight: '600',
    fontSize: 12,
  },
  competitorMeta: {
    ...AppTypography.cardMeta,
    fontSize: 10,
  },
  competitorPriceCol: {
    alignItems: 'flex-end',
  },
  competitorPrice: {
    ...AppTypography.priceText,
    fontSize: 13,
  },
  higherDiffText: {
    ...AppTypography.cardMeta,
    fontSize: 9.5,
    color: '#DC2626',
  },
  retryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  retryText: {
    ...AppTypography.cardMetaStrong,
    color: '#7C3AED',
    fontSize: 12,
  },
});
