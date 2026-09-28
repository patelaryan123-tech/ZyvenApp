import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Only initialize Firebase if API key exists, otherwise mock it so app doesn't crash
let app;
let auth;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } else {
    // Mock for when deployed without Firebase env vars
    console.warn("Firebase env vars missing. Google Login will be disabled.");
    app = {};
    auth = { 
      onAuthStateChanged: (cb) => { 
        if (typeof cb === 'function') cb(null); 
        return () => {}; 
      } 
    };
  }
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
