import { initializeApp, getApps } from 'firebase/app';
import {
  ConfirmationResult,
  createUserWithEmailAndPassword,
  getAuth,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  updateProfile,
} from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

export const firebaseConfigured = Object.values(config).every(Boolean);
const app = firebaseConfigured ? (getApps()[0] ?? initializeApp(config)) : null;
export const firebaseAuth = app ? getAuth(app) : null;

export async function createAccount(email: string, password: string, name: string) {
  if (!firebaseAuth) throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* values to .env.local.');
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
}

export async function signIn(email: string, password: string) {
  if (!firebaseAuth) throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* values to .env.local.');
  const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return result.user;
}

export async function requestPasswordReset(email: string) {
  if (!firebaseAuth) throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* values to .env.local.');
  await sendPasswordResetEmail(firebaseAuth, email);
}

let phoneConfirmation: ConfirmationResult | null = null;
let phoneVerifier: RecaptchaVerifier | null = null;

export async function requestPhoneCode(phone: string) {
  if (!firebaseAuth) throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* values to .env.local.');
  if (!phoneVerifier) phoneVerifier = new RecaptchaVerifier(firebaseAuth, 'firebase-recaptcha-container', { size: 'invisible' });
  const digits = phone.replace(/\D/g, '');
  const normalizedPhone = phone.trim().startsWith('+') ? phone.trim() : `+91${digits.slice(-10)}`;
  phoneConfirmation = await signInWithPhoneNumber(firebaseAuth, normalizedPhone, phoneVerifier);
}

export async function confirmPhoneCode(code: string) {
  if (!phoneConfirmation) throw new Error('Request a verification code first.');
  const result = await phoneConfirmation.confirm(code);
  phoneConfirmation = null;
  phoneVerifier = null;
  return result.user;
}

export async function signOutFirebase() {
  if (firebaseAuth) await signOut(firebaseAuth);
}
