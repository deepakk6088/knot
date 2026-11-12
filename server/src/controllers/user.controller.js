const userService = require("../services/user.service");

async function updateProfile(req, res, next) {
    try {
        const user = await userService.updateUserProfile(
            req.user.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    updateProfile
};