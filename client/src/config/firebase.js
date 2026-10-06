import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDUZhFd9jUubxQeLv78RMXOfgBtaXAWKPE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'zyven-814b3.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'zyven-814b3',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'zyven-814b3.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1034242571932',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1034242571932:web:f2848eba067384a7e4b759'
};

let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase init error:", error);
  app = {};
  auth = { 
    onAuthStateChanged: (cb) => { 
      if (typeof cb === 'function') cb(null); 
      return () => {}; 
    } 
  };
}

export { app, auth };
