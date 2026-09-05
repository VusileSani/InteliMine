export const EMPLOYEES = Object.freeze([
  { id: "emp_104782", employeeNumber: "104782", pin: "1111", name: "Thabo Mokoena", role: "Fitter", department: "Engineering", area: "Section 3", active: true },
  { id: "emp_105310", employeeNumber: "105310", pin: "2222", name: "Sipho Dlamini", role: "Electrician", department: "Engineering", area: "Section 3", active: true },
  { id: "emp_106004", employeeNumber: "106004", pin: "3333", name: "Lerato Maseko", role: "Safety Officer", department: "Safety", area: "Section 3", active: true },
  { id: "emp_107199", employeeNumber: "107199", pin: "4444", name: "Mandla Khumalo", role: "Supervisor", department: "Production", area: "Section 3", active: true },
  { id: "emp_108022", employeeNumber: "108022", pin: "5555", name: "Nandi Cele", role: "Operator", department: "Production", area: "Section 3", active: true }
]);

export const DEMO_ATTENDANCE = Object.freeze([
  { employeeId: "emp_104782", clockedIn: true, clockInTime: "18:01" },
  { employeeId: "emp_105310", clockedIn: true, clockInTime: "17:58" },
  { employeeId: "emp_106004", clockedIn: true, clockInTime: "18:03" },
  { employeeId: "emp_107199", clockedIn: true, clockInTime: "17:49" },
  { employeeId: "emp_108022", clockedIn: true, clockInTime: "18:05" }
]);

export const DEMO_INITIAL_SUBMISSIONS = Object.freeze([
  {
    employeeId: "emp_104782",
    status: "complete",
    completedAt: "2026-09-05T18:47:00+02:00",
    answers: { equipmentWorkedOn: "CV-04", equipmentConcern: "yes", equipmentCondition: "Abnormal vibration near drive pulley", outstandingWork: "Inspect bearing alignment on next shift", handoverNote: "Monitor CV-04 before full load" }
  },
  {
    employeeId: "emp_106004",
    status: "complete",
    completedAt: "2026-09-05T18:42:00+02:00",
    answers: { hazardsObserved: "yes", hazardDetails: "Loose rock observed near Panel B access", incidentOrNearMiss: "no", correctiveAction: "Area barricaded and supervisor informed", outstandingSafety: "Re-inspection required before next entry" }
  }
]);
