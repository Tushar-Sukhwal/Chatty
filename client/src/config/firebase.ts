
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVk5UMQUQil8iLAThfzR8XY6RUtEGNHlY",
  authDomain: "chatty-5d50d.firebaseapp.com",
  projectId: "chatty-5d50d",
  storageBucket: "chatty-5d50d.firebasestorage.app",
  messagingSenderId: "600551699138",
  appId: "1:600551699138:web:2dbf3a9d3355a36b93c15b",
  measurementId: "G-7J0E01D4LT",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
