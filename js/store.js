import { DEMO_INITIAL_SUBMISSIONS } from "./demoData.js";

const STORAGE_KEY = "mining_shift_intelligence_v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function initialState() {
  return {
    submissions: clone(DEMO_INITIAL_SUBMISSIONS),
    overrides: [],
    createdAt: new Date().toISOString()
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialState();
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
