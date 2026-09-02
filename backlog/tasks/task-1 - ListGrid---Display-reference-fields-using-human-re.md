---
id: TASK-1
title: ListGrid - Display reference fields using human-readable values
status: To Do
assignee: []
created_date: '2026-09-02 12:42'
updated_date: '2026-09-02 12:47'
labels: []
milestone: s-001
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For `reference` fields in entity lists, display a human-readable value from the referenced entity instead of showing only the raw foreign key.

The list query should provide both the referenced entity ID and a display value. List metadata should define which returned field contains the display value.

Example:

```json
{
  "productId": 101,
  "categoryId": 12,
  "categoryName": "Electronics"
}
```

```json
{
  "field": "categoryId",
  "display": {
    "type": "reference",
    "displayField": "categoryName"
  }
}
```

`ListGridCell` should render `Electronics` instead of `12`, with a visual style indicating that the value is a reference/link. If the display value is unavailable, fall back to the raw ID.

Future enhancement: clicking the reference should open or navigate to the referenced entity.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
<!-- AC:END -->
