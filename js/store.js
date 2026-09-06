import {
  INITIAL_REPORTING_OBLIGATIONS,
  INITIAL_SUBMISSIONS,
  INITIAL_CHECK_FACTS,
  INITIAL_OBSERVATIONS,
  INITIAL_ISSUES,
  INITIAL_INTEGRATION_BATCHES,
  EMPLOYEES,
  INITIAL_ATTENDANCE
} from "./seedData.js";
import { defaultMasterDataSnapshot } from "./masterData.js";
import {
  SHIFT_PERFORMANCE_HISTORY,
  CURRENT_DELAY_EVENTS,
  CRITICAL_CONTROL_VERIFICATIONS
} from "./leadershipData.js";

const STORAGE_KEY = "intelimine_v2_0_leadership_value";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function initialState() {
  return {
    schemaVersion: "2.0",
    employees: clone(EMPLOYEES),
    attendance: clone(INITIAL_ATTENDANCE),
    masterData: defaultMasterDataSnapshot(),
    obligations: clone(INITIAL_REPORTING_OBLIGATIONS),
    submissions: clone(INITIAL_SUBMISSIONS),
    checkFacts: clone(INITIAL_CHECK_FACTS),
    observations: clone(INITIAL_OBSERVATIONS),
    issues: clone(INITIAL_ISSUES),
    overrides: [],
    shiftPerformance: clone(SHIFT_PERFORMANCE_HISTORY),
    delayEvents: clone(CURRENT_DELAY_EVENTS),
    controlVerifications: clone(CRITICAL_CONTROL_VERIFICATIONS),
    integrationBatches: clone(INITIAL_INTEGRATION_BATCHES),
    auditTrail: [],
    createdAt: new Date().toISOString()
  };
}

function normalizeState(candidate) {
  if (!candidate || candidate.schemaVersion !== "2.0") return initialState();
  return {
    ...candidate,
    employees: Array.isArray(candidate.employees) ? candidate.employees : clone(EMPLOYEES),
    attendance: Array.isArray(candidate.attendance) ? candidate.attendance : clone(INITIAL_ATTENDANCE),
    masterData: candidate.masterData && typeof candidate.masterData === "object" ? candidate.masterData : defaultMasterDataSnapshot(),
    obligations: Array.isArray(candidate.obligations) ? candidate.obligations : [],
    submissions: Array.isArray(candidate.submissions) ? candidate.submissions : [],
    checkFacts: Array.isArray(candidate.checkFacts) ? candidate.checkFacts : [],
    observations: Array.isArray(candidate.observations) ? candidate.observations : [],
    issues: Array.isArray(candidate.issues) ? candidate.issues : [],
    overrides: Array.isArray(candidate.overrides) ? candidate.overrides : [],
    shiftPerformance: Array.isArray(candidate.shiftPerformance) ? candidate.shiftPerformance : clone(SHIFT_PERFORMANCE_HISTORY),
    delayEvents: Array.isArray(candidate.delayEvents) ? candidate.delayEvents : clone(CURRENT_DELAY_EVENTS),
    controlVerifications: Array.isArray(candidate.controlVerifications) ? candidate.controlVerifications : clone(CRITICAL_CONTROL_VERIFICATIONS),
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
