import { APP_CONFIG } from "./config.js";
import { reportingObligations, reportingStatus, mayClockOff, submissionFor, overrideFor, observationById } from "./domain.js";
import { areaById, equipmentById, eventTypeById, operationById } from "./masterData.js";
import { COMMON_SAFETY_FIELDS } from "./reportSchemas.js";
import { shiftById, processStageById, workContextById } from "./operationalModel.js";

function minutesBetween(start, end) {
  if (!start || !end) return null;
  const delta = new Date(end) - new Date(start);
  return Number.isFinite(delta) ? Math.max(0, Math.round(delta / 60000)) : null;
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
    shiftGroup: context.shiftGroup || "",
    assignmentId: context.assignmentId || "",
    assignedAreaId: context.assignedAreaId || "",
    processStageId: context.processStageId || "",
    workContextId: context.workContextId || "",
    teamId: context.teamId || "",
    teamName: context.teamName || ""
  };
}

function versionColumns(versions = {}) {
  return {
    dataContractVersion: versions.dataContractVersion || "",
    reportSchemaVersion: versions.reportSchemaVersion || "",
    eventTaxonomyVersion: versions.eventTaxonomyVersion || "",
    masterDataVersion: versions.masterDataVersion || "",
    processModelVersion: versions.processModelVersion || ""
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
    const event = eventTypeById(observation.eventTypeId);
    const area = areaById(observation.areaId);
    const equipment = equipmentById(observation.equipmentId);
    const operation = operationById(observation.operationId);
    const shift = shiftById(state, observation.shiftInstanceId);

    return {
      observationId: observation.observationId,
      sourceSubmissionId: observation.sourceSubmissionId || "",
      sourceType: observation.sourceType || "SHIFT_HANDOVER",
      obligationId: observation.obligationId || "",
      shiftInstanceId: observation.shiftInstanceId,
      shiftId: observation.shiftId || shift?.shiftId || "",
      shiftName: shift?.shiftName || "",
      shiftBusinessDate: observation.shiftBusinessDate || shift?.businessDate || "",
      shiftStartsAtUtc: shift?.startsAtUtc || "",
      shiftEndsAtUtc: shift?.endsAtUtc || "",
      operationTimezone: observation.operationTimezone || shift?.timezone || APP_CONFIG.operationTimezone,
      ...contextColumns(observation.employeeContext),
      operationId: observation.operationId,
      operationName: operation?.name || observation.employeeContext?.operationName || "",
      areaId: observation.areaId,
      areaCode: area?.code || "",
      areaName: area?.name || "",
      processStageId: observation.processStageId || "",
      processStageName: processStageById(state, observation.processStageId)?.name || "",
      workContextId: observation.workContextId || "",
      workContextName: workContextById(state, observation.workContextId)?.name || "",
      teamId: observation.teamId || "",
      equipmentId: observation.equipmentId || "",
      equipmentCode: equipment?.code || "",
      equipmentName: equipment?.name || "",
      equipmentClass: equipment?.equipmentClass || "",
      eventTypeId: observation.eventTypeId,
      eventTypeName: event?.label || "",
      eventCategoryId: event?.category || "",
      severityId: observation.severityId,
      actionRequired: Boolean(observation.actionRequired),
      signalStatus: observation.signalStatus || "",
      issueId: observation.issueId || "",
      handoverDeliveryId: observation.handoverDeliveryId || "",
      carriedForward: Boolean(observation.handoverDeliveryId),
      observedAtUtc: observation.observedAtUtc || new Date(observation.observedAt).toISOString(),
      localObservedDate: observation.localObservedDate || "",
      localObservedTime: observation.localObservedTime || "",
      reportedAtUtc: observation.reportedAtUtc || new Date(observation.reportedAt).toISOString(),
      narrative: observation.narrative || "",
      ...versionColumns(observation.versions),
      ...provenanceColumns(observation.provenance)
    };
  });
}

export function buildCheckFactRows(state) {
  return (state.checkFacts || []).map(check => {
    const equipment = check.subjectType === "EQUIPMENT" ? equipmentById(check.subjectId) : null;
    const area = check.subjectType === "AREA" ? areaById(check.subjectId) : null;
    const workContext = check.subjectType === "WORK_CONTEXT" ? workContextById(state, check.subjectId) : null;
    const shift = shiftById(state, check.shiftInstanceId);

    return {
      checkId: check.checkId,
      sourceSubmissionId: check.sourceSubmissionId,
      obligationId: check.obligationId,
      shiftInstanceId: check.shiftInstanceId,
      shiftId: check.shiftId || shift?.shiftId || "",
      shiftBusinessDate: shift?.businessDate || "",
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
      subjectCode: equipment?.code || area?.code || workContext?.code || "",
      subjectName: equipment?.name || area?.name || workContext?.name || (check.subjectType === "SHIFT" ? (shift?.shiftName || "") : ""),
      abnormalFlag: Boolean(check.abnormalFlag),
      recordedAtUtc: check.recordedAtUtc || new Date(check.recordedAt).toISOString(),
      ...versionColumns(check.versions),
      ...provenanceColumns(check.provenance)
    };
  });
}

export function buildComplianceFactRows(state) {
  return reportingObligations(state).map(obligation => {
    const submission = submissionFor(state, obligation.employeeId);
    const override = overrideFor(state, obligation.employeeId);
    const status = reportingStatus(state, obligation.employeeId);
    const decision = mayClockOff(state, obligation.employeeId);
    const shift = shiftById(state, obligation.shiftInstanceId);

    return {
      obligationId: obligation.obligationId,
      shiftInstanceId: obligation.shiftInstanceId,
      shiftId: obligation.shiftId || shift?.shiftId || "",
      shiftName: shift?.shiftName || "",
      shiftBusinessDate: shift?.businessDate || "",
      ...contextColumns(obligation.employeeContext || {}),
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
    const event = eventTypeById(issue.eventTypeId);
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
      ownerRole: issue.ownerRole || "",
      assignedTeamId: issue.assignedTeamId || "",
      assignedEmployeeId: issue.assignedEmployeeId || "",
      targetAtUtc: issue.targetAt ? new Date(issue.targetAt).toISOString() : null,
      eventTypeId: issue.eventTypeId,
      eventTypeName: event?.label || "",
      eventCategoryId: event?.category || "",
      operationId: issue.operationId,
      shiftInstanceId: issue.shiftInstanceId || observation?.shiftInstanceId || "",
      areaId: issue.areaId,
      areaName: area?.name || "",
      processStageId: issue.processStageId || observation?.processStageId || "",
      workContextId: issue.workContextId || observation?.workContextId || "",
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
      minutesToResolve: minutesBetween(issue.openedAt, resolvedAt || closedAt),
      resolutionReason: issue.resolutionReason || "",
      resolutionEvidence: issue.resolutionEvidence || "",
      closureReason: issue.closureReason || "",
      verifiedByEmployeeId: issue.verifiedByEmployeeId || "",
      primaryReporterEmployeeNumber: observation?.employeeContext?.employeeNumber || "",
      primaryReporterRoleId: observation?.employeeContext?.reportingRoleId || "",
      lifecycleCount: history.length,
      assignmentCount: issue.assignmentHistory?.length || 0,
      ...versionColumns(issue.versions)
    };
  });
}

export function buildShiftPerformanceFactRows(state) {
  return (state.shiftPerformance || []).map(item => ({
    shiftInstanceId: item.shiftInstanceId,
    operationId: item.operationId || APP_CONFIG.operationId,
    plannedTonnes: Number(item.plannedTonnes || 0),
    actualTonnes: Number(item.actualTonnes || 0),
    planAttainmentPct: Number(item.plannedTonnes || 0) ? Math.round(Number(item.actualTonnes || 0) / Number(item.plannedTonnes || 0) * 100) : 0,
    equipmentAvailabilityPct: Number(item.equipmentAvailabilityPct || 0),
    utilisationPct: Number(item.utilisationPct || 0),
    delayMinutes: Number(item.delayMinutes || 0),
    criticalControlConformancePct: Number(item.criticalControlConformancePct || 0),
    handoverCompliancePct: Number(item.handoverCompliancePct || 0),
    actionClosurePct: Number(item.actionClosurePct || 0),
    sourceType: item.sourceType || "DEMO_INTEGRATION",
    dataContractVersion: APP_CONFIG.dataContractVersion
  }));
}

export function buildDelayEventFactRows(state) {
  return (state.delayEvents || []).map(item => ({
    delayId: item.delayId,
    shiftInstanceId: item.shiftInstanceId || "",
    operationId: item.operationId || "",
    category: item.category,
    timeClass: item.timeClass || "",
    areaId: item.areaId || "",
    equipmentId: item.equipmentId || "",
    delayMinutes: Number(item.minutes || 0),
    estimatedTonnesImpact: Number(item.estimatedTonnesImpact || 0),
    label: item.label || "",
    sourceType: item.sourceType || "DEMO_INTEGRATION",
    dataContractVersion: APP_CONFIG.dataContractVersion
  }));
}

export function buildControlVerificationFactRows(state) {
  return (state.controlVerifications || []).map(item => ({
    verificationId: item.verificationId,
    shiftInstanceId: item.shiftInstanceId || "",
    operationId: item.operationId || "",
    hazardId: item.hazardId || "",
    hazard: item.hazard || "",
    controlId: item.controlId || "",
    control: item.control || "",
    areaId: item.areaId || "",
    status: item.status || "",
    owner: item.owner || "",
    verifiedAtUtc: item.verifiedAt ? new Date(item.verifiedAt).toISOString() : null,
    note: item.note || "",
    sourceType: item.sourceType || "DEMO_INTEGRATION",
    dataContractVersion: APP_CONFIG.dataContractVersion
  }));
}

export function buildHandoverDeliveryFactRows(state) {
  return (state.handoverDeliveries || []).map(item => ({
    ...item,
    acknowledged: Boolean(item.acknowledgedAt),
    dataContractVersion: APP_CONFIG.dataContractVersion
  }));
}

export function buildOperationalStatusFactRows(state) {
  return (state.operationalStatusHistory || []).map(item => ({
    ...item,
    operationId: item.operationId || APP_CONFIG.operationId,
    dataContractVersion: APP_CONFIG.dataContractVersion
  }));
}

export function analyticsDataQuality(state) {
  const groups = {
    observationRows: buildObservationFactRows(state),
    checkRows: buildCheckFactRows(state),
    complianceRows: buildComplianceFactRows(state),
    issueRows: buildIssueFactRows(state),
    performanceRows: buildShiftPerformanceFactRows(state),
    delayRows: buildDelayEventFactRows(state),
    controlRows: buildControlVerificationFactRows(state),
    handoverRows: buildHandoverDeliveryFactRows(state),
    statusRows: buildOperationalStatusFactRows(state)
  };

  const errors = [];
  const ids = {
    shift: new Set((state.shiftInstances || []).map(item => item.shiftInstanceId)),
    stage: new Set((state.processStages || []).map(item => item.id)),
    context: new Set((state.workContexts || []).map(item => item.id)),
    employee: new Set((state.employees || []).map(item => item.id)),
    area: new Set((state.masterData?.areas || []).map(item => item.id)),
    equipment: new Set((state.masterData?.equipment || []).map(item => item.id)),
    event: new Set((state.masterData?.eventTypes || []).map(item => item.id)),
    operation: new Set((state.masterData?.operations || []).map(item => item.id))
  };
  const valid = (set, value) => Boolean(value && set.has(value));

  for (const row of groups.observationRows) {
    if (!row.observationId) errors.push("Observation missing observationId");
    if (!row.employeeNumber) errors.push(`${row.observationId}: frozen employee context missing`);
    if (!valid(ids.shift, row.shiftInstanceId)) errors.push(`${row.observationId}: shift reference invalid`);
    if (!valid(ids.operation, row.operationId)) errors.push(`${row.observationId}: operation reference invalid`);
    if (!valid(ids.area, row.areaId)) errors.push(`${row.observationId}: area reference invalid`);
    if (row.processStageId && !ids.stage.has(row.processStageId)) errors.push(`${row.observationId}: process stage invalid`);
    if (row.workContextId && !ids.context.has(row.workContextId)) errors.push(`${row.observationId}: work context invalid`);
    if (row.equipmentId && !ids.equipment.has(row.equipmentId)) errors.push(`${row.observationId}: equipment reference invalid`);
    if (!valid(ids.event, row.eventTypeId)) errors.push(`${row.observationId}: event taxonomy invalid`);
    if (!row.severityId) errors.push(`${row.observationId}: severity missing`);
    if (!row.dataContractVersion || !row.eventTaxonomyVersion || !row.processModelVersion) errors.push(`${row.observationId}: version envelope missing`);
  }

  for (const row of groups.checkRows) {
    if (!row.checkId || !row.questionKey) errors.push("Structured check fact missing identity");
    if (!row.employeeNumber || !valid(ids.shift, row.shiftInstanceId)) errors.push(`${row.checkId}: analytical context missing`);
    if (row.subjectType === "SHIFT" && row.subjectId && !ids.shift.has(row.subjectId)) errors.push(`${row.checkId}: shift subject invalid`);
    if (row.subjectType === "AREA" && row.subjectId && !ids.area.has(row.subjectId)) errors.push(`${row.checkId}: area subject invalid`);
    if (row.subjectType === "EQUIPMENT" && row.subjectId && !ids.equipment.has(row.subjectId)) errors.push(`${row.checkId}: equipment subject invalid`);
    if (row.subjectType === "WORK_CONTEXT" && row.subjectId && !ids.context.has(row.subjectId)) errors.push(`${row.checkId}: work-context subject invalid`);
  }

  for (const row of groups.complianceRows) {
    if (!row.obligationId || !row.employeeNumber) errors.push("Reporting obligation fact missing identity");
    if (!valid(ids.shift, row.shiftInstanceId)) errors.push(`${row.obligationId}: obligation shift invalid`);
  }

  for (const row of groups.issueRows) {
    if (!row.issueId || !row.primaryObservationId) errors.push("Issue fact missing observation lineage");
    if (!valid(ids.shift, row.shiftInstanceId)) errors.push(`${row.issueId}: shift reference invalid`);
    if (!valid(ids.operation, row.operationId)) errors.push(`${row.issueId}: operation reference invalid`);
    if (!valid(ids.area, row.areaId)) errors.push(`${row.issueId}: area reference invalid`);
    if (row.eventTypeId && !ids.event.has(row.eventTypeId)) errors.push(`${row.issueId}: event taxonomy invalid`);
    if (row.equipmentId && !ids.equipment.has(row.equipmentId)) errors.push(`${row.issueId}: equipment reference invalid`);
    if (row.assignedEmployeeId && !ids.employee.has(row.assignedEmployeeId)) errors.push(`${row.issueId}: assigned employee invalid`);
    if (row.processStageId && !ids.stage.has(row.processStageId)) errors.push(`${row.issueId}: process stage invalid`);
    if (row.workContextId && !ids.context.has(row.workContextId)) errors.push(`${row.issueId}: work context invalid`);
    if (!["OPEN", "IN_PROGRESS", "CLOSED"].includes(row.currentStatus)) errors.push(`${row.issueId}: issue status outside restrained lifecycle`);
  }

  for (const row of groups.performanceRows) {
    if (!valid(ids.shift, row.shiftInstanceId) || !valid(ids.operation, row.operationId)) errors.push(`${row.shiftInstanceId || "Shift performance"}: grain identity invalid`);
  }

  for (const row of groups.delayRows) {
    if (!row.delayId || !row.category || !valid(ids.shift, row.shiftInstanceId) || !valid(ids.operation, row.operationId)) errors.push(`${row.delayId || "Delay"}: delay grain invalid`);
    if (row.areaId && !ids.area.has(row.areaId)) errors.push(`${row.delayId}: delay area invalid`);
    if (row.equipmentId && !ids.equipment.has(row.equipmentId)) errors.push(`${row.delayId}: delay equipment invalid`);
  }

  for (const row of groups.controlRows) {
    if (!row.verificationId || !row.status || !row.control || !valid(ids.shift, row.shiftInstanceId) || !valid(ids.operation, row.operationId)) errors.push(`${row.verificationId || "Control"}: control grain invalid`);
    if (row.areaId && !ids.area.has(row.areaId)) errors.push(`${row.verificationId}: control area invalid`);
  }

  // Regression guard: every common safety answer that is actually supplied must survive as a structured fact.
  for (const submission of state.submissions || []) {
    for (const field of COMMON_SAFETY_FIELDS) {
      const value = submission.answers?.[field.key];
      if (value === undefined || value === null || String(value).trim() === "") continue;
      if (!(state.checkFacts || []).some(check => check.sourceSubmissionId === submission.submissionId && check.questionKey === field.key)) {
        errors.push(`${submission.submissionId}: safety answer ${field.key} missing structured fact`);
      }
    }
  }

  for (const row of groups.handoverRows) {
    if (!row.deliveryId || !row.sourceEmployeeId || !ids.employee.has(row.sourceEmployeeId)) errors.push(`${row.deliveryId || "Handover"}: source identity invalid`);
    if (row.sourceShiftInstanceId && !ids.shift.has(row.sourceShiftInstanceId)) errors.push(`${row.deliveryId}: source shift invalid`);
    if (row.targetShiftInstanceId && !ids.shift.has(row.targetShiftInstanceId)) errors.push(`${row.deliveryId}: target shift invalid`);
    if (row.sourceShiftInstanceId && row.targetShiftInstanceId && row.sourceShiftInstanceId === row.targetShiftInstanceId) errors.push(`${row.deliveryId}: handover targets its source shift`);
    if (row.targetEmployeeId && !ids.employee.has(row.targetEmployeeId)) errors.push(`${row.deliveryId}: target employee invalid`);
    if (row.acknowledgedByEmployeeId && !ids.employee.has(row.acknowledgedByEmployeeId)) errors.push(`${row.deliveryId}: acknowledgement employee invalid`);
    if (row.areaId && !ids.area.has(row.areaId)) errors.push(`${row.deliveryId}: handover area invalid`);
    if (row.targetAreaId && !ids.area.has(row.targetAreaId)) errors.push(`${row.deliveryId}: target area invalid`);
    if (row.processStageId && !ids.stage.has(row.processStageId)) errors.push(`${row.deliveryId}: handover process stage invalid`);
    if (row.workContextId && !ids.context.has(row.workContextId)) errors.push(`${row.deliveryId}: handover work context invalid`);
    for (const observationId of row.carriedObservationIds || []) {
      if (!(state.observations || []).some(observation => observation.observationId === observationId)) errors.push(`${row.deliveryId}: carried observation ${observationId} missing`);
    }
  }

  for (const row of groups.statusRows) {
    if (!row.statusEventId || !valid(ids.operation, row.operationId)) errors.push(`${row.statusEventId || "Operational status"}: status history reference invalid`);
  }

  const totalRows = Object.values(groups).reduce((count, rows) => count + rows.length, 0);
  const completeness = totalRows ? Math.max(0, Math.round((totalRows - errors.length) / totalRows * 100)) : 100;
  return {
    totalRows,
    completeness,
    errors,
    ...Object.fromEntries(Object.entries(groups).map(([key, rows]) => [key, rows.length]))
  };
}
