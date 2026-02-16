const { verifyAccessToken } = require("../utils/jwt.utils");
const User = require("../models/user.model");

/**
 * requireAuth — Protects routes by verifying JWT access token.
 * Attaches user object to req.user.
 *
 * Token can be in:
 *  1. Authorization header: "Bearer <token>"
 *  2. Cookie: "accessToken" (optional fallback)
 */
const requireAuth = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Fetch user from DB (without password and refreshToken)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User associated with this token no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated. Contact the administrator.",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please refresh your token.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

/**
 * requireRole — Restricts access to specific roles.
 * Must be used AFTER requireAuth.
 *
 * Usage:
 *   router.get("/admin-only", requireAuth, requireRole("admin"), handler)
 *   router.get("/multi", requireAuth, requireRole("admin", "department"), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before role check.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(
          ", "
        )}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = { requireAuth, requireRole };
