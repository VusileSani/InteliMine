import {
  DEMO_REPORTING_OBLIGATIONS,
  DEMO_INITIAL_SUBMISSIONS,
  DEMO_INITIAL_CHECK_FACTS,
  DEMO_INITIAL_OBSERVATIONS,
  DEMO_INITIAL_ISSUES,
  DEMO_INTEGRATION_BATCHES
} from "./demoData.js";

const STORAGE_KEY = "intelimine_v1_3_analytics_integrity";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function initialState() {
  return {
    schemaVersion: "1.3",
    obligations: clone(DEMO_REPORTING_OBLIGATIONS),
    submissions: clone(DEMO_INITIAL_SUBMISSIONS),
    checkFacts: clone(DEMO_INITIAL_CHECK_FACTS),
    observations: clone(DEMO_INITIAL_OBSERVATIONS),
    issues: clone(DEMO_INITIAL_ISSUES),
    overrides: [],
    integrationBatches: clone(DEMO_INTEGRATION_BATCHES),
    auditTrail: [],
    createdAt: new Date().toISOString()
  };
}

function normalizeState(candidate) {
  if (!candidate || candidate.schemaVersion !== "1.3") return initialState();
  return {
    ...candidate,
    obligations: Array.isArray(candidate.obligations) ? candidate.obligations : [],
    submissions: Array.isArray(candidate.submissions) ? candidate.submissions : [],
    checkFacts: Array.isArray(candidate.checkFacts) ? candidate.checkFacts : [],
    observations: Array.isArray(candidate.observations) ? candidate.observations : [],
    issues: Array.isArray(candidate.issues) ? candidate.issues : [],
    overrides: Array.isArray(candidate.overrides) ? candidate.overrides : [],
    integrationBatches: Array.isArray(candidate.integrationBatches) ? candidate.integrationBatches : [],
    auditTrail: Array.isArray(candidate.auditTrail) ? candidate.auditTrail : []
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : initialState();
  } catch {
    return initialState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  const state = initialState();
  saveState(state);
  return state;
}
