/**
 * Department Constants
 * External departments that may be contacted for document verification.
 */
const DEPARTMENTS = {
  POLICE: "police",
  HOSPITAL: "hospital",
  GRAM_PANCHAYAT: "gram_panchayat",
  AGRICULTURE: "agriculture",
  REVENUE: "revenue",
  PATWARI: "patwari",
  THANA: "thana",
};

const DEPARTMENT_VALUES = Object.values(DEPARTMENTS);

module.exports = { DEPARTMENTS, DEPARTMENT_VALUES };
