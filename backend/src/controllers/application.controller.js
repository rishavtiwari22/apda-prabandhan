const applicationService = require("../services/application.service");
const Application = require("../models/application.model");

/**
 * Controller for handling incoming requests and mapping them to ApplicationService
 */

/**
 * Helper to process files into payload
 */
const processApplicationFiles = (req, payload) => {
  const newPayload = { ...payload };
  
  // ALWAYS parse nested objects if they arrive as JSON strings from FormData
  // Multer puts fields into req.body as strings
  const jsonFields = ['applicantInfo', 'beneficiaryInfo', 'location', 'witnesses', 'uploadedDocuments', 'lossTypes', 'lossDetails'];
  
  jsonFields.forEach(field => {
    if (typeof newPayload[field] === 'string') {
      try {
        newPayload[field] = JSON.parse(newPayload[field]);
      } catch (e) {
        console.error(`Error parsing ${field}:`, e);
      }
    }
  });

  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      // General/Required documents: keyed as doc_index
      if (file.fieldname.startsWith('doc_')) {
        const idx = parseInt(file.fieldname.split('_')[1]);
        if (newPayload.uploadedDocuments && newPayload.uploadedDocuments[idx]) {
          newPayload.uploadedDocuments[idx].fileUrl = file.path; // Cloudinary URL
        }
      }
      // Additional documents: keyed as other_doc_i
      if (file.fieldname.startsWith('other_doc_')) {
        if (!newPayload.uploadedDocuments) newPayload.uploadedDocuments = [];
        newPayload.uploadedDocuments.push({
          name: file.originalname || "Other Document",
          fileUrl: file.path, // Cloudinary URL
          documentType: null 
        });
      }
    });
  }

  return newPayload;
};

/**
 * POST /applications/public
 */
exports.submitPublicApplication = async (req, res) => {
  try {
    let payload = { ...req.body };
    payload = processApplicationFiles(req, payload);
    
    // Public submissions are always "individual" source with today's date
    payload.source = "individual";
    payload.applicationDate = new Date();

    const application = await applicationService.submitApplication(payload, null, true);
    
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      applicationNumber: application.applicationNumber,
      data: application
    });
  } catch (error) {
    console.error("Public submission error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error submitting application",
      errors: error.errors
    });
  }
};

/**
 * POST /applications
 */
exports.submitDepartmentApplication = async (req, res) => {
  try {
    let payload = { ...req.body };
    payload = processApplicationFiles(req, payload);

    const application = await applicationService.submitApplication(payload, req.user._id, false);
    
    res.status(201).json({
      success: true,
      message: "Application submitted successfully by department",
      applicationNumber: application.applicationNumber,
      data: application
    });
  } catch (error) {
    console.error("Department submission error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error submitting application",
      errors: error.errors
    });
  }
};

/**
 * POST /applications/:id/forward
 */
exports.forwardApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { forwardToId, remarks } = req.body;
    
    const application = await applicationService.forwardApplication(id, forwardToId, req.user, remarks);
    
    res.status(200).json({
      success: true,
      message: "Application forwarded successfully",
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /applications/:id/backward
 */
exports.backwardApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { backwardToId, remarks } = req.body;
    
    if (!backwardToId || !remarks) {
      return res.status(400).json({ success: false, message: "Return target and remarks are required." });
    }

    const application = await applicationService.backwardApplication(id, backwardToId, req.user, remarks);
    
    res.status(200).json({
      success: true,
      message: "Application returned successfully",
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
exports.resolveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNote, paymentAmount, paymentDate } = req.body;
    const finalDocument = req.file ? req.file.path : req.body.finalDocument;
    
    const application = await applicationService.resolveApplication(id, req.user, {
      resolutionNote,
      paymentAmount,
      paymentDate,
      finalDocument
    });
    
    res.status(200).json({
      success: true,
      message: "Application resolved and compensation approved",
      data: application
    });
  } catch (error) {
    const status = error.message.includes("authorized") || error.message.includes("handler") ? 403 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /applications/:id/request-documents
 */
exports.requestDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentTypes, remarks } = req.body;
    
    const application = await applicationService.requestDocuments(id, req.user, documentTypes, remarks);
    
    res.status(200).json({
      success: true,
      message: "Documents requested from applicant",
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /applications/:id/upload-document
 * Used by applicants via the public upload portal (PublicUpload.jsx)
 */
exports.uploadApplicantDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const docData = {
      documentType: req.body.documentType,
      name: req.body.name,
      fileUrl: req.file.path // Cloudinary URL
    };

    const application = await applicationService.uploadDocument(id, req.user, docData);

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /applications/track/:applicationNumber/docs
 */
exports.getTrackDocs = async (req, res) => {
  try {
    const application = await applicationService.trackByNumberWithDocs(req.params.applicationNumber, req.user);
    
    res.status(200).json({
      success: true,
      data: {
        applicationId: application._id,
        applicationNumber: application.applicationNumber,
        status: application.status,
        requiredDocuments: application.requiredDocuments,
        uploadedDocuments: application.uploadedDocuments
      }
    });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 403 : (error.message === "Application not found" ? 404 : 500);
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /applications/track/:applicationNumber
 */
exports.trackApplication = async (req, res) => {
  try {
    const application = await applicationService.trackByNumber(req.params.applicationNumber);
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    const status = error.message === "Application not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /applications
 */
exports.getApplications = async (req, res) => {
  try {
    const { status, disasterEventId, limit = 50, skip = 0 } = req.query;

    const filters = {};

    // Role-based data scoping: 
    const isSubAdmin = req.user.role === "sub-admin";
    const isDept = req.user.role === "department";
    const isPublic = req.user.role === "public";
    const isAdmin = req.user.role === "admin";

    if (isSubAdmin) {
      // Sub-Admins see everything in their territory (Block > Tehsil > District)
      if (req.user.assignedBlock) {
        filters["location.block"] = req.user.assignedBlock;
      } else if (req.user.assignedTehsil) {
        filters["location.tehsil"] = req.user.assignedTehsil;
      } else if (req.user.assignedDistrict) {
        filters["location.district"] = req.user.assignedDistrict;
      }
      // If no territory assigned, act as Super Admin (see everything)
    } else if (isDept) {
      // Departmental users see their assigned territory OR their forwarded cases
      const deptFilters = [
        { currentHandler: req.user._id },
        { sharedWith: req.user._id }
      ];
      
      if (req.user.assignedBlock) deptFilters.push({ "location.block": req.user.assignedBlock });
      else if (req.user.assignedTehsil) deptFilters.push({ "location.tehsil": req.user.assignedTehsil });
      else if (req.user.assignedDistrict) deptFilters.push({ "location.district": req.user.assignedDistrict });

      filters.$or = deptFilters;
    } else if (isPublic) {
      // Public users ONLY see their own applications
      filters.createdBy = req.user._id;
    }

    if (status) filters.status = status;
    if (disasterEventId) filters.disasterEventId = disasterEventId;

    const [applications, total] = await Promise.all([
      applicationService.getApplications(filters, {
        sort: "-createdAt",
        limit: parseInt(limit),
        skip: parseInt(skip)
      }),
      applicationService.countApplications(filters)
    ]);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
/**
 * GET /applications/:id
 */
exports.getApplicationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await applicationService.getApplicationById(id);
    
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Permission checks
    const user = req.user;
    const isOwner = application.createdBy?.toString() === user._id.toString();
    const isHandler = application.currentHandler?.toString() === user._id.toString() || 
                      application.sharedWith?.some(u => u.toString() === user._id.toString());
    const isSubAdmin = user.role === "sub-admin";
    const isDept = user.role === "department";
    const isAdmin = user.role === "admin";

    // Territory check for Sub-Admins and Departmental users
    let isInCategory = true;
    if (isSubAdmin || isDept) {
      // Hierarchical check: if user has a specific assignment, application must match it.
      if (user.assignedBlock) {
        if (application.location?.block?.toString() !== user.assignedBlock.toString()) isInCategory = false;
      } else if (user.assignedTehsil) {
        if (application.location?.tehsil?.toString() !== user.assignedTehsil.toString()) isInCategory = false;
      } else if (user.assignedDistrict) {
        if (application.location?.district?.toString() !== user.assignedDistrict.toString()) isInCategory = false;
      }
    }

    if (!isAdmin && !isOwner && !isHandler && (!isSubAdmin || !isInCategory) && (!isDept || !isInCategory)) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this application." });
    }

    // Populate related data for better context
    await application.populate([
      { path: "disasterType", select: "name nameHindi" },
      { path: "disasterEventId", select: "eventNumber incidentDate status description" },
      { path: "location.district", select: "name" },
      { path: "location.tehsil", select: "name" },
      { path: "location.block", select: "name" }
    ]);

    // If linked to a disaster event, add the total application count for that incident
    let clusterStats = null;
    if (application.disasterEventId) {
      const totalInCluster = await Application.countDocuments({ 
        disasterEventId: application.disasterEventId._id 
      });
      clusterStats = { totalApplications: totalInCluster };
    }

    res.status(200).json({
      success: true,
      data: application,
      clusterStats
    });
  } catch (error) {
    const status = error.message === "Application not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /applications/:id/share
 */
exports.shareApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one user to share with." });
    }

    const application = await applicationService.shareApplication(id, userIds, req.user);
    
    res.status(200).json({
      success: true,
      message: `Case shared with ${userIds.length} user(s) successfully`,
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /applications/:id/remark
 */
exports.addRemark = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    
    if (!remarks) {
      return res.status(400).json({ success: false, message: "Remark text is required." });
    }

    await applicationService.addRemark(id, req.user, remarks);
    
    res.status(200).json({
      success: true,
      message: "Remark added successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /applications/:id/documents/upload
 */
exports.uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a file." });
    }

    if (!type) {
      return res.status(400).json({ success: false, message: "Document type is required." });
    }

    const application = await applicationService.uploadOfficerDocument(id, req.user, type, req.file);
    
    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PATCH /applications/:id/documents/:docId/verify
 */
exports.verifyDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const application = await applicationService.verifyDocument(id, docId, req.user);
    
    res.status(200).json({
      success: true,
      message: "Document verified successfully",
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
/**
 * PATCH /applications/:id/documents/:docId/reject
 */
exports.rejectDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: "Rejection reason is required." });
    }

    const application = await applicationService.handleDepartmentAction(id, req.user, {
      action: "REJECT",
      documentMappingId: docId,
      rejectionReason,
    });

    res.status(200).json({
      success: true,
      message: "Document rejected successfully",
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /applications/:id/admin-action
 */
exports.adminActionOnRejection = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remarks, documentMappingId } = req.body;

    const application = await applicationService.adminActionOnRejection(id, req.user, {
      action,
      remarks,
      documentMappingId
    });

    res.status(200).json({
      success: true,
      message: `Admin action ${action} performed successfully`,
      data: application
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PATCH /applications/:id
 */
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await applicationService.updateApplication(id, req.user, req.body);
    
    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
