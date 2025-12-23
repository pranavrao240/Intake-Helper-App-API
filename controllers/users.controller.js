const { model } = require('mongoose');
const userServices = require('../services/user.service');


exports.register = (req, res, next) => {
    userServices.register(req.body, (error, results) => {
        if (error) {
            // If it's a known error (like email exists), return 400
            if (error.message && (error.message.includes('already registered') || 
                                 error.message.includes('Missing required fields') ||
                                 error.message.includes('Invalid email format'))) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            // For other errors, pass to error handler with 500 status
            return res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        // Success response
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: results
        });
    });
}

exports.getProfile = (req, res, next) => {
    try {
        console.log('Request user:', req.user); // Debug log
        
        // Get user ID from the authenticated request
        const userId = req.user?.userId;
        
        if (!userId) {
            console.error('No user ID found in request:', {
                user: req.user,
                headers: req.headers
            });
            return res.status(400).json({
                success: false,
                message: "User authentication failed: No user ID found"
            });
        }

        userServices.getProfile(userId, (error, results) => {
            if (error) {
                console.error('Profile Error:', error);
                return res.status(500).json({
                    success: false,
                    message: "Error retrieving user profile",
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
            
            if (!results) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
            
            res.status(200).json({ 
                success: true,
                message: "Profile retrieved successfully",
                data: results 
            });
        });
    } catch (error) {
        console.error('Unexpected Error in getProfile:', error);
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// In your auth.js middleware
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    try {
        // Get token from header
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

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Make sure the token has the user ID
        if (!decoded._id) {
            return res.status(401).json({
                success: false,
                message: "Invalid token: missing user ID"
            });
        }

        // Attach user to request
        req.user = {
            _id: decoded._id,
            email: decoded.email
        };
        
        console.log('Authenticated user:', req.user); // Debug log
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
    // const email = req.body.email;

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