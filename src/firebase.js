import { initializeApp } from 'firebase/app';
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

const firebaseConfig = {
  apiKey:            "AIzaSyDfLK-CyX5kLlq1Jn6zoBh3HUUEwPVzlNY",
  authDomain:        "ophelia-app-f0c6f.firebaseapp.com",
  projectId:         "ophelia-app-f0c6f",
  storageBucket:     "ophelia-app-f0c6f.firebasestorage.app",
  messagingSenderId: "1003575436551",
  appId:             "1:1003575436551:web:7f6ffea9c1d62b2a8211a2",
};

const IS_CONFIGURED = true;

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db  = getFirestore(app);
} catch(e) {
  console.warn('Firebase init failed', e);
}

// Stubs so any Auth imports in App.js don't crash
const auth = null;
const googleProvider = null;
const appleProvider  = null;
function signInWithEmailAndPassword(){}
function createUserWithEmailAndPassword(){}
function signInWithPopup(){}
function updateProfile(){}
function onAuthStateChanged(){}
function signOut(){}

export {
  auth, db, googleProvider, appleProvider, IS_CONFIGURED,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, updateProfile, onAuthStateChanged, signOut,
  doc, collection, setDoc, deleteDoc, onSnapshot, query, orderBy,
};
