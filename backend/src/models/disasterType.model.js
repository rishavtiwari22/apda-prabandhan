const mongoose = require("mongoose");

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
    // List of documents that the applicant must upload for this disaster
    requiredDocuments: [
      {
        label: { type: String, required: true },
        labelHindi: { type: String, required: true },
        isMandatory: { type: Boolean, default: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

disasterTypeSchema.index({ name: 1 });
disasterTypeSchema.index({ isActive: 1 });

const DisasterType = mongoose.model("DisasterType", disasterTypeSchema);

module.exports = DisasterType;
