import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, RoundButton } from '@dusmint/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'OnBoarding'>;

const { width } = Dimensions.get('window');

const pageArr = [
  {
    title: 'Find Food You Love',
    subtitle:
      'Discover the best foods from over 1,000\nrestaurants and fast delivery to your\ndoorstep',
    image: require('../../../assets/img/on_boarding_1.png'),
  },
  {
    title: 'Fast Delivery',
    subtitle: 'Fast food delivery to your home, office\nwherever you are',
    image: require('../../../assets/img/on_boarding_2.png'),
  },
  {
    title: 'Live Tracking',
    subtitle:
      'Real time tracking of your food on the app\nonce you placed the order',
    image: require('../../../assets/img/on_boarding_3.png'),
  },
];

export const OnBoardingScreen: React.FC<Props> = ({ navigation }) => {
  const [selectPage, setSelectPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (selectPage >= 2) {
      navigation.replace('MainTabs', { screen: 'HomeTab' });
    } else {
      const nextPage = selectPage + 1;
      setSelectPage(nextPage);
      flatListRef.current?.scrollToIndex({ index: nextPage, animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={pageArr}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setSelectPage(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.page}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
      />

      {/* Dots Indicator */}
      <View style={styles.dotsRow}>
        {pageArr.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === selectPage ? Colors.primary : Colors.placeholder,
              },
            ]}
          />
        ))}
      </View>

      {/* Next Button */}
      <View style={styles.btnContainer}>
        <RoundButton title="Next" onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  page: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    marginTop: 40,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 40,
  },
  title: {
    color: Colors.primaryText,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    color: Colors.secondaryText,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 25,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  btnContainer: {
    width: '100%',
    paddingHorizontal: 25,
  },
});
