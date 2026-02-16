const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const otpSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: Mongo auto-deletes when current date > expiresAt
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify OTP
otpSchema.methods.verifyOTP = async function (enteredOTP) {
  return await bcrypt.compare(enteredOTP, this.otpHash);
};

// Static method to hash OTP
otpSchema.statics.hashOTP = async function (otp) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
};

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
