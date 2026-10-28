import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;

const config: FirebaseOptions = {
  apiKey,
  authDomain,
  projectId,
  appId,
  ...(storageBucket ? { storageBucket } : {}),
  ...(messagingSenderId ? { messagingSenderId } : {}),
};

const requiredConfigValues = [apiKey, authDomain, projectId, appId];
export const isFirebaseConfigured = requiredConfigValues.every(value =>
  Boolean(value && !value.startsWith('seu-') && !value.startsWith('sua-')),
);
const firebaseApp = isFirebaseConfigured
  ? (getApps()[0] ?? initializeApp(config))
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

export function requireFirebase() {
  if (!auth || !db) {
    throw new Error('O Firebase ainda não está configurado. Depois de criar o app Web no Firebase, preencha as variáveis VITE_FIREBASE_* no arquivo .env e reinicie o aplicativo.');
  }
  return { auth, db };
}
