

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const nutritionController = require('../controllers/nutritions.controller');
const userController = require('../controllers/users.controller');
const { authenticationToken } = require("../middleware/auth");
const todoController = require("../controllers/todos.controller");
const streakController = require("../controllers/streak.controller");
const notificationController = require('../controllers/notifications.controller');
const { importNutritionData } = require('../services/nutritions.service'); 
const { resetPasswordEmail } = require('../controllers/users.controller');
const User = require('../models/user.model');


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
    const path = require('path');
    const filePath = path.join(__dirname, '..', 'dataset', 'nutrition-db.nutritions.csv');
    const result = await importNutritionData(filePath);
 
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
// Add these routes
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
// Email verification route
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }
        
        const { verifyEmail } = require('../services/user.service');
        const result = await verifyEmail(token);
        
        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                email: result.email
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Email verification failed',
            error: error.message
        });
    }
});


router.get('/verify-reset-token', async (req, res) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>❌ Invalid Request</h1>
                        <p>Reset token is required</p>
                    </body>
                </html>
            `);
        }
        
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() }
        });
        
        if (!user) {
            return res.status(400).send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>❌ Invalid Token</h1>
                        <p>The reset token is invalid or expired</p>
                    </body>
                </html>
            `);
        }
        
        // Update emailVerified to true
        await User.findByIdAndUpdate(user._id, {
            emailVerified: true
        });
        
        // Show success message
        res.send(`
            <html>
                <head>
                    <title>Email Verified - Intake Helper</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            margin: 0;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .container {
                            background: white;
                            padding: 40px;
                            border-radius: 10px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            max-width: 500px;
                            width: 100%;
                            text-align: center;
                        }
                        .success-icon {
                            color: #28a745;
                            font-size: 48px;
                            margin-bottom: 20px;
                        }
                        .token-display {
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                            word-break: break-all;
                            font-family: monospace;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success-icon">✅</div>
                        <h1 style="color: #333; margin: 0 0 20px 0;">Email Verified Successfully!</h1>
                        <p style="color: #666; margin: 0 0 30px 0;">Your email has been verified successfully. You can now use this token to reset your password.</p>
                        
                        <div class="token-display">
                            <strong>Reset Token:</strong><br>
                            ${token}
                        </div>
                        
                        <p style="color: #999; font-size: 14px; margin: 30px 0 10px 0;">
                            Email verified for: ${user.email}
                        </p>
                        
                        <p style="color: #999; font-size: 12px; margin: 10px 0;">
                            This token will expire at: ${user.emailVerificationExpires}
                        </p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #666; font-size: 14px; margin: 0;">
                                <strong>Next Steps:</strong><br>
                                Use your app to reset your password with this token
                            </p>
                        </div>
                    </div>
                </body>
            </html>
        `);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying token',
            error: error.message
        });
    }
});
// Test endpoint (optional)
router.post('/test-reset-email', async (req, res) => {
    try {
        const { email } = req.body;
        const testToken = 'test-token-123';
        const { sendPasswordResetEmail } = require('../services/email.service');
        const result = await sendPasswordResetEmail(email, testToken);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/profile", authenticationToken, userController.getProfile);
router.put('/profile', authenticationToken, userController.updateProfile);
router.delete('/profile', authenticationToken, userController.deleteUser);



 



router.post("/todos", authenticationToken, todoController.create);
router.get("/todos", authenticationToken, todoController.findAll);
router.delete("/todos", authenticationToken, todoController.delete);
router.get('/reset-todos', authenticationToken, todoController.resetTodos);

router.get('/status-todos/:status', authenticationToken, todoController.getStatusTodos);
router.put('/change-status/:status/:id', authenticationToken, todoController.changeStatus);



module.exports = router;
