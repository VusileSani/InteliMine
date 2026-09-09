import { currentShiftObservations, openIssues, reportingEmployees, reportingStatus } from "./domain.js";
import { LOSS_CATEGORY_LABELS } from "./leadershipData.js";
import { currentShift } from "./operationalModel.js";

function clampPct(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function currentShiftPerformance(state) {
  const shift = currentShift(state);
  const shiftInstanceId = shift?.shiftInstanceId || null;
  const base = (state.shiftPerformance || []).find(item => item.shiftInstanceId === shiftInstanceId) || {};
  const employees = reportingEmployees(state);
  const complete = employees.filter(employee => reportingStatus(state, employee.id) === "complete").length;
  const handoverCompliancePct = employees.length ? Math.round((complete / employees.length) * 100) : 100;
  const controls = (state.controlVerifications || []).filter(item => !shiftInstanceId || item.shiftInstanceId === shiftInstanceId);
  const passedControls = controls.filter(item => item.status === "PASS").length;
  const criticalControlConformancePct = controls.length ? Math.round((passedControls / controls.length) * 100) : 100;
  const plannedTonnes = Number(base.plannedTonnes || 0);
  const actualTonnes = Number(base.actualTonnes || 0);
  const planAttainmentPct = plannedTonnes ? Math.round((actualTonnes / plannedTonnes) * 100) : 0;
  const shiftDelayEvents = (state.delayEvents || []).filter(item => !shiftInstanceId || item.shiftInstanceId === shiftInstanceId);
  const delayMinutes = shiftDelayEvents.length
    ? shiftDelayEvents.reduce((total, item) => total + Number(item.minutes || 0), 0)
    : Number(base.delayMinutes || 0);

  return {
    ...base,
    shiftInstanceId,
    shiftName: shift?.shiftName || base.shiftName || "",
    shiftBusinessDate: shift?.businessDate || "",
    metricSource: base.sourceType || "DEMO_INTEGRATION",
    handoverCompliancePct,
    criticalControlConformancePct,
    planAttainmentPct,
    delayMinutes,
    shortfallTonnes: Math.max(0, plannedTonnes - actualTonnes),
    completeHandovers: complete,
    requiredHandovers: employees.length,
    outstandingHandovers: employees.length - complete,
    controlExceptions: controls.filter(item => item.status !== "PASS"),
    highPotentialObservations: currentShiftObservations(state).filter(item => ["HIGH", "CRITICAL"].includes(item.severityId)),
    openActionCount: openIssues(state).length
  };
}

function average(values) {
  const clean = values.filter(Number.isFinite);
  if (!clean.length) return 0;
  return clean.reduce((total, value) => total + value, 0) / clean.length;
}

function planAttainment(item) {
  const planned = Number(item.plannedTonnes || 0);
  const actual = Number(item.actualTonnes || 0);
  return planned ? (actual / planned) * 100 : 0;
}

function trendDelta(values) {
  if (values.length < 4) return 0;
  const split = Math.floor(values.length / 2);
  const earlier = average(values.slice(0, split));
  const recent = average(values.slice(split));
  return Math.round(recent - earlier);
}

export function executivePerformance(state) {
  const current = currentShiftPerformance(state);
  const activeShiftId = current.shiftInstanceId;
  const history = (state.shiftPerformance || []).map(item => item.shiftInstanceId === activeShiftId
    ? { ...item, handoverCompliancePct: current.handoverCompliancePct, criticalControlConformancePct: current.criticalControlConformancePct }
    : item);

  const planValues = history.map(planAttainment);
  const availabilityValues = history.map(item => Number(item.equipmentAvailabilityPct));
  const controlValues = history.map(item => Number(item.criticalControlConformancePct));
  const actionClosureValues = history.map(item => Number(item.actionClosurePct));
  const handoverValues = history.map(item => Number(item.handoverCompliancePct));

  const losses = {};
  for (const item of history) {
    for (const [category, minutes] of Object.entries(item.lossBreakdown || {})) {
      losses[category] = (losses[category] || 0) + Number(minutes || 0);
    }
  }

  const lossRanking = Object.entries(losses)
    .map(([category, minutes]) => ({ category, label: LOSS_CATEGORY_LABELS[category] || category, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  return {
    history: history.map(item => ({ ...item, planAttainmentPct: clampPct(planAttainment(item)) })),
    averages: {
      planAttainmentPct: clampPct(average(planValues)),
      equipmentAvailabilityPct: clampPct(average(availabilityValues)),
      criticalControlConformancePct: clampPct(average(controlValues)),
      actionClosurePct: clampPct(average(actionClosureValues)),
      handoverCompliancePct: clampPct(average(handoverValues))
    },
    trends: {
      planAttainmentPct: trendDelta(planValues),
      equipmentAvailabilityPct: trendDelta(availabilityValues),
      criticalControlConformancePct: trendDelta(controlValues),
      actionClosurePct: trendDelta(actionClosureValues)
    },
    lossRanking,
    current
  };
}
