const mongoose = require("mongoose");

const lossMetricSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    nameHindi: {
      type: String,
      required: true,
    },
    fields: [
      {
        name: { type: String, required: true },
        label: { type: String, required: true },
        labelHindi: { type: String },
        type: {
          type: String,
          enum: ["text", "number", "select", "date", "boolean"],
          default: "text",
        },
        options: [{ type: String }], // Only for "select" type
        placeholder: { type: String },
        required: { type: Boolean, default: false },
        validation: { type: String }, // Optional regex or rule
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LossMetric", lossMetricSchema);
