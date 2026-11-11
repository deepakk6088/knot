
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

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

module.exports = {
    registerUser
};
