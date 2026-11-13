
const express = require("express");

const authController = require("../controllers/auth.controller");

const {
    validateRegistration,
    validateLogin,
    validateEmailVerification,
    validateResendVerification
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
    "/verify-email",
    validateEmailVerification,
    authController.verifyEmail
);

router.post(
    "/resend-verification",
    validateResendVerification,
    authController.resendVerification
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
