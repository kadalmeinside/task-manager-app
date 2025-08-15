// Import the Firebase app and messaging packages.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJlqDRDggh3gJrwvbFQTWoRJYfmtlI3Zk",
  authDomain: "taskflow-87348.firebaseapp.com",
  projectId: "taskflow-87348",
  storageBucket: "taskflow-87348.firebasestorage.app",
  messagingSenderId: "17313154792",
  appId: "1:917313154792:web:803205af861af3cf3ae35d"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging.isSupported() ? firebase.messaging() : null;

if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/pwa-192x192.png'
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
