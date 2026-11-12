
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is required."
        });
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (
        scheme?.toLowerCase() !== "bearer" ||
        !token ||
        authorizationHeader.split(" ").length !== 2
    ) {
        return res.status(401).json({
            success: false,
            message: "Invalid authorization header."
        });
    }

    if (!process.env.JWT_SECRET) {
        return next(new Error("JWT_SECRET is not configured."));
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        req.user = {
            id: decoded.userId
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Authentication token has expired."
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        next(error);
    }
}

module.exports = {
    authenticateToken
};
