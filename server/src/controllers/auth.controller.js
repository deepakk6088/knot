
const authService = require("../services/auth.service");

async function register(req, res, next) {
    try {
        const result = await authService.registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: result.message,
            email: result.email
        });
    } catch (error) {
        next(error);
    }
}

async function resendVerification(req, res, next) {
    try {
        const result = await authService.resendVerificationOTP(
            req.body.email
        );

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
}

async function verifyEmail(req, res, next) {
    try {
        const { email, otp } = req.body;

        const result = await authService.verifyEmail(email, otp);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully.",
            user: result.user,
            token: result.token
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { identifier, password } = req.body;

        const result = await authService.loginUser(
            identifier,
            password
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: result.user,
            token: result.token
        });
    } catch (error) {
        next(error);
    }
}

async function getCurrentUser(req, res, next) {
    try {
        const user = await authService.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    resendVerification,
    verifyEmail,
    login,
    getCurrentUser
};
