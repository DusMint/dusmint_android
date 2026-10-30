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

        // Extract locality and city from address components if present
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
          shortAddress = locality || primary.name || fullAddress.split(',')[0] || 'Current Location';
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
        locality = addr.district || addr.subregion || safeName || '';
        city = addr.city || addr.region || '';
        pincode = addr.postalCode || '';
        shortAddress = locality || addr.city || safeName || 'Current Location';
      }
    } catch (err) {
      console.warn('[LocationService] Expo reverseGeocode error:', err);
    }
  }

  if (!fullAddress) {
    fullAddress = 'Current Location';
    shortAddress = 'Current Location';
  }

  return {
    fullAddress,
    shortAddress: shortAddress || 'Current Location',
    locality: locality || shortAddress,
    city: city || 'Pune',
    pincode: pincode || '',
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
 * High-accuracy satellite GPS fix with automatic fallback to high accuracy
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

    // Highest satellite precision first
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      if (loc?.coords) {
        return {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }
    } catch (err) {
      console.warn('[LocationService] Highest accuracy fix failed, attempting High accuracy fallback:', err);
    }

    // High accuracy fallback
    const fallbackLoc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    if (fallbackLoc?.coords) {
      return {
        latitude: fallbackLoc.coords.latitude,
        longitude: fallbackLoc.coords.longitude,
      };
    }
  } catch (err) {
    console.warn('[LocationService] getCurrentGPSPosition error:', err);
  }
  return null;
}

/**
 * Autocomplete place search using Ola Maps with India boundaries
 */
export async function searchPlacesAutocomplete(
  query: string,
  biasLat: number = 18.5529,
  biasLng: number = 73.9348
): Promise<AutocompleteResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    if (OLA_KEY) {
      const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(
        query.trim()
      )}&location=${biasLat},${biasLng}&api_key=${OLA_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'ok' && data.predictions?.length) {
        return data.predictions
          .filter((p: any) =>
            isWithinIndia(p.geometry?.location?.lat, p.geometry?.location?.lng, p.description)
          )
          .slice(0, 8)
          .map((p: any, i: number) => ({
            id: p.place_id || `ola-${i}`,
            title: p.structured_formatting?.main_text || p.description?.split(',')[0] || query,
            subtitle: p.structured_formatting?.secondary_text || p.description || '',
            lat: p.geometry?.location?.lat ?? 0,
            lng: p.geometry?.location?.lng ?? 0,
            address: p.description || '',
          }));
      }
    }
  } catch (e) {
    console.warn('[LocationService] Ola autocomplete error:', e);
  }

  return [];
}

