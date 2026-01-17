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

exports.getProfile = (req, res, next) => {
    try {
        console.log('Request user:', req.user); 
        
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