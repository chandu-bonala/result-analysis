import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAlYA1AxcnLW4N8pppF327Bepcot9CnAKE",
  authDomain: "plant-ec218.firebaseapp.com",
  projectId: "plant-ec218",
  storageBucket: "plant-ec218.appspot.com",
  messagingSenderId: "711179970125",
  appId: "1:711179970125:web:759d271f321312caca9e04",
  measurementId: "G-54427HWEG8",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
