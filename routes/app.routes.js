

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const nutritionController = require('../controllers/nutritions.controller');
const userController = require('../controllers/users.controller');
const { authenticationToken } = require("../middleware/auth");
const todoController = require("../controllers/todos.controller");
const streakController = require("../controllers/streak.controller");
const notificationController = require('../controllers/notifications.controller');


const Nutrition = require('../models/nutritions.model');

router.get('/nutrition/import', async (req, res) => {
  try {
    const nutritionData = await Nutrition.find(); 
    res.status(200).json({
      message: 'Nutrition data fetched successfully.',
      data: nutritionData
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch nutrition data',
      error: error.message
    });
  }
});




router.get("/nutrition/import/csv", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "Nutrition_data.csv");
    
    const result = await importNutritionData("Nutrition_data.csv");

    res.status(200).json({
      message: "CSV Imported successfully",
      insertedRecords: result.length,
    });

  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({ message: "Failed to import CSV", error: error.message });
  }
});

router.get('/streak', authenticationToken, streakController.getStreak);
router.post('/streak/update', authenticationToken, streakController.updateStreak);
router.delete('/streak/reset', authenticationToken, streakController.resetStreak);


// Notification routes
router.get('/notifications', authenticationToken, notificationController.getNotifications);
router.post('/notifications', authenticationToken, notificationController.createNotification);
router.delete('/notifications', authenticationToken, notificationController.deleteNotifications);
router.put('/notifications/read', authenticationToken, notificationController.markAsRead);
router.get('/notifications/unread-count', authenticationToken, notificationController.getUnreadCount);
router.post('/notifications/streak', authenticationToken, notificationController.createStreakNotification);
router.post('/notifications/meal-reminder', authenticationToken, notificationController.createMealReminder);
router.delete('/notifications/cleanup', authenticationToken, notificationController.deleteOldNotifications);

router.get("/nutrition/saved", authenticationToken, nutritionController.findSaved);
router.put("/nutrition/saved/:id", authenticationToken, nutritionController.updateSavedMeal);

router.get('/nutrition/:_id', nutritionController.findOne); 
router.post("/nutrition", authenticationToken, nutritionController.create);
router.put('/nutrition/:id', authenticationToken, nutritionController.update);
router.delete('/nutrition/:id', authenticationToken, nutritionController.delete);


router.post("/login", userController.login);
router.post("/register", userController.register);
router.get("/profile", authenticationToken, userController.getProfile);
router.put('/profile', authenticationToken, userController.updateProfile);

 
// router.put('/profile/image', authenticationToken, userController.updateProfileWithImage);



router.post("/todos", authenticationToken, todoController.create);
router.get("/todos", authenticationToken, todoController.findAll);
router.delete("/todos", authenticationToken, todoController.delete);
router.get('/reset-todos', authenticationToken, todoController.resetTodos);

router.get('/status-todos/:status', authenticationToken, todoController.getStatusTodos);
router.put('/change-status/:status/:id', authenticationToken, todoController.changeStatus);



module.exports = router;
