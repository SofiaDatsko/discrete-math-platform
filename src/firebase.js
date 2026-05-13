import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  authDomain: "discrete-math-57425.firebaseapp.com",
  projectId: "discrete-math-57425",
  storageBucket: "discrete-math-57425.firebasestorage.app",
  messagingSenderId: "480807233461",
  appId: "1:480807233461:web:3fec8b3c71e978b3e29bfc",
  measurementId: "G-Q7F291D0P8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
