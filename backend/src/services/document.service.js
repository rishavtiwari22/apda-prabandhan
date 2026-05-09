const Application = require("../models/application.model");

class DocumentService {
  /**
   * Check if all mandatory documents are uploaded for an application
   */
  async areRequiredDocumentsUploaded(applicationId) {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    const mandatoryDocs = (application.requiredDocuments || []).filter(d => d.isUserMandatory || d.isDeptMandatory);
    if (mandatoryDocs.length === 0) return true;

    const uploadedDocTypeIds = (application.uploadedDocuments || [])
      .filter(d => d.documentType)
      .map(d => d.documentType.toString());
    
    const missingDocs = mandatoryDocs.filter(d => !uploadedDocTypeIds.includes(d.documentType.toString()));

    return missingDocs.length === 0;
  }

  /**
   * Get list of missing mandatory documents
   */
  async getMissingMandatoryDocuments(applicationId) {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    const mandatoryDocs = (application.requiredDocuments || []).filter(d => d.isUserMandatory || d.isDeptMandatory);
    const uploadedDocTypeIds = (application.uploadedDocuments || [])
      .filter(d => d.documentType)
      .map(d => d.documentType.toString());
    
    return mandatoryDocs.filter(d => !uploadedDocTypeIds.includes(d.documentType.toString()));
  }
}

module.exports = new DocumentService();
