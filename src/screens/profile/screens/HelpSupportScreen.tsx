import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  navigation: any;
}

export const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does 9-minute instant delivery work?',
      a: 'We connect directly with hyper-local verified Mandi and Kirana stores within 1-2 km of your location. Packing begins the second your order is confirmed.',
    },
    {
      q: 'What if vegetables are damaged or missing?',
      a: 'You can tap on your order under Past Orders and choose "Report Issue". Our zero-questions-asked refund policy immediately credits your account.',
    },
    {
      q: 'How are Mandi prices decided?',
      a: 'Prices are synchronized daily with the local Agricultural Produce Market (Mandi) to ensure you get direct wholesale farm-fresh rates without supermarket markups.',
    },
    {
      q: 'Can I cancel an order once placed?',
      a: 'Yes, orders can be cancelled free of charge within 1 minute of placing before the partner starts packing your items.',
    },
  ];

  const handleCall = () => {
    Linking.openURL('tel:180020062634').catch(() => {
      Alert.alert('Call Support', 'Please call our toll-free number: 1800-200-MANDI (1800-200-62634)');
    });
  };

  const handleEmail = () => {
    Linking.openURL('mailto:orders@dusmint.com?subject=Support%20Request').catch(() => {
      Alert.alert('Email Support', 'Please email us at orders@dusmint.com');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* 1. Header */}
      <View style={[styles.headerContainer, { paddingTop: statusBarHeight }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Instant Channels */}
        <View style={styles.section}>
          <Text style={styles.caption}>INSTANT ASSISTANCE</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.channelRow} onPress={handleCall} activeOpacity={0.7}>
              <View style={styles.iconCircle}>
                <Ionicons name="call-outline" size={20} color="#047A36" />
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelTitle}>24/7 Mandi Helpline</Text>
                <Text style={styles.channelSub}>Toll-free 1800-200-MANDI (Immediate assistance)</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.channelRow} onPress={handleEmail} activeOpacity={0.7}>
              <View style={styles.iconCircle}>
                <Ionicons name="mail-outline" size={20} color="#047A36" />
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelTitle}>Email Customer Care</Text>
                <Text style={styles.channelSub}>orders@dusmint.com (Response within 15 mins)</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.caption}>FREQUENTLY ASKED QUESTIONS</Text>
          <View style={styles.card}>
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <View key={idx}>
                  <TouchableOpacity
                    style={styles.faqRow}
                    activeOpacity={0.7}
                    onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                  >
                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                  {isExpanded && (
                    <Text style={styles.faqAnswer}>{faq.a}</Text>
                  )}
                  {idx < faqs.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* Empty Support Status Card */}
        <View style={styles.section}>
          <Text style={styles.caption}>ACTIVE TICKETS</Text>
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={38} color="#64748B" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No open support tickets</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('OrdersList')}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>View Past Orders</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  caption: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#777777',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
    marginRight: 8,
  },
  channelTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  channelSub: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  faqQuestion: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13.5,
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 19,
    paddingBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 16,
  },
  addBtn: {
    backgroundColor: '#047A36',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 22,
  },
  addBtnText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
