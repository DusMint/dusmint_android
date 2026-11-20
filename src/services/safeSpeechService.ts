import { useEffect } from 'react';
import { requireOptionalNativeModule } from 'expo';

// Safely load the native module without throwing if not yet compiled in the APK
export const NativeSpeechModule = requireOptionalNativeModule('ExpoSpeechRecognition') as any;

/**
 * Returns true if the native speech recognition module is compiled and available in the running binary.
 */
export const isSpeechRecognitionSupported = (): boolean => {
  return NativeSpeechModule != null && typeof NativeSpeechModule.start === 'function';
};

/**
 * Request audio recording & speech recognition permissions safely
 */
export async function requestSpeechPermissions(): Promise<boolean> {
  if (!NativeSpeechModule || typeof NativeSpeechModule.requestPermissionsAsync !== 'function') {
    return false;
  }
  try {
    const res = await NativeSpeechModule.requestPermissionsAsync();
    return !!res?.granted;
  } catch (e) {
    console.warn('SafeSpeech: Permission request failed:', e);
    return false;
  }
}

/**
 * Start listening via native Android/iOS speech engine
 */
export function startSpeechRecognition(options?: {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
}) {
  if (!NativeSpeechModule || typeof NativeSpeechModule.start !== 'function') {
    return false;
  }
  try {
    NativeSpeechModule.start({
      lang: options?.lang || 'hi-IN',
      interimResults: options?.interimResults ?? true,
      continuous: options?.continuous ?? false,
    });
    return true;
  } catch (e) {
    console.warn('SafeSpeech: Start failed:', e);
    return false;
  }
}

/**
 * Stop listening gracefully
 */
export function stopSpeechRecognition() {
  if (!NativeSpeechModule || typeof NativeSpeechModule.stop !== 'function') {
    return;
  }
  try {
    NativeSpeechModule.stop();
  } catch (e) {
    console.warn('SafeSpeech: Stop failed:', e);
  }
}

/**
 * Abort active recognition
 */
export function abortSpeechRecognition() {
  if (!NativeSpeechModule || typeof NativeSpeechModule.abort !== 'function') {
    return;
  }
  try {
    NativeSpeechModule.abort();
  } catch (e) {
    console.warn('SafeSpeech: Abort failed:', e);
  }
}

/**
 * Safe hook to subscribe to speech events without crashing if module is missing
 */
export function useSafeSpeechEvent(
  eventName: 'start' | 'end' | 'result' | 'error',
  callback: (event: any) => void
) {
  useEffect(() => {
    if (!NativeSpeechModule || typeof NativeSpeechModule.addListener !== 'function') {
      return;
    }

    try {
      const subscription = NativeSpeechModule.addListener(eventName, callback);
      return () => {
        try {
          if (subscription && typeof subscription.remove === 'function') {
            subscription.remove();
          }
        } catch {
          // Ignore unmount cleanup errors
        }
      };
    } catch (e) {
      console.warn(`SafeSpeech: Failed to subscribe to ${eventName}:`, e);
    }
  }, [eventName, callback]);
}
