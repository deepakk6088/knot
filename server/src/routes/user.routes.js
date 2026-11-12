
const express = require("express");

const userController = require("../controllers/user.controller");

const {
    validateProfileUpdate,
    validateUserSearch
} = require("../validators/user.validator");

const {
    authenticateToken
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.patch(
    "/me",
    authenticateToken,
    validateProfileUpdate,
    userController.updateProfile
);

router.get(
    "/search",
    authenticateToken,
    validateUserSearch,
    userController.searchUsers
);

module.exports = router;
