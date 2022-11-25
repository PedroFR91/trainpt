// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
  apiKey: 'AIzaSyB_V8b0uXx23_BU2ak9y2pEjQdZ7HS5jx8',
  authDomain: 'trainpt-3fe80.firebaseapp.com',
  projectId: 'trainpt-3fe80',
  storageBucket: 'trainpt-3fe80.appspot.com',
  messagingSenderId: '66970129686',
  appId: '1:66970129686:web:fdc96d99e3cbce1787ec37',
  measurementId: 'G-20Z0X2R86Y',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };
