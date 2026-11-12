
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

async function searchUsers(req, res, next) {
    try {
        const users = await userService.searchUsers(
            req.searchQuery,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    updateProfile,
    searchUsers
};
