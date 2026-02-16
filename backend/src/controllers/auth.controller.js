const User = require("../models/user.model");
const OTP = require("../models/otp.model");
const { ROLES } = require("../constants/roles");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  generateResetToken,
  verifyResetToken,
} = require("../utils/jwt.utils");

/**
 * @desc    Register a new user (Admin creates Department users; Public self-registers)
 * @route   POST /api/auth/register
 * @access  Public (for public role) | Admin (for department role)
 */
const register = async (req, res) => {
  try {
    const { name, mobile, aadhaar, email, password, role, departmentType, otp } =
      req.body;

    // Determine the role being created
    const requestedRole = role || ROLES.PUBLIC;

    // 1. Mandatory OTP Verification for PUBLIC self-registration
    if (requestedRole === ROLES.PUBLIC) {
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: "OTP is required for registration.",
        });
      }

      const formattedMobile = mobile.startsWith("+") ? mobile : `+91${mobile}`;

      if (twilioClient) {
        // REAL TWILIO VERIFY CHECK
        try {
          const check = await twilioClient.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks.create({ to: formattedMobile, code: otp });

          if (check.status !== "approved") {
            return res.status(400).json({
              success: false,
              message: "Incorrect or expired OTP.",
            });
          }
        } catch (twilioError) {
          console.error("Twilio Verify Error (Reg):", twilioError.message);
          return res.status(500).json({
            success: false,
            message: `Twilio Error during registration: ${twilioError.message}`,
          });
        }
      } else {
        // SIMULATED VERIFY
        const otpRecord = await OTP.findOne({ mobile, isUsed: false }).sort({ createdAt: -1 });

        if (!otpRecord) {
          return res.status(400).json({
            success: false,
            message: "Expired or invalid OTP. Please request a new one.",
          });
        }

        const isValid = await otpRecord.verifyOTP(otp);
        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: "Incorrect OTP.",
          });
        }

        otpRecord.isUsed = true;
        await otpRecord.save();
      }
    }

    // Only Admin can create DEPARTMENT or ADMIN users
    if (requestedRole === ROLES.DEPARTMENT || requestedRole === ROLES.ADMIN) {
      if (!req.user || req.user.role !== ROLES.ADMIN) {
        return res.status(403).json({
          success: false,
          message:
            "Only Admin (Collector) can create departmental or admin users.",
        });
      }
    }

    // Check if mobile already exists
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: "A user with this mobile number already exists.",
      });
    }

    // Check if aadhaar already exists
    const existingAadhaar = await User.findOne({ aadhaar });
    if (existingAadhaar) {
      return res.status(400).json({
        success: false,
        message: "A user with this Aadhaar number already exists.",
      });
    }

    // Build user data
    const userData = {
      name,
      mobile,
      aadhaar,
      email,
      password,
      role: requestedRole,
    };

    // Add department type if creating a department user
    if (requestedRole === ROLES.DEPARTMENT) {
      if (!departmentType) {
        return res.status(400).json({
          success: false,
          message: "Department type is required for departmental users.",
        });
      }
      userData.departmentType = departmentType;
    }

    const user = await User.create(userData);

    // If public user registers themselves, generate tokens and log them in
    if (requestedRole === ROLES.PUBLIC) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Save refresh token in DB
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      setRefreshTokenCookie(res, refreshToken);

      return res.status(201).json({
        success: true,
        message: "Registration successful.",
        data: {
          user: user.toSafeObject(),
          accessToken,
        },
      });
    }

    // Admin creating a department user — no auto-login
    return res.status(201).json({
      success: true,
      message: `${requestedRole} user created successfully.`,
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A user with this ${field} already exists.`,
      });
    }

    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

/**
 * @desc    Login user with mobile/aadhaar + password
 * @route   POST /api/auth/login
 * @access  Public
 *
 * User can login with either mobile or aadhaar number (gov-style).
 */
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // identifier can be mobile or aadhaar
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide mobile/Aadhaar number and password.",
      });
    }

    // Determine if identifier is mobile (10 digits) or aadhaar (12 digits)
    let query;
    if (/^[6-9]\d{9}$/.test(identifier)) {
      query = { mobile: identifier };
    } else if (/^\d{12}$/.test(identifier)) {
      query = { aadhaar: identifier };
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10-digit mobile or 12-digit Aadhaar number.",
      });
    }

    // Find user with password included
    const user = await User.findOne(query).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated. Contact the administrator.",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Wrong password.",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token and update last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: user.toSafeObject(),
        accessToken,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

/**
 * @desc    Logout user (clear refresh token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // Clear refresh token from DB
    await User.findByIdAndUpdate(req.user._id, {
      refreshToken: null,
    });

    // Clear cookie
    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed.",
    });
  }
};

/**
 * @desc    Refresh access token using refresh token from cookie
 * @route   POST /api/auth/refresh
 * @access  Public (but needs valid refresh token cookie)
 */
const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token found. Please login again.",
      });
    }

    // Verify the refresh token
    const decoded = verifyRefreshToken(token);

    // Find user and verify stored refresh token matches
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token. Please login again.",
      });
    }

    if (!user.isActive) {
      clearRefreshTokenCookie(res);
      return res.status(403).json({
        success: false,
        message: "Account deactivated.",
      });
    }

    // Rotate: generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Save new refresh token
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: "Token refreshed.",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    clearRefreshTokenCookie(res);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired. Please login again.",
      });
    }

    console.error("Refresh Token Error:", error);
    return res.status(500).json({
      success: false,
      message: "Token refresh failed.",
    });
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: req.user.toSafeObject(),
      },
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
};

const twilio = require("twilio");

// Initialize Twilio Client
const twilioClient = process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_AUTH_TOKEN !== "PASTE_YOUR_AUTH_TOKEN_HERE"
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * @desc    Step 1: Send OTP to mobile (Real via Twilio or Simulated)
 * @route   POST /api/auth/send-otp
 * @access  Public
 * @payload { mobile, type } type: 'reset' (default) or 'register'
 */
const sendOTP = async (req, res, next) => {
  try {
    const { mobile, type = "reset" } = req.body;

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit mobile number.",
      });
    }

    // Check if user exists
    const user = await User.findOne({ mobile });
    
    if (type === "reset" && !user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this mobile number.",
      });
    }

    if (type === "register" && user) {
      return res.status(400).json({
        success: false,
        message: "An account already exists with this mobile number.",
      });
    }

    // Format mobile for Twilio (assumes India +91)
    const formattedMobile = mobile.startsWith("+") ? mobile : `+91${mobile}`;

    if (twilioClient) {
      // REAL TWILIO VERIFY FLOW
      console.log(`[Twilio] Attempting to send OTP (${type}) to ${formattedMobile}...`);
      try {
        const verification = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verifications.create({ to: formattedMobile, channel: "sms" });

        console.log(`[Twilio] Success: Verification SID ${verification.sid}, Status: ${verification.status}`);
        
        return res.status(200).json({
          success: true,
          message: `OTP sent successfully via Twilio for ${type}.`,
        });
      } catch (twilioError) {
        console.error("Twilio Send Error:", twilioError.message);
        return res.status(500).json({
          success: false,
          message: `Twilio Error: ${twilioError.message}`,
        });
      }
    } else {
      // SIMULATED FLOW (Fallback)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = await OTP.hashOTP(otp);

      await OTP.create({
        mobile,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      console.log("\n--------------------------");
      console.log(`📱 [SIMULATED] SMS to ${mobile} (${type}): OTP is ${otp}`);
      console.log("--------------------------\n");

      return res.status(200).json({
        success: true,
        message: `OTP sent successfully (Simulated) for ${type}.`,
        ...(process.env.NODE_ENV === "development" && { devOTP: otp })
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Step 2: Verify OTP (Real via Twilio or Simulated)
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and OTP are required.",
      });
    }

    const formattedMobile = mobile.startsWith("+") ? mobile : `+91${mobile}`;

    if (twilioClient) {
      // REAL TWILIO VERIFY CHECK
      console.log(`[Twilio] Verifying OTP ${otp} for ${formattedMobile}...`);
      try {
        const check = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verificationChecks.create({ to: formattedMobile, code: otp });

        console.log(`[Twilio] Verification result: ${check.status}`);
        
        if (check.status !== "approved") {
          return res.status(400).json({
            success: false,
            message: "Incorrect or expired OTP.",
          });
        }
      } catch (twilioError) {
        console.error("Twilio Verify Error:", twilioError.message);
        return res.status(500).json({
          success: false,
          message: `Twilio Error: ${twilioError.message}`,
        });
      }
    } else {
      // SIMULATED VERIFY
      const otpRecord = await OTP.findOne({ mobile, isUsed: false }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: "Expired or invalid OTP.",
        });
      }

      const isValid = await otpRecord.verifyOTP(otp);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Incorrect OTP.",
        });
      }

      otpRecord.isUsed = true;
      await otpRecord.save();
    }

    // Both flows eventually generate a reset token
    const user = await User.findOne({ mobile });
    const resetToken = generateResetToken(user._id);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      data: { resetToken },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Step 3: Reset password using reset token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = verifyResetToken(resetToken);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token. Please start over.",
      });
    }

    // Find user and update password
    const user = await User.findById(decoded.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.password = newPassword;
    user.refreshToken = null; 
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password (logged-in user provides old password + new password)
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password.",
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    // Invalidate refresh token (force re-login on other devices)
    user.refreshToken = null;
    await user.save();

    // Generate fresh tokens for current session
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Password change failed. Please try again.",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  sendOTP,
  verifyOTP,
  resetPassword,
  changePassword,
};
