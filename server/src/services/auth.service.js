
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(userData) {
    const {
        username,
        email,
        password,
        displayName
    } = userData;

    // Check whether username or email already exists.
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { username },
                { email }
            ]
        },
        select: {
            username: true,
            email: true
        }
    });

    if (existingUser) {
        const error = new Error(
            existingUser.email === email
                ? "Email is already registered."
                : "Username is already taken."
        );

        error.statusCode = 409;
        throw error;
    }

    // Hash the password before storing it.
    const passwordHash = await bcrypt.hash(password, 12);

    try {
        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                displayName: displayName || null
            },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                bio: true,
                avatarUrl: true,
                createdAt: true
            }
        });

        return user;
    } catch (error) {
        // Handle duplicate values caused by concurrent requests.
        if (error.code === "P2002") {
            const errorMessage = new Error(
                "Username or email is already registered."
            );

            errorMessage.statusCode = 409;
            throw errorMessage;
        }

        throw error;
    }
}

async function loginUser(identifier, password) {
    const normalizedIdentifier = identifier.toLowerCase();

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: normalizedIdentifier },
                { username: identifier }
            ]
        },
        select: {
            id: true,
            username: true,
            email: true,
            passwordHash: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            createdAt: true
        }
    });

    // Use the same error for an unknown account and incorrect password.
    if (!user) {
        const error = new Error("Invalid email/username or password.");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatches) {
        const error = new Error("Invalid email/username or password.");
        error.statusCode = 401;
        throw error;
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );

    // Never return the password hash to the client.
    const { passwordHash, ...safeUser } = user;

    return {
        user: safeUser,
        token
    };
}

async function getUserById(userId) {
    return prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            createdAt: true
        }
    });
}

module.exports = {
    registerUser,
    loginUser,
    getUserById
};
