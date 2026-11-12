const express = require("express");

const userController = require("../controllers/user.controller");

const {
    validateProfileUpdate
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

module.exports = router;