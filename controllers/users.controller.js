const { model } = require('mongoose');
const userServices = require('../services/user.service');


exports.register = (req, res, next) => {
    userServices.register(req.body, (error, results) => {
        if (error) {
            if (error.message && (error.message.includes('already registered') || 
                                 error.message.includes('Missing required fields') ||
                                 error.message.includes('Invalid email format'))) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: results
        });
    });
}

const User = require('../models/user.model');


exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log('Fetching user with ID:', userId);
        
        const user = await User.findById(userId)
            .select('-password -__v')
            .lean();

        if (!user) {
            console.log('User not found with ID:', userId);
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log('Found user:', user);
        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in getProfile controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

        // Handle profileImage path
        if (updateData.profileImage) {
            // You can add validation here if needed
            // For example, check if it's a valid URL or local path
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