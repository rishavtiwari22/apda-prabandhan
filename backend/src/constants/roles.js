/**
 * User Roles
 * Used across the entire system for RBAC (Role-Based Access Control).
 */
const ROLES = {
  ADMIN: "admin", // Collector — manages system, users, and authorization
  DEPARTMENT: "department", // Departmental User — Thana, Patwari, etc.
  PUBLIC: "public", // Individual applicant (public portal)
};

const ROLE_VALUES = Object.values(ROLES);

module.exports = { ROLES, ROLE_VALUES };
