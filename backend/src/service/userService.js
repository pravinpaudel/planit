const { createHmac, randomBytes } = require("crypto");
const { prismaClient } = require("../utils/db");
const JWT = require("jsonwebtoken");
const { isValidEmail, validatePassword, hasMinLength } = require("../utils/validation");
require('dotenv').config();

class UserService {
    static async createUser(payload) {
        const { email, password, firstName, lastName } = payload;
        
        // Validate required fields
        if (!email || !password || !firstName) {
            throw new Error("Email, password, and firstName are required");
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            throw new Error("Invalid email format");
        }
        
        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors.join(", "));
        }
        
        // Validate firstName has minimum length
        if (!hasMinLength(firstName, 2)) {
            throw new Error("First name must be at least 2 characters");
        }
        
        try {
            const salt = randomBytes(16).toString("hex");
            const hash = UserService.createHash(password, salt);
            return await prismaClient.user.create({
                data: {
                    email,
                    password: hash,
                    salt,
                    firstName,
                    lastName
                }
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("Email already exists");
            }
            throw new Error("Error creating user: " + error.message);
        }
    }

    static async getUserByEmail(email) {
        try {
            if (!email) {
                throw new Error("Email is required");
            }
            return await prismaClient.user.findUnique({
                where: { email }
            });
        } catch (error) {
            console.error("Error retrieving user by email:", error);
            throw new Error("Error retrieving user: " + error.message);
        }
    }

    static async generateUserToken(payload) {
        //const user = await UserService.getUserByEmail(payload.email);
        // if (!user) {
        //     throw new Error("User not found");
        // }
        
        // Generate access token with short expiry
        const accessToken = JWT.sign(
            { id: payload.id, email: payload.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        // Generate a secure random token
        const jti = randomBytes(32).toString('hex'); // Unique identifier for this token
        
        // Generate refresh token with longer expiry
        const expiresIn = '7d';
        const refreshToken = JWT.sign(
            { 
                id: payload.id,
                jti // Include the token ID in the payload
            }, 
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', 
            { expiresIn }
        );
        
        // Calculate expiry date for database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        
        // Store refresh token in database
        await prismaClient.refreshToken.create({
            data: {
                token: jti, // Store the token ID, not the whole token
                userId: payload.id,
                expiresAt
            }
        });
        
        return { accessToken, refreshToken };
    }

    static async refreshAccessToken(refreshToken) {
        try {
            // Verify refresh token
            const payload = JWT.verify(
                refreshToken, 
                process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
            );
            
            // Check if token exists and is valid in database
            const tokenRecord = await prismaClient.refreshToken.findFirst({
                where: {
                    token: payload.jti,
                    userId: payload.id,
                    expiresAt: {
                        gte: new Date() // Not expired
                    },
                    isRevoked: false // Not revoked
                }
            });
            
            if (!tokenRecord) {
                throw new Error("Refresh token is invalid or has been revoked");
            }
            
            // Get user by ID
            const user = await UserService.getUserById(payload.id);
            if (!user) {
                throw new Error("User not found");
            }
            
            // Generate new access token
            const accessToken = JWT.sign(
                { id: user.id, email: user.email }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );
            
            // Optional: Token rotation - revoke the current refresh token and issue a new one
            // This provides additional security by making refresh tokens single-use
            // Uncomment this section to enable token rotation
            /*
            // Revoke the current token
            await prismaClient.refreshToken.update({
                where: { id: tokenRecord.id },
                data: { isRevoked: true }
            });
            
            // Generate new refresh token
            const newRefreshToken = await UserService.generateRefreshToken(user.id);
            return { accessToken, refreshToken: newRefreshToken };
            */
            
            return { accessToken };
        } catch (error) {
            console.error("Error refreshing token:", error);
            throw new Error("Invalid refresh token");
        }
    }
    
    static async generateRefreshToken(userId) {
        // Generate a secure random token
        const jti = randomBytes(32).toString('hex');
        
        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        
        // Store in database
        await prismaClient.refreshToken.create({
            data: {
                token: jti,
                userId,
                expiresAt
            }
        });
        
        // Generate JWT
        return JWT.sign(
            { id: userId, jti }, 
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', 
            { expiresIn: '7d' }
        );
    }
    
    static async revokeAllUserRefreshTokens(userId) {
        // Revoke all refresh tokens for a user (e.g., on password change or suspected breach)
        return prismaClient.refreshToken.updateMany({
            where: { 
                userId,
                isRevoked: false 
            },
            data: { isRevoked: true }
        });
    }
    
    static async revokeRefreshToken(token) {
        try {
            // Verify token to get the JTI
            const payload = JWT.verify(
                token,
                process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
            );
            
            // Revoke the token in the database
            return prismaClient.refreshToken.updateMany({
                where: { token: payload.jti },
                data: { isRevoked: true }
            });
        } catch (error) {
            console.error("Error revoking token:", error);
            throw new Error("Invalid token");
        }
    }

    static createHash(password, salt) {
        return createHmac("sha256", salt).update(password).digest("hex");
    }

    static async getUserById(userId) {
        try {
            if (!userId) {
                throw new Error("User ID is required");
            }
            return await prismaClient.user.findUnique({
                where: { id: userId }
            });
        } catch (error) {
            console.error("Error retrieving user by ID:", error);
            throw new Error("Error retrieving user: " + error.message);
        }
    }
}

module.exports = { UserService };