import { loadState, saveState } from "./store.js";
import { bindEmployeeExperience } from "./employee.js";
import { renderDashboard, bindDashboardActions } from "./dashboard.js";
import { renderExecutiveDashboard } from "./executive.js";
import { APP_CONFIG } from "./config.js";
import { operationById } from "./masterData.js";

let state = loadState();

function getState() {
  return state;
}

function setState(nextState) {
  state = nextState;
  saveState(state);
}

function onStateChange() {
  renderDashboard(state);
  renderExecutiveDashboard(state);
}

const employeeExperience = bindEmployeeExperience({ getState, setState, onStateChange });
bindDashboardActions({ getState, setState, onStateChange });

const views = {
  employee: document.getElementById("employeeView"),
  manager: document.getElementById("managerView"),
  executive: document.getElementById("executiveView")
};

const roleSelect = document.getElementById("roleSelect");
const topbarStatus = document.getElementById("topbarStatus");
const operation = operationById(APP_CONFIG.operationId);

topbarStatus.textContent = `${operation?.name || "Mining Operation"} · ${APP_CONFIG.shiftName} · ${APP_CONFIG.shiftDateLabel}`;

function route(target) {
  const resolved = views[target] ? target : "manager";
  Object.values(views).forEach(view => view.classList.add("hidden"));
  views[resolved].classList.remove("hidden");
  roleSelect.value = resolved;

  if (resolved === "manager") renderDashboard(state);
  if (resolved === "executive") renderExecutiveDashboard(state);
  if (resolved === "employee") employeeExperience.reset();

  const url = new URL(window.location.href);
  url.searchParams.set("role", resolved);
  window.history.replaceState({}, "", url);
  window.scrollTo(0, 0);
}

roleSelect.addEventListener("change", () => route(roleSelect.value));

renderDashboard(state);
renderExecutiveDashboard(state);

const requestedRole = new URLSearchParams(window.location.search).get("role");
route(requestedRole || "manager");
