const { model } = require('mongoose');
const userServices = require('../services/user.service');


exports.register =(req,res,next)=>{
    userServices.register(req.body,(error,results)=>{
        if(error){
            return next(error);
        }
  
            return res.status(200).send({
                message:"Success",
                data:results
            })
    
    })
}




exports.login = (req,res,next)=>{
    const {email,password} = req.body;

    userServices.login({email,password},(error,results)=>{
        if(error){
            return next(error);

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