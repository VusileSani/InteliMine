import { APP_CONFIG } from "./config.js";
import { isEmployeeActive } from "./employeeMaster.js";
import { currentShift } from "./operationalModel.js";

export function activeShiftInstanceId(state){ return currentShift(state)?.shiftInstanceId || APP_CONFIG.shiftInstanceId; }
export function findEmployeeByNumber(state, employeeNumber){ return (state.employees||[]).find(e=>e.employeeNumber===String(employeeNumber).trim())||null; }
export function employeeById(state, employeeId){ return (state.employees||[]).find(e=>e.id===employeeId)||null; }
export function authenticateEmployee(state, employeeNumber, pin){ const employee=findEmployeeByNumber(state,employeeNumber); return employee&&isEmployeeActive(employee)&&employee.pin===String(pin).trim()?employee:null; }
export function attendanceFor(state, employeeId){ const shiftId=activeShiftInstanceId(state); return (state.attendance||[]).find(e=>e.employeeId===employeeId&&e.shiftInstanceId===shiftId)||null; }
export function reportingObligations(state){ const shiftId=activeShiftInstanceId(state); return (state.obligations||[]).filter(i=>i.reportingRequired&&i.shiftInstanceId===shiftId); }
export function obligationFor(state, employeeId){ return reportingObligations(state).find(i=>i.employeeId===employeeId)||null; }
export function reportingEmployees(state){ const ids=new Set(reportingObligations(state).map(i=>i.employeeId)); return (state.employees||[]).filter(e=>ids.has(e.id)); }
export function submissionFor(state, employeeId){ const o=obligationFor(state,employeeId); return o?(state.submissions||[]).find(s=>s.obligationId===o.obligationId)||null:null; }
export function overrideFor(state, employeeId){ const o=obligationFor(state,employeeId); return o?[...(state.overrides||[])].reverse().find(x=>x.obligationId===o.obligationId)||null:null; }
export function reportingStatus(state, employeeId){ const o=obligationFor(state,employeeId); if(!o)return"not_required"; const s=submissionFor(state,employeeId); if(s?.status==="COMPLETE")return"complete"; if(overrideFor(state,employeeId))return"excused"; return"outstanding"; }
export function mayClockOff(state, employeeId){ const attendance=attendanceFor(state,employeeId); if(!attendance?.clockedIn)return{allowed:true,reason:"Employee is not currently clocked in.",code:"NOT_CLOCKED_IN"}; const o=obligationFor(state,employeeId); if(!o)return{allowed:false,reason:"Clock-in exists but no reporting obligation was generated. Supervisor review is required.",code:"OBLIGATION_MISSING"}; const status=reportingStatus(state,employeeId); if(status==="complete")return{allowed:true,reason:"Required shift report is complete.",code:"REPORT_COMPLETE"}; if(status==="excused")return{allowed:true,reason:"Supervisor-authorised reporting override is recorded.",code:"OVERRIDE_APPROVED"}; return{allowed:false,reason:"Required shift report is still outstanding.",code:"REPORT_OUTSTANDING"}; }
export function currentShiftObservations(state){ const id=activeShiftInstanceId(state); return (state.observations||[]).filter(o=>o.shiftInstanceId===id).sort((a,b)=>new Date(b.reportedAt)-new Date(a.reportedAt)); }
export function currentIssues(state){ return (state.issues||[]).filter(i=>i.operationId===APP_CONFIG.operationId).sort((a,b)=>new Date(b.openedAt)-new Date(a.openedAt)); }
export function openIssues(state){ return currentIssues(state).filter(i=>i.currentStatus!=="CLOSED"); }
export function employeeAssignedIssues(state, employeeId){ return openIssues(state).filter(i=>i.assignedEmployeeId===employeeId).sort((a,b)=>new Date(a.targetAt||a.openedAt)-new Date(b.targetAt||b.openedAt)); }
export function employeeQuickCaptures(state, employeeId){ const id=activeShiftInstanceId(state); return (state.observations||[]).filter(o=>o.employeeId===employeeId&&o.shiftInstanceId===id&&o.sourceType==="QUICK_CAPTURE").sort((a,b)=>new Date(a.reportedAt)-new Date(b.reportedAt)); }
export function observationById(state,id){ return (state.observations||[]).find(i=>i.observationId===id)||null; }
