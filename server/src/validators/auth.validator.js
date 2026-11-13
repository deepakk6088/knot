
function validateRegistration(req, res, next) {
    const { username, email, password, displayName } = req.body || {};
    const errors = {};

    if (typeof username !== "string" || !username.trim()) {
        errors.username = "Username is required.";
    } else if (username.trim().length < 3 || username.trim().length > 30) {
        errors.username = "Username must be between 3 and 30 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        errors.username = "Username can only contain letters, numbers and underscores.";
    }

    if (typeof email !== "string" || !email.trim()) {
        errors.email = "Email is required.";
    } else if (
        email.trim().length > 255 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        errors.email = "Please provide a valid email address.";
    }

    if (typeof password !== "string" || !password) {
        errors.password = "Password is required.";
    } else if (password.length < 8) {
        errors.password = "Password must contain at least 8 characters.";
    } else if (Buffer.byteLength(password, "utf8") > 72) {
        errors.password = "Password cannot exceed 72 bytes.";
    }

    if (
        displayName !== undefined &&
        displayName !== null &&
        (typeof displayName !== "string" || displayName.trim().length > 60)
    ) {
        errors.displayName = "Display name must be a string with at most 60 characters.";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors
        });
    }

    req.body.username = username.trim();
    req.body.email = email.trim().toLowerCase();

    if (typeof displayName === "string") {
        req.body.displayName = displayName.trim() || null;
    }

    next();
}

function validateLogin(req, res, next) {
    const { identifier, password } = req.body || {};
    const errors = {};

    if (typeof identifier !== "string" || !identifier.trim()) {
        errors.identifier = "Email or username is required.";
    } else if (identifier.trim().length > 255) {
        errors.identifier = "Email or username is too long.";
    }

    if (typeof password !== "string" || !password) {
        errors.password = "Password is required.";
    } else if (Buffer.byteLength(password, "utf8") > 72) {
        errors.password = "Invalid password.";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors
        });
    }

    req.body.identifier = identifier.trim();
    next();
}

function validateEmailVerification(req, res, next) {
    const { email, otp } = req.body || {};
    const errors = {};

    if (typeof email !== "string" || !email.trim()) {
        errors.email = "Email is required.";
    } else if (
        email.trim().length > 255 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        errors.email = "Please provide a valid email address.";
    }

    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
        errors.otp = "OTP must be exactly 6 digits.";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors
        });
    }

    req.body.email = email.trim().toLowerCase();
    next();
}

function validateResendVerification(req, res, next) {
    const { email } = req.body || {};

    if (
        typeof email !== "string" ||
        !email.trim() ||
        email.trim().length > 255 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address.",
            errors: {
                email: "A valid email address is required."
            }
        });
    }

    req.body.email = email.trim().toLowerCase();
    next();
}

module.exports = {
    validateRegistration,
    validateLogin,
    validateEmailVerification,
    validateResendVerification
};
