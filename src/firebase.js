// src/firebase.js

import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database"; // 🛑 IMPORT REALTIME DATABASE FUNCTIONS

// 🛑 DELETE the line that imports getAnalytics and the line that initializes it.
// We only need the database functions for the kudos wall.

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDTK-DcGqXM1aall7n75suzk_uTCcHIQc",
  authDomain: "rove-kudos.firebaseapp.com",
  projectId: "rove-kudos",
  storageBucket: "rove-kudos.firebasestorage.app",
  messagingSenderId: "711748176095",
  appId: "1:711748176095:web:0a4f52a178e9478fbd816a",
  measurementId: "G-X69BJ2F30C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🛑 NEW CODE: Initialize and export the Realtime Database reference
export const db = getDatabase(app);
export const KUDOS_REF = ref(db, 'kudos'); // This is the path where we will store the Kudos
