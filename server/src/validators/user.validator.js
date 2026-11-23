function validateProfileUpdate(req, res, next) {
    const { displayName, bio, avatarUrl } = req.body;

    // Reject fields that users are not allowed to update.
    const allowedFields = ["displayName", "bio", "avatarUrl"];
    const receivedFields = Object.keys(req.body);

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

    // Validate avatar URL or base64 image.
    if (avatarUrl !== undefined && avatarUrl !== null) {
        if (typeof avatarUrl !== "string") {
            return res.status(400).json({
                success: false,
                message: "Avatar must be an image URL or image file."
            });
        }

        const trimmedAvatar = avatarUrl.trim();
        req.body.avatarUrl = trimmedAvatar;

        if (trimmedAvatar.length === 0) {
            req.body.avatarUrl = null;
        } else if (trimmedAvatar.startsWith("data:")) {
            const validImageDataUrl =
                /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/i;

            if (!validImageDataUrl.test(trimmedAvatar)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid JPEG, PNG, WebP, or GIF image."
                });
            }

            if (trimmedAvatar.length > 7 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: "Avatar image is too large. Maximum size is 5 MB."
                });
            }
        } else {
            try {
                const parsedUrl = new URL(trimmedAvatar);

                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    throw new Error("Invalid protocol");
                }
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid HTTP or HTTPS image URL."
                });
            }
        }
    }

    next();
}

function validateUserSearch(req, res, next) {
    const { q } = req.query;

    if (typeof q !== "string") {
        return res.status(400).json({
            success: false,
            message: "Search query is required."
        });
    }

    const query = q.trim();

    if (query.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Search query cannot be empty."
        });
    }

    if (query.length > 60) {
        return res.status(400).json({
            success: false,
            message: "Search query cannot exceed 60 characters."
        });
    }

    req.searchQuery = query;

    next();
}

module.exports = {
    validateProfileUpdate,
    validateUserSearch
};
