// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAK3C4Ocp7xb_Jf6rcWgfmQh06-jO7xEU",
  authDomain: "aiflashcard-348c0.firebaseapp.com",
  projectId: "aiflashcard-348c0",
  storageBucket: "aiflashcard-348c0.appspot.com",
  messagingSenderId: "568454220969",
  appId: "1:568454220969:web:0c9f4af8466d2d64f3edb8",
  measurementId: "G-093B9S7HRE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export {db}