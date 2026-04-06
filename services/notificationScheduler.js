const cron = require('node-cron');
const admin = require('firebase-admin');
const User = require('../models/user.model'); // Fix path

// Init Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json'))
});

// Run every day at 8 PM
cron.schedule('0 20 * * *', async () => {
  console.log('Checking inactive users...');

  const now = new Date();
  const cutoff = new Date(now - 24 * 60 * 60 * 1000); // 24 hours ago

  // Find users who haven't opened app OR completed a task in 24h
  const inactiveUsers = await User.find({
    $or: [
      { FCMToken: { $exists: true, $ne: null } }
    ],
    $or: [
      { lastActive: { $lt: cutoff } },
      { lastTaskCompleted: { $lt: cutoff }, lastTaskCompleted: { $exists: true } },
      { lastTaskCompleted: { $exists: false }, lastActive: { $lt: cutoff } }
    ]
  });

  console.log(`Found ${inactiveUsers.length} inactive users`);

  for (const user of inactiveUsers) {
    const token = user.FCMToken;
    if (token) {
      await sendNotification(token, {
        title: '⏰ Don\'t forget!',
        body: 'You have pending meals. Stay on track today!'
      });
    }
  }
});


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