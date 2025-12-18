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