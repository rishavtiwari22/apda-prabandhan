const { APPLICATION_STATUS } = require("../constants/applicationStatus");
const { ROLES, DESIGNATIONS } = require("../constants/roles");
const documentService = require("./document.service");

class AuthorizationService {
  /**
   * Check if a user can resolve a specific application
   */
  async canResolve(user, application) {
    // 1. Role / Designation checks
    const isCollector = user.designation === DESIGNATIONS.COLLECTOR || user.role === ROLES.ADMIN;

    // 2. Ownership check 
    // Except for Collector (Collector can override)
    if (!isCollector && application.currentHandler.toString() !== user._id.toString()) {
      return { 
        authorized: false, 
        reason: "You are not the current handler for this application. Only the current handler or Collector can resolve cases." 
      };
    }

    // 3. Disaster Type Authorization check
    // user.authorizedDisasterTypes is an array of ObjectIds
    const isAuthorizedForDisaster = user.authorizedDisasterTypes.some(
      (typeId) => typeId.toString() === application.disasterType.toString()
    );

    if (!isAuthorizedForDisaster && !isCollector) {
      return { 
        authorized: false, 
        reason: "You are not authorized to resolve cases for this disaster type." 
      };
    }

    // 4. Status Check
    // Application must be in a resolvable state
    const allowedStatuses = [
      APPLICATION_STATUS.SUBMITTED,
      APPLICATION_STATUS.TEHSILDAR_REVIEW,
      APPLICATION_STATUS.SDM_REVIEW,
      APPLICATION_STATUS.COLLECTOR_REVIEW,
      APPLICATION_STATUS.APPROVED_PENDING_PAYMENT,
    ];
    if (!allowedStatuses.includes(application.status)) {
      return { 
        authorized: false, 
        reason: `Application must be in a resolvable state. Current status: ${application.status}` 
      };
    }
 
    // 5. Document Completeness Check
    // Admin (Collector) can override missing documents
    const isComplete = await documentService.areRequiredDocumentsUploaded(application.id);
    if (!isComplete && !isCollector) {
      const missing = await documentService.getMissingMandatoryDocuments(application.id);
      return { 
        authorized: false, 
        reason: "All required documents must be uploaded before resolution.",
        details: { missingDocuments: missing.map(d => d.name) }
      };
    }

    return { authorized: true };
  }
}

module.exports = new AuthorizationService();
