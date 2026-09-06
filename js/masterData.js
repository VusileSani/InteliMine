export const OPERATIONS = Object.freeze([
  { id: "OP-SITE01", code: "SITE-01", name: "Mining Operation" }
]);

export const DEPARTMENTS = Object.freeze([
  { id: "DEPT-ENG", code: "ENG", name: "Engineering" },
  { id: "DEPT-SAF", code: "SAF", name: "Safety" },
  { id: "DEPT-PROD", code: "PROD", name: "Production" }
]);

export const AREAS = Object.freeze([
  { id: "AREA-SEC3", code: "SEC-003", operationId: "OP-SITE01", name: "Section 3" },
  { id: "AREA-PANEL-B", code: "PNL-B", operationId: "OP-SITE01", name: "Panel B" },
  { id: "AREA-WORKSHOP", code: "WS-01", operationId: "OP-SITE01", name: "Engineering Workshop" },
  { id: "AREA-CONVEYOR", code: "CV-DECL", operationId: "OP-SITE01", name: "Conveyor Decline" }
]);

export const EQUIPMENT = Object.freeze([
  { id: "EQ-CV04", code: "CV-04", name: "Conveyor CV-04", equipmentClass: "CONVEYOR", areaId: "AREA-CONVEYOR", active: true },
  { id: "EQ-P18", code: "P-18", name: "Pump P-18", equipmentClass: "PUMP", areaId: "AREA-SEC3", active: true },
  { id: "EQ-DB07", code: "DB-07", name: "Distribution Board DB-07", equipmentClass: "ELECTRICAL", areaId: "AREA-SEC3", active: true },
  { id: "EQ-RD12", code: "RD-12", name: "Rock Drill RD-12", equipmentClass: "DRILL", areaId: "AREA-PANEL-B", active: true }
]);

export const EVENT_CATEGORIES = Object.freeze({
  EQUIPMENT: "Equipment",
  ELECTRICAL: "Electrical",
  SAFETY: "Safety",
  OPERATIONS: "Operations",
  PEOPLE: "People"
});

export const EVENT_TYPES = Object.freeze([
  { id: "EVT-VIBRATION", category: "EQUIPMENT", label: "Abnormal vibration", requiresEquipment: true, roles: ["FITTER", "OPERATOR"] },
  { id: "EVT-OVERHEATING", category: "EQUIPMENT", label: "Overheating / high temperature", requiresEquipment: true, roles: ["FITTER", "ELECTRICIAN", "OPERATOR"] },
  { id: "EVT-MECH-DEFECT", category: "EQUIPMENT", label: "Mechanical defect", requiresEquipment: true, roles: ["FITTER", "OPERATOR"] },
  { id: "EVT-ELECTRICAL-FAULT", category: "ELECTRICAL", label: "Electrical fault / abnormality", requiresEquipment: true, roles: ["ELECTRICIAN"] },
  { id: "EVT-ISOLATION", category: "ELECTRICAL", label: "Isolation / restoration concern", requiresEquipment: false, roles: ["ELECTRICIAN"] },
  { id: "EVT-HAZARD", category: "SAFETY", label: "Hazard / unsafe condition", requiresEquipment: false, roles: ["SAFETY_OFFICER", "SUPERVISOR", "OPERATOR"] },
  { id: "EVT-NEAR-MISS", category: "SAFETY", label: "Near miss", requiresEquipment: false, roles: ["SAFETY_OFFICER", "SUPERVISOR"] },
  { id: "EVT-INCIDENT", category: "SAFETY", label: "Incident", requiresEquipment: false, roles: ["SAFETY_OFFICER", "SUPERVISOR"] },
  { id: "EVT-PROD-DELAY", category: "OPERATIONS", label: "Production / operational delay", requiresEquipment: false, roles: ["SUPERVISOR", "OPERATOR"] },
  { id: "EVT-ABNORMAL-CONDITION", category: "OPERATIONS", label: "Abnormal operating condition", requiresEquipment: false, roles: ["SUPERVISOR", "OPERATOR", "FITTER", "ELECTRICIAN"] },
  { id: "EVT-PEOPLE", category: "PEOPLE", label: "Crew / people constraint", requiresEquipment: false, roles: ["SUPERVISOR"] }
]);


export const DELAY_CATEGORIES = Object.freeze([
  { id: "EQUIPMENT", label: "Equipment / engineering" },
  { id: "GROUND", label: "Ground conditions" },
  { id: "PEOPLE", label: "People / crew" },
  { id: "SERVICES", label: "Services / infrastructure" }
]);

export const CRITICAL_CONTROLS = Object.freeze([
  { id: "CC-GROUND-ENTRY", hazardId: "GROUND_CONTROL", hazardLabel: "Ground control", label: "Workplace ground condition verified before entry" },
  { id: "CC-GROUND-ACCESS", hazardId: "GROUND_CONTROL", hazardLabel: "Ground control", label: "Access restriction / barricading in place" },
  { id: "CC-ENERGY-ISOLATION", hazardId: "ENERGY_ISOLATION", hazardLabel: "Energy isolation", label: "Isolation state verified before electrical work" },
  { id: "CC-MACHINERY-GUARD", hazardId: "MOVING_MACHINERY", hazardLabel: "Moving machinery", label: "Conveyor guarding / access condition verified" },
  { id: "CC-MOBILE-PREUSE", hazardId: "MOBILE_EQUIPMENT", hazardLabel: "Mobile equipment", label: "Pre-use inspection completed" },
  { id: "CC-EMERGENCY-COMMS", hazardId: "EMERGENCY_RESPONSE", hazardLabel: "Emergency response", label: "Emergency communication channel available" }
]);

export const SEVERITIES = Object.freeze([
  { id: "INFO", label: "Information" },
  { id: "LOW", label: "Low" },
  { id: "MEDIUM", label: "Medium" },
  { id: "HIGH", label: "High" },
  { id: "CRITICAL", label: "Critical" }
]);

export const ISSUE_STATUSES = Object.freeze([
  { id: "OPEN", label: "Open" },
  { id: "ACKNOWLEDGED", label: "Acknowledged" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "CLOSED", label: "Closed" }
]);

function byId(list, id) {
  return list.find(item => item.id === id) || null;
}

export const operationById = id => byId(OPERATIONS, id);
export const departmentById = id => byId(DEPARTMENTS, id);
export const areaById = id => byId(AREAS, id);
export const equipmentById = id => byId(EQUIPMENT, id);
export const eventTypeById = id => byId(EVENT_TYPES, id);
export const delayCategoryById = id => byId(DELAY_CATEGORIES, id);
export const criticalControlById = id => byId(CRITICAL_CONTROLS, id);
export const severityById = id => byId(SEVERITIES, id);
export const issueStatusById = id => byId(ISSUE_STATUSES, id);

export function eventTypesForRole(roleCode) {
  return EVENT_TYPES.filter(type => type.roles.includes(roleCode));
}
