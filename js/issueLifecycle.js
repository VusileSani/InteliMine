const NEXT_STATUS=Object.freeze({OPEN:"IN_PROGRESS",IN_PROGRESS:"CLOSED"});
export function nextIssueStatus(issue){return NEXT_STATUS[issue?.currentStatus]||null;}
export function transitionLabel(status){return{IN_PROGRESS:"Start work",CLOSED:"Close"}[status]||status;}

export function normalizeIssueLifecycle(issue){
  if(!issue)return issue;
  if(issue.currentStatus==="ACKNOWLEDGED") issue.currentStatus="IN_PROGRESS";
  if(issue.currentStatus==="RESOLVED") issue.currentStatus="CLOSED";
  return issue;
}

export function assignIssue(state,issueId,{teamId=null,employeeId=null,actorId="ROLE-MINE-MANAGER",reason="Management assignment"}={}){
  const issue=(state.issues||[]).find(i=>i.issueId===issueId); if(!issue)return{ok:false,message:"Issue not found."};
  const at=new Date().toISOString(); issue.assignedTeamId=teamId||null; issue.assignedEmployeeId=employeeId||null; issue.assignmentHistory=Array.isArray(issue.assignmentHistory)?issue.assignmentHistory:[]; issue.assignmentHistory.push({teamId:issue.assignedTeamId,employeeId:issue.assignedEmployeeId,at,actorId,reason});
  state.auditTrail.push({type:"ISSUE_ASSIGNED",issueId,teamId:issue.assignedTeamId,employeeId:issue.assignedEmployeeId,actorId,reason,at}); return{ok:true,issue};
}

export function transitionIssue(state,issueId,options={}){
  if(typeof options==="string")options={actorId:options};
  const {actorId="ROLE-MINE-MANAGER",reason="",evidence="",verifiedByEmployeeId=null}=options;
  const issue=(state.issues||[]).find(i=>i.issueId===issueId); if(!issue)return{ok:false,message:"Issue not found."};
  normalizeIssueLifecycle(issue);
  const next=nextIssueStatus(issue); if(!next)return{ok:false,message:"No further lifecycle transition is available."};
  if(next==="CLOSED"&&!String(reason).trim())return{ok:false,message:"Closure reasoning is required."};
  const at=new Date().toISOString();
  const lifecycleReason=String(reason).trim()||(next==="IN_PROGRESS"?"Work started":"Action closed");
  issue.currentStatus=next;
  issue.lifecycleHistory=Array.isArray(issue.lifecycleHistory)?issue.lifecycleHistory:[];
  issue.lifecycleHistory.push({status:next,at,actorId,reason:lifecycleReason,evidence:String(evidence||"").trim()||null,verifiedByEmployeeId:verifiedByEmployeeId||null});
  if(next==="IN_PROGRESS"){
    issue.acknowledgedAt=issue.acknowledgedAt||at;
    issue.workStartedAt=issue.workStartedAt||at;
  }
  if(next==="CLOSED"){
    issue.resolvedAt=issue.resolvedAt||at;
    issue.closedAt=at;
    issue.resolutionReason=issue.resolutionReason||lifecycleReason;
    issue.resolutionEvidence=issue.resolutionEvidence||String(evidence||"").trim()||null;
    issue.closureReason=lifecycleReason;
    issue.verifiedByEmployeeId=verifiedByEmployeeId||issue.verifiedByEmployeeId||null;
  }
  state.auditTrail.push({type:"ISSUE_STATUS_CHANGED",issueId,status:next,actorId,reason:lifecycleReason,evidence:String(evidence||"").trim()||null,verifiedByEmployeeId:verifiedByEmployeeId||null,at});
  return{ok:true,issue};
}
