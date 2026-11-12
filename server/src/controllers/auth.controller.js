
const authService = require("../services/auth.service");

async function register(req, res, next) {
    try {
        const user = await authService.registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user
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
    login,
    getCurrentUser
};
