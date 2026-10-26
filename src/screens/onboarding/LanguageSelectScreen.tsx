import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius, RoundButton } from '@dusmint/ui';
import { useAuthStore } from '../../state/useAuthStore';
import i18next from '@dusmint/i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSelect'>;

interface LangOption {
  code: 'en' | 'hi' | 'mr';
  label: string;
  subLabel: string;
}

const languages: LangOption[] = [
  { code: 'hi', label: 'हिंदी', subLabel: 'Hindi (अनुशंसित / Recommended)' },
  { code: 'en', label: 'English', subLabel: 'English' },
  { code: 'mr', label: 'मराठी', subLabel: 'Marathi' },
];

export const LanguageSelectScreen: React.FC<Props> = ({ navigation }) => {
  const [selected, setSelected] = useState<'en' | 'hi' | 'mr'>('hi');
  const setLanguage = useAuthStore((s) => s.setLanguage);

  const handleContinue = () => {
    setLanguage(selected);
    i18next.changeLanguage(selected);
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>अपनी भाषा चुनें</Text>
        <Text style={styles.subTitle}>Select your preferred language</Text>
      </View>

      <View style={styles.optionsList}>
        {languages.map((item) => {
          const isChosen = selected === item.code;
          return (
            <TouchableOpacity
              key={item.code}
              activeOpacity={0.8}
              onPress={() => setSelected(item.code)}
              style={[
                styles.card,
                isChosen ? styles.cardSelected : null,
              ]}
            >
              <View style={styles.textGroup}>
                <Text style={[styles.langLabel, isChosen ? styles.textActive : null]}>
                  {item.label}
                </Text>
                <Text style={styles.langSubLabel}>{item.subLabel}</Text>
              </View>

              <View style={[styles.radioCircle, isChosen ? styles.radioSelected : null]}>
                {isChosen ? <View style={styles.radioInner} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <RoundButton
          title={selected === 'hi' ? 'जारी रखें' : 'Continue'}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
  },
  subTitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  optionsList: {
    marginVertical: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surfaceCream,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  textGroup: {
    flex: 1,
  },
  langLabel: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  textActive: {
    color: Colors.primary,
  },
  langSubLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  footer: {
    marginBottom: Spacing.xl,
  },
});
