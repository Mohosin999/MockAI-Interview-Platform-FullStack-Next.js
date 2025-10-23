import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCoQiZRpkXsKiAqrTMZjgwiLEvuhPZFpQ",
  authDomain: "mockzone-a190a.firebaseapp.com",
  projectId: "mockzone-a190a",
  storageBucket: "mockzone-a190a.firebasestorage.app",
  messagingSenderId: "384026037913",
  appId: "1:384026037913:web:2d5a7ee0ea913424417208",
  measurementId: "G-CSKF6KLBMJ",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
