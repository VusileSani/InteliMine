import { APP_CONFIG } from "./config.js";
import { operationById, departmentById, areaById } from "./masterData.js";

export const EMPLOYEES = Object.freeze([
  {
    id: "emp_104782", employeeNumber: "104782", pin: "1111", firstName: "Thabo", lastName: "Mokoena",
    jobTitle: "Engineering Artisan Mechanical UG", reportingRole: "FITTER",
    departmentId: "DEPT-ENG", areaId: "AREA-SEC3", operationId: "OP-SITE01",
    supervisorEmployeeNo: "107199", employmentStatus: "ACTIVE", shiftGroup: "B", workLocation: "Underground",
    badgeId: "CARD-104782", mobileNumber: "", email: "", sourceSystem: "HR_MASTER", sourceRecordId: "104782",
    effectiveFrom: "2026-01-01", effectiveTo: "", lastUpdatedAt: "2026-09-05T18:00:00+02:00"
  },
  {
    id: "emp_105310", employeeNumber: "105310", pin: "2222", firstName: "Sipho", lastName: "Dlamini",
    jobTitle: "Engineering Artisan Electrical UG", reportingRole: "ELECTRICIAN",
    departmentId: "DEPT-ENG", areaId: "AREA-SEC3", operationId: "OP-SITE01",
    supervisorEmployeeNo: "107199", employmentStatus: "ACTIVE", shiftGroup: "B", workLocation: "Underground",
    badgeId: "CARD-105310", mobileNumber: "", email: "", sourceSystem: "HR_MASTER", sourceRecordId: "105310",
    effectiveFrom: "2026-01-01", effectiveTo: "", lastUpdatedAt: "2026-09-05T18:00:00+02:00"
  },
  {
    id: "emp_106004", employeeNumber: "106004", pin: "3333", firstName: "Lerato", lastName: "Maseko",
    jobTitle: "Safety Officer UG", reportingRole: "SAFETY_OFFICER",
    departmentId: "DEPT-SAF", areaId: "AREA-SEC3", operationId: "OP-SITE01",
    supervisorEmployeeNo: "107199", employmentStatus: "ACTIVE", shiftGroup: "B", workLocation: "Underground",
    badgeId: "CARD-106004", mobileNumber: "", email: "", sourceSystem: "HR_MASTER", sourceRecordId: "106004",
    effectiveFrom: "2026-01-01", effectiveTo: "", lastUpdatedAt: "2026-09-05T18:00:00+02:00"
  },
  {
    id: "emp_107199", employeeNumber: "107199", pin: "4444", firstName: "Mandla", lastName: "Khumalo",
    jobTitle: "Shiftboss Mining", reportingRole: "SUPERVISOR",
    departmentId: "DEPT-PROD", areaId: "AREA-SEC3", operationId: "OP-SITE01",
    supervisorEmployeeNo: "", employmentStatus: "ACTIVE", shiftGroup: "B", workLocation: "Underground",
    badgeId: "CARD-107199", mobileNumber: "", email: "", sourceSystem: "HR_MASTER", sourceRecordId: "107199",
    effectiveFrom: "2026-01-01", effectiveTo: "", lastUpdatedAt: "2026-09-05T18:00:00+02:00"
  },
  {
    id: "emp_108022", employeeNumber: "108022", pin: "5555", firstName: "Nandi", lastName: "Cele",
    jobTitle: "Rock Drill Operator", reportingRole: "OPERATOR",
    departmentId: "DEPT-PROD", areaId: "AREA-PANEL-B", operationId: "OP-SITE01",
    supervisorEmployeeNo: "107199", employmentStatus: "ACTIVE", shiftGroup: "B", workLocation: "Underground",
    badgeId: "CARD-108022", mobileNumber: "", email: "", sourceSystem: "HR_MASTER", sourceRecordId: "108022",
    effectiveFrom: "2026-01-01", effectiveTo: "", lastUpdatedAt: "2026-09-05T18:00:00+02:00"
  }
]);

function employeeSnapshot(employeeId) {
  const employee = EMPLOYEES.find(item => item.id === employeeId);
  if (!employee) return null;
  return {
    employeeId: employee.id,
    employeeNumber: employee.employeeNumber,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    jobTitle: employee.jobTitle,
    reportingRoleId: employee.reportingRole,
    departmentId: employee.departmentId,
    departmentName: departmentById(employee.departmentId)?.name || employee.departmentId,
    areaId: employee.areaId,
    areaName: areaById(employee.areaId)?.name || employee.areaId,
    operationId: employee.operationId,
    operationName: operationById(employee.operationId)?.name || employee.operationId,
    supervisorEmployeeNo: employee.supervisorEmployeeNo,
    shiftGroup: employee.shiftGroup,
    workLocation: employee.workLocation,
    employeeMasterEffectiveFrom: employee.effectiveFrom,
    employeeMasterLastUpdatedAt: employee.lastUpdatedAt
  };
}

function versions() {
  return {
    dataContractVersion: APP_CONFIG.dataContractVersion,
    reportSchemaVersion: APP_CONFIG.reportSchemaVersion,
    eventTaxonomyVersion: APP_CONFIG.eventTaxonomyVersion,
    masterDataVersion: APP_CONFIG.masterDataVersion
  };
}

function provenance(channel = "KIOSK", capturePointId = "KIOSK-SEC3-01") {
  return {
    captureChannel: channel,
    capturePointId,
    sourceSystem: "INTELIMINE_CAPTURE",
    sourceRecordId: null,
    importBatchId: null
  };
}

export const INITIAL_ATTENDANCE = Object.freeze([
  { attendanceId: "ATT-104782", employeeId: "emp_104782", shiftInstanceId: APP_CONFIG.shiftInstanceId, clockedIn: true, clockInAt: "2026-09-05T18:01:00+02:00", sourceSystem: "T_AND_A" },
  { attendanceId: "ATT-105310", employeeId: "emp_105310", shiftInstanceId: APP_CONFIG.shiftInstanceId, clockedIn: true, clockInAt: "2026-09-05T17:58:00+02:00", sourceSystem: "T_AND_A" },
  { attendanceId: "ATT-106004", employeeId: "emp_106004", shiftInstanceId: APP_CONFIG.shiftInstanceId, clockedIn: true, clockInAt: "2026-09-05T18:03:00+02:00", sourceSystem: "T_AND_A" },
  { attendanceId: "ATT-107199", employeeId: "emp_107199", shiftInstanceId: APP_CONFIG.shiftInstanceId, clockedIn: true, clockInAt: "2026-09-05T17:49:00+02:00", sourceSystem: "T_AND_A" },
  { attendanceId: "ATT-108022", employeeId: "emp_108022", shiftInstanceId: APP_CONFIG.shiftInstanceId, clockedIn: true, clockInAt: "2026-09-05T18:05:00+02:00", sourceSystem: "T_AND_A" }
]);

export const INITIAL_REPORTING_OBLIGATIONS = Object.freeze(INITIAL_ATTENDANCE.map(entry => ({
  obligationId: `OBL-${APP_CONFIG.shiftInstanceId}-${entry.employeeId.replace("emp_", "")}`,
  shiftInstanceId: APP_CONFIG.shiftInstanceId,
  shiftId: APP_CONFIG.shiftId,
  employeeId: entry.employeeId,
  reportingRequired: true,
  createdAt: entry.clockInAt,
  createdFrom: "ATTENDANCE_CLOCK_IN",
  sourceAttendanceId: entry.attendanceId,
  dueBy: APP_CONFIG.shiftEndLocal,
  employeeContext: employeeSnapshot(entry.employeeId),
  versions: versions()
})));

const THABO_OBLIGATION = "OBL-SHIFT-NS-20260905-104782";
const LERATO_OBLIGATION = "OBL-SHIFT-NS-20260905-106004";

export const INITIAL_SUBMISSIONS = Object.freeze([
  {
    submissionId: "SUB-20260905-104782",
    obligationId: THABO_OBLIGATION,
    employeeId: "emp_104782",
    shiftInstanceId: APP_CONFIG.shiftInstanceId,
    shiftId: APP_CONFIG.shiftId,
    status: "COMPLETE",
    completedAt: "2026-09-05T18:47:00+02:00",
    completedAtUtc: "2026-09-05T16:47:00.000Z",
    observationDeclared: true,
    observationIds: ["OBS-20260905-0001"],
    issueIds: ["ISS-20260905-0001"],
    checkFactIds: ["CHK-THABO-EQ", "CHK-THABO-COND", "CHK-THABO-CONCERN", "CHK-THABO-WORK", "CHK-THABO-HANDOVER"],
    answers: {
      equipmentWorkedOnId: "EQ-CV04",
      generalCondition: "ATTENTION_REQUIRED",
      equipmentConcern: "yes",
      outstandingWork: "Inspect bearing alignment on next shift",
      handoverNote: "Monitor CV-04 before full load"
    },
    employeeContext: employeeSnapshot("emp_104782"),
    versions: versions(),
    provenance: provenance()
  },
  {
    submissionId: "SUB-20260905-106004",
    obligationId: LERATO_OBLIGATION,
    employeeId: "emp_106004",
    shiftInstanceId: APP_CONFIG.shiftInstanceId,
    shiftId: APP_CONFIG.shiftId,
    status: "COMPLETE",
    completedAt: "2026-09-05T18:42:00+02:00",
    completedAtUtc: "2026-09-05T16:42:00.000Z",
    observationDeclared: true,
    observationIds: ["OBS-20260905-0002"],
    issueIds: ["ISS-20260905-0002"],
    checkFactIds: ["CHK-LERATO-HAZ", "CHK-LERATO-INC", "CHK-LERATO-CTRL", "CHK-LERATO-OUT", "CHK-LERATO-HANDOVER"],
    answers: {
      hazardsObserved: "yes",
      incidentOrNearMiss: "no",
      correctiveAction: "Area barricaded and supervisor informed",
      outstandingSafety: "yes",
      handoverNote: "Re-inspection required before next entry"
    },
    employeeContext: employeeSnapshot("emp_106004"),
    versions: versions(),
    provenance: provenance()
  }
]);

function checkFact({ checkId, submissionId, obligationId, employeeId, questionKey, questionLabel, valueCode = null, valueText = null, valueType, subjectType = "SHIFT", subjectId = APP_CONFIG.shiftInstanceId, abnormalFlag = false, recordedAt }) {
  return {
    checkId, sourceSubmissionId: submissionId, obligationId, employeeId,
    shiftInstanceId: APP_CONFIG.shiftInstanceId, shiftId: APP_CONFIG.shiftId,
    questionKey, questionLabel, valueCode, valueText, valueType,
    subjectType, subjectId, abnormalFlag,
    recordedAt, recordedAtUtc: new Date(recordedAt).toISOString(),
    employeeContext: employeeSnapshot(employeeId), versions: versions(), provenance: provenance()
  };
}

export const INITIAL_CHECK_FACTS = Object.freeze([
  checkFact({ checkId: "CHK-THABO-EQ", submissionId: "SUB-20260905-104782", obligationId: THABO_OBLIGATION, employeeId: "emp_104782", questionKey: "equipmentWorkedOnId", questionLabel: "Primary equipment worked on", valueCode: "EQ-CV04", valueType: "EQUIPMENT", subjectType: "EQUIPMENT", subjectId: "EQ-CV04", recordedAt: "2026-09-05T18:47:00+02:00" }),
  checkFact({ checkId: "CHK-THABO-COND", submissionId: "SUB-20260905-104782", obligationId: THABO_OBLIGATION, employeeId: "emp_104782", questionKey: "generalCondition", questionLabel: "General equipment condition at handover", valueCode: "ATTENTION_REQUIRED", valueType: "CODE", subjectType: "EQUIPMENT", subjectId: "EQ-CV04", abnormalFlag: true, recordedAt: "2026-09-05T18:47:00+02:00" }),
  checkFact({ checkId: "CHK-THABO-CONCERN", submissionId: "SUB-20260905-104782", obligationId: THABO_OBLIGATION, employeeId: "emp_104782", questionKey: "equipmentConcern", questionLabel: "Any equipment concern observed?", valueCode: "yes", valueType: "BOOLEAN_CODE", subjectType: "EQUIPMENT", subjectId: "EQ-CV04", abnormalFlag: true, recordedAt: "2026-09-05T18:47:00+02:00" }),
  checkFact({ checkId: "CHK-THABO-WORK", submissionId: "SUB-20260905-104782", obligationId: THABO_OBLIGATION, employeeId: "emp_104782", questionKey: "outstandingWork", questionLabel: "Outstanding work", valueText: "Inspect bearing alignment on next shift", valueType: "TEXT", subjectType: "EQUIPMENT", subjectId: "EQ-CV04", abnormalFlag: true, recordedAt: "2026-09-05T18:47:00+02:00" }),
  checkFact({ checkId: "CHK-THABO-HANDOVER", submissionId: "SUB-20260905-104782", obligationId: THABO_OBLIGATION, employeeId: "emp_104782", questionKey: "handoverNote", questionLabel: "Handover note", valueText: "Monitor CV-04 before full load", valueType: "TEXT", subjectType: "EQUIPMENT", subjectId: "EQ-CV04", abnormalFlag: false, recordedAt: "2026-09-05T18:47:00+02:00" }),
  checkFact({ checkId: "CHK-LERATO-HAZ", submissionId: "SUB-20260905-106004", obligationId: LERATO_OBLIGATION, employeeId: "emp_106004", questionKey: "hazardsObserved", questionLabel: "Any hazards identified?", valueCode: "yes", valueType: "BOOLEAN_CODE", abnormalFlag: true, recordedAt: "2026-09-05T18:42:00+02:00" }),
  checkFact({ checkId: "CHK-LERATO-INC", submissionId: "SUB-20260905-106004", obligationId: LERATO_OBLIGATION, employeeId: "emp_106004", questionKey: "incidentOrNearMiss", questionLabel: "Any incident or near miss?", valueCode: "no", valueType: "BOOLEAN_CODE", abnormalFlag: false, recordedAt: "2026-09-05T18:42:00+02:00" }),
  checkFact({ checkId: "CHK-LERATO-CTRL", submissionId: "SUB-20260905-106004", obligationId: LERATO_OBLIGATION, employeeId: "emp_106004", questionKey: "correctiveAction", questionLabel: "Corrective action / controls applied", valueText: "Area barricaded and supervisor informed", valueType: "TEXT", abnormalFlag: true, recordedAt: "2026-09-05T18:42:00+02:00" }),
  checkFact({ checkId: "CHK-LERATO-OUT", submissionId: "SUB-20260905-106004", obligationId: LERATO_OBLIGATION, employeeId: "emp_106004", questionKey: "outstandingSafety", questionLabel: "Outstanding safety concern?", valueCode: "yes", valueType: "BOOLEAN_CODE", abnormalFlag: true, recordedAt: "2026-09-05T18:42:00+02:00" }),
  checkFact({ checkId: "CHK-LERATO-HANDOVER", submissionId: "SUB-20260905-106004", obligationId: LERATO_OBLIGATION, employeeId: "emp_106004", questionKey: "handoverNote", questionLabel: "Safety handover note", valueText: "Re-inspection required before next entry", valueType: "TEXT", abnormalFlag: false, recordedAt: "2026-09-05T18:42:00+02:00" })
]);

export const INITIAL_OBSERVATIONS = Object.freeze([
  {
    observationId: "OBS-20260905-0001", sourceSubmissionId: "SUB-20260905-104782", obligationId: THABO_OBLIGATION,
    employeeId: "emp_104782", shiftInstanceId: APP_CONFIG.shiftInstanceId, shiftId: APP_CONFIG.shiftId,
    areaId: "AREA-CONVEYOR", equipmentId: "EQ-CV04", eventTypeId: "EVT-VIBRATION", severityId: "MEDIUM",
    actionRequired: true, observedAt: "2026-09-05T18:35:00+02:00", observedAtUtc: "2026-09-05T16:35:00.000Z",
    localObservedDate: "2026-09-05", localObservedTime: "18:35", reportedAt: "2026-09-05T18:47:00+02:00", reportedAtUtc: "2026-09-05T16:47:00.000Z",
    narrative: "Abnormal vibration near drive pulley. Inspect bearing alignment before full load.", issueId: "ISS-20260905-0001",
    employeeContext: employeeSnapshot("emp_104782"), versions: versions(), provenance: provenance()
  },
  {
    observationId: "OBS-20260905-0002", sourceSubmissionId: "SUB-20260905-106004", obligationId: LERATO_OBLIGATION,
    employeeId: "emp_106004", shiftInstanceId: APP_CONFIG.shiftInstanceId, shiftId: APP_CONFIG.shiftId,
    areaId: "AREA-PANEL-B", equipmentId: null, eventTypeId: "EVT-HAZARD", severityId: "HIGH",
    actionRequired: true, observedAt: "2026-09-05T18:28:00+02:00", observedAtUtc: "2026-09-05T16:28:00.000Z",
    localObservedDate: "2026-09-05", localObservedTime: "18:28", reportedAt: "2026-09-05T18:42:00+02:00", reportedAtUtc: "2026-09-05T16:42:00.000Z",
    narrative: "Loose rock observed near Panel B access. Area barricaded; re-inspection required before next entry.", issueId: "ISS-20260905-0002",
    employeeContext: employeeSnapshot("emp_106004"), versions: versions(), provenance: provenance()
  }
]);

export const INITIAL_ISSUES = Object.freeze([
  {
    issueId: "ISS-20260905-0001", title: "CV-04 abnormal vibration", operationId: "OP-SITE01", areaId: "AREA-CONVEYOR", equipmentId: "EQ-CV04",
    eventTypeId: "EVT-VIBRATION", severityId: "MEDIUM", currentStatus: "OPEN", ownerRole: "Engineering Supervisor", targetAt: "2026-09-05T20:47:00+02:00", openedAt: "2026-09-05T18:47:00+02:00",
    openedAtUtc: "2026-09-05T16:47:00.000Z", primaryObservationId: "OBS-20260905-0001", observationIds: ["OBS-20260905-0001"],
    lifecycleHistory: [{ status: "OPEN", at: "2026-09-05T18:47:00+02:00", actorId: "emp_104782", reason: "Created from structured observation" }],
    versions: versions()
  },
  {
    issueId: "ISS-20260905-0002", title: "Panel B loose rock hazard", operationId: "OP-SITE01", areaId: "AREA-PANEL-B", equipmentId: null,
    eventTypeId: "EVT-HAZARD", severityId: "HIGH", currentStatus: "ACKNOWLEDGED", ownerRole: "Shift Supervisor", targetAt: "2026-09-05T19:12:00+02:00", openedAt: "2026-09-05T18:42:00+02:00",
    openedAtUtc: "2026-09-05T16:42:00.000Z", primaryObservationId: "OBS-20260905-0002", observationIds: ["OBS-20260905-0002"],
    acknowledgedAt: "2026-09-05T18:51:00+02:00",
    lifecycleHistory: [
      { status: "OPEN", at: "2026-09-05T18:42:00+02:00", actorId: "emp_106004", reason: "Created from structured observation" },
      { status: "ACKNOWLEDGED", at: "2026-09-05T18:51:00+02:00", actorId: "emp_107199", reason: "Supervisor acknowledged" }
    ],
    versions: versions()
  }
]);

export const INITIAL_INTEGRATION_BATCHES = Object.freeze([
  {
    batchId: "IMP-EMP-20260905-001", entityType: "EMPLOYEE_MASTER", sourceSystem: "HR_MASTER", receivedAt: "2026-09-05T15:00:00+02:00",
    status: "APPLIED", receivedCount: 5, validCount: 5, rejectedCount: 0, appliedCount: 5,
    stages: [
      { status: "RECEIVED", at: "2026-09-05T15:00:00+02:00" },
      { status: "VALIDATED", at: "2026-09-05T15:00:04+02:00" },
      { status: "APPLIED", at: "2026-09-05T15:00:06+02:00" }
    ]
  },
  {
    batchId: "IMP-EQP-20260905-001", entityType: "EQUIPMENT_MASTER", sourceSystem: "ASSET_MASTER", receivedAt: "2026-09-05T15:10:00+02:00",
    status: "REJECTED", receivedCount: 5, validCount: 4, rejectedCount: 1, appliedCount: 0,
    errorSummary: "1 record rejected: missing canonical equipment code",
    stages: [
      { status: "RECEIVED", at: "2026-09-05T15:10:00+02:00" },
      { status: "VALIDATED", at: "2026-09-05T15:10:03+02:00" },
      { status: "REJECTED", at: "2026-09-05T15:10:04+02:00" }
    ]
  }
]);
