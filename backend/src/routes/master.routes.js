const express = require("express");
const router = express.Router();
const {
  addDisasterType,
  getDisasterTypes,
  updateDisasterType,
  deleteDisasterType,
  addDocumentType,
  getDocumentTypes,
  updateDocumentType,
  deleteDocumentType,
  addDistrict,
  getDistricts,
  updateDistrict,
  deleteDistrict,
  addBlock,
  getBlocks,
  updateBlock,
  deleteBlock,
  addPanchayat,
  getPanchayats,
  updatePanchayat,
  deletePanchayat,
  addVidhansabha,
  getVidhansabhas,
  updateVidhansabha,
  deleteVidhansabha,
  addTehsil,
  getTehsils,
  updateTehsil,
  deleteTehsil,
  addVillage,
  getVillages,
  updateVillage,
  deleteVillage,
  bulkUploadGeography,
  bulkUploadDisasterTypes,
  bulkUploadLossMetrics,
  getLossMetrics,
  addLossMetric,
  updateLossMetric,
  deleteLossMetric,
} = require("../controllers/master.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");
const { ROLES } = require("../constants/roles");

// =============================
// PUBLIC ROUTES
// =============================

router.get("/disaster-types", getDisasterTypes);
router.get("/document-types/:disasterTypeId", getDocumentTypes);
router.get("/districts", getDistricts);
router.get("/blocks/:districtId", getBlocks);
router.get("/panchayats/:blockId", getPanchayats);
router.get("/tehsils/:districtId", getTehsils);
router.get("/villages/:panchayatId", getVillages);
router.get("/vidhansabhas/:districtId", getVidhansabhas);
router.get("/loss-metrics", getLossMetrics);

// =============================
// ADMIN-ONLY ROUTES
// =============================

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.post("/bulk-geography", bulkUploadGeography);
router.post("/bulk-disaster-types", bulkUploadDisasterTypes);
router.post("/bulk-loss-metrics", bulkUploadLossMetrics);
router.post("/loss-metrics", addLossMetric);
router.put("/loss-metrics/:id", updateLossMetric);
router.delete("/loss-metrics/:id", deleteLossMetric);

router.post("/disaster-types", addDisasterType);
router.put("/disaster-types/:id", updateDisasterType);
router.delete("/disaster-types/:id", deleteDisasterType);

router.post("/document-types", addDocumentType);
router.put("/document-types/:id", updateDocumentType);
router.delete("/document-types/:id", deleteDocumentType);

router.post("/districts", addDistrict);
router.put("/districts/:id", updateDistrict);
router.delete("/districts/:id", deleteDistrict);

router.post("/blocks", addBlock);
router.put("/blocks/:id", updateBlock);
router.delete("/blocks/:id", deleteBlock);

router.post("/panchayats", addPanchayat);
router.put("/panchayats/:id", updatePanchayat);
router.delete("/panchayats/:id", deletePanchayat);

router.post("/tehsils", addTehsil);
router.put("/tehsils/:id", updateTehsil);
router.delete("/tehsils/:id", deleteTehsil);

router.post("/villages", addVillage);
router.put("/villages/:id", updateVillage);
router.delete("/villages/:id", deleteVillage);

router.post("/vidhansabhas", addVidhansabha);
router.put("/vidhansabhas/:id", updateVidhansabha);
router.delete("/vidhansabhas/:id", deleteVidhansabha);

module.exports = router;
