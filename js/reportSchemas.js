const yesNo = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" }
];

export const REPORT_SCHEMAS = Object.freeze({
  Fitter: [
    { key: "equipmentWorkedOn", label: "Equipment worked on", type: "text", required: true, placeholder: "e.g. CV-04" },
    { key: "equipmentConcern", label: "Any equipment concern observed?", type: "choice", required: true, options: yesNo },
    { key: "equipmentCondition", label: "Equipment condition / observation", type: "textarea", required: true, placeholder: "If none, state: No issues observed" },
    { key: "outstandingWork", label: "Outstanding work", type: "textarea", required: true, placeholder: "If none, state: None" },
    { key: "handoverNote", label: "Handover note", type: "textarea", required: true }
  ],
  Electrician: [
    { key: "equipmentWorkedOn", label: "Electrical equipment / circuit worked on", type: "text", required: true },
    { key: "electricalConcern", label: "Any electrical concern observed?", type: "choice", required: true, options: yesNo },
    { key: "electricalCondition", label: "Condition / observation", type: "textarea", required: true, placeholder: "If none, state: No issues observed" },
    { key: "isolationStatus", label: "Isolation / restoration status", type: "textarea", required: true },
    { key: "handoverNote", label: "Handover note", type: "textarea", required: true }
  ],
  "Safety Officer": [
    { key: "hazardsObserved", label: "Any hazards identified?", type: "choice", required: true, options: yesNo },
    { key: "hazardDetails", label: "Hazard details", type: "textarea", required: true, placeholder: "If none, state: No hazards observed" },
    { key: "incidentOrNearMiss", label: "Any incident or near miss?", type: "choice", required: true, options: yesNo },
    { key: "correctiveAction", label: "Corrective action taken", type: "textarea", required: true, placeholder: "If none required, state: None" },
    { key: "outstandingSafety", label: "Outstanding safety concern", type: "textarea", required: true, placeholder: "If none, state: None" }
  ],
  Supervisor: [
    { key: "crewAttendance", label: "Crew attendance / people issue", type: "textarea", required: true },
    { key: "productionStatus", label: "Production status", type: "textarea", required: true },
    { key: "operationalDelay", label: "Any operational delay?", type: "choice", required: true, options: yesNo },
    { key: "constraints", label: "Equipment / operational constraints", type: "textarea", required: true, placeholder: "If none, state: None" },
    { key: "nextShiftPriority", label: "Next-shift priority", type: "textarea", required: true }
  ],
  Operator: [
    { key: "workArea", label: "Work area / equipment operated", type: "text", required: true },
    { key: "abnormalCondition", label: "Any abnormal condition observed?", type: "choice", required: true, options: yesNo },
    { key: "conditionDetails", label: "Condition details", type: "textarea", required: true, placeholder: "If none, state: No abnormal conditions observed" },
    { key: "productionConstraint", label: "Any production constraint?", type: "choice", required: true, options: yesNo },
    { key: "handoverNote", label: "Handover note", type: "textarea", required: true }
  ]
});
