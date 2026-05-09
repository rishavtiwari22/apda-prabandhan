const mongoose = require("mongoose");

const disasterEventSchema = new mongoose.Schema(
  {
    eventNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    disasterType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisasterType",
      required: true,
    },
    incidentDate: {
      type: Date,
      required: true,
    },
    incidentHalfDay: {
      type: String,
      enum: ["FIRST_HALF", "SECOND_HALF"],
      default: "FIRST_HALF",
    },
    location: {
      district: { type: mongoose.Schema.Types.ObjectId, ref: "District", required: true },
      tehsil: { type: mongoose.Schema.Types.ObjectId, ref: "Tehsil", required: true },
      block: { type: mongoose.Schema.Types.ObjectId, ref: "Block", required: true },
      panchayat: { type: mongoose.Schema.Types.ObjectId, ref: "Panchayat", required: true },
      village: { type: mongoose.Schema.Types.ObjectId, ref: "Village", required: true },
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "RESOLVED", "CLOSED"],
      default: "ACTIVE",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Denormalized/Summary fields for admin overview
    totalCases: {
      type: Number,
      default: 0,
    },
    totalResolved: {
        type: Number,
        default: 0,
    },
    totalCompensationAmount: {
      type: Number,
      default: 0,
    },
    auditLogs: [
      {
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remarks: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Indexes
disasterEventSchema.index({ "location.panchayat": 1, "location.village": 1 });
disasterEventSchema.index({ "location.tehsil": 1 });
disasterEventSchema.index({ incidentDate: -1 });
disasterEventSchema.index({ eventNumber: 1 });

const DisasterEvent = mongoose.model("DisasterEvent", disasterEventSchema);

module.exports = DisasterEvent;
