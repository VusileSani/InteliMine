import { operationById, departmentById, areaById } from "./masterData.js";

export const EMPLOYMENT_STATUSES = Object.freeze(["ACTIVE", "INACTIVE"]);

export const REPORTING_ROLES = Object.freeze({
  FITTER: "Fitter",
  ELECTRICIAN: "Electrician",
  SAFETY_OFFICER: "Safety Officer",
  SUPERVISOR: "Supervisor",
  OPERATOR: "Operator"
});

export const EMPLOYEE_MASTER_FIELDS = Object.freeze([
  { key: "employeeNumber", required: true, description: "Stable employee number used across enterprise integrations." },
  { key: "firstName", required: true, description: "Employee first name." },
  { key: "lastName", required: true, description: "Employee surname." },
  { key: "jobTitle", required: true, description: "Official source-system job title." },
  { key: "reportingRole", required: true, description: "InteliMine reporting role after mapping from the official job title." },
  { key: "departmentId", required: true, description: "Canonical department identifier. Stable even when display names change." },
  { key: "areaId", required: true, description: "Canonical operational area / section identifier." },
  { key: "operationId", required: true, description: "Canonical mine / operation identifier." },
  { key: "supervisorEmployeeNo", required: false, description: "Direct supervisor employee number where available." },
  { key: "employmentStatus", required: true, description: "ACTIVE or INACTIVE. Historical records are retained after employment ends." },
  { key: "shiftGroup", required: false, description: "Roster / shift group where supplied by the source system." },
  { key: "workLocation", required: false, description: "Source-system work-location description." },
  { key: "badgeId", required: false, description: "Badge/card identifier for future kiosk authentication integration." },
  { key: "mobileNumber", required: false, description: "Optional mobile contact for employee self-service." },
  { key: "email", required: false, description: "Optional enterprise email address." },
  { key: "sourceSystem", required: true, description: "System that supplied the employee record, e.g. SAP." },
  { key: "sourceRecordId", required: false, description: "Source-system record identifier if different from employee number." },
  { key: "effectiveFrom", required: true, description: "Date from which this master-data record is effective." },
  { key: "effectiveTo", required: false, description: "Optional end date for the master-data record." },
  { key: "lastUpdatedAt", required: true, description: "Last source/master-data update timestamp." }
]);

export function employeeDisplayName(employee) {
  return [employee?.firstName, employee?.lastName].filter(Boolean).join(" ").trim() || "Unknown employee";
}

export function reportingRoleLabel(roleCode) {
  return REPORTING_ROLES[roleCode] || roleCode || "Unmapped";
}

export function employeeDepartmentName(employee) {
  return departmentById(employee?.departmentId)?.name || employee?.departmentId || "Unknown department";
}

export function employeeAreaName(employee) {
  return areaById(employee?.areaId)?.name || employee?.areaId || "Unknown area";
}

export function employeeOperationName(employee) {
  return operationById(employee?.operationId)?.name || employee?.operationId || "Unknown operation";
}

export function isEmployeeActive(employee) {
  return employee?.employmentStatus === "ACTIVE";
}

export function validateEmployeeRecord(employee) {
  const errors = [];

  for (const field of EMPLOYEE_MASTER_FIELDS) {
    if (!field.required) continue;
    const value = employee?.[field.key];
    if (value === undefined || value === null || String(value).trim() === "") {
      errors.push(`${field.key} is required`);
    }
  }

  if (employee?.employmentStatus && !EMPLOYMENT_STATUSES.includes(employee.employmentStatus)) {
    errors.push("employmentStatus must be ACTIVE or INACTIVE");
  }

  if (employee?.reportingRole && !REPORTING_ROLES[employee.reportingRole]) {
    errors.push(`reportingRole ${employee.reportingRole} is not configured`);
  }

  if (employee?.operationId && !operationById(employee.operationId)) errors.push(`operationId ${employee.operationId} is not configured`);
  if (employee?.departmentId && !departmentById(employee.departmentId)) errors.push(`departmentId ${employee.departmentId} is not configured`);
  if (employee?.areaId && !areaById(employee.areaId)) errors.push(`areaId ${employee.areaId} is not configured`);

  return errors;
}
