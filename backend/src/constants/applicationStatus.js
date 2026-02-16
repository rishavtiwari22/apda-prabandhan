/**
 * Application Status Constants
 * Tracks the lifecycle of a disaster relief application.
 */
const APPLICATION_STATUS = {
  SUBMITTED: "submitted",
  UNDER_VERIFICATION: "under_verification",
  DOCUMENTS_PENDING: "documents_pending",
  FORWARDED: "forwarded",
  AUTHORIZED: "authorized",
  RESOLVED: "resolved",
  REJECTED: "rejected",
};

const STATUS_VALUES = Object.values(APPLICATION_STATUS);

module.exports = { APPLICATION_STATUS, STATUS_VALUES };
