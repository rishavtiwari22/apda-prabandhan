const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

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
  getAllUsers,
  getAllUsersAdmin,
  toggleUserActive,
  updateUser,
  updateAuthorizedDisasters,
} = require("../controllers/auth.controller");

const { requireAuth, requireRole } = require("../middlewares/auth.middleware");
const { ROLES } = require("../constants/roles");

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { success: false, message: "Too many OTP requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// =============================
// PUBLIC ROUTES
// =============================

// Public self-registration
router.post("/register", register);

// Login with mobile/aadhaar + password
router.post("/login", loginLimiter, login);

// Refresh access token (uses cookie)
router.post("/refresh", refreshAccessToken);

// OTP-based Password Reset flow
router.post("/send-otp", otpLimiter, sendOTP);
router.post("/verify-otp", otpLimiter, verifyOTP);
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

// Get active dept/admin users for assignment dropdowns
router.get("/users", requireAuth, getAllUsers);

// =============================
// ADMIN-ONLY ROUTES
// =============================

// Admin creates department/admin users
router.post("/register-user", requireAuth, requireRole(ROLES.ADMIN), register);

// Admin: Get ALL users (includes inactive & public)
router.get("/users/all", requireAuth, requireRole(ROLES.ADMIN), getAllUsersAdmin);

// Admin: Toggle user active/inactive
router.patch("/users/:id/toggle-active", requireAuth, requireRole(ROLES.ADMIN), toggleUserActive);

// Admin: Update user details
router.put("/users/:id", requireAuth, requireRole(ROLES.ADMIN), updateUser);

// Admin: Update authorized disaster types for a user
router.patch("/users/:id/authorized-disasters", requireAuth, requireRole(ROLES.ADMIN), updateAuthorizedDisasters);

module.exports = router;
