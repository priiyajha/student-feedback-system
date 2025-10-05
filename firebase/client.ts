import { initializeApp,  getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';



const firebaseConfig = {
    apiKey: "AIzaSyBzCSyx43Skkvl-YKcwnswu9elgSW20vzI",
    authDomain: "student-feedback-system-2bbc7.firebaseapp.com",
    projectId: "student-feedback-system-2bbc7",
    storageBucket: "student-feedback-system-2bbc7.firebasestorage.app",
    messagingSenderId: "486819156543",
    appId: "1:486819156543:web:2137b73f14ea9e165e9e8a",
    measurementId: "G-NJRMHWYRFR"
};



// Initialize Firebase
const app = !getApp.length? initializeApp(firebaseConfig): getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
