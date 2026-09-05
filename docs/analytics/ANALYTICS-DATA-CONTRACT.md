# InteliMine Analytics Data Contract — v1.1

## Principle
The long-term asset is a governed set of analytical facts whose grain and meaning remain stable even when screens, employee assignments, terminology and BI tools change.

## Fact grains
### Reporting compliance fact
One row per reporting obligation per employee per shift instance.

### Structured check fact
One row per required report question/answer. Normal answers are retained so analytics has a denominator, not only exceptions.

### Observation fact
One immutable row per noteworthy thing an employee observed. The observation never carries a mutable workflow status.

### Issue fact
One row per managed operational problem. An issue may reference one or many observations and owns the mutable lifecycle: OPEN → ACKNOWLEDGED → IN_PROGRESS → RESOLVED → CLOSED.

## Required analytical context
Facts should carry stable IDs and a frozen context snapshot for employee, role, department, operation and home area as they existed at capture time.

## Time
Facts use a shiftInstanceId, shift business date, operation timezone, UTC timestamps, and local observation date/time. Cross-midnight shifts must resolve an entered clock time within the shift interval.

## Versioning
Analytical records carry:
- dataContractVersion
- reportSchemaVersion
- eventTaxonomyVersion
- masterDataVersion

## Provenance
Capture records identify channel and capture point. Integration-origin records should also preserve source system, source record and import batch identifiers.
