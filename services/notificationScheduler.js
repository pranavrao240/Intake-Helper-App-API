require('dotenv').config();
const cron = require('node-cron');
const admin = require('firebase-admin');
const User = require('../models/user.model'); // Fix path

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString(),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Run every day at 8:00 PM
cron.schedule('0 20 * * *', async () => {
  try {
    await checkAndNotifyInactiveUsers();
  } catch (err) {
    console.error('Cron check failed:', err.message);
  }
});

// Run every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  try {
    await sendMorningReminder();
  } catch (err) {
    console.error('Cron morning reminder failed:', err.message);
  }
});

async function sendMorningReminder() {
  console.log('Sending morning reminders to plan todos...');
  try {
    const activeUsers = await User.find({
      FCMToken: { $exists: true, $ne: null }
    });

    console.log(`Found ${activeUsers.length} users with FCM tokens for morning reminders`);

    const notifiedUsers = [];
    for (const user of activeUsers) {
      const token = user.FCMToken;
      if (token) {
        await sendNotification(token, {
          title: "🌅 Plan your day!",
          body: "Don't forget to add your todos for today's meals and stay on track!"
        });
        notifiedUsers.push({ email: user.email, fullName: user.fullName });
      }
    }
    
    return {
      totalFound: activeUsers.length,
      notified: notifiedUsers
    };
  } catch (err) {
    console.error('Error during morning reminders dispatch:', err);
    throw err;
  }
}

async function checkAndNotifyInactiveUsers() {
  console.log('Checking inactive users...');
  try {
    const now = new Date();
    const cutoff = new Date(now - 24 * 60 * 60 * 1000); // 24 hours ago

    const inactiveUsers = await User.find({
      FCMToken: { $exists: true, $ne: null },
      $or: [
        { lastActive: { $lt: cutoff } },
        { lastTaskCompleted: { $lt: cutoff }, lastTaskCompleted: { $exists: true } },
        { lastTaskCompleted: { $exists: false }, lastActive: { $lt: cutoff } }
      ]
    });

    console.log(`Found ${inactiveUsers.length} inactive users`);

    const notifiedUsers = [];
    for (const user of inactiveUsers) {
      const token = user.FCMToken;
      if (token) {
        await sendNotification(token, {
          title: "⏰ Don't forget!",
          body: 'You have pending meals. Stay on track today!'
        });
        notifiedUsers.push({ email: user.email, fullName: user.fullName });
      }
    }

    return {
      totalFound: inactiveUsers.length,
      notified: notifiedUsers
    };
  } catch (err) {
    console.error('Error during inactive user check:', err);
    throw err;
  }
}

async function sendNotification(token, { title, body }) {
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      android: {
        priority: 'high',
        notification: { sound: 'default' }
      },
      apns: {
        payload: { aps: { sound: 'default' } }
      }
    });
    console.log('Notification sent successfully!');
  } catch (err) {
    console.error('FCM error:', err.message);
  }
}

module.exports = {
  checkAndNotifyInactiveUsers,
  sendMorningReminder,
  sendNotification
};