
const express = require("express");

const authController = require("../controllers/auth.controller");
const { validateRegistration } = require("../validators/auth.validator");

const router = express.Router();

router.post(
    "/register",
    validateRegistration,
    authController.register
);

module.exports = router;
