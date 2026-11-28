import { ImageSourcePropType } from 'react-native';

export type ProduceGroup = 'vegetables' | 'fruits' | 'chicken' | 'mutton' | 'fish';

export type ShopCategorySlug = 'vegetables' | 'fruits' | 'meat';

export interface ProduceSubVariant {
  id: string;
  label: string;
  searchKeyword: string;
  image: ImageSourcePropType;
}

export interface ProduceCategoryItem {
  id: string;
  label: string;
  shortLabel?: string;
  group: ProduceGroup;
  shopCategory: ShopCategorySlug;
  image: ImageSourcePropType;
  isHeroDashboard: boolean;
  isVeg: boolean;
  basePriceRupees: number;
  matchKeywords: string[];
  subVariants: ProduceSubVariant[];
}

export interface ProduceGroupTab {
  id: 'all' | ProduceGroup;
  label: string;
  isVegSafe: boolean;
}

export const PRODUCE_GROUP_TABS: ProduceGroupTab[] = [
  { id: 'all', label: 'All', isVegSafe: true },
  { id: 'vegetables', label: 'Vegetables', isVegSafe: true },
  { id: 'fruits', label: 'Fruits', isVegSafe: true },
  { id: 'chicken', label: 'Chicken', isVegSafe: false },
  { id: 'mutton', label: 'Mutton', isVegSafe: false },
  { id: 'fish', label: 'Fish & Seafood', isVegSafe: false },
];

const IMG = {
  tomato: require('../../../../assets/images/categories/cat_tomato.webp'),
  onion: require('../../../../assets/images/categories/cat_onion.webp'),
  potato: require('../../../../assets/images/categories/cat_potato.webp'),
  bhindi: require('../../../../assets/images/categories/cat_bhindi.webp'),
  cauliflower: require('../../../../assets/images/categories/cat_cauliflower.webp'),
  cabbage: require('../../../../assets/images/categories/cat_cabbage.webp'),
  brinjal: require('../../../../assets/images/categories/cat_brinjal.webp'),
  lauki: require('../../../../assets/images/categories/cat_lauki.webp'),
  spinach: require('../../../../assets/images/categories/cat_spinach.webp'),
  peas: require('../../../../assets/images/categories/cat_peas.webp'),
  carrot: require('../../../../assets/images/categories/cat_carrot.webp'),
  capsicum: require('../../../../assets/images/categories/cat_capsicum.webp'),
  cucumber: require('../../../../assets/images/categories/cat_cucumber.webp'),
  karela: require('../../../../assets/images/categories/cat_karela.webp'),
  pumpkin: require('../../../../assets/images/categories/cat_pumpkin.webp'),
  greenChilli: require('../../../../assets/images/categories/cat_green_chilli.webp'),
  coriander: require('../../../../assets/images/categories/cat_coriander.webp'),
  gingerGarlicLemon: require('../../../../assets/images/categories/cat_ginger_garlic_lemon.webp'),
  banana: require('../../../../assets/images/categories/cat_banana.webp'),
  apple: require('../../../../assets/images/categories/cat_apple.webp'),
  mango: require('../../../../assets/images/categories/cat_mango.webp'),
  orange: require('../../../../assets/images/categories/cat_orange.webp'),
  pomegranate: require('../../../../assets/images/categories/cat_pomegranate.webp'),
  grapes: require('../../../../assets/images/categories/cat_grapes.webp'),
  papaya: require('../../../../assets/images/categories/cat_papaya.webp'),
  watermelon: require('../../../../assets/images/categories/cat_watermelon.webp'),
  guava: require('../../../../assets/images/categories/cat_guava.webp'),
  pineapple: require('../../../../assets/images/categories/cat_pineapple.webp'),
  chikoo: require('../../../../assets/images/categories/cat_chikoo.webp'),
  coconut: require('../../../../assets/images/categories/cat_coconut.webp'),
  chickenCurry: require('../../../../assets/images/categories/cat_chicken_curry.webp'),
  chickenBoneless: require('../../../../assets/images/categories/cat_chicken_boneless.webp'),
  chickenDrumstick: require('../../../../assets/images/categories/cat_chicken_drumstick.webp'),
  chickenWings: require('../../../../assets/images/categories/cat_chicken_wings.webp'),
  chickenKeema: require('../../../../assets/images/categories/cat_chicken_keema.webp'),
  chickenWhole: require('../../../../assets/images/categories/cat_chicken_whole.webp'),
  muttonCurry: require('../../../../assets/images/categories/cat_mutton_curry.webp'),
  muttonBoneless: require('../../../../assets/images/categories/cat_mutton_boneless.webp'),
  muttonKeema: require('../../../../assets/images/categories/cat_mutton_keema.webp'),
  muttonChops: require('../../../../assets/images/categories/cat_mutton_chops.webp'),
  fishRohu: require('../../../../assets/images/categories/cat_fish_rohu.webp'),
  fishKatla: require('../../../../assets/images/categories/cat_fish_katla.webp'),
  fishPomfret: require('../../../../assets/images/categories/cat_fish_pomfret.webp'),
  fishSurmai: require('../../../../assets/images/categories/cat_fish_surmai.webp'),
  prawns: require('../../../../assets/images/categories/cat_prawns.webp'),
  eggs: require('../../../../assets/images/categories/cat_eggs.webp'),
} as const;

function variant(
  id: string,
  label: string,
  searchKeyword: string,
  image: ImageSourcePropType
): ProduceSubVariant {
  return { id, label, searchKeyword, image };
}

export const PRODUCE_CATEGORIES: ProduceCategoryItem[] = [
  // --- POPULAR VEGETABLES (18) ---
  {
    id: 'veg-tomato',
    label: 'Tomato',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.tomato,
    isHeroDashboard: true,
    isVeg: true,
    basePriceRupees: 28,
    matchKeywords: ['tomato', 'tamatar', 'hybrid tomato', 'desi tomato', 'cherry tomato'],
    subVariants: [
      variant('hybrid', 'Hybrid Tomato', 'hybrid tomato', IMG.tomato),
      variant('desi', 'Desi Tomato', 'desi tomato', IMG.tomato),
      variant('organic', 'Farm Fresh', 'organic tomato', IMG.tomato),
    ],
  },
  {
    id: 'veg-onion',
    label: 'Onion',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.onion,
    isHeroDashboard: true,
    isVeg: true,
    basePriceRupees: 34,
    matchKeywords: ['onion', 'pyaz', 'kanda', 'red onion', 'sambhar onion'],
    subVariants: [
      variant('red', 'Nashik Red', 'red onion', IMG.onion),
      variant('new', 'New Crop', 'new onion', IMG.onion),
      variant('small', 'Sambar Pyaz', 'small onion', IMG.onion),
    ],
  },
  {
    id: 'veg-potato',
    label: 'Potato',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.potato,
    isHeroDashboard: true,
    isVeg: true,
    basePriceRupees: 26,
    matchKeywords: ['potato', 'aloo', 'batata', 'pahadi aloo', 'new potato'],
    subVariants: [
      variant('jyoti', 'Regular Aloo', 'potato', IMG.potato),
      variant('pahadi', 'Pahadi Aloo', 'pahadi', IMG.potato),
      variant('baby', 'Baby Potato', 'baby potato', IMG.potato),
    ],
  },
  {
    id: 'veg-bhindi',
    label: 'Lady Finger',
    shortLabel: 'Bhindi',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.bhindi,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 42,
    matchKeywords: ['bhindi', 'lady finger', 'okra', 'tendli'],
    subVariants: [
      variant('tender', 'Tender Bhindi', 'bhindi', IMG.bhindi),
      variant('desi', 'Desi Okra', 'okra', IMG.bhindi),
    ],
  },
  {
    id: 'veg-cauliflower',
    label: 'Cauliflower',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.cauliflower,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 38,
    matchKeywords: ['cauliflower', 'gobhi', 'phool gobhi', 'gobi'],
    subVariants: [
      variant('tight', 'Firm Head', 'cauliflower', IMG.cauliflower),
      variant('trimmed', 'Clean Gobhi', 'gobhi', IMG.cauliflower),
    ],
  },
  {
    id: 'veg-cabbage',
    label: 'Cabbage',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.cabbage,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 28,
    matchKeywords: ['cabbage', 'patta gobhi', 'band gobhi'],
    subVariants: [
      variant('green', 'Green Cabbage', 'cabbage', IMG.cabbage),
      variant('desi', 'Desi Patta Gobhi', 'patta gobhi', IMG.cabbage),
    ],
  },
  {
    id: 'veg-brinjal',
    label: 'Brinjal',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.brinjal,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 36,
    matchKeywords: ['brinjal', 'baingan', 'eggplant', 'bharta baingan'],
    subVariants: [
      variant('bharta', 'Bharta Baingan', 'bharta', IMG.brinjal),
      variant('small', 'Small Purple', 'brinjal', IMG.brinjal),
    ],
  },
  {
    id: 'veg-lauki',
    label: 'Bottle Gourd',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.lauki,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 30,
    matchKeywords: ['lauki', 'bottle gourd', 'dudhi', 'ghiya'],
    subVariants: [
      variant('tender', 'Tender Lauki', 'lauki', IMG.lauki),
      variant('round', 'Gol Ghiya', 'ghiya', IMG.lauki),
    ],
  },
  {
    id: 'veg-spinach',
    label: 'Spinach (Palak)',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.spinach,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 24,
    matchKeywords: ['spinach', 'palak', 'saag', 'methi'],
    subVariants: [
      variant('desi', 'Desi Palak', 'palak', IMG.spinach),
      variant('cleaned', 'Clean Bunch', 'spinach', IMG.spinach),
    ],
  },
  {
    id: 'veg-peas',
    label: 'Green Peas',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.peas,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 55,
    matchKeywords: ['peas', 'green peas', 'matar', 'hara matar'],
    subVariants: [
      variant('pod', 'Sweet Pods', 'matar', IMG.peas),
      variant('peeled', 'Shelled Matar', 'peas', IMG.peas),
    ],
  },
  {
    id: 'veg-carrot',
    label: 'Carrot',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.carrot,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 36,
    matchKeywords: ['carrot', 'gajar', 'red carrot', 'ooty carrot'],
    subVariants: [
      variant('orange', 'Ooty Carrot', 'carrot', IMG.carrot),
      variant('red', 'Desi Red Gajar', 'gajar', IMG.carrot),
    ],
  },
  {
    id: 'veg-capsicum',
    label: 'Capsicum',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.capsicum,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 48,
    matchKeywords: ['capsicum', 'shimla mirch', 'bell pepper'],
    subVariants: [
      variant('green', 'Green Shimla', 'capsicum', IMG.capsicum),
      variant('redyellow', 'Colored Peppers', 'bell pepper', IMG.capsicum),
    ],
  },
  {
    id: 'veg-cucumber',
    label: 'Cucumber',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.cucumber,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 30,
    matchKeywords: ['cucumber', 'kheera', 'kakdi', 'english cucumber'],
    subVariants: [
      variant('desi', 'Desi Kheera', 'kheera', IMG.cucumber),
      variant('english', 'English Cut', 'cucumber', IMG.cucumber),
    ],
  },
  {
    id: 'veg-karela',
    label: 'Bitter Gourd',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.karela,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 44,
    matchKeywords: ['karela', 'bitter gourd'],
    subVariants: [
      variant('green', 'Fresh Karela', 'karela', IMG.karela),
      variant('small', 'Desi Karela', 'bitter gourd', IMG.karela),
    ],
  },
  {
    id: 'veg-pumpkin',
    label: 'Pumpkin',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.pumpkin,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 32,
    matchKeywords: ['pumpkin', 'kaddu', 'sitaphal'],
    subVariants: [
      variant('yellow', 'Ripe Kaddu', 'kaddu', IMG.pumpkin),
      variant('green', 'Green Cut', 'pumpkin', IMG.pumpkin),
    ],
  },
  {
    id: 'veg-chilli',
    label: 'Green Chilli',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.greenChilli,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 20,
    matchKeywords: ['chilli', 'green chilli', 'hari mirch', 'mirchi'],
    subVariants: [
      variant('teja', 'Spicy Mirchi', 'hari mirch', IMG.greenChilli),
      variant('bhavnagri', 'Mild Bhavnagri', 'chilli', IMG.greenChilli),
    ],
  },
  {
    id: 'veg-coriander',
    label: 'Coriander',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.coriander,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 15,
    matchKeywords: ['coriander', 'dhania', 'dhaniya', 'cilantro', 'pudina', 'mint'],
    subVariants: [
      variant('desi', 'Desi Dhania', 'dhania', IMG.coriander),
      variant('combo', 'Dhania + Pudina', 'coriander', IMG.coriander),
    ],
  },
  {
    id: 'veg-ginger-garlic',
    label: 'Ginger & Garlic',
    group: 'vegetables',
    shopCategory: 'vegetables',
    image: IMG.gingerGarlicLemon,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 40,
    matchKeywords: ['ginger', 'adrak', 'garlic', 'lahsun', 'lemon', 'nimbu'],
    subVariants: [
      variant('ginger', 'Fresh Adrak', 'ginger', IMG.gingerGarlicLemon),
      variant('garlic', 'Whole Lahsun', 'garlic', IMG.gingerGarlicLemon),
      variant('lemon', 'Juicy Nimbu', 'lemon', IMG.gingerGarlicLemon),
    ],
  },

  // --- POPULAR FRUITS (12) ---
  {
    id: 'fruit-banana',
    label: 'Banana',
    group: 'fruits',
    shopCategory: 'fruits',
    image: IMG.banana,
    isHeroDashboard: true,
    isVeg: true,
    basePriceRupees: 45,
    matchKeywords: ['banana', 'kela', 'robusta', 'yelakki'],
    subVariants: [
      variant('robusta', 'Robusta Kela', 'banana', IMG.banana),
      variant('yelakki', 'Yelakki Small', 'yelakki', IMG.banana),
    ],
  },
  {
    id: 'fruit-apple',
    label: 'Apple',
    group: 'fruits',
    shopCategory: 'fruits',
    image: IMG.apple,
    isHeroDashboard: true,
    isVeg: true,
    basePriceRupees: 140,
    matchKeywords: ['apple', 'seb', 'shimla apple', 'kinnaur', 'fuji'],
    subVariants: [
      variant('shimla', 'Shimla Apple', 'shimla apple', IMG.apple),
      variant('washington', 'Royal Gala', 'apple', IMG.apple),
    ],
  },
  {
    id: 'fruit-mango',
    label: 'Mango',
    group: 'fruits',
    shopCategory: 'fruits',
    image: IMG.mango,
    isHeroDashboard: true,
    isVeg: true,
    basePriceRupees: 160,
    matchKeywords: ['mango', 'aam', 'alphonso', 'kesar', 'dasheri', 'badami'],
    subVariants: [
      variant('alphonso', 'Alphonso (Hapus)', 'alphonso', IMG.mango),
      variant('kesar', 'Gir Kesar', 'kesar', IMG.mango),
      variant('badami', 'Badami Mango', 'mango', IMG.mango),
    ],
  },
  {
    id: 'fruit-orange',
    label: 'Orange',
    group: 'fruits',
    shopCategory: 'fruits',
    image: IMG.orange,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 85,
    matchKeywords: ['orange', 'santra', 'nagpur orange', 'mosambi', 'kinnow'],
    subVariants: [
      variant('nagpur', 'Nagpur Santra', 'orange', IMG.orange),
      variant('mosambi', 'Sweet Mosambi', 'mosambi', IMG.orange),
    ],
  },
  {
    id: 'fruit-pomegranate',
    label: 'Pomegranate',
    group: 'fruits',
    shopCategory: 'fruits',
    image: IMG.pomegranate,
    isHeroDashboard: true,
    isVeg: true,
    basePriceRupees: 145,
    matchKeywords: ['pomegranate', 'anar', 'bhagwa anar'],
    subVariants: [
      variant('bhagwa', 'Bhagwa Anar', 'anar', IMG.pomegranate),
      variant('ruby', 'Regular Pack', 'pomegranate', IMG.pomegranate),
    ],
  },
  {
    id: 'fruit-grapes',
    label: 'Grapes',
    group: 'fruits',
    shopCategory: 'fruits',
    image: IMG.grapes,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 78,
    matchKeywords: ['grapes', 'angoor', 'green grapes', 'black grapes'],
    subVariants: [
      variant('green', 'Green Seedless', 'green grapes', IMG.grapes),
      variant('black', 'Black Grapes', 'grapes', IMG.grapes),
    ],
  },
  {
    id: 'fruit-papaya',
    label: 'Papaya',
    group: 'fruits',
    shopCategory: 'fruits',
    image: IMG.papaya,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 48,
    matchKeywords: ['papaya', 'papita', 'red lady papaya'],
    subVariants: [
      variant('redlady', 'Ripe Papaya', 'papaya', IMG.papaya),
      variant('semi', 'Semi Ripe', 'papita', IMG.papaya),
    ],
  },
  {
    id: 'fruit-watermelon',
    label: 'Watermelon',
    group: 'fruits',
    shopCategory: 'fruits',
    image: IMG.watermelon,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 55,
    matchKeywords: ['watermelon', 'tarbooz', 'kiran watermelon'],
    subVariants: [
      variant('kiran', 'Kiran Whole', 'watermelon', IMG.watermelon),
      variant('half', 'Half Cut', 'tarbooz', IMG.watermelon),
    ],
  },
  {
    id: 'fruit-guava',
    label: 'Guava',
    group: 'fruits',
    shopCategory: 'fruits',
    image: IMG.guava,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 60,
    matchKeywords: ['guava', 'amrud', 'amrood', 'allahabadi'],
    subVariants: [
      variant('white', 'Allahabadi White', 'guava', IMG.guava),
      variant('pink', 'Pink Guava', 'amrud', IMG.guava),
    ],
  },
  {
    id: 'fruit-pineapple',
    label: 'Pineapple',
    group: 'fruits',
    shopCategory: 'fruits',
    image: IMG.pineapple,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 75,
    matchKeywords: ['pineapple', 'ananas'],
    subVariants: [
      variant('whole', 'Whole Queen', 'pineapple', IMG.pineapple),
      variant('peeled', 'Peeled Slice', 'ananas', IMG.pineapple),
    ],
  },
  {
    id: 'fruit-chikoo',
    label: 'Chikoo (Sapota)',
    group: 'fruits',
    shopCategory: 'fruits',
    image: IMG.chikoo,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 68,
    matchKeywords: ['chikoo', 'sapota', 'cheeku'],
    subVariants: [
      variant('ripe', 'Sweet Chikoo', 'chikoo', IMG.chikoo),
      variant('box', '500g Basket', 'sapota', IMG.chikoo),
    ],
  },
  {
    id: 'fruit-coconut',
    label: 'Tender Coconut',
    group: 'fruits',
    shopCategory: 'fruits',
    image: IMG.coconut,
    isHeroDashboard: false,
    isVeg: true,
    basePriceRupees: 52,
    matchKeywords: ['coconut', 'nariyal', 'tender coconut', 'nariyal pani'],
    subVariants: [
      variant('water', 'Nariyal Pani', 'tender coconut', IMG.coconut),
      variant('malai', 'Soft Malai', 'coconut', IMG.coconut),
    ],
  },

  // --- CHICKEN TYPES & CUTS (6) ---
  {
    id: 'chicken-curry',
    label: 'Chicken Curry Cut',
    group: 'chicken',
    shopCategory: 'meat',
    image: IMG.chickenCurry,
    isHeroDashboard: true,
    isVeg: false,
    basePriceRupees: 155,
    matchKeywords: ['chicken curry cut', 'chicken', 'murga', 'skinless chicken', 'broiler'],
    subVariants: [
      variant('skinless', 'Skinless Cut', 'chicken curry cut', IMG.chickenCurry),
      variant('small', 'Small Pieces', 'chicken', IMG.chickenCurry),
      variant('boneless', 'Boneless Cubes', 'boneless', IMG.chickenBoneless),
    ],
  },
  {
    id: 'chicken-boneless',
    label: 'Boneless Chicken',
    group: 'chicken',
    shopCategory: 'meat',
    image: IMG.chickenBoneless,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 215,
    matchKeywords: ['boneless chicken', 'chicken breast', 'chicken fillet', 'tikka cut'],
    subVariants: [
      variant('breast', 'Breast Fillet', 'chicken breast', IMG.chickenBoneless),
      variant('tikka', 'Tikka Cubes', 'boneless chicken', IMG.chickenBoneless),
    ],
  },
  {
    id: 'chicken-drumstick',
    label: 'Chicken Leg Piece',
    group: 'chicken',
    shopCategory: 'meat',
    image: IMG.chickenDrumstick,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 195,
    matchKeywords: ['chicken leg', 'drumstick', 'tangdi', 'thigh'],
    subVariants: [
      variant('tangdi', 'Whole Drumsticks', 'chicken leg', IMG.chickenDrumstick),
      variant('thigh', 'Thigh Boneless', 'drumstick', IMG.chickenDrumstick),
    ],
  },
  {
    id: 'chicken-wings',
    label: 'Chicken Lollipop',
    group: 'chicken',
    shopCategory: 'meat',
    image: IMG.chickenWings,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 175,
    matchKeywords: ['chicken wings', 'lollipop', 'wings'],
    subVariants: [
      variant('lollipop', 'Frenched Lollipop', 'lollipop', IMG.chickenWings),
      variant('wings', 'Full Wings', 'wings', IMG.chickenWings),
    ],
  },
  {
    id: 'chicken-keema',
    label: 'Chicken Keema',
    group: 'chicken',
    shopCategory: 'meat',
    image: IMG.chickenKeema,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 225,
    matchKeywords: ['chicken keema', 'minced chicken', 'kheema'],
    subVariants: [
      variant('fine', 'Fine Mince', 'chicken keema', IMG.chickenKeema),
      variant('coarse', 'Coarse Keema', 'keema', IMG.chickenKeema),
    ],
  },
  {
    id: 'chicken-whole',
    label: 'Whole Chicken',
    group: 'chicken',
    shopCategory: 'meat',
    image: IMG.chickenWhole,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 265,
    matchKeywords: ['whole chicken', 'tandoori chicken', 'desi chicken', 'murga'],
    subVariants: [
      variant('skinless', 'Dressed Whole', 'whole chicken', IMG.chickenWhole),
      variant('tandoori', 'Tandoori Halves', 'chicken', IMG.chickenWhole),
    ],
  },

  // --- MUTTON & RED MEAT CUTS (4) ---
  {
    id: 'mutton-curry',
    label: 'Mutton Curry Cut',
    group: 'mutton',
    shopCategory: 'meat',
    image: IMG.muttonCurry,
    isHeroDashboard: true,
    isVeg: false,
    basePriceRupees: 420,
    matchKeywords: ['mutton', 'mutton curry', 'bakra', 'gosht', 'goat meat'],
    subVariants: [
      variant('bonein', 'Standard Curry Cut', 'mutton curry', IMG.muttonCurry),
      variant('shoulder', 'Nalli & Raan', 'mutton', IMG.muttonCurry),
      variant('boneless', 'Boneless Cubes', 'mutton boneless', IMG.muttonBoneless),
    ],
  },
  {
    id: 'mutton-boneless',
    label: 'Mutton Boneless',
    group: 'mutton',
    shopCategory: 'meat',
    image: IMG.muttonBoneless,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 495,
    matchKeywords: ['mutton boneless', 'goat boneless', 'boti'],
    subVariants: [
      variant('boti', 'Boti Cubes', 'mutton boneless', IMG.muttonBoneless),
      variant('biryani', 'Biryani Pieces', 'mutton', IMG.muttonBoneless),
    ],
  },
  {
    id: 'mutton-keema',
    label: 'Mutton Keema',
    group: 'mutton',
    shopCategory: 'meat',
    image: IMG.muttonKeema,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 470,
    matchKeywords: ['mutton keema', 'minced mutton', 'gosht keema'],
    subVariants: [
      variant('fine', 'Extra Fine Mince', 'mutton keema', IMG.muttonKeema),
      variant('kebab', 'Seekh Grade', 'mutton', IMG.muttonKeema),
    ],
  },
  {
    id: 'mutton-chops',
    label: 'Mutton Chops',
    group: 'mutton',
    shopCategory: 'meat',
    image: IMG.muttonChops,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 460,
    matchKeywords: ['mutton chops', 'chaap', 'ribs', 'mutton ribs'],
    subVariants: [
      variant('chaap', 'Ribs (Chaap)', 'mutton chops', IMG.muttonChops),
      variant('mixed', 'Chops + Curry', 'mutton', IMG.muttonChops),
    ],
  },

  // --- FISH, SEAFOOD & EGGS (6) ---
  {
    id: 'fish-rohu',
    label: 'Rohu Fish',
    group: 'fish',
    shopCategory: 'meat',
    image: IMG.fishRohu,
    isHeroDashboard: true,
    isVeg: false,
    basePriceRupees: 165,
    matchKeywords: ['rohu', 'rohu fish', 'bengali cut', 'machli', 'fish'],
    subVariants: [
      variant('bengali', 'Bengali Cut', 'bengali cut', IMG.fishRohu),
      variant('steaks', 'Curry Steaks', 'rohu', IMG.fishRohu),
      variant('whole', 'Cleaned Whole', 'fish', IMG.fishRohu),
    ],
  },
  {
    id: 'fish-katla',
    label: 'Katla Fish',
    group: 'fish',
    shopCategory: 'meat',
    image: IMG.fishKatla,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 185,
    matchKeywords: ['katla', 'catla', 'katla fish', 'fish'],
    subVariants: [
      variant('bengali', 'Bengali Cut', 'katla', IMG.fishKatla),
      variant('gadda', 'Gadda & Peti', 'fish', IMG.fishKatla),
    ],
  },
  {
    id: 'fish-pomfret',
    label: 'Pomfret Fish',
    group: 'fish',
    shopCategory: 'meat',
    image: IMG.fishPomfret,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 440,
    matchKeywords: ['pomfret', 'paplet', 'white pomfret', 'fish'],
    subVariants: [
      variant('whole', 'Whole Cleaned', 'pomfret', IMG.fishPomfret),
      variant('steaks', 'Fry Cut', 'fish', IMG.fishPomfret),
    ],
  },
  {
    id: 'fish-surmai',
    label: 'Surmai Steaks',
    group: 'fish',
    shopCategory: 'meat',
    image: IMG.fishSurmai,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 480,
    matchKeywords: ['surmai', 'kingfish', 'seer fish', 'fish fillet'],
    subVariants: [
      variant('steaks', 'Medium Steaks', 'surmai', IMG.fishSurmai),
      variant('boneless', 'Fillet Cubes', 'fish fillet', IMG.fishSurmai),
    ],
  },
  {
    id: 'fish-prawns',
    label: 'Fresh Prawns',
    group: 'fish',
    shopCategory: 'meat',
    image: IMG.prawns,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 280,
    matchKeywords: ['prawns', 'jhinga', 'shrimp', 'deveined prawns'],
    subVariants: [
      variant('cleaned', 'Peeled & Deveined', 'prawns', IMG.prawns),
      variant('jumbo', 'Jumbo Jhinga', 'shrimp', IMG.prawns),
    ],
  },
  {
    id: 'eggs-farm',
    label: 'Farm Fresh Eggs',
    group: 'fish',
    shopCategory: 'meat',
    image: IMG.eggs,
    isHeroDashboard: false,
    isVeg: false,
    basePriceRupees: 78,
    matchKeywords: ['egg', 'eggs', 'anda', 'brown eggs', 'country eggs'],
    subVariants: [
      variant('white6', '6 White Eggs', 'eggs', IMG.eggs),
      variant('white12', '12 Pack', 'egg', IMG.eggs),
      variant('brown', 'Brown Desi Eggs', 'brown egg', IMG.eggs),
    ],
  },
];

export function getDashboardHeroCategories(isVegOnly: boolean): ProduceCategoryItem[] {
  const pool = isVegOnly
    ? PRODUCE_CATEGORIES.filter((c) => c.isVeg)
    : PRODUCE_CATEGORIES;
  const heroes = pool.filter((c) => c.isHeroDashboard);
  if (heroes.length >= 10) {
    return heroes.slice(0, 10);
  }
  const seen = new Set(heroes.map((h) => h.id));
  const extras = pool.filter((c) => !seen.has(c.id)).slice(0, 10 - heroes.length);
  return [...heroes, ...extras];
}

export function findProduceCategoryByQuery(query: string): ProduceCategoryItem | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return PRODUCE_CATEGORIES.find(
    (c) =>
      c.label.toLowerCase().includes(q) ||
      c.matchKeywords.some((k) => k.includes(q) || q.includes(k))
  );
}
