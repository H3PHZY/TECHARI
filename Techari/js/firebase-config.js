// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyA_3g_CgehkFH-Wp0BL2LH1SVoDXlSIn-E",
  authDomain: "techari-be4ba.firebaseapp.com",
  projectId: "techari-be4ba",
  storageBucket: "techari-be4ba.firebasestorage.app",
  messagingSenderId: "859355606739",
  appId: "1:859355606739:web:abfa0a666f241724932e26",
  measurementId: "G-NJYGLKFBTF"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
window.db = firebase.firestore();
window.auth = firebase.auth();
