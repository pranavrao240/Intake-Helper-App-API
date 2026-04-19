const express = require('express');
const mongoose = require('mongoose');
const nutritionRoutes = require('./routes/app.routes'); // ✅ make sure file name matches
const cors = require('cors');
require('./services/notificationScheduler');

const app = express();
const PORT = 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongodbUrl = process.env.MONGODB_URL || 'mongodb+srv://pranavrao210:HCBunmPYZZ2tkbJQ@nutrition.obx6bxv.mongodb.net/IntakeHelperDB';

if (!mongodbUrl) {
  console.error('ERROR: MONGODB_URL environment variable is not set!');
  console.error('Please set MONGODB_URL in your Vercel environment variables');
  process.exit(1);
}

mongoose.connect(mongodbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');~
  // Start server after DB connection is ready
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// ✅ API Routes
app.use("/api", nutritionRoutes);  // Register routes under /api path
