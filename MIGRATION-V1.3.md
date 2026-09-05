# V1.3 copy-over note

Copy the complete V1.3 folder contents over the existing InteliMine project.

If V1.2 files were previously copied into the repository, remove these obsolete files after the copy:

- `js/eventLifecycle.js` — replaced by `js/issueLifecycle.js`
- `data/analytics-event-fact-template.csv` — replaced by separate observation/check/issue fact templates

V1.3 uses a new localStorage schema key and intentionally starts with fresh demo state.
