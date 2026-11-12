function validateProfileUpdate(req, res, next) {
    const { displayName, bio, avatarUrl } = req.body;

    const allowedFields = ["displayName", "bio", "avatarUrl"];
    const receivedFields = Object.keys(req.body);

    // Reject fields that users are not allowed to update.
    const invalidFields = receivedFields.filter(
        field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Invalid fields: ${invalidFields.join(", ")}.`
        });
    }

    // At least one field must be provided.
    if (receivedFields.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Provide at least one field to update."
        });
    }

    // Validate displayName.
    if (displayName !== undefined && displayName !== null) {
        if (typeof displayName !== "string") {
            return res.status(400).json({
                success: false,
                message: "Display name must be a string or null."
            });
        }

        req.body.displayName = displayName.trim();

        if (req.body.displayName.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Display name cannot exceed 60 characters."
            });
        }
    }

    // Validate bio.
    if (bio !== undefined && bio !== null) {
        if (typeof bio !== "string") {
            return res.status(400).json({
                success: false,
                message: "Bio must be a string or null."
            });
        }

        req.body.bio = bio.trim();

        if (req.body.bio.length > 160) {
            return res.status(400).json({
                success: false,
                message: "Bio cannot exceed 160 characters."
            });
        }
    }

    // Validate avatarUrl.
    if (avatarUrl !== undefined && avatarUrl !== null) {
        if (typeof avatarUrl !== "string") {
            return res.status(400).json({
                success: false,
                message: "Avatar URL must be a string or null."
            });
        }

        try {
            const parsedUrl = new URL(avatarUrl);

            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                throw new Error("Invalid protocol");
            }
        } catch {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid HTTP or HTTPS avatar URL."
            });
        }
    }

    next();
}

module.exports = {
    validateProfileUpdate
};