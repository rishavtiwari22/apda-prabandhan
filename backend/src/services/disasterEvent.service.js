const mongoose = require("mongoose");
const DisasterEvent = require("../models/disasterEvent.model");
// Application is lazily loaded to avoid circular dependencies

/**
 * Service to manage high-level Disaster Incident aggregation
 */
class DisasterEventService {
  /**
   * Recalculate statistics for a specific disaster event
   * @param {string} eventId 
   */
  async updateEventStats(eventId) {
    if (!eventId) return;

    try {
      const Application = mongoose.model("Application");
      const stats = await Application.aggregate([
        { $match: { disasterEventId: new mongoose.Types.ObjectId(eventId) } },
        {
          $group: {
            _id: null,
            totalCases: { $sum: 1 },
            totalResolved: {
              $sum: {
                $cond: [{ $in: ["$status", ["resolved", "approved_pending_payment"]] }, 1, 0]
              }
            },
            totalCompensationAmount: {
              $sum: {
                $cond: [{ $in: ["$status", ["resolved", "approved_pending_payment"]] }, "$resolutionDetails.paymentAmount", 0]
              }
            }
          }
        }
      ]);

      if (stats.length > 0) {
        await DisasterEvent.findByIdAndUpdate(eventId, {
          totalCases: stats[0].totalCases,
          totalResolved: stats[0].totalResolved,
          totalCompensationAmount: stats[0].totalCompensationAmount || 0
        });
      }
    } catch (error) {
      console.error(`Failed to update stats for event ${eventId}:`, error);
    }
  }

  /**
   * Auto-match applications to existing incidents
   * Logic: Same Block, Same Type, +/- 3 days
   */
  async findPotentialMatches(data) {
    const incidentDate = new Date(data.incidentDate);
    const startDate = new Date(incidentDate);
    startDate.setDate(startDate.getDate() - 1); // Reduced window for strictness
    const endDate = new Date(incidentDate);
    endDate.setDate(endDate.getDate() + 1);

    const query = {
      disasterType: data.disasterType,
      "location.district": data.location.district,
      "location.tehsil": data.location.tehsil,
      "location.block": data.location.block,
      incidentHalfDay: data.incidentHalfDay || "FIRST_HALF",
      status: "ACTIVE",
      incidentDate: { $gte: startDate, $lte: endDate }
    };

    if (data.location.panchayat) {
      query["location.panchayat"] = data.location.panchayat;
    }
    if (data.location.village) {
      query["location.village"] = data.location.village;
    }

    return await DisasterEvent.find(query).populate("disasterType", "name nameHindi");
  }

  /**
   * Get specific disaster event with populated fields
   */
  async getEventById(id) {
    return await DisasterEvent.findById(id)
      .populate("disasterType")
      .populate("location.district", "name")
      .populate("location.tehsil", "name")
      .populate("location.block", "name")
      .populate("location.panchayat", "name")
      .populate("location.village", "name")
      .populate("auditLogs.performedBy", "name role designation");
  }

  /**
   * Get all disaster events with optional filter
   */
  async getEvents(filters = {}) {
    return await DisasterEvent.find(filters)
      .populate("disasterType")
      .populate("location.block", "name")
      .sort("-createdAt");
  }

  /**
   * Perform a batch action on all linked applications
   * @param {string} eventId
   * @param {string} action - 'FORWARD_ALL' or 'RESOLVE_ALL'
   * @param {object} actor - user object
   * @param {object} payload - remarks, forwardToId (for forward), or payment info (for resolve)
   */
  async performBatchAction(eventId, action, actor, payload) {
    const event = await DisasterEvent.findById(eventId);
    if (!event) throw new Error("Incident not found");

    const Application = mongoose.model("Application");
    const applications = await Application.find({ disasterEventId: eventId });
    const applicationService = require("./application.service");

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const app of applications) {
      try {
        if (action === "FORWARD_ALL") {
          // Batch Forward: Only forward those currently at a status where forwarding is allowed
          // We wrap this to avoid breaking the entire batch if one fails (e.g. already resolved)
          if (app.status !== 'resolved' && app.status !== 'rejected') {
            await applicationService.forwardApplication(app._id, payload.forwardToId, actor, payload.remarks || "Batch Forwarding from Incident Cluster");
            results.success++;
          } else {
            results.failed++;
          }
        } 
        
        else if (action === "RESOLVE_ALL") {
          if (app.status !== 'resolved' && app.status !== 'rejected') {
            await applicationService.resolveApplication(app._id, actor, {
              resolutionNote: payload.resolutionNote || "Batch Resolution from Incident Cluster",
              paymentAmount: Number(payload.paymentAmount),
              paymentDate: payload.paymentDate || new Date()
            });
            results.success++;
          } else {
            results.failed++;
          }
        }
      } catch (err) {
        results.failed++;
        results.errors.push({ id: app._id, msg: err.message });
      }
    }

    // Log the systemic action on the incident history
    event.auditLogs.push({
      action: action,
      performedBy: actor._id,
      remarks: `Batch action performed on ${results.success} cases. (${results.failed} skipped/failed). ${payload.remarks || ""}`
    });

    if (action === "RESOLVE_ALL" && results.success > 0) {
      event.status = "RESOLVED";
    }

    await event.save();
    await this.updateEventStats(eventId);

    return results;
  }
}

module.exports = new DisasterEventService();
