

const User = require('../models/user.model'); 
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

async function updateProfile(userId, profileData, callback) {
    try {
        const updateData = {};
        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== undefined && profileData[key] !== null) {
                // All fields are at root level, so just assign directly
                updateData[key] = profileData[key];
            }
        });
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return callback({ message: "User not found" });
        }
        
        return callback(null, updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
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

// Login function
async function login({ email, password }, callback) {
    try {
        const userModel = await User.findOne({ email });
        
        if (userModel) {
            if (bcrypt.compareSync(password, userModel.password)) {
                const userPayload = {
                    _id: userModel._id,
                    email: userModel.email,
                    fullName: userModel.fullName,
                };
                const token = auth.generateAccessToken(userPayload);
                return callback(null, { ...userModel.toJSON(), token });
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

// Register function
async function register(params, callback) {
    // Validate required fields
    const requiredFields = ['fullName', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !params[field]);
    
    if (missingFields.length > 0) {
        return callback({ 
            message: `Missing required fields: ${missingFields.join(', ')}` 
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.email)) {
        return callback({ message: "Invalid email format" });
    }

    try {
        // Check if user already exists
        const isUserExist = await User.findOne({ email: params.email.toLowerCase().trim() });
        if (isUserExist) {
            return callback({ message: "Email is already registered" });
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        params.password = bcrypt.hashSync(params.password, salt);
        params.email = params.email.trim();

        // Create and save user
        const user = new User(params);
        const savedUser = await user.save();
        
        // Remove password from response
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
    updateProfile
};
