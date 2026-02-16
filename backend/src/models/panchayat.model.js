const mongoose = require("mongoose");

const panchayatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Panchayat name is required"],
      trim: true,
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
      required: [true, "Block reference is required"],
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

// A panchayat name must be unique within a block
panchayatSchema.index({ name: 1, block: 1 }, { unique: true });

const Panchayat = mongoose.model("Panchayat", panchayatSchema);

module.exports = Panchayat;
