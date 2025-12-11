import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { initInstallPrompt, initializeServiceWorker, registerPeriodicSync } from './utils/notificationService';

// Initialize PWA install prompt handler
initInstallPrompt();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('PWA: Content is cached for offline use.');
    // Initialize notification service after SW is ready
    initializeServiceWorker();
    registerPeriodicSync();
  },
  onUpdate: (registration) => {
    console.log('PWA: New content is available; please refresh.');
    // Optionally show a notification to the user
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  },
  onRegistration: (registration) => {
    console.log('PWA: Service worker registered');
  }
});
