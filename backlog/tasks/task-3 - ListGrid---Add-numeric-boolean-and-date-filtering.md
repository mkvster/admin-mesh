---
id: TASK-3
title: 'ListGrid - Add numeric, boolean, and date filtering'
status: Done
assignee: []
created_date: '2026-09-02 13:20'
updated_date: '2026-09-04 02:44'
labels: []
milestone: s-001
dependencies: []
references:
  - docs/FilterOperators.md
priority: medium
ordinal: 1750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Extend the existing entity-list filtering infrastructure to support numeric, boolean, date, and datetime fields.

The existing Filters dialog, query state, column filter indicators, Admin API request format, and mock query processor should be reused.

### Numeric fields

Support `integer` and `decimal` fields.

Operators:

* `equals`
* `notEquals`
* `greaterThan`
* `greaterThanOrEqual`
* `lessThan`
* `lessThanOrEqual`
* `between`

UI:

* numeric input for single-value operators;
* `From` / `To` inputs for `between`.

Example:

```json
{
  "field": "total",
  "operator": "between",
  "value": [100, 500]
}
```

### Boolean fields

Support boolean filtering with a simple control:

```text
Any
Yes
No
```

`Any` means no filter condition is generated.

Example:

```json
{
  "field": "enabled",
  "operator": "equals",
  "value": true
}
```

### Date and datetime fields

Support `date` and `datetime`.

Operators:

* `equals`
* `before`
* `after`
* `between`

Use Angular Material date/date-time appropriate controls where available.

For `between`, display `From` and `To` values.

Example:

```json
{
  "field": "issueDate",
  "operator": "between",
  "value": [
    "2026-08-01",
    "2026-08-31"
  ]
}
```

Date values must be sent using the Admin API date representation rather than locale-formatted display strings.

### Column indication

Reuse the existing active-filter funnel behavior.

Examples of tooltip summaries:

```text
Greater than 100
Between 100 and 500
Yes
After Sep 1, 2026
Sep 1, 2026 – Sep 30, 2026
```

No funnel icon should be displayed when the field has no active filter.

### Query behavior

All active filters remain combined using `AND` for the current implementation.

Applying or changing filters:

* resets paging to page 1;
* reloads list data;
* does not reload entity or list metadata.

### Mock API

Extend the shared mock list-query processor to evaluate the new operators for their appropriate data types.

Processing order remains:

```text
filter
→ sort
→ totalCount
→ paging
```

Numeric comparisons must be numeric rather than string comparisons.

Date/datetime comparisons must use parsed date values rather than formatted display strings.

### Out of scope

* reference filtering;
* enum filtering;
* nested `AND` / `OR` groups;
* regex;
* inline editing from the column filter indicator.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Filter dialog exposes integer, decimal, boolean, date, and datetime fields using the existing string-filter row/editor pattern, with only type-appropriate operators and controls.
- [x] #2 Typed filter values are validated, serialized to and restored from query state, and sent in the agreed Admin API representation.
- [x] #3 Applying, changing, or clearing filters keeps AND semantics, resets paging to page 1, reloads rows, and does not reload entity or list metadata.
- [x] #4 Active filters show the existing column funnel and a type-appropriate tooltip summary; fields without active filters show no funnel.
- [x] #5 The shared mock query processor and automated tests evaluate numeric, boolean, date, and datetime operators with typed comparisons in filter → sort → totalCount → paging order.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
<!-- SECTION:PLAN:BEGIN -->
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

<!-- SECTION:NOTES:END -->
<!-- SECTION:NOTES:END -->

<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

<!-- SECTION:FINAL_SUMMARY:END -->
