const mongoose = require("mongoose");
const { COMPENSATION_CATEGORY_VALUES } = require("../constants/compensation");

const disasterTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Disaster name in English is required"],
      unique: true,
      trim: true,
    },
    nameHindi: {
      type: String,
      required: [true, "Disaster name in Hindi is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    compensationCategory: {
      type: String,
      required: [true, "Compensation category is required"],
      enum: {
        values: COMPENSATION_CATEGORY_VALUES,
        message: "Invalid compensation category",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slaHours: {
      type: Number,
      default: 24,
    },
    allowedLossMetrics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LossMetric",
      },
    ],
  },
  {
    timestamps: true,
  }
);

disasterTypeSchema.index({ isActive: 1 });

const DisasterType = mongoose.model("DisasterType", disasterTypeSchema);

module.exports = DisasterType;
