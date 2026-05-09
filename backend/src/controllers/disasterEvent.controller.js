const DisasterEvent = require("../models/disasterEvent.model");
const Application = require("../models/application.model");
const disasterEventService = require("../services/disasterEvent.service");

/**
 * Generate a unique event number (INCIDENT-YYYYMMDD-XXXX)
 */
const generateEventNumber = async () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `INC-${dateStr}-`;
  
  const count = await DisasterEvent.countDocuments({
    eventNumber: { $regex: new RegExp(`^${prefix}`) }
  });
  
  const serial = (count + 1).toString().padStart(4, "0");
  return `${prefix}${serial}`;
};

/**
 * GET /disaster-events
 * Search for active events by location
 */
exports.getDisasterEvents = async (req, res) => {
  try {
    const { district, block, panchayat, village, status, incidentDate, incidentHalfDay } = req.query;
    const filters = {};

    if (district) filters["location.district"] = district;
    if (block) filters["location.block"] = block;
    if (panchayat) filters["location.panchayat"] = panchayat;
    if (village) filters["location.village"] = { $regex: new RegExp(`^${village}$`, "i") }; // Strict village matching
    if (status) filters.status = status;
    if (incidentHalfDay) filters.incidentHalfDay = incidentHalfDay;
    
    if (incidentDate) {
      const date = new Date(incidentDate);
      const start = new Date(date);
      start.setDate(start.getDate() - 1); // Stricter window (+/- 1 day)
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      filters.incidentDate = {
        $gte: start.setHours(0,0,0,0),
        $lte: end.setHours(23,59,59,999)
      };
    }

    const events = await DisasterEvent.find(filters)
      .populate("disasterType", "name nameHindi")
      .populate("location.district", "name")
      .populate("location.block", "name")
      .populate("location.panchayat", "name")
      .sort("-incidentDate");

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /disaster-events
 * Create a new disaster event
 */
exports.createDisasterEvent = async (req, res) => {
  try {
    const { disasterType, incidentDate, incidentHalfDay, location, description } = req.body;
    
    const eventNumber = await generateEventNumber();
    
    const event = await DisasterEvent.create({
      eventNumber,
      disasterType,
      incidentDate,
      incidentHalfDay: incidentHalfDay || "FIRST_HALF",
      location,
      description,
      createdBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: "Disaster incident registered successfully",
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /admin/disaster-events/:id
 */
exports.getDisasterEventDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await disasterEventService.getEventById(id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    const query = { disasterEventId: id };
    
    // 2. Role-based scoping for cluster view
    const isAdmin = req.user.role === "admin";
    const isSubAdmin = req.user.role === "sub-admin";
    const isPublic = req.user.role === "public";

    if (isSubAdmin) {
      // Sub-Admins see everything in their territory (Block > District) 
      const belongsToTerritory = 
        (!req.user.assignedBlock || event.location?.block?.toString() === req.user.assignedBlock.toString()) &&
        (!req.user.assignedDistrict || event.location?.district?.toString() === req.user.assignedDistrict.toString());
      
      if (!belongsToTerritory && !isAdmin) {
        return res.status(403).json({ success: false, message: "This incident is outside your assigned territory." });
      }
    }

    // 3. Application Fetch with Field-Level Security
    const applications = await Application.find(query)
      .select(isPublic ? "applicationNumber applicantInfo.name status createdAt" : "") // Public users only see name/status
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      data: {
        ...event._doc,
        applications
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /admin/disaster-events/:id/batch-action
 */
exports.performBatchAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, payload } = req.body;
    
    const results = await disasterEventService.performBatchAction(id, action, req.user, payload);
    
    res.status(200).json({
      success: true,
      message: `Batch ${action} completed: ${results.success} succeeded, ${results.failed} failed.`,
      data: results
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PATCH /disaster-events/:id/status
 */
exports.updateEventStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      const event = await DisasterEvent.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );
  
      if (!event) {
        return res.status(404).json({ success: false, message: "Incident not found" });
      }
  
      res.status(200).json({
        success: true,
        message: `Incident status updated to ${status}`,
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
