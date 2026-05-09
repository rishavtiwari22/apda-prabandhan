const { APPLICATION_STATUS } = require("../constants/applicationStatus");

/**
 * Valid allowed transitions for the application lifecycle
 */
const ALLOWED_TRANSITIONS = {
  [APPLICATION_STATUS.SUBMITTED]: [
    APPLICATION_STATUS.TEHSILDAR_REVIEW,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.TEHSILDAR_REVIEW]: [
    APPLICATION_STATUS.SDM_REVIEW,
    APPLICATION_STATUS.APPROVED_PENDING_PAYMENT, // Direct resolve if authorized
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.SDM_REVIEW]: [
    APPLICATION_STATUS.COLLECTOR_REVIEW,
    APPLICATION_STATUS.TEHSILDAR_REVIEW,        // Backward
    APPLICATION_STATUS.APPROVED_PENDING_PAYMENT, // Direct resolve
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.COLLECTOR_REVIEW]: [
    APPLICATION_STATUS.SDM_REVIEW,              // Backward
    APPLICATION_STATUS.TEHSILDAR_REVIEW,        // Backward
    APPLICATION_STATUS.APPROVED_PENDING_PAYMENT, // Final Resolve
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.APPROVED_PENDING_PAYMENT]: [
    APPLICATION_STATUS.RESOLVED,                // Final payment
    APPLICATION_STATUS.REJECTED,
  ],
  // Final states
  [APPLICATION_STATUS.RESOLVED]: [],
  [APPLICATION_STATUS.REJECTED]: [],
};

class StatusTransitionService {
  /**
   * Validate if a transition from currentStatus to nextStatus is allowed
   */
  validateTransition(currentStatus, nextStatus) {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${nextStatus}`);
    }
    return true;
  }
}

module.exports = new StatusTransitionService();
