const jwt = require("jsonwebtoken");

/**
 * Generate Access Token (short-lived)
 * Contains: userId, role
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" }
  );
};

/**
 * Generate Refresh Token (long-lived)
 * Contains: userId only
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" }
  );
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Set refresh token as httpOnly cookie
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

/**
 * Generate Reset Token (very short-lived, 10 minutes)
 */
const generateResetToken = (userId) => {
  return jwt.sign(
    { id: userId, purpose: "password_reset" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "10m" }
  );
};

/**
 * Verify Reset Token
 */
const verifyResetToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  if (decoded.purpose !== "password_reset") {
    throw new Error("Invalid token purpose");
  }
  return decoded;
};

/**
 * Clear refresh token cookie
 */
const clearRefreshTokenCookie = (res) => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  generateResetToken,
  verifyResetToken,
};
