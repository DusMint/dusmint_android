import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  addressTitle?: string;
  addressSubtitle?: string;
  onBackPress: () => void;
  onAddressPress: () => void;
  onSearchPress: () => void;
  onWishlistPress: () => void;
  onClearCart: () => void;
  onHelpPress: () => void;
}

export const CartAppBar: React.FC<Props> = ({
  addressTitle = 'HOME',
  addressSubtitle = 'Indore Vijay Nagar, 1st Floor, Shuddh Mandi Hub',
  onBackPress,
  onAddressPress,
  onSearchPress,
  onWishlistPress,
  onClearCart,
  onHelpPress,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      <View style={styles.bar}>
        {/* Left: Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBackPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={InstamartColors.ink} />
        </TouchableOpacity>

        {/* Center-Left: Address Info */}
        <TouchableOpacity
          style={styles.addressContainer}
          onPress={onAddressPress}
          activeOpacity={0.7}
        >
          <View style={styles.addressTitleRow}>
            <Text style={styles.addressTitle}>{addressTitle}</Text>
            <Ionicons name="chevron-down" size={14} color={InstamartColors.ink} style={{ marginLeft: 3 }} />
          </View>
          <Text style={styles.addressSubtitle} numberOfLines={1}>
            {addressSubtitle}
          </Text>
        </TouchableOpacity>

        {/* Right Actions: Search, Wishlist, 3-Dot Menu */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onSearchPress}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="search-outline" size={19} color={InstamartColors.ink} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onWishlistPress}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="bookmark-outline" size={19} color={InstamartColors.ink} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="ellipsis-vertical" size={19} color={InstamartColors.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3-Dot Dropdown Popup Modal */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.menuPopup, { top: statusBarHeight + 46 }]}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onClearCart();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color="#D32F2F" style={{ marginRight: 10 }} />
                  <Text style={styles.clearCartText}>Clear cart</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onHelpPress();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="help-circle-outline" size={18} color={InstamartColors.ink} style={{ marginRight: 10 }} />
                  <Text style={styles.helpItemText}>Need help?</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    zIndex: 10,
  },
  bar: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  addressContainer: {
    flex: 1,
    marginRight: 10,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
    fontWeight: '800',
    color: InstamartColors.ink,
  },
  addressSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666666',
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuPopup: {
    position: 'absolute',
    right: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  clearCartText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#D32F2F',
  },
  helpItemText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: InstamartColors.ink,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
});

