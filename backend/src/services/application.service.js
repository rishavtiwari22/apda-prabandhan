const Application = require("../models/application.model");
const User = require("../models/user.model");
const DocumentType = require("../models/documentType.model");
const { APPLICATION_STATUS } = require("../constants/applicationStatus");
const disasterEventService = require("../services/disasterEvent.service");
const { ROLES, DESIGNATIONS } = require("../constants/roles");
const statusTransitionService = require("./statusTransition.service");
const authorizationService = require("./authorization.service");
const notificationService = require("./notification.service");
const auditService = require("./audit.service");
const District = require("../models/district.model");
const Block = require("../models/block.model");
const DisasterEvent = require("../models/disasterEvent.model");

/**
 * Application Service - Handles core business logic, state transitions, and ownership
 */
class ApplicationService {
  /**
   * Generate a unique event number (INCIDENT-YYYYMMDD-XXXX)
   */
  async generateEventNumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `INC-${dateStr}-`;
    
    const count = await DisasterEvent.countDocuments({
      eventNumber: { $regex: new RegExp(`^${prefix}`) }
    });
    
    const serial = (count + 1).toString().padStart(4, "0");
    return `${prefix}${serial}`;
  }

  /**
   * Generate a unique application number
   */
  async generateApplicationNumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `APDA-${dateStr}-`;
    
    const count = await Application.countDocuments({
      applicationNumber: { $regex: new RegExp(`^${prefix}`) }
    });
    
    const serial = (count + 1).toString().padStart(4, "0");
    return `${prefix}${serial}`;
  }

  /**
   * Submit application (Public or Departmental)
   */
  async submitApplication(data, creatorId = null, isPublic = true) {
    const applicationNumber = await this.generateApplicationNumber();
    
    // Get creator details if available
    let creatorRole = "PUBLIC";
    if (creatorId) {
      const creator = await User.findById(creatorId);
      creatorRole = creator?.role || "PUBLIC";
    }

    // NEW: Auto-populate required documents based on Disaster Type
    const defaultDocs = await DocumentType.find({ 
      disasterType: data.disasterType, 
      isActive: true 
    });

    const requiredDocuments = defaultDocs.map(doc => ({
      documentType: doc._id,
      name: doc.name,
      responsibleDepartment: doc.responsibleDepartment || "individual",
      isUserMandatory: doc.isUserMandatory,
      isDeptMandatory: doc.isDeptMandatory,
      allowUserOptional: doc.allowUserOptional,
      status: "PENDING",
      requestedAt: new Date()
    }));

    // ── Handle Disaster Event Linking ──
    let eventId = data.disasterEventId;
    
    // ── Intelligent Clustering ──
    if (!eventId || eventId === "NEW") {
      const matches = await disasterEventService.findPotentialMatches(data);
      
      if (matches.length > 0) {
        eventId = matches[0]._id;
      } else {
        const dateStr = new Date(data.incidentDate).toISOString().slice(0, 10).replace(/-/g, "");
        const prefix = `INC-${dateStr}-`;
        const count = await DisasterEvent.countDocuments({ eventNumber: { $regex: new RegExp(`^${prefix}`) } });
        const eventNumber = `${prefix}${(count + 1).toString().padStart(4, "0")}`;

        const newEvent = await DisasterEvent.create({
          eventNumber,
          disasterType: data.disasterType,
          incidentDate: data.incidentDate,
          incidentHalfDay: data.incidentHalfDay || "FIRST_HALF",
          location: data.location,
          description: `Incident group created for ${data.subject || 'Individual Report'}`,
          createdBy: creatorId
        });
        eventId = newEvent._id;
      }
    }

    const applicationData = {
      ...data,
      applicationNumber,
      disasterEventId: eventId,
      incidentHalfDay: data.incidentHalfDay || "FIRST_HALF",
      status: APPLICATION_STATUS.SUBMITTED,
      createdBy: creatorId,
      currentHandler: creatorId, // Default to creator
      requiredDocuments,
      auditLogs: [{
        action: "APPLICATION_SUBMITTED",
        toStatus: APPLICATION_STATUS.SUBMITTED,
        performedBy: creatorId,
        performedByRole: creatorRole,
        remarks: isPublic ? "Application submitted via public portal" : "Application submitted by department",
        timestamp: new Date()
      }]
    };

    // If any documents are required from a department, add a remark
    const deptDocs = defaultDocs.filter(d => d.responsibleDepartment && d.responsibleDepartment !== "individual");
    if (deptDocs.length > 0) {
      const depts = [...new Set(deptDocs.map(d => d.responsibleDepartment))];
      applicationData.auditLogs[0].remarks += `. Action required from: ${depts.join(", ")}.`;
    }

    const application = await Application.create(applicationData);

    // Update DisasterEvent statistics
    await DisasterEvent.findByIdAndUpdate(eventId, { $inc: { totalCases: 1 } });

    // NEW: Automatic Routing / Forwarding Logic
    try {
      // 1. Get territory names for clearer notifications (needed for both admins and officers)
      const [districtDoc, blockDoc] = await Promise.all([
        District.findById(data.location.district),
        Block.findById(data.location.block)
      ]);
      const territoryName = blockDoc?.name || districtDoc?.name || "Unknown Territory";

      // 2. Routing and Officer Notifications
      // Every application goes to the Tehsildar of the region first.
      const primaryHandler = await User.findOne({
        role: ROLES.SUB_ADMIN,
        designation: DESIGNATIONS.TEHSILDAR,
        isActive: true,
        $or: [
          { assignedBlock: data.location.block },
          { assignedTehsil: data.location.tehsil },
          { assignedDistrict: data.location.district }
        ]
      }).sort({ assignedBlock: -1, assignedTehsil: -1 });

      if (primaryHandler) {
        application.currentHandler = primaryHandler._id;
        
        application.auditLogs.push({
          action: "APPLICATION_ROUTED",
          fromStatus: APPLICATION_STATUS.SUBMITTED,
          toStatus: APPLICATION_STATUS.TEHSILDAR_REVIEW,
          performedBy: null,
          performedByRole: "system",
          remarks: `Automatically routed to ${primaryHandler.name} (TEHSILDAR) for verification.`,
          timestamp: new Date(),
          details: { from: "System", to: primaryHandler.name }
        });

        application.status = APPLICATION_STATUS.TEHSILDAR_REVIEW;
        await application.save();
      }

      const allHandlers = await User.find({
        role: ROLES.SUB_ADMIN,
        designation: DESIGNATIONS.TEHSILDAR,
        isActive: true,
        $or: [
          { assignedBlock: data.location.block },
          { assignedTehsil: data.location.tehsil },
          { assignedDistrict: data.location.district }
        ]
      });

      for (const handler of allHandlers) {
        const isPrimary = primaryHandler && handler._id.toString() === primaryHandler._id.toString();
        const title = isPrimary ? "New Case Automatically Assigned" : "Official Report Required";
        const message = isPrimary 
          ? `Case ${application.applicationNumber} from ${territoryName} has been assigned to you for verification.`
          : `Case ${application.applicationNumber} from ${territoryName} requires verification at the Tehsildar level.`;

        await notificationService.createNotification(
          handler._id,
          title,
          message,
          application._id
        );
      }

      // 3. NEW ENHANCEMENT: Notify all Admins (Always)
      const allAdmins = await User.find({ role: ROLES.ADMIN, isActive: true });
      for (const admin of allAdmins) {
        await notificationService.createNotification(
          admin._id,
          "New Application Registered",
          `A new case ${application.applicationNumber} has been submitted from ${territoryName}.`,
          application._id
        );
      }
    } catch (routingError) {
      console.error("Automatic routing failed:", routingError);
      // Don't fail the whole submission if routing fails
    }

    return application;
  }

  /**
   * Forward Application to another user in the hierarchy
   */
  async forwardApplication(applicationId, forwardToId, user, remarks) {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    const isSystemAdmin = user.role === ROLES.ADMIN;
    if (!isSystemAdmin && application.currentHandler.toString() !== user._id.toString()) {
      throw new Error("Only the current handler can forward this application.");
    }
    if (forwardToId === user._id.toString()) {
      throw new Error("Cannot forward application to yourself.");
    }

    const targetUser = await User.findById(forwardToId);
    if (!targetUser || !targetUser.isActive) {
      throw new Error("Target user not found or inactive.");
    }

    // Hierarchical Validation
    let nextStatus;
    if (user.role === ROLES.SUB_ADMIN) {
      if (user.designation === DESIGNATIONS.TEHSILDAR) {
        if (targetUser.designation !== DESIGNATIONS.SDM) {
          throw new Error("Tehsildar can only forward to SDM.");
        }
        nextStatus = APPLICATION_STATUS.SDM_REVIEW;
      } else if (user.designation === DESIGNATIONS.SDM) {
        if (targetUser.designation !== DESIGNATIONS.COLLECTOR) {
          throw new Error("SDM can only forward to Collector.");
        }
        nextStatus = APPLICATION_STATUS.COLLECTOR_REVIEW;
      } else {
        throw new Error("Collector cannot forward further (only resolve or backward).");
      }
    } else if (isSystemAdmin) {
       // Admins can forward to any sub-admin level, status depends on target
       if (targetUser.designation === DESIGNATIONS.TEHSILDAR) nextStatus = APPLICATION_STATUS.TEHSILDAR_REVIEW;
       else if (targetUser.designation === DESIGNATIONS.SDM) nextStatus = APPLICATION_STATUS.SDM_REVIEW;
       else if (targetUser.designation === DESIGNATIONS.COLLECTOR) nextStatus = APPLICATION_STATUS.COLLECTOR_REVIEW;
       else throw new Error("Invalid forward target for admin.");
    }

    statusTransitionService.validateTransition(application.status, nextStatus);

    const previousStatus = application.status;

    // Update Application
    application.forwardedHistory.push({
      from: user._id,
      to: targetUser._id,
      remarks,
      timestamp: new Date()
    });

    application.currentHandler = targetUser._id;
    application.status = nextStatus;

    await application.save();

    // Audit Log
    await auditService.logAction(application._id, {
      action: "APPLICATION_FORWARDED",
      fromStatus: previousStatus,
      toStatus: nextStatus,
      performedBy: user._id,
      performedByRole: user.designation || user.role,
      remarks,
      details: { from: user.name, to: targetUser.name }
    });

    // Notification
    await notificationService.createNotification(
      targetUser._id,
      "New Application Forwarded",
      `Case ${application.applicationNumber} has been forwarded to you for level-${targetUser.designation.toUpperCase()} review.`,
      application._id
    );
    
    return application;
  }

  /**
   * Backward Application to a previous level
   */
  async backwardApplication(applicationId, backwardToId, user, remarks) {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    const isSystemAdmin = user.role === ROLES.ADMIN;
    if (!isSystemAdmin && application.currentHandler.toString() !== user._id.toString()) {
      throw new Error("Only the current handler can return this application.");
    }

    const targetUser = await User.findById(backwardToId);
    if (!targetUser || !targetUser.isActive) {
      throw new Error("Target user not found or inactive.");
    }

    // Hierarchical Validation
    let nextStatus;
    if (user.role === ROLES.SUB_ADMIN) {
      if (user.designation === DESIGNATIONS.COLLECTOR) {
        if (targetUser.designation === DESIGNATIONS.SDM) nextStatus = APPLICATION_STATUS.SDM_REVIEW;
        else if (targetUser.designation === DESIGNATIONS.TEHSILDAR) nextStatus = APPLICATION_STATUS.TEHSILDAR_REVIEW;
        else throw new Error("Collector can only return to SDM or Tehsildar.");
      } else if (user.designation === DESIGNATIONS.SDM) {
        if (targetUser.designation !== DESIGNATIONS.TEHSILDAR) {
          throw new Error("SDM can only return to Tehsildar.");
        }
        nextStatus = APPLICATION_STATUS.TEHSILDAR_REVIEW;
      } else {
        throw new Error("Tehsildar cannot backward a case.");
      }
    } else if (isSystemAdmin) {
       if (targetUser.designation === DESIGNATIONS.TEHSILDAR) nextStatus = APPLICATION_STATUS.TEHSILDAR_REVIEW;
       else if (targetUser.designation === DESIGNATIONS.SDM) nextStatus = APPLICATION_STATUS.SDM_REVIEW;
       else throw new Error("Invalid return target for admin.");
    }

    statusTransitionService.validateTransition(application.status, nextStatus);

    const previousStatus = application.status;

    application.currentHandler = targetUser._id;
    application.status = nextStatus;

    await application.save();

    // Audit Log
    await auditService.logAction(application._id, {
      action: "APPLICATION_BACKWARDED",
      fromStatus: previousStatus,
      toStatus: nextStatus,
      performedBy: user._id,
      performedByRole: user.designation || user.role,
      remarks,
      details: { from: user.name, to: targetUser.name }
    });

    // Notification
    await notificationService.createNotification(
      targetUser._id,
      "Case Returned for Correction",
      `Case ${application.applicationNumber} has been sent back to you with remarks: ${remarks}`,
      application._id
    );

    return application;
  }

  /**
   * Resolve Application
   */
  async resolveApplication(applicationId, user, resolutionData) {
    const { resolutionNote, paymentAmount, paymentDate, finalDocument } = resolutionData;

    if (!paymentAmount || paymentAmount <= 0) throw new Error("Invalid payment amount.");
    if (!paymentDate || new Date(paymentDate) > new Date()) throw new Error("Invalid payment date.");
    if (!resolutionNote || resolutionNote.trim().length === 0) throw new Error("Resolution note is required.");

    const application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    const auth = await authorizationService.canResolve(user, application);
    if (!auth.authorized) throw new Error(auth.reason);

    statusTransitionService.validateTransition(application.status, APPLICATION_STATUS.APPROVED_PENDING_PAYMENT);

    const previousStatus = application.status;
    const isCollectorOverride = (user.role === ROLES.ADMIN && application.currentHandler.toString() !== user._id.toString());
    const previousHandlerId = application.currentHandler;

    // Update Application
    application.status = APPLICATION_STATUS.APPROVED_PENDING_PAYMENT;
    application.resolutionDetails = {
      resolutionNote,
      paymentAmount,
      paymentDate: new Date(paymentDate),
      resolvedBy: user._id,
      resolvedByRole: user.designation || user.role,
      resolvedByName: user.name,
      resolvedAt: new Date(),
      finalDocument
    };

    await application.save();

    // Update DisasterEvent summary fields
    if (application.disasterEventId) {
      await DisasterEvent.findByIdAndUpdate(application.disasterEventId, {
        $inc: { 
          totalResolved: 1, 
          totalCompensationAmount: paymentAmount 
        }
      });
    }

    // Standardized Audit Log
    await auditService.logAction(application._id, {
      action: "APPLICATION_RESOLVED",
      fromStatus: previousStatus,
      toStatus: APPLICATION_STATUS.APPROVED_PENDING_PAYMENT,
      performedBy: user._id,
      performedByRole: user.role,
      remarks: resolutionNote,
      details: {
        paymentAmount,
        paymentDate,
        override: isCollectorOverride
      }
    });

    // Notifications
    if (application.createdBy) {
      await notificationService.createNotification(
        application.createdBy,
        "Application Approved",
        "Your application has been approved and is pending final payment.",
        application._id
      );
    }
    if (previousHandlerId && previousHandlerId.toString() !== user._id.toString()) {
      await notificationService.createNotification(
        previousHandlerId,
        "Application Resolved",
        "An application previously handled by you has been resolved.",
        application._id
      );
    }
    
    return application;
  }

  /**
   * Request Documents
   */
  async requestDocuments(applicationId, user, documentTypes, remarks) {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    if (application.currentHandler.toString() !== user._id.toString()) {
      throw new Error("Only the current handler can request documents.");
    }

    statusTransitionService.validateTransition(application.status, APPLICATION_STATUS.DOCUMENTS_PENDING);

    const previousStatus = application.status;

    application.requiredDocuments = [
      ...(application.requiredDocuments || []),
      ...documentTypes.map(doc => ({ ...doc, requestedAt: new Date() }))
    ];

    application.status = APPLICATION_STATUS.DOCUMENTS_PENDING;

    await application.save();

    // Standardized Audit Log
    await auditService.logAction(application._id, {
      action: "DOCUMENTS_REQUESTED",
      fromStatus: previousStatus,
      toStatus: APPLICATION_STATUS.DOCUMENTS_PENDING,
      performedBy: user._id,
      performedByRole: user.role,
      remarks,
      details: { requestedDocs: documentTypes.map(d => d.name) }
    });

    // Notification Logic
    const notifiedDepts = new Set();
    let notifyApplicant = false;

    for (const doc of documentTypes) {
      if (doc.responsibleDepartment && doc.responsibleDepartment !== "individual") {
        notifiedDepts.add(doc.responsibleDepartment);
      } else {
        notifyApplicant = true;
      }
    }

    // 1. Notify Applicant
    if (notifyApplicant && application.createdBy) {
      await notificationService.createNotification(
        application.createdBy,
        "Documents Required (आवेदक हेतु)",
        "Please upload the additional documents requested for your application.",
        application._id
      );
    }

    // 2. Notify Departments
    for (const deptType of notifiedDepts) {
      const deptUsers = await User.find({ departmentType: deptType, isActive: true });
      for (const deptUser of deptUsers) {
        await notificationService.createNotification(
          deptUser._id,
          `Official Report Requested (${deptType.toUpperCase()})`,
          `Case ${application.applicationNumber} requires a report from your department.`,
          application._id
        );
      }
    }

    return application;
  }

  /**
   * Upload Document
   */
  async uploadDocument(applicationId, user, docData) {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    // Ownership verification for PUBLIC users
    if (user.role === ROLES.PUBLIC) {
      if (user.mobile !== application.applicantInfo.mobile) {
        throw new Error("Unauthorized. Your mobile number does not match the applicant's mobile on this application.");
      }
    } else {
      // For Department/Admin, ensure they are the current handler
      if (application.currentHandler.toString() !== user._id.toString() && user.role !== ROLES.ADMIN) {
        throw new Error("Only the current handler can upload documents for this application.");
      }
    }

    application.uploadedDocuments.push({
      ...docData,
      uploadedAt: new Date()
    });

    await application.save();

    // Standardized Audit Log
    await auditService.logAction(application._id, {
      action: "DOCUMENT_UPLOADED",
      toStatus: application.status,
      performedBy: user._id,
      performedByRole: user.role,
      remarks: `Document uploaded: ${docData.name}`,
      details: { documentName: docData.name }
    });

    return application;
  }

  /**
   * Track application by number with sensitive doc details
   */
  async trackByNumberWithDocs(applicationNumber, user) {
    const application = await Application.findOne({ 
      applicationNumber: applicationNumber.toUpperCase() 
    });

    if (!application) throw new Error("Application not found");

    // Verify ownership
    if (user.role === ROLES.PUBLIC && user.mobile !== application.applicantInfo.mobile) {
      throw new Error("Unauthorized access to this application's documents.");
    }

    return application;
  }

  /**
   * Track application by number
   */
  async trackByNumber(applicationNumber) {
    const application = await Application.findOne({ 
      applicationNumber: applicationNumber.toUpperCase() 
    })
    .populate("disasterType", "name")
    .populate("location.district", "name")
    .populate("location.block", "name")
    .populate("location.panchayat", "name")
    .select("applicationNumber status applicantInfo disasterType incidentDate location auditLogs createdAt requiredDocuments uploadedDocuments");

    if (!application) throw new Error("Application not found");
    return application;
  }

  /**
   * Get applications with filters and pagination
   */
  async getApplications(filters = {}, options = {}) {
    const { sort = "-createdAt", limit = 50, skip = 0 } = options;
    return await Application.find(filters)
      .populate("disasterType", "name")
      .populate("location.district", "name")
      .populate("location.block", "name")
      .populate("location.panchayat", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  /**
   * Count applications matching filters (for pagination)
   */
  async countApplications(filters = {}) {
    return await Application.countDocuments(filters);
  }

  /**
   * Get total detail for a single application by ID
   */
  async getApplicationById(id) {
    const application = await Application.findById(id)
      .populate("disasterType", "name")
      .populate("location.district", "name")
      .populate("location.tehsil", "name")
      .populate("location.block", "name")
      .populate("location.panchayat", "name")
      .populate("location.village", "name")
      .populate("createdBy", "name role")
      .populate("currentHandler", "name role")
      .populate("sharedWith", "name role departmentType")
      .populate("requiredDocuments.documentType")
      .populate("uploadedDocuments.documentType")
      .populate("auditLogs.performedBy", "name role designation")
      .populate("disasterEventId", "eventNumber status");

    if (!application) throw new Error("Application not found");
    return application;
  }

  /**
   * Share application with one or more users
   */
  async shareApplication(applicationId, userIds, currentUser) {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    // Only current handler or admin can share
    const isAdmin = currentUser.role === ROLES.ADMIN;
    const isHandler = application.currentHandler.toString() === currentUser._id.toString();
    if (!isAdmin && !isHandler) {
      throw new Error("Only the current handler or admin can share this case.");
    }

    // Merge with existing, avoid duplicates
    const existing = (application.sharedWith || []).map(id => id.toString());
    const merged = [...new Set([...existing, ...userIds])];
    application.sharedWith = merged;
    await application.save();

    // Audit log
    await auditService.logAction(application._id, {
      action: "CASE_SHARED",
      fromStatus: application.status,
      toStatus: application.status,
      performedBy: currentUser._id,
      performedByRole: currentUser.role,
      remarks: `Shared with ${userIds.length} user(s)`,
      details: { sharedWithIds: userIds }
    });

    // Notify each shared user
    for (const uid of userIds) {
      if (!existing.includes(uid)) {
        await notificationService.createNotification(
          uid,
          "Case Shared With You",
          `A case has been shared with you for review: ${application.applicationNumber}`,
          application._id
        );
      }
    }

    return application;
  }

  /**
   * Add a simple remark/note to the application audit trail
   */
  async addRemark(applicationId, user, remarks) {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    await auditService.logAction(applicationId, {
      action: "REMARK_ADDED",
      fromStatus: application.status,
      toStatus: application.status,
      performedBy: user._id,
      performedByRole: user.role,
      remarks,
      details: { name: user.name }
    });

    return application;
  }

  /**
   * Check if all mandatory documents (User & Dept) are completed and advance status
   */
  async checkAndAdvanceStatus(application) {
    const mandatoryDocs = application.requiredDocuments.filter(d => d.isUserMandatory || d.isDeptMandatory);
    const allCompleted = mandatoryDocs.every(d => d.status === "VERIFIED" || d.status === "REPLACED");
    
    if (allCompleted && application.status !== APPLICATION_STATUS.READY_FOR_ADMIN) {
      const previousStatus = application.status;
      application.status = APPLICATION_STATUS.READY_FOR_ADMIN;
      
      application.auditLogs.push({
        action: "STATUS_UPDATED",
        fromStatus: previousStatus,
        toStatus: APPLICATION_STATUS.READY_FOR_ADMIN,
        performedBy: null,
        performedByRole: "system",
        remarks: "All required documents have been verified/uploaded. Application is now ready for Admin review.",
        timestamp: new Date()
      });

      // Notify Admins
      const allAdmins = await User.find({ role: ROLES.ADMIN, isActive: true });
      for (const admin of allAdmins) {
        await notificationService.createNotification(
          admin._id,
          "Application Ready for Review",
          `Case ${application.applicationNumber} has all required documents and is ready for your approval.`,
          application._id
        );
      }
    }
  }

  /**
   * Handle Departmental Actions: VERIFY, REJECT, REPLACE
   */
  async handleDepartmentAction(applicationId, user, actionData) {
    const { action, documentMappingId, documentTypeId, rejectionReason, file } = actionData;
    const application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    const isAdmin = user.role === ROLES.ADMIN;
    const isDept = user.role === ROLES.DEPARTMENT;

    if (!isAdmin && application.currentHandler.toString() !== user._id.toString()) {
      throw new Error("Only the current handler can perform this action.");
    }

    const previousStatus = application.status;
    let remarks = "";

    if (action === "VERIFY") {
      const doc = application.uploadedDocuments.id(documentMappingId);
      if (!doc) throw new Error("Document not found");
      
      doc.isVerified = true;
      doc.verifiedBy = user._id;
      doc.status = "VERIFIED";

      const reqDoc = application.requiredDocuments.find(rd => 
        rd.documentType?.toString() === doc.documentType?.toString()
      );
      if (reqDoc) reqDoc.status = "VERIFIED";

      remarks = `Verified document: ${doc.name}`;
      
    } else if (action === "REJECT") {
      const doc = application.uploadedDocuments.id(documentMappingId);
      if (!doc) throw new Error("Uploaded document not found");

      doc.isVerified = false;
      doc.status = "REJECTED";

      const reqDoc = application.requiredDocuments.find(rd => 
        rd.documentType?.toString() === doc.documentType?.toString()
      );
      if (reqDoc) {
        reqDoc.status = "REJECTED";
        reqDoc.rejectionReason = rejectionReason;
      }

      application.status = APPLICATION_STATUS.REJECTED_BY_DEPARTMENT;
      remarks = `Rejected document: ${doc.name}. Reason: ${rejectionReason}`;

      // Notify User
      if (application.createdBy) {
        await notificationService.createNotification(
          application.createdBy,
          "Document Rejected",
          `Your document "${doc.name}" was rejected. Please check remarks.`,
          application._id
        );
      }

    } else if (action === "UPLOAD" || action === "REPLACE") {
      if (!file) throw new Error("File is required for upload/replace action.");
      
      const uploadedDoc = {
        documentType: documentTypeId,
        name: file.originalname,
        fileUrl: file.path,
        uploadedAt: new Date(),
        verifiedBy: user._id,
        isVerified: true,
        status: action === "REPLACE" ? "REPLACED" : "VERIFIED"
      };

      application.uploadedDocuments.push(uploadedDoc);

      const reqDoc = application.requiredDocuments.find(rd => 
        rd.documentType?.toString() === documentTypeId.toString()
      );
      if (reqDoc) reqDoc.status = action === "REPLACE" ? "REPLACED" : "VERIFIED";

      remarks = `${action === "REPLACE" ? "Replaced" : "Uploaded"} document: ${file.originalname}`;
    }

    await this.checkAndAdvanceStatus(application);
    await application.save();

    await auditService.logAction(applicationId, {
      action: `DEPT_${action}`,
      fromStatus: previousStatus,
      toStatus: application.status,
      performedBy: user._id,
      performedByRole: user.role,
      remarks,
      details: { action, documentTypeId, documentMappingId }
    });

    return application;
  }

  /**
   * Standardized Verify/Reject/Upload wrapper
   */
  async verifyDocument(applicationId, documentMappingId, user) {
    return this.handleDepartmentAction(applicationId, user, { action: "VERIFY", documentMappingId });
  }

  async uploadOfficerDocument(applicationId, user, documentTypeId, file) {
    // Check if it's a replacement or initial upload
    const application = await Application.findById(applicationId);
    const existing = application.uploadedDocuments.find(d => d.documentType?.toString() === documentTypeId.toString());
    const action = existing ? "REPLACE" : "UPLOAD";
    
    return this.handleDepartmentAction(applicationId, user, { action, documentTypeId, file });
  }

  /**
   * Admin actions on REJECTED_BY_DEPARTMENT status
   */
  async adminActionOnRejection(applicationId, user, actionData) {
    const { action, remarks, documentMappingId } = actionData;
    const application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    if (user.role !== ROLES.ADMIN) {
      throw new Error("Only an administrator can perform this action.");
    }

    const previousStatus = application.status;

    if (action === "RETURN_TO_USER") {
      application.status = APPLICATION_STATUS.SUBMITTED; // Let user re-upload
      
      // Notify User
      if (application.createdBy) {
        await notificationService.createNotification(
          application.createdBy,
          "Action Required: Application Sent Back",
          `Your application has been sent back for corrections: ${remarks}`,
          application._id
        );
      }

      await auditService.logAction(applicationId, {
        action: "ADMIN_RETURN_TO_USER",
        fromStatus: previousStatus,
        toStatus: APPLICATION_STATUS.SUBMITTED,
        performedBy: user._id,
        performedByRole: user.role,
        remarks: remarks || "Admin sent case back to user for re-upload/fixes.",
        details: { action }
      });

    } else if (action === "ADMIN_OVERRIDE") {
      const doc = application.uploadedDocuments.id(documentMappingId);
      if (!doc) throw new Error("Document not found");

      doc.isVerified = true;
      doc.verifiedBy = user._id;
      doc.status = "VERIFIED";
      doc.adminOverride = true;
      doc.overrideRemarks = remarks;

      const reqDoc = application.requiredDocuments.find(rd => 
        rd.documentType?.toString() === doc.documentType?.toString()
      );
      if (reqDoc) reqDoc.status = "VERIFIED";

      await auditService.logAction(applicationId, {
        action: "ADMIN_OVERRIDE",
        fromStatus: previousStatus,
        toStatus: application.status,
        performedBy: user._id,
        performedByRole: user.role,
        remarks: `Admin overrode departmental rejection: ${remarks}`,
        details: { action, documentMappingId, documentName: doc.name }
      });

      // After override, check if overall status can advance
      await this.checkAndAdvanceStatus(application);
    }

    await application.save();
    return application;
  }

  /**
   * Update application details (Generic)
   * Allows updating applicantInfo, beneficiaryInfo, location, lossTypes, etc.
   */
  async updateApplication(applicationId, user, updateData) {
    const application = await Application.findById(applicationId).populate("currentHandler");
    if (!application) throw new Error("Application not found");

    // Authorization check: Only current handler or admin can update
    const isAdmin = user.role === ROLES.ADMIN;
    const isHandler = application.currentHandler?._id?.toString() === user._id.toString();
    const isOwner = application.createdBy?.toString() === user._id.toString();

    if (!isAdmin && !isHandler && !isOwner) {
      throw new Error("You are not authorized to update this application.");
    }

    // List of fields that are safe to update via this generic method
    const updatableFields = [
      "applicantInfo", 
      "beneficiaryInfo", 
      "location", 
      "lossTypes", 
      "subject", 
      "cause", 
      "compensationDemand", 
      "incidentDate",
      "incidentHalfDay",
      "witnesses",
      "disasterEventId"
    ];

    let updatedFieldsCount = 0;
    Object.keys(updateData).forEach(key => {
      if (updatableFields.includes(key)) {
        application[key] = updateData[key];
        updatedFieldsCount++;
      }
    });

    if (updatedFieldsCount === 0) {
      throw new Error("No valid fields provided for update.");
    }

    await application.save();

    // Log the update
    await auditService.logAction(applicationId, {
      action: "APPLICATION_UPDATED",
      fromStatus: application.status,
      toStatus: application.status,
      performedBy: user._id,
      performedByRole: user.role,
      remarks: "Application details updated via institutional form.",
      details: { 
        updatedFields: Object.keys(updateData).filter(k => updatableFields.includes(k)) 
      }
    });

    return application;
  }
}

module.exports = new ApplicationService();
