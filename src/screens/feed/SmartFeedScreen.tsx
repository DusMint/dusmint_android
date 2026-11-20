import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../state/useAuthStore';
import { useCartStore } from '../../state/useCartStore';
import { AppTypography, AppTextColors } from '../../ui/theme/appTypography';
import { FeedDealsCarousel } from './widgets/FeedDealsCarousel';
import { FeedFloatingInputBar } from './widgets/FeedFloatingInputBar';
import { AudioWaveformVisualizer } from './widgets/AudioWaveformVisualizer';
import { PriceComparisonCard } from './widgets/PriceComparisonCard';
import { comparePricesForQuery, PriceComparisonResult } from '../../services/voicePriceComparator';
import {
  isSpeechRecognitionSupported,
  requestSpeechPermissions,
  startSpeechRecognition,
  stopSpeechRecognition,
  useSafeSpeechEvent,
} from '../../services/safeSpeechService';

type Props = NativeStackScreenProps<RootStackParamList, 'SmartFeed'>;

const SUGGESTED_CHIPS = [
  'Tamatar 1 kg',
  'Amul Taaza Doodh',
  'Aashirvaad Atta 5kg',
  'Fortune Oil 1L',
  'Aalu 2 kg',
  'Maggi Noodles',
];

export const SmartFeedScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const userName = user?.fullName ? user.fullName.split(' ')[0] : 'Shopper';

  // Screen phase: 'greeting' -> 'feed'
  const [phase, setPhase] = useState<'greeting' | 'feed'>('greeting');
  const greetingFadeAnim = useRef(new Animated.Value(1)).current;
  const feedFadeAnim = useRef(new Animated.Value(0)).current;

  // Search & Voice States
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<PriceComparisonResult | null>(null);
  const [noResultQuery, setNoResultQuery] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  // Transition from greeting to feed
  const transitionToFeed = useCallback(() => {
    if (phase === 'feed') return;
    Animated.timing(greetingFadeAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      setPhase('feed');
      Animated.timing(feedFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    });
  }, [phase, greetingFadeAnim, feedFadeAnim]);

  // Initial greeting auto-transition after 1.4s
  useEffect(() => {
    const timer = setTimeout(() => {
      transitionToFeed();
      if (route?.params?.autoStartVoice) {
        startVoiceRecognition();
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [transitionToFeed, route?.params?.autoStartVoice]);

  // Execute Price Comparison Search
  const handlePerformSearch = async (queryToSearch: string) => {
    const query = queryToSearch.trim();
    if (!query) return;

    Keyboard.dismiss();
    transitionToFeed();
    setIsSearching(true);
    setNoResultQuery(null);

    try {
      const result = await comparePricesForQuery(query);
      if (result) {
        setComparisonResult(result);
        setNoResultQuery(null);
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 200);
      } else {
        setComparisonResult(null);
        setNoResultQuery(query);
      }
    } catch (err) {
      console.warn('Search error:', err);
      setComparisonResult(null);
      setNoResultQuery(query);
    } finally {
      setIsSearching(false);
    }
  };

  // Speech Recognition Events
  useSafeSpeechEvent('start', () => {
    setIsListening(true);
    setSpeechTranscript('');
  });

  useSafeSpeechEvent('end', () => {
    setIsListening(false);
  });

  useSafeSpeechEvent('result', (event) => {
    const transcript = event?.results?.[0]?.transcript || '';
    setSpeechTranscript(transcript);
    setInputText(transcript);

    if (event?.isFinal && transcript.trim().length > 0) {
      stopVoiceRecognition();
      handlePerformSearch(transcript);
    }
  });

  useSafeSpeechEvent('error', (event) => {
    console.warn('Speech recognition error:', event?.error, event?.message);
    setIsListening(false);
  });

  // Start speech recognition
  const startVoiceRecognition = async () => {
    transitionToFeed();

    if (!isSpeechRecognitionSupported()) {
      Alert.alert(
        'Voice Recognition',
        'Live microphone voice search ke liye app ko new APK build se update karna hoga (npx expo run:android). Tab tak aap product ka naam likh kar ya suggestions tap karke lowest price check kar sakte hain.',
        [{ text: 'Theek Hai' }]
      );
      return;
    }

    try {
      const granted = await requestSpeechPermissions();
      if (!granted) {
        Alert.alert(
          'Microphone Permission',
          'Voice search use karne ke liye microphone permission allow kijiye.',
          [{ text: 'Theek Hai' }]
        );
        setIsListening(false);
        return;
      }

      setIsListening(true);
      setSpeechTranscript('');
      startSpeechRecognition({
        lang: 'hi-IN',
        interimResults: true,
        continuous: false,
      });
    } catch (e) {
      console.warn('Failed to start voice recognition:', e);
      setIsListening(false);
    }
  };

  // Stop speech recognition
  const stopVoiceRecognition = () => {
    stopSpeechRecognition();
    setIsListening(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };

  const handleResetSearch = () => {
    setInputText('');
    setSpeechTranscript('');
    setComparisonResult(null);
    setNoResultQuery(null);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen 1: Minimalist Personalized Greeting */}
      {phase === 'greeting' && (
        <Animated.View
          style={[
            styles.greetingContainer,
            {
              paddingTop: Math.max(insets.top, 24) + 120,
              opacity: greetingFadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.greetingTouchArea}
            activeOpacity={1}
            onPress={transitionToFeed}
          >
            <Text style={styles.greetingTitle}>Hi {userName}!</Text>
            <Text style={styles.greetingSubtitle}>
              What are you looking for today?
            </Text>
            <View style={styles.greetingHintRow}>
              <Ionicons name="sparkles" size={15} color="#8B5CF6" />
              <Text style={styles.greetingHintText}>
                DusMint AI finds the lowest price across local stores
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Screen 2: "Your Feed" View */}
      {phase === 'feed' && (
        <Animated.View style={[styles.feedContainer, { opacity: feedFadeAnim }]}>
          {/* Top Bar matching Zomato's Feed */}
          <View
            style={[
              styles.topBar,
              { paddingTop: Math.max(insets.top, 14) + 6 },
            ]}
          >
            <TouchableOpacity
              style={styles.topBarCircleBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="home-outline" size={20} color="#1F2937" />
            </TouchableOpacity>

            <Text style={styles.topBarTitle}>Your Feed</Text>

            <TouchableOpacity
              style={styles.topBarCircleBtn}
              onPress={handleResetSearch}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={20} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Main Scrollable Content */}
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. Curated Best Savings Deals Carousel */}
            <FeedDealsCarousel
              onExploreMore={() => navigation.navigate('MainTabs', { screen: 'BrowseTab' })}
              onProductPress={(prod) =>
                navigation.navigate('ProductDetail', { productId: prod.id })
              }
            />

            {/* 2. Anchor Prompt Banner matching Zomato ("Too many options? Let DusMint find lowest price") */}
            <View style={styles.promptAnchorCard}>
              <View style={styles.sparkleIconBox}>
                <Ionicons name="sparkles" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.promptTextContainer}>
                <Text style={styles.promptHeading}>Too many options?</Text>
                <Text style={styles.promptSubheading}>
                  Let DusMint find the lowest price
                </Text>
              </View>
            </View>

            {/* 3. Quick Chips for instant query selection */}
            <View style={styles.chipsSection}>
              <Text style={styles.chipsSectionLabel}>TRY ASKING BY VOICE OR TAP</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {SUGGESTED_CHIPS.map((chip, index) => (
                  <TouchableOpacity
                    key={`chip-${index}`}
                    style={styles.suggestionChip}
                    onPress={() => {
                      setInputText(chip);
                      handlePerformSearch(chip);
                    }}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="search" size={12} color="#8B5CF6" />
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 4. Active Voice Waveform Visualizer Banner */}
            {isListening && (
              <View style={styles.waveformCard}>
                <AudioWaveformVisualizer isListening={isListening} />
                <Text style={styles.liveTranscriptText}>
                  {speechTranscript
                    ? `Aapne bola: "${speechTranscript}"`
                    : 'Sun rahe hain... Kripya boliye (jaise "1 kilo Tamatar")'}
                </Text>
              </View>
            )}

            {/* 5. Loading Indicator while searching across stores */}
            {isSearching && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.loadingText}>
                  Checking prices across all nearby stores...
                </Text>
              </View>
            )}

            {/* 6. Comparison Results (Winner + Competitors) */}
            {comparisonResult && !isSearching && (
              <PriceComparisonCard
                result={comparisonResult}
                onItemPress={(item) =>
                  navigation.navigate('ProductDetail', { productId: item.id })
                }
              />
            )}

            {/* 7. No Result Message if item not found */}
            {noResultQuery && !isSearching && (
              <View style={styles.noResultCard}>
                <Ionicons name="search-outline" size={28} color="#9CA3AF" />
                <Text style={styles.noResultTitle}>Item Not Found</Text>
                <Text style={styles.noResultSubtitle}>
                  "{noResultQuery}" is currently not available in nearby stores. Try searching for other groceries or daily essentials.
                </Text>
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Floating Glassmorphic Dual-Input Bar (Voice & Text) */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <FeedFloatingInputBar
              value={inputText}
              onChangeText={setInputText}
              onSubmitText={() => handlePerformSearch(inputText)}
              onMicPress={toggleMic}
              isListening={isListening}
              onCartPress={() => navigation.navigate('Cart')}
              onNewPress={handleResetSearch}
            />
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  greetingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  greetingTouchArea: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  greetingTitle: {
    ...AppTypography.screenTitle,
    fontSize: 26,
    color: AppTextColors.primary,
    textAlign: 'center',
  },
  greetingSubtitle: {
    ...AppTypography.bodyText,
    fontSize: 18,
    color: AppTextColors.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  greetingHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  greetingHintText: {
    ...AppTypography.badgeText,
    fontSize: 11.5,
    color: '#6D28D9',
  },
  feedContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topBarCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    ...AppTypography.screenTitle,
    fontSize: 17,
    color: AppTextColors.primary,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  promptAnchorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
    backgroundColor: '#FAF5FF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: 12,
  },
  sparkleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptTextContainer: {
    flex: 1,
  },
  promptHeading: {
    ...AppTypography.cardTitle,
    fontSize: 15,
    color: AppTextColors.primary,
  },
  promptSubheading: {
    ...AppTypography.cardMeta,
    fontSize: 12.5,
    color: '#7C3AED',
    marginTop: 2,
    fontWeight: '600',
  },
  chipsSection: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  chipsSectionLabel: {
    ...AppTypography.sectionLabel,
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  chipsRow: {
    gap: 8,
    paddingRight: 16,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  chipText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#374151',
  },
  waveformCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C4B5FD',
  },
  liveTranscriptText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#6D28D9',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    gap: 8,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#6B7280',
  },
  noResultCard: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noResultTitle: {
    ...AppTypography.cardTitle,
    fontSize: 15,
    color: AppTextColors.primary,
    marginTop: 8,
  },
  noResultSubtitle: {
    ...AppTypography.cardMeta,
    fontSize: 12.5,
    color: AppTextColors.secondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
