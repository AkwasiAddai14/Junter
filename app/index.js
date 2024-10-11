// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDipsD5OWV6bR9Tlz9GXgf4wy1Vsg_16ZI",
  authDomain: "junter-427511.firebaseapp.com",
  projectId: "junter-427511",
  storageBucket: "junter-427511.appspot.com",
  messagingSenderId: "852658618024",
  appId: "1:852658618024:web:e6c54754945e9a8350cc9d",
  measurementId: "G-DD0J9KQLXF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);