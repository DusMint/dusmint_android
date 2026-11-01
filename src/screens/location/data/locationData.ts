export interface SavedAddressItem {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  name: string;
  houseNo: string;
  streetArea: string;
  landmark?: string;
  pincode: string;
  distanceKm: string;
  latitude: number;
  longitude: number;
  isSelected: boolean;
  isDefault: boolean;
}

export interface PlaceSuggestion {
  id: string;
  mainText: string;
  secondaryText: string;
  latitude: number;
  longitude: number;
}

export const INITIAL_SAVED_ADDRESSES: SavedAddressItem[] = [
  {
    id: 'addr-1',
    label: 'Home',
    name: 'Home',
    houseNo: '1st Floor, Flat 102, Shuddh Mandi Hub',
    streetArea: 'Vijay Nagar, Scheme 54',
    landmark: 'Near Sayaji Hotel',
    pincode: '452010',
    distanceKm: '0.2 km',
    latitude: 22.7533,
    longitude: 75.8937,
    isSelected: true,
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Work',
    name: 'Office',
    houseNo: 'Plot 42, 3rd Floor, IT Park',
    streetArea: 'Ring Road, Electronic Complex',
    landmark: 'Opposite Crystal IT Park',
    pincode: '452014',
    distanceKm: '3.4 km',
    latitude: 22.7196,
    longitude: 75.8577,
    isSelected: false,
    isDefault: false,
  },
  {
    id: 'addr-3',
    label: 'Other',
    name: "Parents' House",
    houseNo: 'House No. 75, Mominpura Main Road',
    streetArea: 'Mominpura Market Sector B',
    landmark: 'Near Jama Masjid',
    pincode: '452002',
    distanceKm: '1.8 km',
    latitude: 22.7215,
    longitude: 75.8648,
    isSelected: false,
    isDefault: false,
  },
  {
    id: 'addr-4',
    label: 'Other',
    name: "Sister's Flat",
    houseNo: 'B-404, Silver Springs',
    streetArea: 'Bypass Road, Palasia Extension',
    landmark: 'Near Best Price Walmart',
    pincode: '452016',
    distanceKm: '5.2 km',
    latitude: 22.7126,
    longitude: 75.9124,
    isSelected: false,
    isDefault: false,
  },
];

export const MOCK_PLACES_DATABASE: PlaceSuggestion[] = [
  {
    id: 'plc-1',
    mainText: 'Vijay Nagar',
    secondaryText: 'Indore, Madhya Pradesh 452010',
    latitude: 22.7533,
    longitude: 75.8937,
  },
  {
    id: 'plc-2',
    mainText: 'Mominpura',
    secondaryText: 'Indore, Madhya Pradesh 452002',
    latitude: 22.7215,
    longitude: 75.8648,
  },
  {
    id: 'plc-3',
    mainText: 'Palasia (Old & New)',
    secondaryText: 'Indore, Madhya Pradesh 452001',
    latitude: 22.7244,
    longitude: 75.8839,
  },
  {
    id: 'plc-4',
    mainText: 'Bhawarkua Square',
    secondaryText: 'Indore, Madhya Pradesh 452001',
    latitude: 22.6926,
    longitude: 75.8676,
  },
  {
    id: 'plc-5',
    mainText: 'Mahalaxmi Nagar',
    secondaryText: 'Indore, Madhya Pradesh 452010',
    latitude: 22.7631,
    longitude: 75.9022,
  },
  {
    id: 'plc-6',
    mainText: 'Rajwada Palace Area',
    secondaryText: 'MG Road, Indore, Madhya Pradesh 452002',
    latitude: 22.7186,
    longitude: 75.8553,
  },
  {
    id: 'plc-7',
    mainText: 'Annapurna Mandir Road',
    secondaryText: 'Indore, Madhya Pradesh 452009',
    latitude: 22.6987,
    longitude: 75.8398,
  },
];

