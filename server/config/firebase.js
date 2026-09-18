const admin = require('firebase-admin');
require('dotenv').config();

let initialized = false;

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace literal \n with actual newlines if necessary
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    initialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    console.warn('Firebase Admin SDK config missing. Firebase features will not work.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

module.exports = { admin, initialized };
