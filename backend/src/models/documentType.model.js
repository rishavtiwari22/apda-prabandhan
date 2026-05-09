const mongoose = require("mongoose");

const documentTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Document name in English is required"],
      trim: true,
    },
    nameHindi: {
      type: String,
      required: [true, "Document name in Hindi is required"],
      trim: true,
    },
    disasterType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisasterType",
      required: [true, "Disaster type reference is required"],
    },
    responsibleDepartment: {
      type: String,
      default: "individual",
    },
    isUserMandatory: {
      type: Boolean,
      default: false,
    },
    isDeptMandatory: {
      type: Boolean,
      default: true,
    },
    allowUserOptional: {
      type: Boolean,
      default: true,
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

// One document name per disaster type
documentTypeSchema.index({ name: 1, disasterType: 1 }, { unique: true });
documentTypeSchema.index({ disasterType: 1 });

const DocumentType = mongoose.model("DocumentType", documentTypeSchema);

module.exports = DocumentType;
