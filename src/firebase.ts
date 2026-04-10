// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlpDsyhP325yk0JqPZ3-r7bmqmfi7FMcU",
  authDomain: "travelwise-1cca6.firebaseapp.com",
  databaseURL: "https://travelwise-1cca6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "travelwise-1cca6",
  storageBucket: "travelwise-1cca6.firebasestorage.app",
  messagingSenderId: "365838389942",
  appId: "1:365838389942:web:d3bbcc7a1b3eec0c044c17",
  measurementId: "G-4YLYJQL1PP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
const analytics = getAnalytics(app);