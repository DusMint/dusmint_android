import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  noBagSelected: boolean;
  onToggleNoBag: (val: boolean) => void;
  noBagAvailable?: boolean;
}

export const NoBagCard: React.FC<Props> = ({
  noBagSelected,
  onToggleNoBag,
  noBagAvailable = true,
}) => {
  return (
    <View style={[styles.card, !noBagAvailable && styles.disabledCard]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>I don't need a bag!</Text>
        <Text style={styles.subtext}>
          {noBagAvailable
            ? 'Save paper and opt for bag-less delivery at your doorstep'
            : 'Due to high demand, No bag delivery is currently unavailable'}
        </Text>
      </View>

      <Switch
        value={noBagAvailable && noBagSelected}
        onValueChange={onToggleNoBag}
        disabled={!noBagAvailable}
        trackColor={{ false: '#E0E0E0', true: InstamartColors.accentBlue }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledCard: {
    opacity: 0.55,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  subtext: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
    lineHeight: 15,
  },
});

