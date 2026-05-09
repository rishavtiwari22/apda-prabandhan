const mongoose = require("mongoose");

const villageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Village", villageSchema);
