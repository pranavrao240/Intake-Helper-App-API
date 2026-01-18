const jwt = require('jsonwebtoken');
const TOKEN_KEY = process.env.JWT_SECRET || "RANDOM_KEY";

function authenticationToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false,
            message: "No token provided" 
        });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "Invalid token format" 
        });
    }

    jwt.verify(token, TOKEN_KEY, (err, decoded) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(403).json({ 
                success: false,
                message: "Invalid or expired token" 
            });
        }
        
        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };
        
        next();
    });
}

function generateAccessToken(user) {
    const payload = {
        userId: user._id.toString(), 
        email: user.email
    };
    
    return jwt.sign(
        payload, 
        process.env.JWT_SECRET || TOKEN_KEY, 
        { 
            expiresIn: '30d' 
        }
    );
}

module.exports = {
    authenticationToken,
    generateAccessToken
};