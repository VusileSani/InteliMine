import { executivePerformance } from "./leadership.js";
import { openIssues } from "./domain.js";
import { areaById } from "./masterData.js";
import { currentShift } from "./operationalModel.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toneFor(value, goodAt, watchAt) {
  if (value >= goodAt) return "good";
  if (value >= watchAt) return "watch";
  return "risk";
}

function trendText(delta, inverse = false) {
  if (!delta) return "Stable";
  const improving = inverse ? delta < 0 : delta > 0;
  return `${delta > 0 ? "+" : ""}${delta} pts · ${improving ? "improving" : "declining"}`;
}

function executiveMetric(label, value, note, tone) {
  return `<div class="executive-metric ${tone}">
    <div class="metric-label">${escapeHtml(label)}</div>
    <div class="metric-value">${escapeHtml(value)}</div>
    <div class="metric-note">${escapeHtml(note)}</div>
  </div>`;
}

function attentionCard(label, title, copy, tone = "watch") {
  return `<div class="attention-card ${tone}">
    <div class="attention-label">${escapeHtml(label)}</div>
    <strong>${escapeHtml(title)}</strong>
    <span>${escapeHtml(copy)}</span>
  </div>`;
}

export function renderExecutiveDashboard(state) {
  const host = document.getElementById("executiveDashboard");
  if (!host) return;

  const shift = currentShift(state);
  const performance = executivePerformance(state);
  const { averages, trends, history, lossRanking, current } = performance;
  const issues = openIssues(state);
  const materialIssues = issues.filter(issue => ["HIGH", "CRITICAL"].includes(issue.severityId));
  const totalLossMinutes = lossRanking.reduce((total, item) => total + item.minutes, 0);
  const topTwoLoss = lossRanking.slice(0, 2);
  const topTwoShare = totalLossMinutes
    ? Math.round((topTwoLoss.reduce((total, item) => total + item.minutes, 0) / totalLossMinutes) * 100)
    : 0;

  const attention = [];
  if (current.controlExceptions.length) {
    const first = current.controlExceptions[0];
    attention.push(attentionCard(
      "Fatal-risk control",
      `${current.controlExceptions.length} verification exception${current.controlExceptions.length === 1 ? "" : "s"}`,
      `${first.hazard}: ${first.note}`,
      "risk"
    ));
  }
  if (current.planAttainmentPct < 90) {
    attention.push(attentionCard(
      "Current shift",
      `${current.planAttainmentPct}% of production plan`,
      `${current.shortfallTonnes} t below plan with ${current.delayMinutes || 0} delay minutes.`,
      "risk"
    ));
  }
  if (materialIssues.length) {
    attention.push(attentionCard(
      "Priority actions",
      `${materialIssues.length} high-priority action${materialIssues.length === 1 ? "" : "s"} open`,
      materialIssues.map(issue => issue.title).join(" · "),
      "watch"
    ));
  }
  if (topTwoLoss.length) {
    attention.push(attentionCard(
      "Recurring loss",
      `${topTwoShare}% of recorded delay sits in two categories`,
      topTwoLoss.map(item => item.label).join(" and "),
      "watch"
    ));
  }

  host.innerHTML = `
    <div class="context-line">8-shift operating view · active ${escapeHtml(shift?.label || shift?.shiftName || "shift")}</div>
    <div class="status-box neutral compact-note"><strong>Prototype integration metrics.</strong> Production, availability, delay and control-conformance values are seeded placeholders until connected to authoritative mine systems. MineMind-native actions and handovers remain state-driven.</div>

    <div class="executive-metrics">
      ${executiveMetric(
        "Plan attainment",
        `${averages.planAttainmentPct}%`,
        trendText(trends.planAttainmentPct),
        toneFor(averages.planAttainmentPct, 95, 90)
      )}
      ${executiveMetric(
        "Critical controls",
        `${averages.criticalControlConformancePct}%`,
        trendText(trends.criticalControlConformancePct),
        toneFor(averages.criticalControlConformancePct, 98, 95)
      )}
      ${executiveMetric(
        "Availability",
        `${averages.equipmentAvailabilityPct}%`,
        trendText(trends.equipmentAvailabilityPct),
        toneFor(averages.equipmentAvailabilityPct, 90, 85)
      )}
      ${executiveMetric(
        "Action closure",
        `${averages.actionClosurePct}%`,
        trendText(trends.actionClosurePct),
        toneFor(averages.actionClosurePct, 92, 85)
      )}
      ${executiveMetric(
        "Handover discipline",
        `${averages.handoverCompliancePct}%`,
        `${current.outstandingHandovers} current outstanding`,
        toneFor(averages.handoverCompliancePct, 98, 93)
      )}
    </div>

    <section class="section-block">
      <div class="section-title"><div><div class="eyebrow">Leadership attention</div><h3>Where intervention has the highest value</h3></div></div>
      <div class="attention-grid executive-attention">${attention.join("") || `<div class="status-box success">No material leadership exceptions detected.</div>`}</div>
    </section>

    <div class="executive-two-column section-block">
      <section class="card">
        <div class="section-title"><h3>Operating rhythm</h3><span class="muted">Last 8 shifts</span></div>
        <div class="rhythm-list">
          ${history.map(item => `<div class="rhythm-row">
            <div class="rhythm-label">${escapeHtml(item.label)}</div>
            <div class="rhythm-measure">
              <div class="bar-track"><span style="width:${Math.min(100, Math.max(0, item.planAttainmentPct))}%"></span></div>
              <strong>${item.planAttainmentPct}% plan</strong>
            </div>
            <div class="rhythm-support">${Number(item.equipmentAvailabilityPct || 0)}% availability</div>
            <div class="rhythm-support">${Number(item.criticalControlConformancePct || 0)}% controls</div>
          </div>`).join("")}
        </div>
      </section>

      <section class="card">
        <div class="section-title"><h3>Loss concentration</h3><span class="muted">Recorded delay minutes</span></div>
        <div class="loss-ranking">
          ${lossRanking.map((item, index) => {
            const share = totalLossMinutes ? Math.round((item.minutes / totalLossMinutes) * 100) : 0;
            return `<div class="rank-row">
              <div class="rank-number">${index + 1}</div>
              <div class="rank-main">
                <strong>${escapeHtml(item.label)}</strong>
                <div class="bar-track slim"><span style="width:${share}%"></span></div>
              </div>
              <div class="rank-value"><strong>${item.minutes} min</strong><span>${share}%</span></div>
            </div>`;
          }).join("")}
        </div>
      </section>
    </div>

    <section class="card section-block">
      <div class="section-title"><h3>Current priority exceptions</h3><span class="muted">Only open high-priority items</span></div>
      ${materialIssues.length ? `<div class="material-risk-list">
        ${materialIssues.map(issue => `<div class="material-risk-row">
          <div><strong>${escapeHtml(issue.title)}</strong><span>${escapeHtml(areaById(issue.areaId)?.name || "Mine area")} · ${escapeHtml(issue.ownerRole || "Shift Supervisor")}</span></div>
          <span class="status-pill">${escapeHtml(String(issue.currentStatus || "OPEN").replaceAll("_", " "))}</span>
        </div>`).join("")}
      </div>` : `<div class="status-box success">No open high-priority actions.</div>`}
    </section>
  `;
}
