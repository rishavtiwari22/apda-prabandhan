const DisasterType = require("../models/disasterType.model");
const DocumentType = require("../models/documentType.model");
const District = require("../models/district.model");
const Block = require("../models/block.model");
const Panchayat = require("../models/panchayat.model");
const Vidhansabha = require("../models/vidhansabha.model");
const Tehsil = require("../models/tehsil.model");
const Village = require("../models/village.model");
const LossMetric = require("../models/lossMetric.model");

// ---------------------
// DISASTER TYPES
// ---------------------

/**
 * @desc    Add a new disaster type
 * @route   POST /api/master/disaster-types
 * @access  Private (Admin)
 */
const addDisasterType = async (req, res, next) => {
  try {
    const { name, nameHindi, description, compensationCategory, requiredDocuments, slaHours } = req.body;
    
    // Create the disaster type
    const disaster = await DisasterType.create({ name, nameHindi, description, compensationCategory, slaHours });

    // If documents are provided, create them linked to this disaster
    if (requiredDocuments && Array.isArray(requiredDocuments) && requiredDocuments.length > 0) {
      const docs = requiredDocuments.map(doc => ({
        ...doc,
        disasterType: disaster._id
      }));
      await DocumentType.insertMany(docs);
    }

    res.status(201).json({
      success: true,
      message: "Disaster type and documents added successfully",
      data: disaster,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active disaster types
 * @route   GET /api/master/disaster-types
 * @access  Public
 */
const getDisasterTypes = async (req, res, next) => {
  try {
    const disasters = await DisasterType.find({ isActive: true })
      .populate("allowedLossMetrics")
      .sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: disasters,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update disaster type
 * @route   PUT /api/master/disaster-types/:id
 * @access  Private (Admin)
 */
const updateDisasterType = async (req, res, next) => {
  try {
    const disaster = await DisasterType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!disaster) {
      return res.status(404).json({ success: false, message: "Disaster type not found" });
    }
    res.status(200).json({
      success: true,
      message: "Disaster type updated successfully",
      data: disaster,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete/Deactivate disaster type
 * @route   DELETE /api/master/disaster-types/:id
 * @access  Private (Admin)
 */
const deleteDisasterType = async (req, res, next) => {
  try {
    const disaster = await DisasterType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!disaster) {
      return res.status(404).json({ success: false, message: "Disaster type not found" });
    }
    res.status(200).json({
      success: true,
      message: "Disaster type deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------
// DOCUMENT TYPES
// ---------------------

/**
 * @desc    Add a new document type
 * @route   POST /api/master/document-types
 * @access  Private (Admin)
 */
const addDocumentType = async (req, res, next) => {
  try {
    const document = await DocumentType.create(req.body);
    res.status(201).json({
      success: true,
      message: "Document type added successfully",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get documents for a specific disaster type
 * @route   GET /api/master/document-types/:disasterTypeId
 * @access  Public
 */
const getDocumentTypes = async (req, res, next) => {
  try {
    const documents = await DocumentType.find({
      disasterType: req.params.disasterTypeId,
      isActive: true,
    }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update document type
 * @route   PUT /api/master/document-types/:id
 * @access  Private (Admin)
 */
const updateDocumentType = async (req, res, next) => {
  try {
    const document = await DocumentType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return res.status(404).json({ success: false, message: "Document type not found" });
    }
    res.status(200).json({
      success: true,
      message: "Document type updated successfully",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete/Deactivate document type
 * @route   DELETE /api/master/document-types/:id
 * @access  Private (Admin)
 */
const deleteDocumentType = async (req, res, next) => {
  try {
    const document = await DocumentType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!document) {
      return res.status(404).json({ success: false, message: "Document type not found" });
    }
    res.status(200).json({
      success: true,
      message: "Document type deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------
// GEOGRAPHY
// ---------------------

/**
 * @desc    Add a new district
 * @route   POST /api/master/districts
 * @access  Private (Admin)
 */
const addDistrict = async (req, res, next) => {
  try {
    const district = await District.create(req.body);
    res.status(201).json({
      success: true,
      data: district,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all districts
 * @route   GET /api/master/districts
 * @access  Public
 */
const getDistricts = async (req, res, next) => {
  try {
    const districts = await District.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: districts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update district
 * @route   PUT /api/master/districts/:id
 * @access  Private (Admin)
 */
const updateDistrict = async (req, res, next) => {
  try {
    const district = await District.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: district });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete district
 * @route   DELETE /api/master/districts/:id
 * @access  Private (Admin)
 */
const deleteDistrict = async (req, res, next) => {
  try {
    await District.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "District deactivated" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new block to a district
 * @route   POST /api/master/blocks
 * @access  Private (Admin)
 */
const addBlock = async (req, res, next) => {
  try {
    const block = await Block.create(req.body);
    res.status(201).json({
      success: true,
      data: block,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get blocks for a specific district
 * @route   GET /api/master/blocks/:districtId
 * @access  Public
 */
const getBlocks = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    const blocks = await Block.find({ district: districtId, isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: blocks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update block
 * @route   PUT /api/master/blocks/:id
 * @access  Private (Admin)
 */
const updateBlock = async (req, res, next) => {
  try {
    const block = await Block.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: block });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete block
 * @route   DELETE /api/master/blocks/:id
 * @access  Private (Admin)
 */
const deleteBlock = async (req, res, next) => {
  try {
    await Block.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "Block deactivated" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new panchayat to a block
 * @route   POST /api/master/panchayats
 * @access  Private (Admin)
 */
const addPanchayat = async (req, res, next) => {
  try {
    const panchayat = await Panchayat.create(req.body);
    res.status(201).json({
      success: true,
      data: panchayat,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get panchayats for a specific block
 * @route   GET /api/master/panchayats/:blockId
 * @access  Public
 */
const getPanchayats = async (req, res, next) => {
  try {
    const { blockId } = req.params;
    const panchayats = await Panchayat.find({ block: blockId, isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: panchayats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update panchayat
 * @route   PUT /api/master/panchayats/:id
 * @access  Private (Admin)
 */
const updatePanchayat = async (req, res, next) => {
  try {
    const panchayat = await Panchayat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: panchayat });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete panchayat
 * @route   DELETE /api/master/panchayats/:id
 * @access  Private (Admin)
 */
const deletePanchayat = async (req, res, next) => {
  try {
    await Panchayat.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "Panchayat deactivated" });
  } catch (error) {
    next(error);
  }
};

// ---------------------
// VIDHANSABHA
// ---------------------

/**
 * @desc    Add a new vidhansabha to a district
 * @route   POST /api/master/vidhansabhas
 * @access  Private (Admin)
 */
const addVidhansabha = async (req, res, next) => {
  try {
    const vidhansabha = await Vidhansabha.create(req.body);
    res.status(201).json({
      success: true,
      data: vidhansabha,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get vidhansabhas for a specific district
 * @route   GET /api/master/vidhansabhas/:districtId
 * @access  Public
 */
const getVidhansabhas = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    const vidhansabhas = await Vidhansabha.find({ district: districtId, isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: vidhansabhas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vidhansabha
 * @route   PUT /api/master/vidhansabhas/:id
 * @access  Private (Admin)
 */
const updateVidhansabha = async (req, res, next) => {
  try {
    const vidhansabha = await Vidhansabha.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: vidhansabha });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete vidhansabha
 * @route   DELETE /api/master/vidhansabhas/:id
 * @access  Private (Admin)
 */
const deleteVidhansabha = async (req, res, next) => {
  try {
    await Vidhansabha.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "Vidhansabha deactivated" });
  } catch (error) {
    next(error);
  }
};

// ---------------------
// TEHSIL
// ---------------------

const addTehsil = async (req, res, next) => {
  try {
    const tehsil = await Tehsil.create(req.body);
    res.status(201).json({ success: true, data: tehsil });
  } catch (error) {
    next(error);
  }
};

const getTehsils = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    const tehsils = await Tehsil.find({ district: districtId, isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: tehsils });
  } catch (error) {
    next(error);
  }
};

const updateTehsil = async (req, res, next) => {
  try {
    const tehsil = await Tehsil.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: tehsil });
  } catch (error) {
    next(error);
  }
};

const deleteTehsil = async (req, res, next) => {
  try {
    await Tehsil.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "Tehsil deactivated" });
  } catch (error) {
    next(error);
  }
};

// ---------------------
// VILLAGE
// ---------------------

const addVillage = async (req, res, next) => {
  try {
    const village = await Village.create(req.body);
    res.status(201).json({ success: true, data: village });
  } catch (error) {
    next(error);
  }
};

const getVillages = async (req, res, next) => {
  try {
    const { panchayatId } = req.params;
    const villages = await Village.find({ panchayat: panchayatId, isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: villages });
  } catch (error) {
    next(error);
  }
};

const updateVillage = async (req, res, next) => {
  try {
    const village = await Village.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: village });
  } catch (error) {
    next(error);
  }
};

const deleteVillage = async (req, res, next) => {
  try {
    await Village.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "Village deactivated" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk upload geography data
 * @route   POST /api/master/bulk-geography
 * @access  Private (Admin)
 */
/**
 * @desc    Bulk upload geography data (Supports Nested Object or Flat Array)
 * @route   POST /api/master/bulk-geography
 * @access  Private (Admin)
 */
const bulkUploadGeography = async (req, res) => {
  try {
    let { data } = req.body;
    const results = { districts: 0, tehsils: 0, blocks: 0, panchayats: 0, villages: 0, errors: [] };

    // Conversion: If it's the nested object format, flatten it for the processing loop
    let flatData = [];
    if (!Array.isArray(data) && data.district && data.blocks) {
      const districtName = data.district.trim();
      data.blocks.forEach(b => {
        const blockName = b.blockName.trim();
        const tehsilName = (b.tehsil || b.blockName).trim();
        if (b.gramPanchayats) {
          b.gramPanchayats.forEach(gp => {
            const gpName = gp.gpName.trim();
            if (gp.villages && Array.isArray(gp.villages)) {
              gp.villages.forEach(v => {
                const vName = typeof v === "string" ? v.trim() : v.villageName?.trim();
                if (vName) {
                  flatData.push({
                    district: districtName,
                    block: blockName,
                    tehsil: tehsilName,
                    panchayat: gpName,
                    village: vName
                  });
                }
              });
            } else {
              flatData.push({ district: districtName, block: blockName, tehsil: tehsilName, panchayat: gpName });
            }
          });
        } else {
          flatData.push({ district: districtName, block: blockName, tehsil: tehsilName });
        }
      });
    } else if (Array.isArray(data)) {
      flatData = data.map(item => ({
        district: item.district?.trim(),
        tehsil: (item.tehsil || item.block)?.trim(),
        block: item.block?.trim(),
        panchayat: item.panchayat?.trim(),
        village: item.village?.trim()
      }));
    } else {
      return res.status(400).json({ success: false, message: "Invalid data format. Expected an array or a nested district object." });
    }

    const cache = { districts: {}, tehsils: {}, blocks: {}, panchayats: {} };
    console.log(`Starting bulk processing for ${flatData.length} items...`);

    for (const [index, item] of flatData.entries()) {
      try {
        const { district, tehsil, block, panchayat, village } = item;
        if (!district) throw new Error("District name is required");

        // 1. District
        let districtId = cache.districts[district];
        if (!districtId) {
          let distDoc = await District.findOne({ name: new RegExp(`^${district}$`, "i") });
          if (!distDoc) { 
            console.log(`Creating District: ${district}`);
            distDoc = await District.create({ name: district }); 
            results.districts++; 
          } else if (!distDoc.isActive) {
            console.log(`Re-activating District: ${district}`);
            distDoc.isActive = true;
            await distDoc.save();
            results.districts++;
          }
          districtId = distDoc._id;
          cache.districts[district] = districtId;
        }

        // 2. Tehsil
        if (tehsil) {
          const tKey = `${districtId}:${tehsil}`;
          let tehsilId = cache.tehsils[tKey];
          if (!tehsilId) {
            let tehsilDoc = await Tehsil.findOne({ district: districtId, name: new RegExp(`^${tehsil}$`, "i") });
            if (!tehsilDoc) { 
              console.log(`Creating Tehsil: ${tehsil}`);
              tehsilDoc = await Tehsil.create({ name: tehsil, district: districtId }); 
              results.tehsils++; 
            } else if (!tehsilDoc.isActive) {
              tehsilDoc.isActive = true;
              await tehsilDoc.save();
              results.tehsils++;
            }
            tehsilId = tehsilDoc._id;
            cache.tehsils[tKey] = tehsilId;
          }
        }

        // 3. Block
        let blockId;
        if (block) {
          const bKey = `${districtId}:${block}`;
          blockId = cache.blocks[bKey];
          if (!blockId) {
            let blockDoc = await Block.findOne({ district: districtId, name: new RegExp(`^${block}$`, "i") });
            if (!blockDoc) { 
              console.log(`Creating Block: ${block}`);
              blockDoc = await Block.create({ name: block, district: districtId }); 
              results.blocks++; 
            } else if (!blockDoc.isActive) {
              blockDoc.isActive = true;
              await blockDoc.save();
              results.blocks++;
            }
            blockId = blockDoc._id;
            cache.blocks[bKey] = blockId;
          }
        }

        // 4. Panchayat
        let panchayatId;
        if (blockId && panchayat) {
          const pKey = `${blockId}:${panchayat}`;
          panchayatId = cache.panchayats[pKey];
          if (!panchayatId) {
            let panchayatDoc = await Panchayat.findOne({ block: blockId, name: new RegExp(`^${panchayat}$`, "i") });
            if (!panchayatDoc) { 
              console.log(`Creating Panchayat: ${panchayat}`);
              panchayatDoc = await Panchayat.create({ name: panchayat, block: blockId }); 
              results.panchayats++; 
            } else if (!panchayatDoc.isActive) {
              panchayatDoc.isActive = true;
              await panchayatDoc.save();
              results.panchayats++;
            }
            panchayatId = panchayatDoc._id;
            cache.panchayats[pKey] = panchayatId;
          }
        }

        // 5. Village
        if (panchayatId && village) {
          let villageDoc = await Village.findOne({ panchayat: panchayatId, name: new RegExp(`^${village}$`, "i") });
          if (!villageDoc) { 
            console.log(`Creating Village: ${village}`);
            await Village.create({ name: village, panchayat: panchayatId }); 
            results.villages++; 
          } else if (!villageDoc.isActive) {
            villageDoc.isActive = true;
            await villageDoc.save();
            results.villages++;
          }
        }
      } catch (err) {
        console.error(`Error at index ${index}: ${err.message}`);
        results.errors.push({ index, message: err.message, item });
      }
    }

    console.log("Bulk upload finished. Results:", results);
    
    const dbCounts = {
      districts: await District.countDocuments({ isActive: true }),
      tehsils: await Tehsil.countDocuments({ isActive: true }),
      blocks: await Block.countDocuments({ isActive: true }),
      panchayats: await Panchayat.countDocuments({ isActive: true }),
      villages: await Village.countDocuments({ isActive: true })
    };

    res.status(200).json({ 
      success: true, 
      message: "Bulk upload processed", 
      results,
      dbCounts,
      processedCount: flatData.length 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Bulk upload Disaster Types and their Required Documents + Loss Metrics
 * @route   POST /api/master/bulk-disaster-types
 * @access  Private (Admin)
 */
const bulkUploadDisasterTypes = async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ success: false, message: "Input must be a JSON array" });
    }

    const results = { created: 0, updated: 0, documents: 0, metricsLinked: 0, errors: [] };

    for (const [index, item] of data.entries()) {
      try {
        let { name, nameHindi, compensationCategory, slaHours, documents, allowedLossMetrics } = item;
        if (!name || !nameHindi || !compensationCategory) {
          throw new Error("name, nameHindi, and compensationCategory are required");
        }

        // Normalize Category Alises
        const categoryMap = {
          "HOUSING_DAMAGE": "HOUSING",
          "AGRICULTURAL_LOSS": "AGRICULTURAL",
          "NATURAL_DISASTER": "OTHER",
          "PROPERTY_DAMAGE": "OTHER",
          "CROP_DAMAGE": "AGRICULTURAL",
          "HUMAN_LOSS": "EX_GRATIA"
        };
        
        if (categoryMap[compensationCategory]) {
          compensationCategory = categoryMap[compensationCategory];
        }

        // Handle Loss Metrics Mapping (by Key)
        let metricIds = [];
        if (allowedLossMetrics && Array.isArray(allowedLossMetrics)) {
          const metrics = await LossMetric.find({ key: { $in: allowedLossMetrics } });
          metricIds = metrics.map(m => m._id);
        }

        // 1. Disaster Type
        let disasterDoc = await DisasterType.findOne({ name: new RegExp(`^${name.trim()}$`, "i") });
        if (!disasterDoc) {
          disasterDoc = await DisasterType.create({
            name: name.trim(),
            nameHindi: nameHindi.trim(),
            compensationCategory,
            slaHours: slaHours || 24,
            allowedLossMetrics: metricIds,
            isActive: true
          });
          results.created++;
        } else {
          // Update existing
          disasterDoc.nameHindi = nameHindi.trim();
          disasterDoc.compensationCategory = compensationCategory;
          disasterDoc.isActive = true;
          disasterDoc.allowedLossMetrics = metricIds;
          if (slaHours) disasterDoc.slaHours = slaHours;
          await disasterDoc.save();
          results.updated++;
        }

        const disasterId = disasterDoc._id;
        if (metricIds.length > 0) results.metricsLinked += metricIds.length;

        // 2. Documents
        if (documents && Array.isArray(documents)) {
          for (const doc of documents) {
            const docName = doc.name.trim();
            const docNameHindi = (doc.nameHindi || doc.name).trim();

            let docType = await DocumentType.findOne({ 
              disasterType: disasterId, 
              name: new RegExp(`^${docName}$`, "i") 
            });

            if (!docType) {
              await DocumentType.create({
                name: docName,
                nameHindi: docNameHindi,
                disasterType: disasterId,
                isUserMandatory: !!doc.isUserMandatory,
                isDeptMandatory: doc.isDeptMandatory !== undefined ? !!doc.isDeptMandatory : true,
                allowUserOptional: doc.allowUserOptional !== undefined ? !!doc.allowUserOptional : true,
                isActive: true
              });
              results.documents++;
            } else {
              // Update existing doc type
              docType.nameHindi = docNameHindi;
              docType.isUserMandatory = !!doc.isUserMandatory;
              docType.isActive = true;
              await docType.save();
              results.documents++;
            }
          }
        }
      } catch (err) {
        results.errors.push({ index, message: err.message, item });
      }
    }

    res.status(200).json({ success: true, message: "Disaster types processed", results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all active loss metrics
 * @route   GET /api/master/loss-metrics
 * @access  Public
 */
const getLossMetrics = async (req, res, next) => {
  try {
    const metrics = await LossMetric.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk upload Loss Metrics Configuration
 * @route   POST /api/master/bulk-loss-metrics
 * @access  Private (Admin)
 */
const bulkUploadLossMetrics = async (req, res) => {
  try {
    let { data } = req.body;
    
    // If user provided a single object, wrap it in an array
    if (data && !Array.isArray(data)) {
      data = [data];
    }

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ 
        success: false, 
        message: "Input must be a JSON object or array" 
      });
    }

    const results = { created: 0, updated: 0, linked: 0, errors: [] };

    for (const [index, item] of data.entries()) {
      try {
        const { key, name, nameHindi, fields, disasterTypeNames } = item;
        
        if (!key || !name || !nameHindi) {
          throw new Error("key, name, and nameHindi are required for each metric");
        }

        // 1. Create or Update Metric
        let metric = await LossMetric.findOne({ key: key.toUpperCase().trim() });
        
        if (!metric) {
          metric = await LossMetric.create({
            key: key.toUpperCase().trim(),
            name: name.trim(),
            nameHindi: nameHindi.trim(),
            fields: fields || [],
            isActive: true
          });
          results.created++;
        } else {
          metric.name = name.trim();
          metric.nameHindi = nameHindi.trim();
          metric.fields = fields || [];
          metric.isActive = true;
          await metric.save();
          results.updated++;
        }

        // 2. Link to Disaster Types if specified
        if (disasterTypeNames && Array.isArray(disasterTypeNames)) {
          for (const dName of disasterTypeNames) {
            // Find disaster type by English or Hindi name
            const disaster = await DisasterType.findOne({
              $or: [
                { name: new RegExp(`^${dName.trim()}$`, "i") },
                { nameHindi: dName.trim() }
              ]
            });

            if (disaster) {
              const metricIdStr = metric._id.toString();
              const existingIds = (disaster.allowedLossMetrics || []).map(id => id.toString());
              
              if (!existingIds.includes(metricIdStr)) {
                disaster.allowedLossMetrics.push(metric._id);
                await disaster.save();
                results.linked++;
              }
            }
          }
        }
      } catch (err) {
        results.errors.push({ 
          index, 
          message: err.message, 
          itemSummary: item.name || item.key || "Unknown" 
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      message: "Loss metrics processed successfully", 
      results 
    });
  } catch (error) {
    console.error("Bulk Loss Metrics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add single loss metric
 */
const addLossMetric = async (req, res) => {
  try {
    const { key, name, nameHindi, fields } = req.body;
    const existing = await LossMetric.findOne({ key: key.toUpperCase() });
    if (existing) return res.status(400).json({ success: false, message: "Metric key already exists" });

    const metric = await LossMetric.create({
      key: key.toUpperCase(),
      name,
      nameHindi,
      fields,
      isActive: true
    });

    res.status(201).json({ success: true, data: metric });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update single loss metric
 */
const updateLossMetric = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await LossMetric.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete loss metric
 */
const deleteLossMetric = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if metric exists
    const metric = await LossMetric.findById(id);
    if (!metric) {
      return res.status(404).json({ success: false, message: "Metric not found" });
    }

    // Deactivate the metric
    metric.isActive = false;
    await metric.save();

    // Remove this metric from all DisasterTypes that reference it
    await DisasterType.updateMany(
      { allowedLossMetrics: id },
      { $pull: { allowedLossMetrics: id } }
    );

    res.status(200).json({ 
      success: true, 
      message: "Metric deactivated and unlinked from disaster types successfully" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
