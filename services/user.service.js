

const User = require('../models/user.model'); 
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const { sendVerificationEmail } = require('./email.service');
const crypto = require('crypto');

async function updateProfile(userId, profileData, callback) {
    try {
        console.log('Updating profile for user:', userId);
        console.log('Profile data received:', profileData);
        
        const updateData = { ...profileData, }; 
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password ');
        
        if (!updatedUser) {
            return callback({ message: "User not found" });
        }
        
        console.log('Updated user:', updatedUser);
        return callback(null, updatedUser);
    } catch (error) {
        console.error('Error in updateProfile service:', error);
        return callback({ 
            message: "Error updating profile", 
            error: error.message 
        });
    }
}


async function getProfile(userId, callback) {
    try {
        console.log('Fetching user with ID:', userId); 
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            console.log('User not found with ID:', userId);
            return callback({ message: "User not found" });
        }

        console.log('Found user:', user); 
        return callback(null, user);
    } catch (error) {
        console.error('Error in getProfile service:', error); 
        return callback({ 
            message: "Error retrieving profile", 
            error: error.message 
        });
    }
}

async function deleteUser(userId, callback) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return callback({ message: "User not found" });
        }

       
        await require('../models/notifications.model.js').deleteMany({ userId });
        
        await require('../models/todos.model.js').deleteMany({ userId });
        
        await require('../models/streak.model.js').deleteMany({ userId });
        
        await require('../models/nutritions.model.js').deleteMany({ userId });

        await User.findByIdAndDelete(userId);

        return callback(null, { 
            success: true, 
            message: "User account and all related data deleted successfully" 
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return callback({ 
            message: "Error deleting user account", 
            error: error.message 
        });
    }
}

function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}
async function sendEmailVerification(userId, email) {
    try {
        const verificationToken = generateVerificationToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        const updatedUser = await User.findByIdAndUpdate(userId, {
            emailVerificationToken: verificationToken,
            emailVerificationExpires: expiresAt,
            emailVerified: false
        }, { new: true });
        
        const result = await sendVerificationEmail(email, verificationToken);
        
        return {
            ...result,
            user: {
                emailVerificationToken: updatedUser.emailVerificationToken,
                emailVerificationExpires: updatedUser.emailVerificationExpires,
                emailVerified: updatedUser.emailVerified
            }
        };
    } catch (error) {
        throw new Error(`Failed to send email verification: ${error.message}`);
    }
}
async function verifyEmail(token) {
    try {
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() }
        });
        
        if (!user) {
            return { success: false, message: 'Invalid or expired verification token' };
        }
        
        await User.findByIdAndUpdate(user._id, {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null
        });
        
        return { 
            success: true, 
            message: 'Email verified successfully',
            email: user.email 
        };
    } catch (error) {
        throw new Error(`Failed to verify email: ${error.message}`);
    }
}

async function login({ email, password }, callback) {
    try {
        const userModel = await User.findOne({ email });
        
        if (userModel) {
            if (!userModel.emailVerified) {
                return callback({ message: "Please verify your email before logging in" });
            }
            if (bcrypt.compareSync(password, userModel.password)) {
                const userPayload = {
                    _id: userModel._id,
                    email: userModel.email,
                    fullName: userModel.fullName,
                };
                const token = auth.generateAccessToken(userPayload);
                return callback(null, { ...userModel.toJSON(), token, userId: userModel.userId });
            } else {
                return callback({ message: "Invalid Email/Password" });
            }
        } else {
            return callback({ message: "Invalid Email/Password2" });
        }
    } catch (error) {
        return callback(error);
    }
}

async function register(params, callback) {
    const requiredFields = ['fullName', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !params[field]);
    
    if (missingFields.length > 0) {
        return callback({ 
            message: `Missing required fields: ${missingFields.join(', ')}` 
        });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.email)) {
        return callback({ message: "Invalid email format" });
    }

    try {
        const isUserExist = await User.findOne({ email: params.email.toLowerCase().trim() });
        if (isUserExist) {
            return callback({ message: "Email is already registered" });
        }

        const salt = bcrypt.genSaltSync(10);
        params.password = bcrypt.hashSync(params.password, salt);
        params.email = params.email.trim();

        const user = new User(params);
        const savedUser = await user.save();
        
        const userResponse = savedUser.toObject();
        delete userResponse.password;
        
        return callback(null, userResponse);
    } catch (error) {
        console.error('Registration error:', error);
        return callback({ 
            message: "Registration failed",
            error: error.message 
        });
    }
}

module.exports = {
    login,
    register,
    getProfile,
    updateProfile,
    sendEmailVerification,
    verifyEmail,
    deleteUser,
};
