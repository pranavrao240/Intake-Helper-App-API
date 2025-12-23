

const User = require('../models/user.model'); // Adjust the path if necessary
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

async function updateProfile({email,password},callback){
    try{
        
    }catch{}
}
async function getProfile(userId, callback) {
    try {
        const user = await User.findById(userId).select('-password'); // Exclude password from results
        if (user) {
            return callback(null, user);
        } else {
            return callback({ message: "User not found" });
        }
    } catch (error) {
        return callback(error);
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
    getProfile
};
