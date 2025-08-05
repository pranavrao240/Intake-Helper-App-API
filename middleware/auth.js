const jwt = require('jsonwebtoken');
const TOKEN_KEY = process.env.JWT_SECRET || "RANDOM_KEY";

function authenticationToken(req,res,next) {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];
   
    if(!token){
        return res.status(403).send({message : "No token Provided"})
    }
    jwt.verify(token,TOKEN_KEY,(err,user)=>{
        if(err) return res.sendStatus(401).send({message:"Unauthorized"});
        req.user = user;
        next();
    })
    
}


function generateAccessToken(user) {
    const payload = {
        userId: user._id,
        email: user.email,
        
    };
    return jwt.sign(payload, process.env.JWT_SECRET || TOKEN_KEY, { expiresIn: '1h' });

}
module.exports = {
    authenticationToken,generateAccessToken
}