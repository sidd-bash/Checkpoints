// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Ensure auth persistence is local (keeps user signed in across browser restarts)
 * This is set once before sign in flow
 */
export async function ensureLocalPersistence() {
  await setPersistence(auth, browserLocalPersistence);
}

/**
 * Phone sign-in using reCAPTCHA.
 *
 * Example usage:
 *   await ensureLocalPersistence();
 *   const confirmationResult = await startPhoneSignIn("+15551234567", "recaptcha-container");
 *   // Then confirm with the OTP:
 *   const userCredential = await confirmationResult.confirm(code);
 */
export function startPhoneSignIn(
  phoneNumber,
  recaptchaContainerId = "recaptcha-container"
) {
  // Create verifier only once
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,                        // First parameter: auth instance
      recaptchaContainerId,        // Second: container ID
      {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA solved");
        },
      }
    );
  }

  const verifier = window.recaptchaVerifier;
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
}   

export function logout() {
  return signOut(auth);
}

export { app, auth, db, storage, serverTimestamp };
