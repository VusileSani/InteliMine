const yesNo = Object.freeze([
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" }
]);

const field = (definition, analytics = {}) => Object.freeze({ ...definition, analytics: Object.freeze(analytics) });

export const REPORT_SCHEMAS = Object.freeze({
  FITTER: Object.freeze([
    field({ key: "equipmentWorkedOnId", label: "Primary equipment worked on", type: "equipment", required: true }, { factType: "EQUIPMENT_REFERENCE", subjectType: "EQUIPMENT", subjectFromValue: true }),
    field({ key: "generalCondition", label: "General equipment condition at handover", type: "select", required: true, options: [
      { value: "NORMAL", label: "Normal / serviceable" },
      { value: "ATTENTION_REQUIRED", label: "Attention required" },
      { value: "OUT_OF_SERVICE", label: "Out of service" }
    ] }, { factType: "CONDITION", subjectType: "EQUIPMENT", subjectFromAnswer: "equipmentWorkedOnId", abnormalValues: ["ATTENTION_REQUIRED", "OUT_OF_SERVICE"] }),
    field({ key: "equipmentConcern", label: "Any equipment concern observed?", type: "choice", required: true, options: yesNo, triggersObservation: true }, { factType: "BOOLEAN_CHECK", subjectType: "EQUIPMENT", subjectFromAnswer: "equipmentWorkedOnId", abnormalValues: ["yes"] }),
    field({ key: "outstandingWork", label: "Outstanding work", type: "textarea", required: true, placeholder: "If none, state: None" }, { factType: "NARRATIVE_CHECK", subjectType: "EQUIPMENT", subjectFromAnswer: "equipmentWorkedOnId" }),
    field({ key: "handoverNote", label: "Handover note", type: "textarea", required: true }, { factType: "NARRATIVE_CHECK", subjectType: "EQUIPMENT", subjectFromAnswer: "equipmentWorkedOnId" })
  ]),
  ELECTRICIAN: Object.freeze([
    field({ key: "equipmentWorkedOnId", label: "Primary equipment / circuit worked on", type: "equipment", required: true }, { factType: "EQUIPMENT_REFERENCE", subjectType: "EQUIPMENT", subjectFromValue: true }),
    field({ key: "restorationStatus", label: "Isolation / restoration state", type: "select", required: true, options: [
      { value: "RESTORED", label: "Restored / available" },
      { value: "ISOLATED", label: "Still isolated" },
      { value: "PARTIAL", label: "Partially restored" }
    ] }, { factType: "CONDITION", subjectType: "EQUIPMENT", subjectFromAnswer: "equipmentWorkedOnId", abnormalValues: ["ISOLATED", "PARTIAL"] }),
    field({ key: "electricalConcern", label: "Any electrical concern observed?", type: "choice", required: true, options: yesNo, triggersObservation: true }, { factType: "BOOLEAN_CHECK", subjectType: "EQUIPMENT", subjectFromAnswer: "equipmentWorkedOnId", abnormalValues: ["yes"] }),
    field({ key: "outstandingWork", label: "Outstanding electrical work", type: "textarea", required: true, placeholder: "If none, state: None" }, { factType: "NARRATIVE_CHECK", subjectType: "EQUIPMENT", subjectFromAnswer: "equipmentWorkedOnId" }),
    field({ key: "handoverNote", label: "Handover note", type: "textarea", required: true }, { factType: "NARRATIVE_CHECK", subjectType: "EQUIPMENT", subjectFromAnswer: "equipmentWorkedOnId" })
  ]),
  SAFETY_OFFICER: Object.freeze([
    field({ key: "hazardsObserved", label: "Any hazards identified?", type: "choice", required: true, options: yesNo, triggersObservation: true }, { factType: "BOOLEAN_CHECK", subjectType: "AREA", abnormalValues: ["yes"] }),
    field({ key: "incidentOrNearMiss", label: "Any incident or near miss?", type: "choice", required: true, options: yesNo, triggersObservation: true }, { factType: "BOOLEAN_CHECK", subjectType: "AREA", abnormalValues: ["yes"] }),
    field({ key: "correctiveAction", label: "Corrective action / controls applied", type: "textarea", required: true, placeholder: "If none required, state: None" }, { factType: "NARRATIVE_CHECK", subjectType: "AREA" }),
    field({ key: "outstandingSafety", label: "Outstanding safety concern?", type: "choice", required: true, options: yesNo, triggersObservation: true }, { factType: "BOOLEAN_CHECK", subjectType: "AREA", abnormalValues: ["yes"] }),
    field({ key: "handoverNote", label: "Safety handover note", type: "textarea", required: true }, { factType: "NARRATIVE_CHECK", subjectType: "AREA" })
  ]),
  SUPERVISOR: Object.freeze([
    field({ key: "crewStatus", label: "Crew status", type: "select", required: true, options: [
      { value: "FULL_COMPLEMENT", label: "Full complement" },
      { value: "SHORT_STAFFED", label: "Short staffed" },
      { value: "REASSIGNED", label: "Crew reassigned" }
    ] }, { factType: "CONDITION", subjectType: "SHIFT", abnormalValues: ["SHORT_STAFFED", "REASSIGNED"] }),
    field({ key: "productionStatus", label: "Production status", type: "select", required: true, options: [
      { value: "ON_PLAN", label: "On plan" },
      { value: "BELOW_PLAN", label: "Below plan" },
      { value: "ABOVE_PLAN", label: "Above plan" },
      { value: "STOPPED", label: "Stopped" }
    ] }, { factType: "CONDITION", subjectType: "SHIFT", abnormalValues: ["BELOW_PLAN", "STOPPED"] }),
    field({ key: "operationalDelay", label: "Any operational delay?", type: "choice", required: true, options: yesNo, triggersObservation: true }, { factType: "BOOLEAN_CHECK", subjectType: "SHIFT", abnormalValues: ["yes"] }),
    field({ key: "constraints", label: "Equipment / operational constraints", type: "textarea", required: true, placeholder: "If none, state: None" }, { factType: "NARRATIVE_CHECK", subjectType: "SHIFT" }),
    field({ key: "nextShiftPriority", label: "Next-shift priority", type: "textarea", required: true }, { factType: "NARRATIVE_CHECK", subjectType: "SHIFT" })
  ]),
  OPERATOR: Object.freeze([
    field({ key: "equipmentOperatedId", label: "Primary equipment operated", type: "equipment", required: true }, { factType: "EQUIPMENT_REFERENCE", subjectType: "EQUIPMENT", subjectFromValue: true }),
    field({ key: "operatingCondition", label: "Operating condition at handover", type: "select", required: true, options: [
      { value: "NORMAL", label: "Normal" },
      { value: "DEGRADED", label: "Degraded" },
      { value: "STOPPED", label: "Stopped / unavailable" }
    ] }, { factType: "CONDITION", subjectType: "EQUIPMENT", subjectFromAnswer: "equipmentOperatedId", abnormalValues: ["DEGRADED", "STOPPED"] }),
    field({ key: "abnormalCondition", label: "Any abnormal condition observed?", type: "choice", required: true, options: yesNo, triggersObservation: true }, { factType: "BOOLEAN_CHECK", subjectType: "EQUIPMENT", subjectFromAnswer: "equipmentOperatedId", abnormalValues: ["yes"] }),
    field({ key: "productionConstraint", label: "Any production constraint?", type: "choice", required: true, options: yesNo, triggersObservation: true }, { factType: "BOOLEAN_CHECK", subjectType: "EQUIPMENT", subjectFromAnswer: "equipmentOperatedId", abnormalValues: ["yes"] }),
    field({ key: "handoverNote", label: "Handover note", type: "textarea", required: true }, { factType: "NARRATIVE_CHECK", subjectType: "EQUIPMENT", subjectFromAnswer: "equipmentOperatedId" })
  ])
});

export function reportSchemaForRole(roleCode) {
  return REPORT_SCHEMAS[roleCode] || [];
}
