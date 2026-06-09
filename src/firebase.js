import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  updateProfile,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

// ── Paste your Firebase config here ──────────────────────────────────────────
// Get this from: Firebase Console → Project Settings → Your apps → Web app
const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY",
  authDomain:        "PASTE_YOUR_AUTH_DOMAIN",
  projectId:         "PASTE_YOUR_PROJECT_ID",
  storageBucket:     "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId:             "PASTE_YOUR_APP_ID",
};

const IS_CONFIGURED = !firebaseConfig.apiKey.includes('PASTE');

let app, auth, googleProvider, appleProvider;

if (IS_CONFIGURED) {
  app           = initializeApp(firebaseConfig);
  auth          = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  appleProvider  = new OAuthProvider('apple.com');
  appleProvider.addScope('email');
  appleProvider.addScope('name');
}

export {
  auth, googleProvider, appleProvider, IS_CONFIGURED,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, updateProfile, onAuthStateChanged, signOut,
};
