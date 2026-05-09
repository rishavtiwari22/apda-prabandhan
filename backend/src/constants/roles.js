/**
 * User Roles
 * Used across the entire system for RBAC (Role-Based Access Control).
 */
const ROLES = {
  ADMIN: "admin", // System Admin — manages everything
  SUB_ADMIN: "sub-admin", // Hierarchical Officers — Tehsildar, SDM, Collector
  PUBLIC: "public",   // Individual applicant
  DEPARTMENT: "department", // Departmental Officers (Veterinary, Agri, etc.)
};

const DESIGNATIONS = {
  TEHSILDAR: "tehsildar", // Level 1
  SDM: "sdm",             // Level 2
  COLLECTOR: "collector", // Level 3
};

const ROLE_VALUES = Object.values(ROLES);
const DESIGNATION_VALUES = Object.values(DESIGNATIONS);

module.exports = { ROLES, ROLE_VALUES, DESIGNATIONS, DESIGNATION_VALUES };
