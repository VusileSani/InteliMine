import { APP_CONFIG } from "./config.js";
import { reportSchemaForRole } from "./reportSchemas.js";
import { eventTypeById, equipmentById, areaById } from "./masterData.js";
import { resolveObservedTimestamp } from "./shift.js";
import { snapshotEmployeeContext, versionEnvelope, captureProvenance } from "./context.js";

function randomToken() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().split("-")[0].toUpperCase();
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function answerLabel(field, value) {
  return field.options?.find(option => option.value === value)?.label || null;
}

function subjectFor(field, answers, employee) {
  const analytics = field.analytics || {};
  if (analytics.subjectFromValue) return { subjectType: analytics.subjectType || "VALUE", subjectId: answers[field.key] || null };
  if (analytics.subjectFromAnswer) return { subjectType: analytics.subjectType || "REFERENCE", subjectId: answers[analytics.subjectFromAnswer] || null };
  if (analytics.subjectType === "AREA") return { subjectType: "AREA", subjectId: employee.areaId };
  if (analytics.subjectType === "SHIFT") return { subjectType: "SHIFT", subjectId: APP_CONFIG.shiftInstanceId };
  return { subjectType: analytics.subjectType || "SHIFT", subjectId: APP_CONFIG.shiftInstanceId };
}

function createCheckFacts({ employee, obligation, submissionId, answers, completedAt, provenance }) {
  const schema = reportSchemaForRole(employee.reportingRole);
  const employeeContext = snapshotEmployeeContext(employee);
  const versions = versionEnvelope();

  return schema.map((field, index) => {
    const value = answers[field.key] ?? "";
    const analytics = field.analytics || {};
    const subject = subjectFor(field, answers, employee);
    const isText = ["text", "textarea"].includes(field.type);
    const abnormalFlag = Array.isArray(analytics.abnormalValues) && analytics.abnormalValues.includes(value);

    return {
      checkId: `CHK-${APP_CONFIG.shiftId}-${employee.employeeNumber}-${randomToken()}-${index + 1}`,
      sourceSubmissionId: submissionId,
      obligationId: obligation.obligationId,
      employeeId: employee.id,
      shiftInstanceId: APP_CONFIG.shiftInstanceId,
      shiftId: APP_CONFIG.shiftId,
      questionKey: field.key,
      questionLabel: field.label,
      factType: analytics.factType || "ANSWER",
      valueType: field.type === "choice" ? "BOOLEAN_CODE" : field.type === "equipment" ? "EQUIPMENT" : isText ? "TEXT" : "CODE",
      valueCode: isText ? null : value,
      valueLabel: isText ? null : answerLabel(field, value),
      valueText: isText ? value : null,
      subjectType: subject.subjectType,
      subjectId: subject.subjectId,
      abnormalFlag,
      recordedAt: completedAt,
      recordedAtUtc: new Date(completedAt).toISOString(),
      employeeContext,
      versions,
      provenance
    };
  });
}

function issueTitle(draft) {
  const type = eventTypeById(draft.eventTypeId);
  const equipment = equipmentById(draft.equipmentId);
  const area = areaById(draft.areaId);
  const subject = equipment?.code || area?.name || "Operational issue";
  return `${subject} · ${type?.label || draft.eventTypeId}`;
}

export function createSubmissionArtifacts(employee, obligation, answers, observationResult, capture = {}) {
  if (!obligation) throw new Error("No reporting obligation exists for this employee and shift.");

  const completedAt = new Date().toISOString();
  const submissionId = `SUB-${APP_CONFIG.shiftId}-${employee.employeeNumber}-${randomToken()}`;
  const employeeContext = snapshotEmployeeContext(employee);
  const versions = versionEnvelope();
  const provenance = captureProvenance(capture);
  const checkFacts = createCheckFacts({ employee, obligation, submissionId, answers, completedAt, provenance });
  const observations = [];
  const issues = [];

  for (const [index, draft] of observationResult.observations.entries()) {
    const observationId = `OBS-${APP_CONFIG.shiftId}-${randomToken()}-${index + 1}`;
    const timestamp = resolveObservedTimestamp(draft.observedTime, completedAt);
    const issueId = draft.actionRequired === "yes" ? `ISS-${APP_CONFIG.shiftId}-${randomToken()}-${index + 1}` : null;

    const observation = {
      observationId,
      sourceSubmissionId: submissionId,
      obligationId: obligation.obligationId,
      employeeId: employee.id,
      shiftInstanceId: APP_CONFIG.shiftInstanceId,
      shiftId: APP_CONFIG.shiftId,
      operationId: employee.operationId,
      areaId: draft.areaId,
      equipmentId: draft.equipmentId || null,
      eventTypeId: draft.eventTypeId,
      severityId: draft.severityId,
      actionRequired: draft.actionRequired === "yes",
      observedAt: timestamp.observedAt,
      observedAtUtc: timestamp.observedAtUtc,
      localObservedDate: timestamp.localObservedDate,
      localObservedTime: timestamp.localObservedTime,
      shiftBusinessDate: APP_CONFIG.shiftBusinessDate,
      operationTimezone: APP_CONFIG.operationTimezone,
      reportedAt: completedAt,
      reportedAtUtc: new Date(completedAt).toISOString(),
      narrative: draft.narrative,
      issueId,
      employeeContext,
      versions,
      provenance
    };
    observations.push(observation);

    if (issueId) {
      issues.push({
        issueId,
        title: issueTitle(draft),
        operationId: employee.operationId,
        areaId: draft.areaId,
        equipmentId: draft.equipmentId || null,
        eventTypeId: draft.eventTypeId,
        severityId: draft.severityId,
        currentStatus: "OPEN",
        openedAt: completedAt,
        openedAtUtc: new Date(completedAt).toISOString(),
        primaryObservationId: observationId,
        observationIds: [observationId],
        lifecycleHistory: [{ status: "OPEN", at: completedAt, actorId: employee.id, reason: "Created from structured observation" }],
        versions
      });
    }
  }

  const submission = {
    submissionId,
    obligationId: obligation.obligationId,
    employeeId: employee.id,
    shiftInstanceId: APP_CONFIG.shiftInstanceId,
    shiftId: APP_CONFIG.shiftId,
    status: "COMPLETE",
    completedAt,
    completedAtUtc: new Date(completedAt).toISOString(),
    observationDeclared: observationResult.declared === "yes",
    observationIds: observations.map(item => item.observationId),
    issueIds: issues.map(item => item.issueId),
    checkFactIds: checkFacts.map(item => item.checkId),
    answers,
    employeeContext,
    versions,
    provenance
  };

  return { submission, checkFacts, observations, issues };
}
