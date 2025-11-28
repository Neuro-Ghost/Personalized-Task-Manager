// js/home.js
// Module moved out of HTML to keep markup clean.
// Behavior preserved exactly: loader timing, fetch to /api/verify-secret,
// anonymous Firebase sign-in, sessionStorage flag, etc.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

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

// Function to show the loading overlay (creates it if missing)
function showLoadingOverlay() {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = '<div class="loader"><img src="loading.gif" alt="Loading..."></div>';
    document.body.appendChild(overlay);
  } else {
    overlay.style.display = 'flex';
  }
}

// Function to hide the loading overlay (if present)
function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Ensure the loader fades out after at least minLoadTime on window load
window.addEventListener("load", () => {
  const loader = document.querySelector(".loader");
  const minLoadTime = 3000; // 3 seconds

  const loadStart = performance.now();

  function hideLoader() {
    const elapsed = performance.now() - loadStart;
    const delay = Math.max(0, minLoadTime - elapsed);

    setTimeout(() => {
      if (loader) {
        loader.style.opacity = "0";
        setTimeout(() => {
          if (loader) loader.style.display = "none";
        }, 500); // fade-out duration
      }
    }, delay);
  }

  hideLoader();
});

// Keep the same function name used in HTML button attribute.
// Attach to window so onclick="checkSecret()" still works.
window.checkSecret = async function () {
  const messageInput = document.getElementById('secretMessage');
  const secret = messageInput ? messageInput.value.trim() : "";

  try {
    const response = await fetch('/api/verify-secret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    });

    const data = await response.json();

    if (data.success) {
      // Show loading overlay on next page via sessionStorage flag
      sessionStorage.setItem('showLoading', 'true');

      // Sign in anonymously before redirecting
      const result = await signInAnonymously(auth);
      console.log("Logged in anonymously. UID:", result.user.uid);

      // Redirect to the target URL
      window.location.href = data.redirectUrl;
    } else {
      alert(data.message);
      if (messageInput) messageInput.value = "";
    }
  } catch (error) {
    console.error('Error verifying secret or signing in:', error);
    alert('An error occurred while verifying the secret.');
  }
};

// expose overlay helpers in case other pages/scripts expect them
window.showLoadingOverlay = showLoadingOverlay;
window.hideLoadingOverlay = hideLoadingOverlay;
