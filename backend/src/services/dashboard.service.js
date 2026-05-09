const Application = require("../models/application.model");
const mongoose = require("mongoose");
const { APPLICATION_STATUS } = require("../constants/applicationStatus");

class DashboardService {
  /**
   * Helper to build match filter from query params
   */
  _buildFilters(filters) {
    const match = {};

    if (filters.fromDate || filters.toDate) {
      match.createdAt = {};
      if (filters.fromDate) match.createdAt.$gte = new Date(filters.fromDate);
      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999);
        match.createdAt.$lte = toDate;
      }
    }

    if (filters.disasterType && mongoose.Types.ObjectId.isValid(filters.disasterType)) {
      match.disasterType = new mongoose.Types.ObjectId(filters.disasterType);
    }

    if (filters.status) {
      match.status = filters.status;
    }

    if (filters.block && mongoose.Types.ObjectId.isValid(filters.block)) {
      match["location.block"] = new mongoose.Types.ObjectId(filters.block);
    }

    return match;
  }

  /**
   * Get Admin Dashboard Stats
   */
  async getAdminDashboard(filters) {
    const match = this._buildFilters(filters);

    // 1. Status overview aggregation
    const statusCounts = await Application.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalApplications: 0,
      pendingApplications: 0,
      resolvedApplications: 0,
      forwardedApplications: 0,
      documentPendingApplications: 0
    };

    statusCounts.forEach(item => {
      stats.totalApplications += item.count;
      if (item._id === APPLICATION_STATUS.RESOLVED) stats.resolvedApplications = item.count;
      else if (item._id === APPLICATION_STATUS.FORWARDED) stats.forwardedApplications = item.count;
      else if (item._id === APPLICATION_STATUS.DOCUMENTS_PENDING) stats.documentPendingApplications = item.count;
      else stats.pendingApplications += item.count; // SUBMITTED, UNDER_VERIFICATION etc are pending
    });

    // 2. Build per-status counts map for Reports page
    const statusCountsMap = {};
    statusCounts.forEach(item => {
      statusCountsMap[item._id] = item.count;
    });

    // 3. Disaster type distribution (for Reports page)
    const disasterStats = await Application.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "disastertypes",
          localField: "disasterType",
          foreignField: "_id",
          as: "disasterInfo"
        }
      },
      { $unwind: { path: "$disasterInfo", preserveNullAndEmpty: true } },
      {
        $group: {
          _id: "$disasterInfo.name",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 4. Department Stats
    // We group by the department of the currentHandler
    const deptStats = await Application.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "currentHandler",
          foreignField: "_id",
          as: "handler"
        }
      },
      { $unwind: "$handler" },
      {
        $group: {
          _id: "$handler.departmentType",
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", APPLICATION_STATUS.RESOLVED] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $ne: ["$status", APPLICATION_STATUS.RESOLVED] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          departmentId: "$_id",
          departmentName: "$_id", // Using the enum value as name for now
          total: 1,
          resolved: 1,
          pending: 1,
          _id: 0
        }
      }
    ]);

    return {
      ...stats,
      statusCounts: statusCountsMap,
      departmentStats: deptStats,
      disasterStats: disasterStats.map(d => ({
        label: d._id || "Unknown",
        count: d.count
      }))
    };
  }

  /**
   * Get Department/User Dashboard Stats
   */
  async getDepartmentDashboard(userId, filters) {
    const match = this._buildFilters(filters);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const stats = await Application.aggregate([
      { 
        $match: { 
          ...match,
          currentHandler: userObjectId 
        } 
      },
      {
        $group: {
          _id: null,
          myCases: { $sum: 1 },
          forwardedToMe: {
            $sum: { $cond: [{ $eq: ["$status", APPLICATION_STATUS.FORWARDED] }, 1, 0] }
          },
          pendingDocuments: {
            $sum: { $cond: [{ $eq: ["$status", APPLICATION_STATUS.DOCUMENTS_PENDING] }, 1, 0] }
          },
          resolvedCases: {
            $sum: { $cond: [{ $eq: ["$status", APPLICATION_STATUS.RESOLVED] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      myCases: 0,
      forwardedToMe: 0,
      pendingDocuments: 0,
      resolvedCases: 0
    };
    
    delete result._id;
    return result;
  }
}

module.exports = new DashboardService();
