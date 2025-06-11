const { UserService } = require("../service/userService");
const JWT = require('jsonwebtoken');

/**
 * Middleware to authenticate access token
 */
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access token is missing" });
    }
    
    try {
        // Verify token
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        
        // Get fresh user data from database to ensure user still exists and has permissions
        const user = await UserService.getUserById(decoded.id);
        if (!user) {
            return res.status(403).json({ error: "User no longer exists" });
        }
        
        // Attach user info to request object
        req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName
        };
        
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: "Token expired", 
                code: "TOKEN_EXPIRED"
            });
        }
        return res.status(403).json({ error: "Invalid token" });
    }
}

/**
 * Optional auth middleware - continues even if no token or invalid token
 * Useful for routes that work differently when authenticated vs unauthenticated
 */
async function optionalAuthenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(); // Continue without authentication
    }
    
    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const user = await UserService.getUserById(decoded.id);
        if (user) {
            req.user = {
                id: user.id,
                email: user.email,
                firstName: user.firstName
            };
        }
    } catch (error) {
        // Just continue without setting user
        console.log("Optional auth failed:", error.message);
    }
    
    next();
}

module.exports = { 
    authenticateToken,
    optionalAuthenticateToken
};