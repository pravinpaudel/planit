const { UserService } = require("../service/userService");

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({ error: "Access token is missing" });
    }
    try {
        const user = await UserService.verifyUserToken(token);
        if (!user) {
            return res.status(403).json({ error: "Invalid token" });
        }
        req.user = user; // Attach user info to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}

module.exports = { authenticateToken };