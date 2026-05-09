const express = require("express");
const router = express.Router();
const {
  getDisasterEvents,
  createDisasterEvent,
  getDisasterEventDetail,
  updateEventStatus
} = require("../controllers/disasterEvent.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");
const { ROLES } = require("../constants/roles");

/**
 * Public/General Access
 */
// Search for active events (used by applicants during submission)
router.get("/", getDisasterEvents);

/**
 * Protected Access
 */
router.use(requireAuth);

// Create a new incident (Report New Incident)
router.post("/", createDisasterEvent);

// Incident Details & Analytics
router.get("/:id", getDisasterEventDetail);

// Batch Actions (Forward All / Resolve All)
router.post("/:id/batch-action", requireRole([ROLES.ADMIN, ROLES.SUB_ADMIN, ROLES.COLLECTOR, ROLES.SDM]), requireAuth, (req, res, next) => {
  // Pass to controller
  const { performBatchAction } = require("../controllers/disasterEvent.controller");
  return performBatchAction(req, res);
});

// Close or Resolve an Incident (Admin Only)
router.patch("/:id/status", requireRole(ROLES.ADMIN), updateEventStatus);

module.exports = router;
