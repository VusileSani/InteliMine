import { APP_CONFIG } from "./config.js";

export const SHIFT_PERFORMANCE_HISTORY = Object.freeze([
  {
    shiftInstanceId: "SHIFT-DS-20260902", label: "02 Sep · Day", plannedTonnes: 1240, actualTonnes: 1165,
    equipmentAvailabilityPct: 86, utilisationPct: 76, delayMinutes: 61, criticalControlConformancePct: 96,
    handoverCompliancePct: 100, actionClosurePct: 88,
    lossBreakdown: { EQUIPMENT: 29, GROUND: 12, PEOPLE: 8, SERVICES: 12 }
  },
  {
    shiftInstanceId: "SHIFT-NS-20260902", label: "02 Sep · Night", plannedTonnes: 1220, actualTonnes: 1189,
    equipmentAvailabilityPct: 89, utilisationPct: 80, delayMinutes: 43, criticalControlConformancePct: 98,
    handoverCompliancePct: 96, actionClosurePct: 91,
    lossBreakdown: { EQUIPMENT: 18, GROUND: 7, PEOPLE: 6, SERVICES: 12 }
  },
  {
    shiftInstanceId: "SHIFT-DS-20260903", label: "03 Sep · Day", plannedTonnes: 1260, actualTonnes: 1197,
    equipmentAvailabilityPct: 87, utilisationPct: 77, delayMinutes: 58, criticalControlConformancePct: 97,
    handoverCompliancePct: 100, actionClosurePct: 92,
    lossBreakdown: { EQUIPMENT: 24, GROUND: 13, PEOPLE: 9, SERVICES: 12 }
  },
  {
    shiftInstanceId: "SHIFT-NS-20260903", label: "03 Sep · Night", plannedTonnes: 1230, actualTonnes: 1138,
    equipmentAvailabilityPct: 84, utilisationPct: 73, delayMinutes: 76, criticalControlConformancePct: 94,
    handoverCompliancePct: 92, actionClosurePct: 85,
    lossBreakdown: { EQUIPMENT: 33, GROUND: 22, PEOPLE: 11, SERVICES: 10 }
  },
  {
    shiftInstanceId: "SHIFT-DS-20260904", label: "04 Sep · Day", plannedTonnes: 1260, actualTonnes: 1216,
    equipmentAvailabilityPct: 90, utilisationPct: 81, delayMinutes: 39, criticalControlConformancePct: 100,
    handoverCompliancePct: 100, actionClosurePct: 94,
    lossBreakdown: { EQUIPMENT: 15, GROUND: 8, PEOPLE: 6, SERVICES: 10 }
  },
  {
    shiftInstanceId: "SHIFT-NS-20260904", label: "04 Sep · Night", plannedTonnes: 1230, actualTonnes: 1096,
    equipmentAvailabilityPct: 81, utilisationPct: 70, delayMinutes: 103, criticalControlConformancePct: 92,
    handoverCompliancePct: 88, actionClosurePct: 81,
    lossBreakdown: { EQUIPMENT: 47, GROUND: 31, PEOPLE: 15, SERVICES: 10 }
  },
  {
    shiftInstanceId: "SHIFT-DS-20260905", label: "05 Sep · Day", plannedTonnes: 1260, actualTonnes: 1221,
    equipmentAvailabilityPct: 91, utilisationPct: 82, delayMinutes: 36, criticalControlConformancePct: 98,
    handoverCompliancePct: 100, actionClosurePct: 93,
    lossBreakdown: { EQUIPMENT: 14, GROUND: 8, PEOPLE: 5, SERVICES: 9 }
  },
  {
    shiftInstanceId: APP_CONFIG.shiftInstanceId, label: "05 Sep · Night", plannedTonnes: 1250, actualTonnes: 1088,
    equipmentAvailabilityPct: 82, utilisationPct: 72, delayMinutes: 94, criticalControlConformancePct: 83,
    handoverCompliancePct: null, actionClosurePct: 74,
    lossBreakdown: { EQUIPMENT: 31, GROUND: 42, PEOPLE: 21, SERVICES: 0 }
  }
]);

export const CURRENT_DELAY_EVENTS = Object.freeze([
  {
    delayId: "DLY-20260905-001",
    shiftInstanceId: APP_CONFIG.shiftInstanceId, operationId: APP_CONFIG.operationId,
    category: "GROUND",
    label: "Ground condition clearance",
    minutes: 42,
    estimatedTonnesImpact: 74,
    areaId: "AREA-PANEL-B",
    equipmentId: null,
    timeClass: "Operational delay"
  },
  {
    delayId: "DLY-20260905-002",
    shiftInstanceId: APP_CONFIG.shiftInstanceId, operationId: APP_CONFIG.operationId,
    category: "EQUIPMENT",
    label: "CV-04 engineering stop",
    minutes: 31,
    estimatedTonnesImpact: 56,
    areaId: "AREA-CONVEYOR",
    equipmentId: "EQ-CV04",
    timeClass: "Unscheduled maintenance"
  },
  {
    delayId: "DLY-20260905-003",
    shiftInstanceId: APP_CONFIG.shiftInstanceId, operationId: APP_CONFIG.operationId,
    category: "PEOPLE",
    label: "Crew reassignment",
    minutes: 21,
    estimatedTonnesImpact: 32,
    areaId: "AREA-SEC3",
    equipmentId: null,
    timeClass: "Operational delay"
  }
]);

export const CRITICAL_CONTROL_VERIFICATIONS = Object.freeze([
  {
    verificationId: "CCV-20260905-001",
    shiftInstanceId: APP_CONFIG.shiftInstanceId, operationId: APP_CONFIG.operationId,
    controlId: "CC-GROUND-ENTRY",
    hazardId: "GROUND_CONTROL",
    hazard: "Ground control",
    control: "Workplace ground condition verified before entry",
    areaId: "AREA-PANEL-B",
    status: "EXCEPTION",
    verifiedAt: "2026-09-05T18:26:00+02:00",
    owner: "Shift Supervisor",
    note: "Loose rock identified at Panel B access. Area barricaded pending re-inspection."
  },
  {
    verificationId: "CCV-20260905-002",
    shiftInstanceId: APP_CONFIG.shiftInstanceId, operationId: APP_CONFIG.operationId,
    controlId: "CC-GROUND-ACCESS",
    hazardId: "GROUND_CONTROL",
    hazard: "Ground control",
    control: "Access restriction / barricading in place",
    areaId: "AREA-PANEL-B",
    status: "PASS",
    verifiedAt: "2026-09-05T18:31:00+02:00",
    owner: "Shift Supervisor",
    note: "Access restricted after hazard identification."
  },
  {
    verificationId: "CCV-20260905-003",
    shiftInstanceId: APP_CONFIG.shiftInstanceId, operationId: APP_CONFIG.operationId,
    controlId: "CC-ENERGY-ISOLATION",
    hazardId: "ENERGY_ISOLATION",
    hazard: "Energy isolation",
    control: "Isolation state verified before electrical work",
    areaId: "AREA-SEC3",
    status: "PASS",
    verifiedAt: "2026-09-05T18:12:00+02:00",
    owner: "Engineering Supervisor",
    note: "Isolation verification complete."
  },
  {
    verificationId: "CCV-20260905-004",
    shiftInstanceId: APP_CONFIG.shiftInstanceId, operationId: APP_CONFIG.operationId,
    controlId: "CC-MACHINERY-GUARD",
    hazardId: "MOVING_MACHINERY",
    hazard: "Moving machinery",
    control: "Conveyor guarding / access condition verified",
    areaId: "AREA-CONVEYOR",
    status: "PASS",
    verifiedAt: "2026-09-05T18:16:00+02:00",
    owner: "Engineering Supervisor",
    note: "Guarding condition confirmed."
  },
  {
    verificationId: "CCV-20260905-005",
    shiftInstanceId: APP_CONFIG.shiftInstanceId, operationId: APP_CONFIG.operationId,
    controlId: "CC-MOBILE-PREUSE",
    hazardId: "MOBILE_EQUIPMENT",
    hazard: "Mobile equipment",
    control: "Pre-use inspection completed",
    areaId: "AREA-SEC3",
    status: "PASS",
    verifiedAt: "2026-09-05T18:08:00+02:00",
    owner: "Production Supervisor",
    note: "No stop-work defects recorded."
  },
  {
    verificationId: "CCV-20260905-006",
    shiftInstanceId: APP_CONFIG.shiftInstanceId, operationId: APP_CONFIG.operationId,
    controlId: "CC-EMERGENCY-COMMS",
    hazardId: "EMERGENCY_RESPONSE",
    hazard: "Emergency response",
    control: "Emergency communication channel available",
    areaId: "AREA-SEC3",
    status: "PASS",
    verifiedAt: "2026-09-05T18:05:00+02:00",
    owner: "Shift Supervisor",
    note: "Communication check passed."
  }
]);

export const LOSS_CATEGORY_LABELS = Object.freeze({
  EQUIPMENT: "Equipment / engineering",
  GROUND: "Ground conditions",
  PEOPLE: "People / crew",
  SERVICES: "Services / infrastructure"
});
