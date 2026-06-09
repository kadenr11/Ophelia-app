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
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

// ── Paste your Firebase config here ──────────────────────────────────────────
// Get this from: Firebase Console → Project Settings → Your apps → Web app
// Also enable Firestore in your Firebase Console (Build → Firestore Database)
const firebaseConfig = {
  apiKey:            "AIzaSyDfLK-CyX5kLlq1Jn6zoBh3HUUEwPVzlNY",
  authDomain:        "ophelia-app-f0c6f.firebaseapp.com",
  projectId:         "ophelia-app-f0c6f",
  storageBucket:     "ophelia-app-f0c6f.firebasestorage.app",
  messagingSenderId: "1003575436551",
  appId:             "1:1003575436551:web:7f6ffea9c1d62b2a8211a2",
};

const IS_CONFIGURED = !firebaseConfig.apiKey.includes('PASTE');

let app, auth, db, googleProvider, appleProvider;

if (IS_CONFIGURED) {
  app            = initializeApp(firebaseConfig);
  auth           = getAuth(app);
  db             = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  appleProvider  = new OAuthProvider('apple.com');
  appleProvider.addScope('email');
  appleProvider.addScope('name');
}

export {
  auth, db, googleProvider, appleProvider, IS_CONFIGURED,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, updateProfile, onAuthStateChanged, signOut,
  // Firestore helpers
  doc, collection, setDoc, deleteDoc, onSnapshot, query, orderBy,
};
