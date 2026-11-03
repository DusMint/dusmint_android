import * as Location from 'expo-location';
import { Platform, Linking } from 'react-native';

const OLA_KEY = process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY;
const PLACES_KEY = process.env.EXPO_PUBLIC_PLACES_API_KEY;

export interface ResolvedLocation {
  fullAddress: string;
  shortAddress: string;
  locality: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export interface AutocompleteResult {
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  address: string;
}

/**
 * Strict geographical bounding box for India (Lat: 6.0 to 37.5, Lng: 68.0 to 97.5)
 */
function isWithinIndia(lat?: number, lng?: number, address?: string): boolean {
  if (lat && lng && (lat !== 0 || lng !== 0)) {
    if (lat < 6.0 || lat > 37.5 || lng < 68.0 || lng > 97.5) {
      return false;
    }
  }

  if (address) {
    const lower = address.toLowerCase();
    const foreignIndicators = [
      'united states', 'usa', 'canada', 'united kingdom', 'london', 'dubai', 'uae',
      'singapore', 'australia', 'germany', 'france', 'china', 'pakistan', 'bangladesh',
      'nepal', 'sri lanka', 'japan', 'russia', 'malaysia', 'thailand', 'california', 'texas', 'new york',
    ];
    for (const term of foreignIndicators) {
      if (lower.includes(term) && !lower.includes('india')) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Haversine formula to calculate distance in km between two lat/lng coordinates
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Multi-tier Reverse Geocoding:
 * 1. Primary: Ola Maps Reverse Geocoding API
 * 2. Fallback: Expo Location native reverse geocode
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<ResolvedLocation> {
  let fullAddress = '';
  let shortAddress = '';
  let locality = '';
  let city = '';
  let pincode = '';

  // 1. Primary: Ola Maps Reverse Geocoding
  try {
    if (OLA_KEY) {
      const url = `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${latitude},${longitude}&api_key=${OLA_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'ok' && data.results && data.results.length > 0) {
        const primary = data.results[0];
        fullAddress = primary.formatted_address || '';

        if (primary.address_components && Array.isArray(primary.address_components)) {
          const sublocalityComp = primary.address_components.find((c: any) =>
            c.types?.includes('sublocality') || c.types?.includes('neighborhood')
          );
          const localityComp = primary.address_components.find((c: any) =>
            c.types?.includes('locality')
          );
          const cityComp = primary.address_components.find((c: any) =>
            c.types?.includes('administrative_area_level_2') || c.types?.includes('city')
          );
          const pinComp = primary.address_components.find((c: any) =>
            c.types?.includes('postal_code')
          );

          if (sublocalityComp) locality = sublocalityComp.long_name || sublocalityComp.short_name;
          if (localityComp && !locality) locality = localityComp.long_name || localityComp.short_name;
          if (cityComp) city = cityComp.long_name || cityComp.short_name;
          if (pinComp) pincode = pinComp.long_name || pinComp.short_name;
        }

        if (!shortAddress) {
          shortAddress = locality ? `${locality}, ${city || 'Indore'}` : primary.name || fullAddress.split(',')[0] || 'Vijay Nagar, Indore';
        }
      }
    }
  } catch (err) {
    console.warn('[LocationService] Ola reverse geocode unavailable, falling back:', err);
  }

  // 2. Fallback: Expo Location Reverse Geocode
  if (!fullAddress) {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const addr = results[0];
        const safeName = addr.name && !addr.name.includes('+') ? addr.name : null;
        const parts = [
          safeName,
          addr.streetNumber,
          addr.street,
          addr.district,
          addr.city,
          addr.region,
          addr.postalCode,
        ];
        fullAddress = [...new Set(parts.filter(Boolean))].join(', ');
        locality = addr.district || addr.subregion || safeName || 'Vijay Nagar';
        city = addr.city || addr.region || 'Indore';
        pincode = addr.postalCode || '';
        shortAddress = locality ? `${locality}, ${city}` : safeName || 'Vijay Nagar, Indore';
      }
    } catch (err) {
      console.warn('[LocationService] Expo reverseGeocode error:', err);
    }
  }

  if (!fullAddress) {
    fullAddress = 'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore';
    shortAddress = 'Vijay Nagar, Indore';
    locality = 'Vijay Nagar';
    city = 'Indore';
    pincode = '452010';
  }

  return {
    fullAddress,
    shortAddress: shortAddress || 'Vijay Nagar, Indore',
    locality: locality || 'Vijay Nagar',
    city: city || 'Indore',
    pincode: pincode || '452010',
    latitude,
    longitude,
  };
}

/**
 * Checks GPS service health and requests foreground permission
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => false);
    if (!servicesEnabled) return false;

    const { status } = await Location.getForegroundPermissionsAsync().catch(() => ({ status: 'undetermined' }));
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Native Android 1-tap dialog or Settings redirect to turn on GPS / Location Services
 */
export async function promptEnableLocation(): Promise<boolean> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => false);
    if (!servicesEnabled) {
      if (Platform.OS === 'android') {
        try {
          await Location.enableNetworkProviderAsync();
        } catch {
          return false;
        }
      } else {
        Linking.openSettings();
        return false;
      }
    }

    let { status } = await Location.getForegroundPermissionsAsync().catch(() => ({ status: 'undetermined' }));
    if (status !== 'granted') {
      const req = await Location.requestForegroundPermissionsAsync().catch(() => ({ status: 'denied' }));
      status = req.status;
    }

    if (status === 'granted') {
      return true;
    }

    Linking.openSettings();
    return false;
  } catch {
    return false;
  }
}

/**
 * Instant GPS Position Acquisition:
 * 1. Checks Location.getLastKnownPositionAsync (< 50ms instant fix)
 * 2. Requests Location.getCurrentPositionAsync (balanced accuracy)
 */
export async function getCurrentGPSPosition(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const hasService = await Location.hasServicesEnabledAsync().catch(() => false);
    if (!hasService) return null;

    let { status } = await Location.getForegroundPermissionsAsync().catch(() => ({ status: 'undetermined' }));
    if (status !== 'granted') {
      const req = await Location.requestForegroundPermissionsAsync().catch(() => ({ status: 'denied' }));
      status = req.status;
    }

    if (status !== 'granted') return null;

    // 1. Instant Last Known Position (< 50ms)
    try {
      const last = await Location.getLastKnownPositionAsync();
      if (last?.coords && last.coords.latitude && last.coords.longitude) {
        return {
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
        };
      }
    } catch {
      // continue to current position
    }

    // 2. High/Balanced accuracy GPS fix
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (loc?.coords) {
        return {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }
    } catch (err) {
      console.warn('[LocationService] getCurrentPositionAsync fallback:', err);
    }
    return null;
  } catch (err) {
    console.warn('[LocationService] getCurrentGPSPosition error:', err);
    return null;
  }
}

/**
 * Autocomplete search for places (Vijay Nagar, Indore, etc.)
 */
export async function searchPlacesAutocomplete(query: string): Promise<AutocompleteResult[]> {
  if (!query || query.trim().length < 2) return [];

  // Ola Maps Autocomplete API
  try {
    if (OLA_KEY) {
      const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(
        query.trim()
      )}&api_key=${OLA_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'ok' && data.predictions) {
        return data.predictions.map((p: any) => ({
          id: p.place_id,
          title: p.structured_formatting?.main_text || p.description.split(',')[0],
          subtitle: p.structured_formatting?.secondary_text || p.description,
          lat: p.geometry?.location?.lat || 22.7533,
          lng: p.geometry?.location?.lng || 75.8937,
          address: p.description,
        }));
      }
    }
  } catch (err) {
    console.warn('[LocationService] Ola Autocomplete error:', err);
  }

  return [];
}
