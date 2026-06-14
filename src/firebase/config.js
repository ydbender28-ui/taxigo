import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTzrT8QJ4FXJwNdrApfpEzJdfly8DPPSk",
  authDomain: "taxi-go-609f7.firebaseapp.com",
  projectId: "taxi-go-609f7",
  storageBucket: "taxi-go-609f7.firebasestorage.app",
  messagingSenderId: "69516004799",
  appId: "1:69516004799:web:b01d0bb0782b33da1e650a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
