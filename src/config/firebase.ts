import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, type Auth } from 'firebase/auth';
import * as FirebaseAuthRN from '@firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// `firebase/auth`'s exports map always resolves TS types to the generic
// "auth-public" declaration regardless of platform, so the AsyncStorage-backed
// persistence helper (only present in @firebase/auth's "react-native" build,
// which Metro selects correctly at bundle time) isn't visible to the type checker.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getReactNativePersistence = (FirebaseAuthRN as any).getReactNativePersistence;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseStorageEnabled = process.env.EXPO_PUBLIC_USE_FIREBASE_STORAGE === 'true';

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(
    '[firebase] Missing EXPO_PUBLIC_FIREBASE_* environment variables. ' +
      'Copy .env.example to .env and fill in your Firebase project config.'
  );
}

if (firebaseStorageEnabled && !firebaseConfig.storageBucket) {
  console.warn(
    '[firebase] EXPO_PUBLIC_USE_FIREBASE_STORAGE is true, but EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET is missing.'
  );
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // initializeAuth throws if already called (e.g. fast refresh) - fall back to existing instance.
  auth = getAuth(app);
}
export { auth };

export const db = initializeFirestore(app, {});
export const storage: FirebaseStorage | null = firebaseStorageEnabled ? getStorage(app) : null;

export default app;
