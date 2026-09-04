---
id: TASK-4
title: ListGrid - Add enum filtering
status: Done
assignee: []
created_date: '2026-09-02 13:23'
updated_date: '2026-09-04 17:46'
labels: []
milestone: s-001
dependencies: []
priority: medium
ordinal: 2750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Extend the existing entity-list filtering infrastructure to support `enum` fields using enum metadata values.

Reuse the existing Filters dialog, query state, column filter indicators, Admin API query format, and shared mock list-query processor.

### UI

For an `enum` field, show the available values using labels from field metadata.

Example metadata:

```json
{
  "name": "status",
  "label": "Status",
  "type": "enum",
  "values": [
    { "value": "draft", "label": "Draft" },
    { "value": "active", "label": "Active" },
    { "value": "archived", "label": "Archived" }
  ]
}
```

Support:

* single-value selection;
* multi-value selection;
* clearing the selection.

The UI must display enum labels, but filters must send the underlying enum values.

### Operators

Support:

```text
equals
notEquals
in
notIn
```

Examples:

```json
{
  "field": "status",
  "operator": "equals",
  "value": "active"
}
```

```json
{
  "field": "status",
  "operator": "in",
  "value": ["draft", "active"]
}
```

### Column indication

Reuse the existing active-filter funnel behavior.

Example tooltip summaries:

```text
Equals Active
In Draft, Active
Not Archived
```

No funnel icon should be displayed when the enum field has no active filter.

### Query behavior

Enum filters participate in the existing list filter expression and are combined with other active filters using `AND` for the current implementation.

Applying or clearing the filter must:

* reset paging to page 1;
* reload list data;
* not reload entity or list metadata.

### Mock API

Extend the shared mock list-query processor with enum comparison support.

The mock must compare against the underlying enum values, not the display labels.

Processing order remains:

```text
filter
→ sort
→ totalCount
→ paging
```

### Out of scope

* reference filtering;
* nested `AND` / `OR` groups;
* free-text matching against enum labels;
* inline editing from the column funnel indicator.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Enum fields support the equals, notEquals, in, and notIn operators. Options are displayed using the labels from field metadata, while the underlying string or integer values are sent to the API.
- [x] #2 equals and notEquals use a single-select control and send a scalar value; in and notIn use a multi-select control and send an array of values.
- [x] #3 Selected enum values can be deselected in the select control. Applying an enum filter with no selected value is prevented and shows a validation message such as 'Choose a value(s)'.
- [x] #4 Enum filters participate in the existing AND expression. Applying a filter resets paging to page 1 and reloads list data without reloading metadata; active filters show the existing funnel indicator and a tooltip using enum labels.
- [x] #5 The shared mock list-query processor supports all four enum operators using underlying values and preserves the order filter -> sort -> totalCount -> paging. docs/FilterOperators.md documents enum filtering.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extend filter types, serialization, validation, and value editor support for enum scalar and array values. 2. Add enum filter controls and operator handling using metadata labels while preserving API values. 3. Add enum tooltip formatting and mock query processor comparisons. 4. Add or update unit tests for enum filtering, validation, serialization, and query behavior. 5. Document enum operators and run the relevant test and build checks.

6. Render distinct single-select and multi-select Material controls so only in/notIn expose checkbox selection.

7. Use a single-select placeholder for empty equals/notEquals values without adding a placeholder option to the enum options list.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Enum metadata separates the underlying value from its display label. The underlying value may be a string or an integer; labels are strings shown in the UI. The UI uses single-select for equals/notEquals and multi-select for in/notIn. The API keeps the corresponding wire shapes: scalar for equals/notEquals and an array for in/notIn; backend implementations may normalize a single scalar to a one-item array internally. An empty enum selection is invalid and must prevent applying the filter with a validation message such as 'Choose a value(s)'. No dedicated clear-selection control is required; users can deselect values in the select. Select all/Deselect all controls are optional and out of scope for acceptance. Unit tests for the existing filtering components and shared mock processor are sufficient; UI/e2e tests are not required unless the implementation reveals a specific need.

Verification: targeted Vitest run passed 12/12 tests for mock list-query, filter serialization, and normalization. Production build passed with the existing initial bundle-size warning. git diff --check passed. Full ng test remains blocked by pre-existing jasmine type errors in src/app/navigation/navigation.spec.ts, which was not changed.

Follow-up bug reported: equals/notEquals must never render a multi-select or checkbox UI; only in/notIn may use multi-select checkboxes.

Follow-up verification: replaced the dynamic multiple binding with distinct single-select and multi-select Material templates. equals/notEquals now render without checkboxes; only in/notIn render multi-select checkboxes. Targeted Vitest tests passed 12/12 and production build passed.

Follow-up UI refinement: single-select empty state should show 'Choose a value' rather than 'Choose a value(s)'; 'Select a value' should be a trigger placeholder only, not a selectable option.

Follow-up verification: single-select now uses the MatSelect placeholder 'Select a value' without a placeholder MatOption, so the dropdown contains only real enum values. Empty single-select validation now says 'Choose a value'; multi-select validation remains 'Choose a value(s)'. Targeted Vitest tests passed 12/12 and production build passed.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented enum filtering with correct single-select and multi-select behavior. equals/notEquals render a single-select without checkboxes; in/notIn render a multi-select with checkboxes. Single-select empty state uses a placeholder-only 'Select a value' and validates with 'Choose a value'; multi-select validates with 'Choose a value(s)'. Verified with targeted Vitest tests (12/12) and production build; only the existing bundle-size warning remains.
<!-- SECTION:FINAL_SUMMARY:END -->
