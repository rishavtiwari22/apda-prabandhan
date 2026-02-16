const DisasterType = require("../models/disasterType.model");
const District = require("../models/district.model");
const Block = require("../models/block.model");
const Panchayat = require("../models/panchayat.model");

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
    const disaster = await DisasterType.create(req.body);
    res.status(201).json({
      success: true,
      message: "Disaster type added successfully",
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
    const disasters = await DisasterType.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: disasters,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------
// GEOGRAPHY (CASCADING)
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

module.exports = {
  addDisasterType,
  getDisasterTypes,
  addDistrict,
  getDistricts,
  addBlock,
  getBlocks,
  addPanchayat,
  getPanchayats,
};
