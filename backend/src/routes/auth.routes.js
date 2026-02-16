const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  sendOTP,
  verifyOTP,
  resetPassword,
  changePassword,
} = require("../controllers/auth.controller");

const { requireAuth, requireRole } = require("../middlewares/auth.middleware");
const { ROLES } = require("../constants/roles");

// =============================
// PUBLIC ROUTES
// =============================

// Public self-registration
router.post("/register", register);

// Login with mobile/aadhaar + password
router.post("/login", login);

// Refresh access token (uses cookie)
router.post("/refresh", refreshAccessToken);

// OTP-based Password Reset flow
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// =============================
// PROTECTED ROUTES
// =============================

// Get current user profile
router.get("/me", requireAuth, getMe);

// Logout
router.post("/logout", requireAuth, logout);

// Change password (logged-in user)
router.post("/change-password", requireAuth, changePassword);

// =============================
// ADMIN-ONLY ROUTES
// =============================

// Admin creates department/admin users
// Uses the same register handler, but requireAuth attaches req.user
// so the controller knows it's an admin creating the user
router.post("/register-user", requireAuth, requireRole(ROLES.ADMIN), register);

module.exports = router;
