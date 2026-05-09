const mongoose = require("mongoose");
const { APPLICATION_STATUS, STATUS_VALUES } = require("../constants/applicationStatus");
const disasterEventService = require("../services/disasterEvent.service");

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    // ── Step 1: Application Source ──
    source: {
      type: String,
      enum: ["individual", "thana", "patwari"],
      default: "individual",
    },

    // ── Step 2: Applicant Info ──
    applicantInfo: {
      name: { type: String, required: true },
      fatherName: { type: String },
      aadhar: { type: String },
      mobile: { type: String, required: true },
      address: { type: String, required: true },
      village: { type: String },
      gp: { type: String },          // Gram Panchayat
      block: { type: String },
      tehsil: { type: String },
      vidhanSabha: { type: String },
    },

    // ── Step 3: Beneficiary Info (Hitgrahi) ──
    beneficiaryInfo: {
      name: { type: String },
      mobile: { type: String },
      address: { type: String },
      relationWithApplicant: { type: String },
      aadhar: { type: String },
      isSameAsApplicant: { type: Boolean, default: false },
    },

    // ── Step 4: Disaster Details ──
    subject: { type: String },
    disasterType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisasterType",
      required: true,
    },
    cause: { type: String },

    // ── Step 5: Loss Types (Multi-select) ──
    lossTypes: [{ type: String }],   // e.g. ["पशु", "मकान", "फसल", "सामान"]

    // ── Step 5.1: Structured Loss Information ──
    lossDetails: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ── Step 6: Compensation Demand ──
    compensationDemand: { type: Number },

    // ── Step 7: Witnesses ──
    witnesses: [
      {
        name: { type: String },
        mobile: { type: String },
        address: { type: String },
        documentUrl: { type: String },
      },
    ],

    // ── Step 8: Dates ──
    incidentDate: {
      type: Date,
      required: true,
    },
    incidentHalfDay: {
      type: String,
      enum: ["FIRST_HALF", "SECOND_HALF"],
      default: "FIRST_HALF",
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },

    // ── Step 9: Documents ──
    // (existing arrays below)

    // ── Location (kept for backward compat & geo queries) ──
    location: {
      district: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
      tehsil: { type: mongoose.Schema.Types.ObjectId, ref: "Tehsil" },
      block: { type: mongoose.Schema.Types.ObjectId, ref: "Block" },
      panchayat: { type: mongoose.Schema.Types.ObjectId, ref: "Panchayat" },
      village: { type: mongoose.Schema.Types.ObjectId, ref: "Village" },
      vidhansabha: { type: mongoose.Schema.Types.ObjectId, ref: "Vidhansabha" },
    },
    description: {
      type: String,
    },

    // ── Document Workflow ──
    requiredDocuments: [
      {
        documentType: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentType" },
        name: { type: String },
        responsibleDepartment: { type: String, default: "individual" },
        isUserMandatory: { type: Boolean, default: false },
        isDeptMandatory: { type: Boolean, default: true },
        allowUserOptional: { type: Boolean, default: true },
        status: {
          type: String,
          enum: ["PENDING", "VERIFIED", "REPLACED", "REJECTED"],
          default: "PENDING",
        },
        rejectionReason: { type: String },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
    uploadedDocuments: [
      {
        documentType: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentType" },
        name: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        isVerified: { type: Boolean, default: false },
        status: {
          type: String,
          enum: ["VERIFIED", "REPLACED", "REJECTED"],
          default: "VERIFIED",
        },
      },
    ],

    // ── Status & Ownership ──
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: APPLICATION_STATUS.SUBMITTED,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    currentHandler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sharedWith: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    resolutionDetails: {
      resolutionNote: { type: String },
      paymentAmount: { type: Number },
      paymentDate: { type: Date },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      resolvedByRole: { type: String },
      resolvedByName: { type: String },
      resolvedAt: { type: Date },
      finalDocument: { type: String },
    },
    forwardedHistory: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remarks: { type: String },
        timestamp: { type: Date, default: Date.now },
      }
    ],
    auditLogs: [
      {
        action: { type: String, required: true },
        fromStatus: { type: String },
        toStatus: { type: String },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        performedByRole: { type: String },
        remarks: { type: String },
        timestamp: { type: Date, default: Date.now },
        details: { type: Object },
      },
    ],
    disasterEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisasterEvent",
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes
applicationSchema.index({ "applicantInfo.aadhar": 1 });
applicationSchema.index({ "applicantInfo.mobile": 1 });
applicationSchema.index({ source: 1 });

// ── Aggregation Hooks ──
applicationSchema.post("save", async function (doc) {
  if (doc.disasterEventId) {
    await disasterEventService.updateEventStats(doc.disasterEventId.toString());
  }
});

applicationSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.disasterEventId) {
    await disasterEventService.updateEventStats(doc.disasterEventId.toString());
  }
});

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
