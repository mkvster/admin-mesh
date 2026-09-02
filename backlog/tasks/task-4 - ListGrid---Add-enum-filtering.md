---
id: TASK-4
title: ListGrid - Add enum filtering
status: To Do
assignee: []
created_date: '2026-09-02 13:23'
updated_date: '2026-09-02 13:50'
labels: []
milestone: s-001
dependencies: []
priority: medium
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
<!-- AC:END -->
