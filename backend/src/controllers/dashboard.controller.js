const dashboardService = require("../services/dashboard.service");
const { ROLES } = require("../constants/roles");

/**
 * GET /dashboard/admin
 * Returns system-wide statistics for Administrators/Collectors
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    // Role check: Only ADMIN (Collector) should see full system stats
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    const stats = await dashboardService.getAdminDashboard(req.query);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /dashboard/department
 * Returns user-specific statistics for Departmental staff
 */
exports.getDepartmentDashboard = async (req, res) => {
  try {
    const stats = await dashboardService.getDepartmentDashboard(req.user._id, req.query);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
