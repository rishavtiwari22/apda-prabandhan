/**
 * Application Status Constants
 * Tracks the lifecycle of a disaster relief application.
 */
const APPLICATION_STATUS = {
  SUBMITTED: "submitted",                // Waiting for Tehsildar
  TEHSILDAR_REVIEW: "tehsildar_review",  // Under Level 1
  SDM_REVIEW: "sdm_review",              // Under Level 2
  COLLECTOR_REVIEW: "collector_review",  // Under Level 3 (Final)
  APPROVED_PENDING_PAYMENT: "approved_pending_payment", // Resolved by Collector
  RESOLVED: "resolved",                  // Payment Complete
  REJECTED: "rejected",                  // Final Rejection
};

const STATUS_VALUES = Object.values(APPLICATION_STATUS);

module.exports = { APPLICATION_STATUS, STATUS_VALUES };
