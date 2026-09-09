class ClassList {
  constructor(){ this.set=new Set(); }
  add(...names){ names.forEach(n=>this.set.add(n)); }
  remove(...names){ names.forEach(n=>this.set.delete(n)); }
  contains(name){ return this.set.has(name); }
  toggle(name,force){ if(force===true){this.set.add(name);return true;} if(force===false){this.set.delete(name);return false;} if(this.set.has(name)){this.set.delete(name);return false;}this.set.add(name);return true; }
}
class StubElement {
  constructor(id=""){ this.id=id; this.innerHTML=""; this.textContent=""; this.value=""; this.src=""; this.className=""; this.dataset={}; this.style={}; this.classList=new ClassList(); this.children=[]; }
  addEventListener(){}
  querySelector(){ return null; }
  querySelectorAll(){ return []; }
  append(el){ this.children.push(el); }
  prepend(el){ this.children.unshift(el); }
  insertAdjacentElement(_where,el){ this.children.push(el); }
  insertAdjacentHTML(_where,html){ this.innerHTML += html; }
  remove(){ this.removed=true; }
}

const ids=[
  "topbarStatus","roleSelect",
  "employeeView","managerView","executiveView","adminView",
  "employeeMessageBoard","managerMessageBoard","executiveMessageBoard","adminMessageBoard",
  "employeeLoginCard","employeeWorkspace","employeeNumber","employeePin","employeeLoginButton","employeeLoginStatus","loginMineSignals",
  "managerDashboard","executiveDashboard","adminWorkspace"
];
const elements=new Map(ids.map(id=>[id,new StubElement(id)]));
const views=["employeeView","managerView","executiveView","adminView"].map(id=>elements.get(id));
const listeners=[];
const documentStub={
  getElementById(id){ return elements.get(id)||null; },
  createElement(){ return new StubElement(); },
  querySelectorAll(selector){ if(selector===".view") return views; if(selector===".mine-brand-logo") return []; return []; },
  addEventListener(type,fn){ listeners.push([type,fn]); }
};
const storage=new Map();
globalThis.document=documentStub;
globalThis.localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
globalThis.window={location:{href:"http://localhost:8080/?role=manager",search:"?role=manager"},history:{replaceState(){}},scrollTo(){},open(){return null;},alert(){},prompt(){return null;}};
globalThis.alert=()=>{};
globalThis.prompt=()=>null;
globalThis.CSS={escape:v=>String(v)};

await import(`../js/app.js?smoke=${Date.now()}`);

if(!elements.get("topbarStatus").textContent.includes("Demo Mining Operation")) throw new Error("Topbar did not render mine/shift context");
const manager=elements.get("managerDashboard").innerHTML;
if(!manager.includes("Handover continuity")) throw new Error("Manager continuity view did not render");
if(!manager.includes("Open actions")) throw new Error("Manager action view did not render");
for(const banned of ["Operational readiness gates","Material / tonnage lineage","Mine operating sequence","Issue Ownership","Safety continuity"]){
  if(manager.toLowerCase().includes(banned.toLowerCase())) throw new Error(`Removed POC surface still rendered: ${banned}`);
}
if(!elements.get("adminWorkspace").innerHTML) throw new Error("Administration workspace did not render");
if(elements.get("roleSelect").value!=="manager") throw new Error("Role routing did not settle on manager");
console.log("PASS · v2.8 app composition root imported and rendered against DOM stubs");
console.log(`Document listeners bound: ${listeners.length}`);
