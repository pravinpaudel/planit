const { createHmac, randomBytes } = require("crypto");
const { prismaClient } = require("../utils/db");
const JWT = require("jsonwebtoken");
require('dotenv').config();

class UserService {
    static async createUser(payload) {
        const { email, password, firstName, lastName } = payload;
        const salt = randomBytes(16).toString("hex");
        const hash = UserService.createHash(password, salt);
        await prismaClient.user.create({
            data: {
                email,
                password: hash,
                salt,
                firstName,
                lastName
            }
        });
    }

    static async getUserByEmail(email) {
        return await prismaClient.user.findUnique({
            where: { email }
        });
    }

    static async generateUserToken(payload) {
        const user = await UserService.getUserByEmail(payload.email);
        if (!user) {
            throw new Error("User not found");
        }
        return JWT.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    }

    static async verifyUserToken(token) {
        try {
            return JWT.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error("Invalid token");
        }
    }

    static createHash(password, salt) {
        return createHmac("sha256", salt).update(password).digest("hex");
    }

    static getUserById(userId) {
        return prismaClient.user.findUnique({
            where: { id: userId }
        });
    }
}

module.exports = { UserService };