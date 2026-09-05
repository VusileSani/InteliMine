const NEXT_STATUS = Object.freeze({
  OPEN: "ACKNOWLEDGED",
  ACKNOWLEDGED: "IN_PROGRESS",
  IN_PROGRESS: "RESOLVED",
  RESOLVED: "CLOSED"
});

export function nextIssueStatus(issue) {
  return NEXT_STATUS[issue?.currentStatus] || null;
}

export function transitionLabel(status) {
  return {
    ACKNOWLEDGED: "Acknowledge",
    IN_PROGRESS: "Start work",
    RESOLVED: "Resolve",
    CLOSED: "Close"
  }[status] || status;
}

export function transitionIssue(state, issueId, actorId = "MANAGER-DEMO") {
  const issue = (state.issues || []).find(item => item.issueId === issueId);
  if (!issue) return { ok: false, message: "Issue not found." };

  const next = nextIssueStatus(issue);
  if (!next) return { ok: false, message: "No further lifecycle transition is available." };

  const at = new Date().toISOString();
  issue.currentStatus = next;
  issue.lifecycleHistory = Array.isArray(issue.lifecycleHistory) ? issue.lifecycleHistory : [];
  issue.lifecycleHistory.push({ status: next, at, actorId, reason: "Management lifecycle update" });

  if (next === "ACKNOWLEDGED") issue.acknowledgedAt = at;
  if (next === "IN_PROGRESS") issue.workStartedAt = at;
  if (next === "RESOLVED") issue.resolvedAt = at;
  if (next === "CLOSED") issue.closedAt = at;

  state.auditTrail.push({ type: "ISSUE_STATUS_CHANGED", issueId, status: next, actorId, at });
  return { ok: true, issue };
}
