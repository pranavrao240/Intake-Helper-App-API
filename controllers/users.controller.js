const { model } = require('mongoose');
const userServices = require('../services/user.service');


const { sendEmailVerification } = require('../services/user.service'); // Fix: import from user.service
const { generateAccessToken } = require('../middleware/auth'); // Add this import
const crypto = require('crypto');

const User = require('../models/user.model');
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        console.log('Registration request received:', { fullName, email });
        
        const existingUser = await User.findOne({ 
            email: email,
            isActive: true
        });
        console.log('Existing user check result:', existingUser);
        
        if (existingUser) {
            console.log('User already exists, returning 400');
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }
        
        console.log('Creating new user...');
        const user = new User({
            fullName,
            email,
            password,
            emailVerified: false
        });
        
        console.log('Saving user to database...');
        const savedUser = await user.save();
        console.log('User saved successfully:', savedUser);
        
        console.log('Sending verification email...');
        await sendEmailVerification(savedUser._id, email);
        console.log('Verification email sent');
        
        const token = generateAccessToken(savedUser);
        console.log('JWT token generated');
        
        console.log('Returning success response');
        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for verification.',
            data: {
                userId: savedUser._id,
                email: savedUser.email,
                fullName: savedUser.fullName,
                emailVerified: savedUser.emailVerified,
                emailVerificationToken: savedUser.emailVerificationToken,  // Add this
                emailVerificationExpires: savedUser.emailVerificationExpires,  // Add this
                token: token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent'
            });
        }
        
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            emailVerificationToken: resetToken,
            emailVerificationExpires: expiresAt,
            emailVerified: false
        }, { new: true });
        
        const { sendPasswordResetEmail } = require('../services/email.service');
        await sendPasswordResetEmail(email, resetToken);
        
        return res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email',
            data: {
                emailVerificationToken: updatedUser.emailVerificationToken,
                emailVerificationExpires: updatedUser.emailVerificationExpires,
                emailVerified: updatedUser.emailVerified
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to send password reset email',
            error: error.message
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }
        
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() }
        });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        
        user.password = newPassword;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        user.emailVerified = true;
        
        await user.save({ validateBeforeSave: false });
        
        return res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: error.message
        });
    }
};

exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is required'
            });
        }
        
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() }
        });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Token is valid',
            data: {
                email: user.email,
                token: token,
                expiresAt: user.emailVerificationExpires
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to verify token',
            error: error.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }

        const { password } = req.body;
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password confirmation is required to delete account'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password'
            });
        }

        const { deleteUser } = require('../services/user.service');
        
        deleteUser(userId, (error, result) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to delete account'
                });
            }

            return res.status(200).json({
                success: true,
                message: result.message
            });
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete account',
            error: error.message
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: {
                userId: user._id,
                email: user.email,
                fullName: user.fullName,
                emailVerified: user.emailVerified,
                emailVerificationToken: user.emailVerificationToken,
                emailVerificationExpires: user.emailVerificationExpires,
                FCMToken: user.FCMToken,
                profileImage: user.profileImage,
                height: user.height,
                weight: user.weight,
                age: user.age,
                bodyFat: user.bodyFat,
                gender: user.gender,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
};


const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "No token provided or invalid format. Use 'Bearer <token>'"
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded._id) {
            return res.status(401).json({
                success: false,
                message: "Invalid token: missing user ID"
            });
        }

        req.user = {
            _id: decoded._id,
            email: decoded.email
        };
        
        console.log('Authenticated user:', req.user); 
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};




exports.login = (req, res, next) => {
    const { email, password } = req.body;

    userServices.login({email,password},(error,results)=>{
        if(error){
            return res.status(400).json({
                success: false,
                message: error.message
            });

        }

        return res.status(200).send({
            success:true,
            message:"Success",
            data:results
        })
    })

}
exports.findOne = (req,res,next)=>{
    model={
        email:req.body.email,
        password:req.body.password
    }
    userServices.findOne(model,(error,results)=>{
        if(error){
            return next(error);
        }
        return res.status(200).send({
            message:"Success",
            data:results
        })
    });
}



exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updateData = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for update"
            });
        }

        if (updateData.profileImage) {
            console.log('Updating profileImage to:', updateData.profileImage);
        }

        userServices.updateProfile(userId, updateData, (error, result) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message || "Failed to update profile",
                    error: error.error
                });
            }

            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: result
            });
        });
    } catch (error) {
        console.error('Error in update profile controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};