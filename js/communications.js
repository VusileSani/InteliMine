const DEFAULT_MESSAGES = [
  { id:"MSG-001", audienceType:"ALL", audienceId:"ALL", title:"Morning production briefing", body:"Ventilation work at Section 3 return airway remains in progress. Observe the temporary access controls and supervisor instructions.", priority:"NOTICE", authorRole:"System Administration", authorName:"MineMind Administrator", createdAt:"2026-09-08T05:45:00+02:00", expiresAt:"2026-09-09T18:00:00+02:00", active:true },
  { id:"MSG-002", audienceType:"TEAM", audienceId:"AREA-SEC3", title:"Section 3 shift focus", body:"Prioritise housekeeping at Panel B access and confirm loose-rock re-inspection before entry.", priority:"IMPORTANT", authorRole:"Supervisor", authorName:"Mandla Khumalo", createdAt:"2026-09-08T06:05:00+02:00", expiresAt:"2026-09-08T18:00:00+02:00", active:true }
];

function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
function activeMessages(state, role){
  const items = Array.isArray(state.messages) && state.messages.length ? state.messages : DEFAULT_MESSAGES;
  const now = Date.now();
  return items.filter(m => m.active !== false && (!m.expiresAt || Date.parse(m.expiresAt) > now) && (m.audienceType === "ALL" || role !== "executive" && role !== "governance"));
}
function messageCard(m){
  return `<article class="message-item ${m.priority === "IMPORTANT" ? "important" : ""}"><div class="message-copy"><div class="message-title-row"><strong>${esc(m.title)}</strong><span>${esc(m.audienceType === "ALL" ? "Mine-wide" : "Team")}</span></div><p>${esc(m.body)}</p><small>${esc(m.authorRole)} · ${new Date(m.createdAt).toLocaleString([], {dateStyle:"medium",timeStyle:"short"})}</small></div></article>`;
}
export function renderMessageBoards(state){
  ["employee","manager","executive","admin","governance"].forEach(role=>{
    const host=document.getElementById(`${role}MessageBoard`); if(!host)return;
    const msgs=activeMessages(state,role).slice(0,3);
    host.innerHTML=`<div class="message-board-head"><div><span class="eyebrow">Message board</span><strong>${msgs.length ? `${msgs.length} current notice${msgs.length===1?"":"s"}` : "No current notices"}</strong></div>${msgs.length>1?`<button class="small secondary" data-message-toggle>View all</button>`:""}</div><div class="message-list">${msgs.map(messageCard).join("")}</div>`;
  });
}
export function renderBrand(state){
  const brand=state.mineIdentity||{};
  document.querySelectorAll(".mine-brand-logo").forEach(el=>{
    if(brand.logoDataUrl){el.src=brand.logoDataUrl;el.classList.remove("hidden");}else el.classList.add("hidden");
  });
  const bar=document.getElementById("mineBrandBanner");
  if(bar){
    if(brand.bannerDataUrl){bar.style.backgroundImage=`linear-gradient(90deg,rgba(16,36,44,.88),rgba(16,36,44,.58)),url(${brand.bannerDataUrl})`;bar.classList.remove("hidden");bar.querySelector("span").textContent=brand.mineName||"Mining Operation";}
    else bar.classList.add("hidden");
  }
}
export function renderSupervisorComposer(){
  const host=document.getElementById("managerMessageComposer"); if(!host)return;
  host.innerHTML=`<details class="compact-disclosure"><summary><div><strong>Team message</strong><span>Send a short notice to your operational team</span></div><span class="chevron">›</span></summary><form id="supervisorMessageForm" class="compact-form"><label>Title<input name="title" maxlength="80" required placeholder="Shift notice" /></label><label>Message<textarea name="body" maxlength="400" required rows="3" placeholder="What does the team need to know?"></textarea></label><label>Expiry<select name="expiry"><option value="8">End of shift (8h)</option><option value="24">24 hours</option><option value="72">3 days</option></select></label><button class="primary" type="submit">Send to team</button></form></details>`;
}
export function bindCommunications({getState,setState,onStateChange}){
  document.addEventListener("click",e=>{const btn=e.target.closest("[data-message-toggle]");if(!btn)return;const board=btn.closest(".message-board");board?.classList.toggle("expanded");btn.textContent=board?.classList.contains("expanded")?"Show less":"View all";});
  document.addEventListener("submit",e=>{
    if(e.target?.id!=="supervisorMessageForm")return;e.preventDefault();const fd=new FormData(e.target);const state=getState();state.messages=Array.isArray(state.messages)&&state.messages.length?state.messages:[...DEFAULT_MESSAGES];const hours=Number(fd.get("expiry")||8);state.messages.unshift({id:`MSG-${Date.now()}`,audienceType:"TEAM",audienceId:"AREA-SEC3",title:String(fd.get("title")||"").trim(),body:String(fd.get("body")||"").trim(),priority:"NOTICE",authorRole:"Supervisor",authorName:"Current Supervisor",createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+hours*3600000).toISOString(),active:true});state.auditTrail.push({type:"TEAM_MESSAGE_PUBLISHED",actor:"Supervisor",at:new Date().toISOString()});setState(state);onStateChange();e.target.reset();
  });
}
export function defaultMessages(){return DEFAULT_MESSAGES.map(x=>({...x}));}
