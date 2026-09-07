
const STATUS_KEY = "intelimine_operational_status_v1";
const DEFAULT_STATUS = {
  production: { level: "ATTENTION", reason: "Crusher 2 downtime affecting planned tonnes.", updatedAt: "2026-09-07T13:40:00+02:00", updatedBy: "System Administrator" },
  safety: { level: "GOOD", reason: "No current mine-wide critical safety condition.", updatedAt: "2026-09-07T13:42:00+02:00", updatedBy: "System Administrator" }
};

function loadStatus(){
  try { return JSON.parse(localStorage.getItem(STATUS_KEY)) || structuredClone(DEFAULT_STATUS); }
  catch { return structuredClone(DEFAULT_STATUS); }
}
function saveStatus(value){ localStorage.setItem(STATUS_KEY, JSON.stringify(value)); }
function tone(level){ return level === "GOOD" ? "good" : level === "CRITICAL" ? "critical" : "attention"; }
function label(level){ return level === "GOOD" ? "Green" : level === "CRITICAL" ? "Red" : "Yellow"; }
function timeLabel(value){ try { return new Date(value).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}); } catch { return "—"; } }

export function renderLoginMineSignals(){
  const host=document.getElementById("loginMineSignals");
  if (!host) return;
  const state=loadStatus();
  host.innerHTML=`
    <div class="login-signal ${tone(state.safety.level)}" title="Safety: ${label(state.safety.level)}" aria-label="Safety status ${label(state.safety.level)}">
      <span class="status-dot" aria-hidden="true"></span><span>Safety</span><strong>${label(state.safety.level)}</strong>
    </div>
    <div class="login-signal ${tone(state.production.level)}" title="Operational Performance: ${label(state.production.level)}" aria-label="Operational Performance status ${label(state.production.level)}">
      <span class="status-dot" aria-hidden="true"></span><span>Operational Performance</span><strong>${label(state.production.level)}</strong>
    </div>`;
}

export function renderOperationalStatusBars(){
  const state=loadStatus();
  for (const view of document.querySelectorAll(".view")) {
    let host=view.querySelector(".operational-status-strip");
    if (!host) {
      host=document.createElement("div");
      host.className="operational-status-strip";
      const header=view.querySelector(".view-header");
      if (header) header.insertAdjacentElement("afterend",host); else view.prepend(host);
    }
    host.innerHTML=`
      <button class="mine-status ${tone(state.production.level)}" data-status-detail="production" type="button">
        <span class="status-dot"></span><span><small>Operational Performance</small><strong>${label(state.production.level)}</strong></span>
      </button>
      <button class="mine-status ${tone(state.safety.level)}" data-status-detail="safety" type="button">
        <span class="status-dot"></span><span><small>Safety Status</small><strong>${label(state.safety.level)}</strong></span>
      </button>
      <div class="status-context">Mine-wide · administrator-set · tap for reason</div>`;
    host.querySelectorAll("[data-status-detail]").forEach(button=>button.addEventListener("click",()=>{
      const key=button.dataset.statusDetail, item=state[key];
      alert(`${key === "production" ? "Operational Performance" : "Safety"}: ${label(item.level)}\n\n${item.reason}\n\nUpdated ${timeLabel(item.updatedAt)} by ${item.updatedBy}`);
    }));
  }
}

export function renderStatusAdminControl(){
  const admin=document.getElementById("adminWorkspace");
  if (!admin) return;
  const state=loadStatus();
  let host=document.getElementById("operationalStatusAdmin");
  if (!host){ host=document.createElement("section"); host.id="operationalStatusAdmin"; host.className="card operational-status-admin section-block"; admin.prepend(host); }
  host.innerHTML=`
    <div class="section-title"><div><div class="eyebrow">Operational status</div><h3>Safety & operational performance</h3></div><span class="badge">Manual control</span></div>
    <p class="muted">These mine-wide indicators are administrator-set. They are not calculated from MineMind data.</p>
    <form id="statusAdminForm" class="status-admin-grid">
      ${["production","safety"].map(key=>{const item=state[key]; const title=key === "production" ? "Operational Performance" : "Safety"; return `
      <fieldset><legend>${title}</legend>
        <label>Status<select name="${key}Level">
          <option value="GOOD" ${item.level==="GOOD"?"selected":""}>Green · Good</option>
          <option value="ATTENTION" ${item.level==="ATTENTION"?"selected":""}>Yellow · Attention</option>
          <option value="CRITICAL" ${item.level==="CRITICAL"?"selected":""}>Red · Critical</option>
        </select></label>
        <label>Reason<textarea name="${key}Reason" required>${item.reason||""}</textarea></label>
      </fieldset>`}).join("")}
      <div class="status-admin-actions"><label>Updated by<input name="updatedBy" value="System Administrator" required /></label><button class="primary" type="submit">Update mine status</button></div>
    </form>
    <div id="statusAdminMessage"></div>`;
  host.querySelector("#statusAdminForm")?.addEventListener("submit",event=>{
    event.preventDefault(); const data=new FormData(event.currentTarget); const now=new Date().toISOString();
    const next={ production:{level:data.get("productionLevel"),reason:String(data.get("productionReason")||"").trim(),updatedAt:now,updatedBy:String(data.get("updatedBy")||"Administrator")}, safety:{level:data.get("safetyLevel"),reason:String(data.get("safetyReason")||"").trim(),updatedAt:now,updatedBy:String(data.get("updatedBy")||"Administrator")} };
    saveStatus(next); renderLoginMineSignals(); renderOperationalStatusBars(); renderStatusAdminControl();
    const msg=document.getElementById("statusAdminMessage"); if(msg) msg.innerHTML='<div class="status-box success">Mine status updated and published to all actor views.</div>';
  });
}

export function renderSafetyMockReports(){
  const hazards=[
    ["Panel B loose rock","Panel B","Critical","Area barricaded","Shift Supervisor","2 shifts","Open"],
    ["Oil leak near haul route","North Ramp","Attention","Spill contained","Engineering","1 shift","In progress"],
    ["Emergency light damaged","Workshop","Attention","Temporary lighting","Electrical","3 shifts","Awaiting repair"],
    ["Conveyor guarding issue","Plant 2","Critical","Conveyor isolated","Plant Foreman","Current shift","Open"]
  ];
  const report=`<section class="card section-block safety-continuity-report">
    <div class="section-title"><div><div class="eyebrow">Safety continuity</div><h3>What the next shift must know</h3></div><span class="badge outstanding">4 carried forward</span></div>
    <div class="safety-kpis"><div><strong>1</strong><span>near miss</span></div><div><strong>2</strong><span>controls applied</span></div><div><strong>4</strong><span>open actions</span></div><div><strong>88.7%</strong><span>production vs plan</span></div></div>
    <div class="safety-table-wrap"><table class="safety-table"><thead><tr><th>Item</th><th>Section</th><th>Severity</th><th>Current control</th><th>Owner</th><th>Age</th><th>Status</th></tr></thead><tbody>
      ${hazards.map(r=>`<tr>${r.map((c,i)=>`<td>${i===2?`<span class="severity-chip ${c.toLowerCase()}">${c}</span>`:c}</td>`).join("")}</tr>`).join("")}
    </tbody></table></div>
    <div class="fact-box"><strong>Fact</strong><span>Conveyor CV-04 tripped four times during the shift.</span><strong>Recorded interpretation</strong><span>Electrical fault suspected by maintenance team.</span><strong>Action</strong><span>Electrical inspection assigned for 18:30.</span></div>
  </section>`;
  for(const id of ["managerDashboard","executiveDashboard"]){ const host=document.getElementById(id); if(host && !host.querySelector(".safety-continuity-report")) host.insertAdjacentHTML("beforeend",report); }
}
