// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCIYnX4Fawe2KAp4jH8XAaN-U86hB5nJCs",
  authDomain: "gotogether-39173.firebaseapp.com",
  projectId: "gotogether-39173",
  storageBucket: "gotogether-39173.firebasestorage.app",
  messagingSenderId: "82024923871",
  appId: "1:82024923871:web:247a81139ade17ec721f6a",
  measurementId: "G-3TW6BJHLYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
export const db = getFirestore(app);