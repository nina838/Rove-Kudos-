// src/firebase.js

import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database"; // Imports for Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  // Your unique credentials are now here
  apiKey: "AIzaSyBDTK-DcGqXM1aall7n75suzk_uTCcHIQc",
  authDomain: "rove-kudos.firebaseapp.com",
  projectId: "rove-kudos",
  storageBucket: "rove-kudos.firebasestorage.app",
  messagingSenderId: "711748176095",
  appId: "1:711748176095:web:0a4f52a178e9478fbd816a",
  measurementId: "G-X69BJ2F30C",
  
  // This is the CRITICAL line we just confirmed!
  databaseURL: "https://rove-kudos-default-rtdb.firebaseio.com", 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export the Realtime Database reference
export const db = getDatabase(app);
export const KUDOS_REF = ref(db, 'kudos');
