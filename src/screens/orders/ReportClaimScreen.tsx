import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius, RoundButton, RoundTextField } from '@dusmint/ui';
import { dusmintApi } from '@dusmint/api-client';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportClaim'>;

type ClaimType = 'underweight' | 'damaged_or_rotten' | 'missing_item' | 'incorrect_item';

const claimOptions: { type: ClaimType; label: string; icon: string }[] = [
  { type: 'underweight', label: 'Item is Underweight', icon: '⚖️' },
  { type: 'damaged_or_rotten', label: 'Spoiled or Bad Quality', icon: '🥀' },
  { type: 'missing_item', label: 'Missing from Sealed Bag', icon: '❓' },
  { type: 'incorrect_item', label: 'Wrong Item Delivered', icon: '🔄' },
];

export const ReportClaimScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [selectedType, setSelectedType] = useState<ClaimType>('underweight');
  const [claimedWeight, setClaimedWeight] = useState('');
  const [remarks, setRemarks] = useState('');
  const [photoAttached, setPhotoAttached] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitClaim = async () => {
    setSubmitting(true);
    try {
      await dusmintApi.submitQualityClaim({
        orderId,
        orderItemId: 'item-101',
        claimType: selectedType,
        claimedWeightGrams: claimedWeight ? parseInt(claimedWeight, 10) : undefined,
        proofPhotoUrl: 'https://images.unsplash.com/photo-example-scale.jpg',
        customerRemarks: remarks,
      });

      setSubmitting(false);
      Alert.alert(
        'Claim Approved Instantly! ✅',
        'Because your order is within the 30-minute claim window and verified by our automated trust engine, a full refund of ₹32.00 has been credited to your original payment method.',
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'HomeTab' }) }]
      );
    } catch {
      setSubmitting(false);
      Alert.alert(
        'Claim Submitted',
        'Your claim has been submitted to cluster operations for immediate review. Refund will be processed within 15 minutes.',
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'HomeTab' }) }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../../assets/img/btn_back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Report a Problem</Text>
          <Text style={styles.headerSub}>30-minute quality & weight guarantee</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Timer Alert */}
        <View style={styles.timerBanner}>
          <Text style={styles.timerIcon}>⏱️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.timerTitle}>Active 30-Minute Claim Window</Text>
            <Text style={styles.timerSub}>
              Bag was opened 8 minutes ago. Small claims under ₹100 are approved automatically.
            </Text>
          </View>
        </View>

        {/* Claim Type Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What is the issue with your item?</Text>

          {claimOptions.map((opt) => {
            const isChosen = selectedType === opt.type;
            return (
              <TouchableOpacity
                key={opt.type}
                activeOpacity={0.8}
                onPress={() => setSelectedType(opt.type)}
                style={[
                  styles.optionRow,
                  isChosen ? styles.optionSelected : null,
                ]}
              >
                <Text style={styles.optionIcon}>{opt.icon}</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    isChosen ? styles.optionTextActive : null,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.radio}>{isChosen ? '🔘' : '⚪'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Weight input if underweight */}
        {selectedType === 'underweight' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Actual Weight Measured</Text>
            <RoundTextField
              hintText="e.g. 850 (in grams)"
              keyboardType="number-pad"
              value={claimedWeight}
              onChangeText={setClaimedWeight}
              leftIcon={<Text style={{ fontSize: 16 }}>⚖️</Text>}
            />
          </View>
        ) : null}

        {/* Photo Proof Upload */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload Photo Proof</Text>
          <Text style={styles.photoDesc}>
            Take a clear photo of the item on your kitchen scale or the defective produce.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setPhotoAttached(!photoAttached)}
            style={[
              styles.uploadBox,
              photoAttached ? styles.uploadBoxDone : null,
            ]}
          >
            <Text style={styles.uploadIcon}>{photoAttached ? '✅' : '📷'}</Text>
            <Text style={styles.uploadText}>
              {photoAttached ? 'Photo Attached (scale_proof.jpg)' : 'Tap to Take Photo with Camera'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Remarks */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Notes (Optional)</Text>
          <RoundTextField
            hintText="Explain issue briefly..."
            value={remarks}
            onChangeText={setRemarks}
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <RoundButton
          title="Submit Claim for Instant Refund"
          onPress={handleSubmitClaim}
          loading={submitting}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    paddingRight: Spacing.md,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: 90,
  },
  timerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  timerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  timerTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.xs,
    color: '#92400E',
  },
  timerSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginVertical: 4,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  optionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  optionLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    flex: 1,
  },
  optionTextActive: {
    fontFamily: Typography.fontFamily.heading,
    color: Colors.primary,
  },
  radio: {
    fontSize: 16,
  },
  photoDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  uploadBox: {
    height: 100,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.placeholder,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLightGrey,
  },
  uploadBoxDone: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
    borderStyle: 'solid',
  },
  uploadIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  uploadText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.xs,
    color: Colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    padding: Spacing.base,
  },
});
