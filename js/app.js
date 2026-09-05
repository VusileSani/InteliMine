import { loadState, saveState, resetState } from "./store.js";
import { bindEmployeeExperience } from "./employee.js";
import { renderDashboard, bindDashboardActions } from "./dashboard.js";
import { bindAttendanceSimulator } from "./attendance.js";

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
}

const employeeExperience = bindEmployeeExperience({ getState, setState, onStateChange });
bindDashboardActions({ getState, setState, onStateChange });
bindAttendanceSimulator({ getState });

const views = {
  home: document.getElementById("homeView"),
  employee: document.getElementById("employeeView"),
  manager: document.getElementById("managerView"),
  attendance: document.getElementById("attendanceView")
};

function route(target) {
  Object.values(views).forEach(view => view.classList.add("hidden"));
  const selected = views[target] || views.home;
  selected.classList.remove("hidden");
  document.getElementById("topbarStatus").textContent = target === "home" ? "V1 Prototype" : selected.querySelector(".eyebrow")?.textContent || "V1 Prototype";
  if (target === "manager") renderDashboard(state);
  if (target === "employee") employeeExperience.reset();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  const routeButton = event.target.closest("[data-route]");
  if (!routeButton) return;
  route(routeButton.dataset.route);
});

document.getElementById("resetDemoButton").addEventListener("click", () => {
  if (!window.confirm("Reset the Mining Shift Intelligence demo data?")) return;
  state = resetState();
  renderDashboard(state);
  employeeExperience.reset();
  alert("Demo data reset.");
});

renderDashboard(state);
route("home");
