import { APP_CONFIG } from "./config.js";
import { SHIFT_INSTANCE } from "./shift.js";
import { reportingObligations, reportingStatus, mayClockOff, submissionFor, overrideFor, observationById } from "./domain.js";
import { areaById, equipmentById, eventTypeById, operationById } from "./masterData.js";

function minutesBetween(start, end) {
  if (!start || !end) return null;
  const delta = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(delta)) return null;
  return Math.max(0, Math.round(delta / 60000));
}

function contextColumns(context = {}) {
  return {
    employeeId: context.employeeId || "",
    employeeNumber: context.employeeNumber || "",
    employeeName: context.employeeName || "",
    jobTitle: context.jobTitle || "",
    reportingRoleId: context.reportingRoleId || "",
    departmentId: context.departmentId || "",
    departmentName: context.departmentName || "",
    employeeHomeAreaId: context.areaId || "",
    employeeHomeAreaName: context.areaName || "",
    employeeOperationId: context.operationId || "",
    employeeOperationName: context.operationName || "",
    supervisorEmployeeNo: context.supervisorEmployeeNo || "",
    shiftGroup: context.shiftGroup || ""
  };
}

function versionColumns(versions = {}) {
  return {
    dataContractVersion: versions.dataContractVersion || "",
    reportSchemaVersion: versions.reportSchemaVersion || "",
    eventTaxonomyVersion: versions.eventTaxonomyVersion || "",
    masterDataVersion: versions.masterDataVersion || ""
  };
}

function provenanceColumns(provenance = {}) {
  return {
    captureChannel: provenance.captureChannel || "",
    capturePointId: provenance.capturePointId || "",
    sourceSystem: provenance.sourceSystem || "",
    sourceRecordId: provenance.sourceRecordId || "",
    importBatchId: provenance.importBatchId || ""
  };
}

export function buildObservationFactRows(state) {
  return (state.observations || []).map(observation => {
    const eventType = eventTypeById(observation.eventTypeId);
    const area = areaById(observation.areaId);
    const equipment = equipmentById(observation.equipmentId);
    const operation = operationById(observation.operationId);

    return {
      observationId: observation.observationId,
      sourceSubmissionId: observation.sourceSubmissionId,
      obligationId: observation.obligationId,
      shiftInstanceId: observation.shiftInstanceId,
      shiftId: observation.shiftId,
      shiftName: APP_CONFIG.shiftName,
      shiftBusinessDate: observation.shiftBusinessDate || APP_CONFIG.shiftBusinessDate,
      shiftStartsAtUtc: SHIFT_INSTANCE.startsAtUtc,
      shiftEndsAtUtc: SHIFT_INSTANCE.endsAtUtc,
      operationTimezone: observation.operationTimezone || APP_CONFIG.operationTimezone,
      ...contextColumns(observation.employeeContext),
      operationId: observation.operationId,
      operationName: operation?.name || observation.employeeContext?.operationName || "",
      areaId: observation.areaId,
      areaCode: area?.code || "",
      areaName: area?.name || "",
      equipmentId: observation.equipmentId || "",
      equipmentCode: equipment?.code || "",
      equipmentName: equipment?.name || "",
      equipmentClass: equipment?.equipmentClass || "",
      eventTypeId: observation.eventTypeId,
      eventTypeName: eventType?.label || "",
      eventCategoryId: eventType?.category || "",
      severityId: observation.severityId,
      actionRequired: Boolean(observation.actionRequired),
      issueId: observation.issueId || "",
      observedAtUtc: observation.observedAtUtc || new Date(observation.observedAt).toISOString(),
      localObservedDate: observation.localObservedDate || "",
      localObservedTime: observation.localObservedTime || "",
      reportedAtUtc: observation.reportedAtUtc || new Date(observation.reportedAt).toISOString(),
      narrative: observation.narrative,
      ...versionColumns(observation.versions),
      ...provenanceColumns(observation.provenance)
    };
  });
}

export function buildCheckFactRows(state) {
  return (state.checkFacts || []).map(check => {
    const equipment = check.subjectType === "EQUIPMENT" ? equipmentById(check.subjectId) : null;
    const area = check.subjectType === "AREA" ? areaById(check.subjectId) : null;
    return {
      checkId: check.checkId,
      sourceSubmissionId: check.sourceSubmissionId,
      obligationId: check.obligationId,
      shiftInstanceId: check.shiftInstanceId,
      shiftId: check.shiftId,
      shiftBusinessDate: APP_CONFIG.shiftBusinessDate,
      ...contextColumns(check.employeeContext),
      questionKey: check.questionKey,
      questionLabel: check.questionLabel,
      factType: check.factType,
      valueType: check.valueType,
      valueCode: check.valueCode ?? "",
      valueLabel: check.valueLabel ?? "",
      valueText: check.valueText ?? "",
      subjectType: check.subjectType,
      subjectId: check.subjectId || "",
      subjectCode: equipment?.code || area?.code || "",
      subjectName: equipment?.name || area?.name || (check.subjectType === "SHIFT" ? APP_CONFIG.shiftName : ""),
      abnormalFlag: Boolean(check.abnormalFlag),
      recordedAtUtc: check.recordedAtUtc || new Date(check.recordedAt).toISOString(),
      ...versionColumns(check.versions),
      ...provenanceColumns(check.provenance)
    };
  });
}

export function buildComplianceFactRows(state) {
  return reportingObligations(state).map(obligation => {
    const context = obligation.employeeContext || {};
    const submission = submissionFor(state, obligation.employeeId);
    const override = overrideFor(state, obligation.employeeId);
    const status = reportingStatus(state, obligation.employeeId);
    const decision = mayClockOff(state, obligation.employeeId);

    return {
      obligationId: obligation.obligationId,
      shiftInstanceId: obligation.shiftInstanceId,
      shiftId: obligation.shiftId,
      shiftName: APP_CONFIG.shiftName,
      shiftBusinessDate: APP_CONFIG.shiftBusinessDate,
      ...contextColumns(context),
      reportingRequired: Boolean(obligation.reportingRequired),
      obligationCreatedFrom: obligation.createdFrom,
      sourceAttendanceId: obligation.sourceAttendanceId || "",
      obligationCreatedAt: obligation.createdAt,
      dueBy: obligation.dueBy,
      reportingStatus: status.toUpperCase(),
      submissionId: submission?.submissionId || "",
      completedAtUtc: submission?.completedAtUtc || null,
      structuredCheckCount: submission?.checkFactIds?.length || 0,
      observationCount: submission?.observationIds?.length || 0,
      issueCount: submission?.issueIds?.length || 0,
      overrideApplied: Boolean(override),
      overrideAt: override?.approvedAt || null,
      overrideApproverEmployeeNumber: override?.approverEmployeeNumber || "",
      overrideReason: override?.reason || "",
      clockOffAllowed: decision.allowed,
      clockOffDecisionCode: decision.code,
      ...versionColumns(obligation.versions)
    };
  });
}

export function buildIssueFactRows(state) {
  return (state.issues || []).map(issue => {
    const observation = observationById(state, issue.primaryObservationId);
    const eventType = eventTypeById(issue.eventTypeId);
    const equipment = equipmentById(issue.equipmentId);
    const area = areaById(issue.areaId);
    const history = Array.isArray(issue.lifecycleHistory) ? issue.lifecycleHistory : [];
    const acknowledgedAt = issue.acknowledgedAt || history.find(item => item.status === "ACKNOWLEDGED")?.at || null;
    const workStartedAt = issue.workStartedAt || history.find(item => item.status === "IN_PROGRESS")?.at || null;
    const resolvedAt = issue.resolvedAt || history.find(item => item.status === "RESOLVED")?.at || null;
    const closedAt = issue.closedAt || history.find(item => item.status === "CLOSED")?.at || null;

    return {
      issueId: issue.issueId,
      title: issue.title,
      currentStatus: issue.currentStatus,
      severityId: issue.severityId,
      eventTypeId: issue.eventTypeId,
      eventTypeName: eventType?.label || "",
      eventCategoryId: eventType?.category || "",
      operationId: issue.operationId,
      areaId: issue.areaId,
      areaName: area?.name || "",
      equipmentId: issue.equipmentId || "",
      equipmentCode: equipment?.code || "",
      primaryObservationId: issue.primaryObservationId,
      observationCount: issue.observationIds?.length || 0,
      openedAtUtc: issue.openedAtUtc || new Date(issue.openedAt).toISOString(),
      acknowledgedAtUtc: acknowledgedAt ? new Date(acknowledgedAt).toISOString() : null,
      workStartedAtUtc: workStartedAt ? new Date(workStartedAt).toISOString() : null,
      resolvedAtUtc: resolvedAt ? new Date(resolvedAt).toISOString() : null,
      closedAtUtc: closedAt ? new Date(closedAt).toISOString() : null,
      minutesToAcknowledge: minutesBetween(issue.openedAt, acknowledgedAt),
      minutesToStartWork: minutesBetween(issue.openedAt, workStartedAt),
      minutesToResolve: minutesBetween(issue.openedAt, resolvedAt),
      primaryReporterEmployeeNumber: observation?.employeeContext?.employeeNumber || "",
      primaryReporterRoleId: observation?.employeeContext?.reportingRoleId || "",
      lifecycleCount: history.length,
      ...versionColumns(issue.versions)
    };
  });
}

export function analyticsDataQuality(state) {
  const observationRows = buildObservationFactRows(state);
  const checkRows = buildCheckFactRows(state);
  const complianceRows = buildComplianceFactRows(state);
  const issueRows = buildIssueFactRows(state);
  const errors = [];

  for (const row of observationRows) {
    if (!row.observationId) errors.push("Observation missing observationId");
    if (!row.employeeNumber) errors.push(`${row.observationId}: frozen employee context missing`);
    if (!row.shiftInstanceId || !row.observedAtUtc) errors.push(`${row.observationId}: shift/time context missing`);
    if (!row.eventTypeName || !row.severityId) errors.push(`${row.observationId}: taxonomy fields missing`);
    if (!row.dataContractVersion || !row.eventTaxonomyVersion) errors.push(`${row.observationId}: version envelope missing`);
  }

  for (const row of checkRows) {
    if (!row.checkId || !row.questionKey) errors.push("Structured check fact missing identity");
    if (!row.employeeNumber || !row.shiftInstanceId) errors.push(`${row.checkId}: analytical context missing`);
  }

  for (const row of complianceRows) {
    if (!row.obligationId || !row.employeeNumber) errors.push("Reporting obligation fact missing identity");
  }

  for (const row of issueRows) {
    if (!row.issueId || !row.primaryObservationId) errors.push("Issue fact missing observation lineage");
  }

  const totalRows = observationRows.length + checkRows.length + complianceRows.length + issueRows.length;
  const completeness = totalRows ? Math.max(0, Math.round(((totalRows - errors.length) / totalRows) * 100)) : 100;
  return { totalRows, completeness, errors, observationRows: observationRows.length, checkRows: checkRows.length, complianceRows: complianceRows.length, issueRows: issueRows.length };
}
