const mongoose = require("mongoose");

const vidhansabhaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vidhansabha name is required"],
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

// A Vidhansabha name must be unique within a district
vidhansabhaSchema.index({ name: 1, district: 1 }, { unique: true });

const Vidhansabha = mongoose.model("Vidhansabha", vidhansabhaSchema);

module.exports = Vidhansabha;
