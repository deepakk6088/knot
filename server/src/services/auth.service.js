
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("./email.service");

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

function generateOTP() {
    return crypto.randomInt(0, 1000000)
        .toString()
        .padStart(6, "0");
}

function hashOTP(otp) {
    if (!process.env.OTP_SECRET) {
        throw new Error("OTP_SECRET is not configured.");
    }

    return crypto
        .createHmac("sha256", process.env.OTP_SECRET)
        .update(otp)
        .digest("hex");
}

function createAuthToken(userId) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );
}

async function registerUser(userData) {
    const { username, email, password, displayName } = userData;

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ username }, { email }]
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

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    const expiresAt = new Date(
        Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    try {
        const user = await prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data: {
                    username,
                    email,
                    passwordHash,
                    displayName: displayName || null
                },
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            });

            await tx.emailVerification.create({
                data: {
                    userId: createdUser.id,
                    otpHash,
                    expiresAt
                }
            });

            return createdUser;
        });

        try {
            await sendVerificationEmail(user.email, otp);
        } catch (emailError) {
            console.error("Verification email failed:", emailError);

            const error = new Error(
                "Account created, but verification email could not be sent. Please try requesting a new code after 60 seconds."
            );

            error.statusCode = 503;
            throw error;
        }

        return {
            email: user.email,
            message: "Verification code sent to your email address."
        };
    } catch (error) {
        if (error.code === "P2002") {
            const conflictError = new Error(
                "Username or email is already registered."
            );

            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw error;
    }
}

async function resendVerificationOTP(email) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            emailVerifiedAt: true,
            emailVerification: {
                select: {
                    id: true,
                    createdAt: true
                }
            }
        }
    });

    const genericResponse = {
        message: "If your account requires verification, a new code will be sent to your email."
    };

    if (!user || user.emailVerifiedAt || !user.emailVerification) {
        return genericResponse;
    }

    const now = new Date();

    const cooldownBefore = new Date(
        now.getTime() - OTP_RESEND_COOLDOWN_SECONDS * 1000
    );

    // Return a generic response during cooldown to avoid exposing account status.
    if (user.emailVerification.createdAt > cooldownBefore) {
        return genericResponse;
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    const expiresAt = new Date(
        now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    // Atomically enforce the cooldown to prevent concurrent resends.
    const updatedChallenge = await prisma.emailVerification.updateMany({
        where: {
            id: user.emailVerification.id,
            createdAt: { lte: cooldownBefore },
            usedAt: null
        },
        data: {
            otpHash,
            expiresAt,
            attempts: 0,
            usedAt: null,
            createdAt: now
        }
    });

    if (updatedChallenge.count !== 1) {
        return genericResponse;
    }

    try {
        await sendVerificationEmail(user.email, otp);
    } catch (emailError) {
        console.error("Resend verification email failed:", emailError);

        const error = new Error(
            "Could not send the verification email. Please try again after 60 seconds."
        );

        error.statusCode = 503;
        throw error;
    }

    return genericResponse;
}

async function verifyEmail(email, otp) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            username: true,
            email: true,
            emailVerifiedAt: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            createdAt: true,
            emailVerification: {
                select: {
                    id: true,
                    otpHash: true,
                    expiresAt: true,
                    attempts: true,
                    usedAt: true
                }
            }
        }
    });

    if (!user || !user.emailVerification) {
        const error = new Error("Invalid or expired verification code.");
        error.statusCode = 400;
        throw error;
    }

    if (user.emailVerifiedAt) {
        const error = new Error("Email is already verified.");
        error.statusCode = 409;
        throw error;
    }

    const verification = user.emailVerification;
    const now = new Date();

    if (
        verification.usedAt ||
        verification.expiresAt <= now ||
        verification.attempts >= MAX_OTP_ATTEMPTS
    ) {
        const error = new Error("Invalid or expired verification code.");
        error.statusCode = 400;
        throw error;
    }

    const submittedHash = Buffer.from(hashOTP(otp), "hex");
    const storedHash = Buffer.from(verification.otpHash, "hex");

    const otpMatches =
        submittedHash.length === storedHash.length &&
        crypto.timingSafeEqual(submittedHash, storedHash);

    if (!otpMatches) {
        const result = await prisma.emailVerification.updateMany({
            where: {
                id: verification.id,
                usedAt: null,
                expiresAt: { gt: now },
                attempts: { lt: MAX_OTP_ATTEMPTS }
            },
            data: {
                attempts: { increment: 1 }
            }
        });

        if (result.count === 0) {
            const error = new Error("Invalid or expired verification code.");
            error.statusCode = 400;
            throw error;
        }

        const error = new Error("Invalid or expired verification code.");
        error.statusCode = 400;
        throw error;
    }

    const verifiedUser = await prisma.$transaction(async (tx) => {
        const challenge = await tx.emailVerification.updateMany({
            where: {
                id: verification.id,
                usedAt: null,
                expiresAt: { gt: now },
                attempts: { lt: MAX_OTP_ATTEMPTS }
            },
            data: {
                usedAt: now
            }
        });

        if (challenge.count !== 1) {
            const error = new Error("Invalid or expired verification code.");
            error.statusCode = 400;
            throw error;
        }

        return tx.user.update({
            where: { id: user.id },
            data: {
                emailVerifiedAt: now
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
    });

    const token = createAuthToken(verifiedUser.id);

    return {
        user: verifiedUser,
        token
    };
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
            emailVerifiedAt: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            createdAt: true
        }
    });

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

    if (!user.emailVerifiedAt) {
        const error = new Error("Please verify your email before logging in.");
        error.statusCode = 403;
        error.code = "EMAIL_NOT_VERIFIED";
        throw error;
    }

    const token = createAuthToken(user.id);

    const {
        passwordHash,
        emailVerifiedAt,
        ...safeUser
    } = user;

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
    resendVerificationOTP,
    verifyEmail,
    loginUser,
    getUserById
};
