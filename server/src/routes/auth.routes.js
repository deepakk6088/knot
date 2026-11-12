
const express = require("express");

const authController = require("../controllers/auth.controller");

const {
    validateRegistration,
    validateLogin
} = require("../validators/auth.validator");

const {
    authenticateToken
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
    "/register",
    validateRegistration,
    authController.register
);

router.post(
    "/login",
    validateLogin,
    authController.login
);

router.get(
    "/me",
    authenticateToken,
    authController.getCurrentUser
);

module.exports = router;
