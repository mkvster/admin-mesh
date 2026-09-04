---
id: TASK-5
title: ListGrid - Add inline editing for active column filters
status: To Do
assignee: []
created_date: '2026-09-02 13:29'
updated_date: '2026-09-04 13:12'
labels: []
milestone: s-010
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Allow users to quickly edit the value of an existing column filter directly from the active filter indicator in the grid header, without opening the full Filters dialog.

This feature should reuse the filter editor controls already implemented for the main Filters dialog.

### Behavior

When a column has an active filter, its funnel indicator shows the current filter summary.

Example:

```text
Contains "apple"
```

or:

```text
Between 100 and 500
```

Clicking the active filter indicator should open a small inline editor anchored to the column header.

Prefer an inline popover-style editor over a separate modal dialog.

### Editing scope

The quick editor is intended for changing only the current filter value or range.

Examples:

```text
Contains [ apple ]
```

```text
Between [ 100 ] and [ 500 ]
```

```text
After [ Sep 1, 2026 ]
```

```text
Equals [ Active ▼ ]
```

The existing filter structure should remain unchanged.

For example, if the filter is:

```json
{
  "field": "name",
  "operator": "contains",
  "value": "apple"
}
```

the quick editor may change `"apple"` to `"banana"`, but should not change `contains` to another operator.

Changing the operator or restructuring filters remains the responsibility of the main Filters dialog.

### Supported types

Reuse the existing filter controls for all filter types already supported at the time this feature is implemented, including:

* string;
* integer / decimal;
* boolean;
* date / datetime;
* enum.

For range filters, allow editing both values.

### Apply behavior

Changes should be applied either:

* explicitly with a small `Apply` action; or
* on Enter / appropriate control confirmation.

Provide a way to cancel without changing the filter.

Applying a change must:

* update the existing filter condition;
* reset paging to page 1;
* reload list data;
* update the filter summary shown in the column header;
* not reload entity or list metadata.

### Reuse

Do not implement a second independent set of filter controls.

Extract or reuse the filter value editor components created for the main Filters dialog so that both the full dialog and the inline editor use the same type-specific controls and validation.

### Out of scope

* changing the filter operator;
* adding/removing filter conditions;
* changing AND/OR relationships;
* creating a new filter from an unfiltered column;
* editing the complete filter expression from the header.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
<!-- AC:END -->
