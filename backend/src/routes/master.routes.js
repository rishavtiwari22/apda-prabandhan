const express = require("express");
const router = express.Router();
const {
  addDisasterType,
  getDisasterTypes,
  addDistrict,
  getDistricts,
  addBlock,
  getBlocks,
  addPanchayat,
  getPanchayats,
} = require("../controllers/master.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");
const { ROLES } = require("../constants/roles");

// =============================
// PUBLIC ROUTES
// =============================

router.get("/disaster-types", getDisasterTypes);
router.get("/districts", getDistricts);
router.get("/blocks/:districtId", getBlocks);
router.get("/panchayats/:blockId", getPanchayats);

// =============================
// ADMIN-ONLY ROUTES
// =============================

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.post("/disaster-types", addDisasterType);
router.post("/districts", addDistrict);
router.post("/blocks", addBlock);
router.post("/panchayats", addPanchayat);

module.exports = router;
