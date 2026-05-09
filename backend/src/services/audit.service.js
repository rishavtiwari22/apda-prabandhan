const Application = require("../models/application.model");

class AuditService {
  /**
   * Log a workflow action to an application's audit trail
   */
  async logAction(applicationId, { action, fromStatus, toStatus, performedBy, performedByRole, remarks, details }) {
    return await Application.findByIdAndUpdate(
      applicationId,
      {
        $push: {
          auditLogs: {
            action,
            fromStatus,
            toStatus,
            performedBy,
            performedByRole,
            remarks,
            timestamp: new Date(),
            details
          }
        }
      },
      { new: true }
    );
  }

  /**
   * Fetch a formatted timeline for an application
   */
  async getTimeline(applicationId) {
    const application = await Application.findById(applicationId)
      .populate("auditLogs.performedBy", "name role")
      .select("auditLogs applicationNumber");

    if (!application) {
      throw new Error("Application not found");
    }

    // Sort by timestamp descending (latest first)
    const timeline = application.auditLogs.sort((a, b) => b.timestamp - a.timestamp);

    return timeline;
  }
}

module.exports = new AuditService();
