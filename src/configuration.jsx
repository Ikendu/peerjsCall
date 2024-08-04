// peerjsapp-afeff
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDw6cYj9ZBCFslF8r-vSHU5rFrQ8oYD6Hg",
  authDomain: "ezeakuyes.firebaseapp.com",
  databaseURL: "https://ezeakuyes-default-rtdb.firebaseio.com",
  projectId: "ezeakuyes",
  storageBucket: "ezeakuyes.appspot.com",
  messagingSenderId: "682991325893",
  appId: "1:682991325893:web:019b18ee5586ea097956ac",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export const auth = getAuth();
export default database;
