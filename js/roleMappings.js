export const ROLE_MAPPINGS = Object.freeze([
  { sourceSystem: "SAP", sourceJobTitle: "Engineering Artisan Mechanical UG", reportingRole: "FITTER" },
  { sourceSystem: "SAP", sourceJobTitle: "Engineering Artisan Electrical UG", reportingRole: "ELECTRICIAN" },
  { sourceSystem: "SAP", sourceJobTitle: "Safety Officer UG", reportingRole: "SAFETY_OFFICER" },
  { sourceSystem: "SAP", sourceJobTitle: "Shiftboss Mining", reportingRole: "SUPERVISOR" },
  { sourceSystem: "SAP", sourceJobTitle: "Rock Drill Operator", reportingRole: "OPERATOR" }
]);

export function mapJobTitleToReportingRole(jobTitle, sourceSystem = "SAP") {
  const cleanTitle = String(jobTitle || "").trim().toLowerCase();
  const cleanSource = String(sourceSystem || "").trim().toLowerCase();

  const match = ROLE_MAPPINGS.find(mapping =>
    mapping.sourceJobTitle.toLowerCase() === cleanTitle &&
    mapping.sourceSystem.toLowerCase() === cleanSource
  );

  return match?.reportingRole || null;
}
