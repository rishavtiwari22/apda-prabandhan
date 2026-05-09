const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLE_VALUES, ROLES, DESIGNATION_VALUES } = require("../constants/roles");
const { DEPARTMENT_VALUES } = require("../constants/departments");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit Indian mobile number",
      ],
    },

    aadhaar: {
      type: String,
      required: [true, "Aadhaar number is required"],
      unique: true,
      trim: true,
      match: [/^\d{12}$/, "Aadhaar must be a 12-digit number"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // allows multiple nulls while keeping unique constraint
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      validate: {
        validator: function (v) {
          // At least one uppercase letter and one digit
          return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
        },
        message:
          "Password must be at least 8 characters and contain at least one uppercase letter and one number",
      },
      select: false, // Never return password by default in queries
    },

    role: {
      type: String,
      enum: {
        values: ROLE_VALUES,
        message: "Role must be one of: " + ROLE_VALUES.join(", "),
      },
      default: ROLES.PUBLIC,
    },

    designation: {
      type: String,
      enum: {
        values: DESIGNATION_VALUES,
        message: "Invalid designation",
      },
      // Required for SUB_ADMIN role — validated in pre-save
    },

    departmentType: {
      type: String,
      enum: {
        values: DEPARTMENT_VALUES,
        message: "Invalid department type",
      },
    },

    // Which disaster types this user is authorized to resolve
    // Set by Admin (Collector)
    authorizedDisasterTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DisasterType",
      },
    ],

    // Territory Assignments (District/Tehsil/Block level responsibility)
    assignedDistrict: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
    assignedTehsil: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tehsil",
    },
    assignedBlock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // For refresh token rotation
    refreshToken: {
      type: String,
      select: false,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ---------------------
// INDEXES
// ---------------------
userSchema.index({ role: 1 });
userSchema.index({ departmentType: 1 });
userSchema.index({ isActive: 1 });

// ---------------------
// PRE-SAVE HOOKS
// ---------------------

// Hash password before saving
userSchema.pre("save", async function () {
  // Only hash if password was modified
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Validate designation is required for SUB_ADMIN role
userSchema.pre("save", function () {
  if (this.role === ROLES.SUB_ADMIN && !this.designation) {
    throw new Error("Designation is required for sub-admin users");
  }
});

// ---------------------
// INSTANCE METHODS
// ---------------------

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Return user object without sensitive fields
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
