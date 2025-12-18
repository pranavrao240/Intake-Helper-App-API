const express = require('express');
const mongoose = require('mongoose');
const nutritionRoutes = require('./routes/app.routes'); // ✅ make sure file name matches
const cors = require('cors');

const app = express();
const PORT = 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect('mongodb+srv://pranavrao210:HCBunmPYZZ2tkbJQ@nutrition.obx6bxv.mongodb.net/IntakeHelperDB')
// mongoose.connect('mongodb://localhost:27017/nutrition-db', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
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
