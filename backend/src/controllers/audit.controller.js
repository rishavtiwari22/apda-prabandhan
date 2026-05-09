const auditService = require("../services/audit.service");

/**
 * GET /applications/:id/timeline
 */
exports.getTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const timeline = await auditService.getTimeline(id);
    
    res.status(200).json({
      success: true,
      data: timeline
    });
  } catch (error) {
    const status = error.message.includes("found") ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};
