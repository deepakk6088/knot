
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

module.exports = {
    register
};
