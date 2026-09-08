import { loadState, saveState } from "./store.js";
import { bindEmployeeExperience } from "./employee.js";
import { renderDashboard, bindDashboardActions } from "./dashboard.js";
import { renderExecutiveDashboard } from "./executive.js";
import { APP_CONFIG } from "./config.js";
import { operationById, applyMasterData } from "./masterData.js";
import { bindAdminExperience, renderAdmin } from "./admin.js";
import { bindGovernanceExperience, renderGovernance } from "./governance.js";
import { renderLoginMineSignals, renderOperationalStatusBars, renderStatusAdminControl, renderSafetyMockReports } from "./operationalStatus.js";
import { bindCommunications, renderBrand, renderMessageBoards, renderSupervisorComposer } from "./communications.js";

let state = loadState();
applyMasterData(state.masterData);

function getState() {
  return state;
}

function setState(nextState) {
  state = nextState;
  applyMasterData(state.masterData);
  saveState(state);
}

function refreshTopbarStatus() {
  const operation = operationById(APP_CONFIG.operationId);
  topbarStatus.textContent = `${operation?.name || "Mining Operation"} · ${APP_CONFIG.shiftName} · ${APP_CONFIG.shiftDateLabel}`;
}

function onStateChange() {
  refreshTopbarStatus();
  renderDashboard(state);
  renderExecutiveDashboard(state);
  renderAdmin(state);
  renderGovernance(state);
  renderLoginMineSignals();
  renderOperationalStatusBars();
  renderStatusAdminControl();
  renderSafetyMockReports();
  renderMessageBoards(state);
  renderBrand(state);
  renderSupervisorComposer();
}

const employeeExperience = bindEmployeeExperience({ getState, setState, onStateChange });
bindDashboardActions({ getState, setState, onStateChange });
bindAdminExperience({ getState, setState, onStateChange });
bindGovernanceExperience({ getState, setState, onStateChange });
bindCommunications({ getState, setState, onStateChange });

const views = {
  employee: document.getElementById("employeeView"),
  manager: document.getElementById("managerView"),
  executive: document.getElementById("executiveView"),
  admin: document.getElementById("adminView"),
  governance: document.getElementById("governanceView")
};

const roleSelect = document.getElementById("roleSelect");
const topbarStatus = document.getElementById("topbarStatus");
refreshTopbarStatus();

function route(target) {
  const resolved = views[target] ? target : "manager";
  Object.values(views).forEach(view => view.classList.add("hidden"));
  views[resolved].classList.remove("hidden");
  roleSelect.value = resolved;

  if (resolved === "manager") renderDashboard(state);
  if (resolved === "executive") renderExecutiveDashboard(state);
  if (resolved === "admin") renderAdmin(state);
  if (resolved === "governance") renderGovernance(state);
  if (resolved === "employee") employeeExperience.reset();
  renderOperationalStatusBars();
  if (resolved === "admin") renderStatusAdminControl();
  if (resolved === "manager" || resolved === "executive") renderSafetyMockReports();

  const url = new URL(window.location.href);
  url.searchParams.set("role", resolved);
  window.history.replaceState({}, "", url);
  window.scrollTo(0, 0);
}

roleSelect.addEventListener("change", () => route(roleSelect.value));

renderDashboard(state);
renderExecutiveDashboard(state);
renderLoginMineSignals();
renderAdmin(state);
renderGovernance(state);
renderOperationalStatusBars();
renderStatusAdminControl();
renderSafetyMockReports();
renderMessageBoards(state);
renderBrand(state);
renderSupervisorComposer();

const requestedRole = new URLSearchParams(window.location.search).get("role");
route(requestedRole || "manager");
