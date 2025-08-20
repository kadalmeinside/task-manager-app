
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const webpush = require("web-push");

// Inisialisasi Firebase Admin SDK
admin.initializeApp();

/**
 * Mengirim notifikasi push saat dokumen baru dibuat di koleksi 'notifications'.
 * Fungsi ini mengambil langganan push pengguna dari Firestore dan menggunakan
 * web-push untuk mengirim payload notifikasi.
 */
exports.sendPushNotificationOnCreate = functions.firestore
    .document("notifications/{notificationId}")
    .onCreate(async (snapshot) => {
      const notificationData = snapshot.data();
      const userId = notificationData.userId;

      const vapidPublicKey = functions.config().vapid.public_key;
      const vapidPrivateKey = functions.config().vapid.private_key;

      if (!vapidPublicKey || !vapidPrivateKey) {
        console.error(
            "VAPID keys are not configured. Please run 'firebase " +
            "functions:config:set vapid.public_key=...'and'...private_key=...'",
        );
        return null;
      }

      // 1. Dapatkan "alamat" push subscription dari pengguna target
      const subscriptionSnap = await admin.firestore()
          .collection("pushSubscriptions")
          .doc(userId)
          .get();

      if (!subscriptionSnap.exists) {
        console.log(`No push subscription found for user: ${userId}`);
        return null;
      }
      const subscription = subscriptionSnap.data();

      // 2. Siapkan payload notifikasi (data yang akan dikirim)
      const payload = JSON.stringify({
        title: "Pemberitahuan Tugas Baru",
        body: notificationData.message,
      });

      // 3. Konfigurasi dan kirim notifikasi push
      webpush.setVapidDetails(
          "mailto:admin@persija.id", // Ganti dengan email kontak Anda
          vapidPublicKey,
          vapidPrivateKey,
      );

      try {
        await webpush.sendNotification(subscription, payload);
        console.log(`Push notification sent successfully to user: ${userId}`);
      } catch (error) {
        console.error(`Error sending push notification to ${userId}:`, error);
        if (error.statusCode === 404 || error.statusCode === 410) {
          console.log("Subscription expired or invalid. Deleting...");
          return subscriptionSnap.ref.delete();
        }
      }
      return null;
    });
