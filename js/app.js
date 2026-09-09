import { loadState, saveState } from "./store.js";
import { bindEmployeeExperience } from "./employee.js";
import { renderDashboard, bindDashboardActions } from "./dashboard.js";
import { renderExecutiveDashboard } from "./executive.js";
import { operationById, applyMasterData } from "./masterData.js";
import { bindAdminExperience, renderAdmin } from "./admin.js";
import { bindOperationalStatus, renderLoginMineSignals, renderOperationalStatusBars, renderStatusAdminControl } from "./operationalStatus.js";
import { bindCommunications, renderBrand, renderMessageBoards } from "./communications.js";
import { bindOperationalIntelligence, renderOperationalAdmin } from "./operationalIntelligence.js";
import { currentShift } from "./operationalModel.js";

let state=loadState();
applyMasterData(state.masterData);
let employeeExperience=null;

function getState(){return state;}
function setState(nextState){state=nextState;applyMasterData(state.masterData);saveState(state);}
function refreshTopbarStatus(){const operation=operationById(currentShift(state)?.operationId);const shift=currentShift(state);topbarStatus.textContent=`${state.mineIdentity?.mineName||operation?.name||"Mining Operation"} · ${shift?.shiftName||"Shift"} · ${shift?.businessDate||""}`;}
function onStateChange(){
  refreshTopbarStatus();
  renderDashboard(state);
  renderExecutiveDashboard(state);
  renderAdmin(state); renderStatusAdminControl(state); renderOperationalAdmin(state);
  renderLoginMineSignals(state); renderOperationalStatusBars(state); renderMessageBoards(state); renderBrand(state);
  employeeExperience?.refresh?.();
}

employeeExperience=bindEmployeeExperience({getState,setState,onStateChange});
bindDashboardActions({getState,setState,onStateChange});
bindAdminExperience({getState,setState,onStateChange});
bindCommunications({getState,setState,onStateChange});
bindOperationalStatus({getState,setState,onStateChange});
bindOperationalIntelligence({getState,setState,onStateChange});

const views={employee:document.getElementById("employeeView"),manager:document.getElementById("managerView"),executive:document.getElementById("executiveView"),admin:document.getElementById("adminView")};
const roleSelect=document.getElementById("roleSelect"),topbarStatus=document.getElementById("topbarStatus");
function route(target){const resolved=views[target]?target:"manager";Object.values(views).forEach(view=>view.classList.add("hidden"));views[resolved].classList.remove("hidden");roleSelect.value=resolved;if(resolved==="employee")employeeExperience.reset();onStateChange();const url=new URL(window.location.href);url.searchParams.set("role",resolved);window.history.replaceState({},"",url);window.scrollTo(0,0);}
roleSelect.addEventListener("change",()=>route(roleSelect.value));
onStateChange();
const requestedRole=new URLSearchParams(window.location.search).get("role");route(requestedRole||"manager");
