const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Block name is required"],
      trim: true,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: [true, "District reference is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// A block name must be unique within a district
blockSchema.index({ name: 1, district: 1 }, { unique: true });

const Block = mongoose.model("Block", blockSchema);

module.exports = Block;
