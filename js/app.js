import { loadState, saveState, resetState } from "./store.js";
import { bindEmployeeExperience } from "./employee.js";
import { renderDashboard, bindDashboardActions } from "./dashboard.js";
import { bindAttendanceSimulator } from "./attendance.js";
import { renderIntegrationHub } from "./integration.js";
import { renderAnalytics, bindAnalyticsActions } from "./analytics.js";
import { APP_CONFIG } from "./config.js";

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
  renderAnalytics(state);
}

const employeeExperience = bindEmployeeExperience({ getState, setState, onStateChange });
bindDashboardActions({ getState, setState, onStateChange });
bindAttendanceSimulator({ getState });
bindAnalyticsActions({ getState });

const views = {
  home: document.getElementById("homeView"),
  employee: document.getElementById("employeeView"),
  manager: document.getElementById("managerView"),
  attendance: document.getElementById("attendanceView"),
  integration: document.getElementById("integrationView"),
  analytics: document.getElementById("analyticsView")
};

function route(target) {
  Object.values(views).forEach(view => view.classList.add("hidden"));
  const selected = views[target] || views.home;
  selected.classList.remove("hidden");
  document.getElementById("topbarStatus").textContent = target === "home"
    ? `V${APP_CONFIG.version} · ${APP_CONFIG.releaseName}`
    : selected.querySelector(".eyebrow")?.textContent || `V${APP_CONFIG.version}`;

  if (target === "manager") renderDashboard(state);
  if (target === "integration") renderIntegrationHub(state);
  if (target === "analytics") renderAnalytics(state);
  if (target === "employee") employeeExperience.reset();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  const routeButton = event.target.closest("[data-route]");
  if (!routeButton) return;
  route(routeButton.dataset.route);
});

document.getElementById("resetDemoButton").addEventListener("click", () => {
  if (!window.confirm("Reset the InteliMine demo data?")) return;
  state = resetState();
  onStateChange();
  employeeExperience.reset();
  alert("Demo data reset.");
});

renderDashboard(state);
renderIntegrationHub(state);
renderAnalytics(state);
route("home");
