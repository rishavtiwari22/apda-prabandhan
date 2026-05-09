const express = require("express");
const router = express.Router();
const {
  submitPublicApplication,
  submitDepartmentApplication,
  trackApplication,
  getTrackDocs,
  getApplications,
  getApplicationDetail,
  forwardApplication,
  backwardApplication,
  resolveApplication,
  requestDocuments,
  uploadDocument,
  uploadApplicantDocument,
  shareApplication,
  addRemark,
  verifyDocument,
  rejectDocument,
  adminActionOnRejection,
  updateApplication
} = require("../controllers/application.controller");
const { getTimeline } = require("../controllers/audit.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");
const { ROLES } = require("../constants/roles");
const upload = require("../middlewares/upload.middleware");
const { body, param, validationResult } = require("express-validator");

// Shared validation middleware - returns 422 if any validator failed
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// =============================
// PUBLIC ROUTES
// =============================

// Public application submission
router.post("/public", upload.any(), submitPublicApplication);

// Public application tracking
router.get("/track/:applicationNumber", trackApplication);

// =============================
// PROTECTED ROUTES
// =============================

// Ensure all following routes require authentication
router.use(requireAuth);

// Departmental/Admin submission
// List & Search
router.get("/", getApplications);
router.post("/", upload.any(), submitDepartmentApplication);

// Authenticated doc tracking (MUST be before /:id to avoid conflict)
router.get("/track/:applicationNumber/docs", getTrackDocs);

// Detail & Timeline
router.get("/:id", getApplicationDetail);
router.get("/:id/timeline", getTimeline);

// Forwarding & Resolution
router.post(
  "/:id/forward",
  param("id").isMongoId().withMessage("Invalid application ID"),
  body("forwardToId").isMongoId().withMessage("Invalid target user ID"),
  body("remarks").notEmpty().withMessage("Remarks are required"),
  validate,
  forwardApplication
);

// Hierarchical Backwarding (SDM -> Tehsildar, Collector -> SDM/Tehsildar)
router.post(
  "/:id/backward",
  param("id").isMongoId().withMessage("Invalid application ID"),
  body("backwardToId").isMongoId().withMessage("Invalid target user ID"),
  body("remarks").notEmpty().withMessage("Remarks are required"),
  validate,
  backwardApplication
);
// Resolution with optional final document upload
router.post(
  "/:id/resolve",
  param("id").isMongoId().withMessage("Invalid application ID"),
  body("paymentAmount").isFloat({ gt: 0 }).withMessage("Payment amount must be a positive number"),
  body("resolutionNote").notEmpty().withMessage("Resolution note is required"),
  validate,
  upload.single("finalDocument"),
  resolveApplication
);

// Document Workflow
router.post(
  "/:id/request-documents",
  param("id").isMongoId().withMessage("Invalid application ID"),
  body("documentTypes").isArray({ min: 1 }).withMessage("At least one document type is required"),
  validate,
  requestDocuments
);
// Officer upload (authenticated, e.g. department staff uploading a report)
router.post("/:id/upload-document", upload.single("file"), uploadDocument);
// Applicant upload (authenticated public user uploading their own documents)
router.post("/:id/upload-applicant-document", upload.single("file"), uploadApplicantDocument);

// Add remark
router.post("/:id/remark", addRemark);

// Update Application Details
router.patch("/:id", requireAuth, updateApplication);

// Document Verification & Rejection
router.patch("/:id/documents/:docId/verify", requireAuth, verifyDocument);
router.patch("/:id/documents/:docId/reject", requireAuth, rejectDocument);
router.patch("/:id/admin-action", requireAuth, adminActionOnRejection);

// Case Sharing
router.post("/:id/share", shareApplication);

module.exports = router;
