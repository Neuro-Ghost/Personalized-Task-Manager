import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js"; // 👈 ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyD5TC0pbWHZnuvrEY0UxQNxy3fuKAQsm70",
  authDomain: "yuugotthis.firebaseapp.com",
  projectId: "yuugotthis",
  storageBucket: "yuugotthis.firebasestorage.app",
  messagingSenderId: "163407586342",
  appId: "1:163407586342:web:0ddc75b68ffb838a9b32e7",
  measurementId: "G-91YXNGQ4MM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // 👈 ADD THIS

export { auth, db }; // 👈 EXPORT db so we can use it in script.js
