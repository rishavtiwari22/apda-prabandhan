const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "District name is required"],
      unique: true,
      trim: true,
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

districtSchema.index({ name: 1 });

const District = mongoose.model("District", districtSchema);

module.exports = District;
