---
id: TASK-6
title: ListGrid - Add advanced sorting dialog for entity lists
status: To Do
assignee: []
created_date: '2026-09-02 13:37'
updated_date: '2026-09-02 13:40'
labels: []
milestone: s-010
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a dedicated sorting dialog that allows users to view and edit the complete multi-column sort definition for an entity list.

This dialog is an additional UI for the existing list sorting behavior. It should reuse the same sort query state used by header sorting and must not introduce a separate sorting model.

### UI

Add a `Sorting` action for the whole entity list.

Clicking it opens a large `MatDialog` showing all active sort fields in priority order.

Example:

```text
1. Last Name      ASC
2. First Name     ASC
3. Customer ID    DESC
```

Each sort item should allow:

* selecting/changing the field;
* selecting `ASC` or `DESC`;
* changing sort priority;
* removing the sort item.

Provide an action to add another sort field.

### Sort priority

The order of items in the dialog defines sort priority.

For example:

```text
1. lastName ASC
2. firstName ASC
3. customerId DESC
```

must produce:

```json
[
  { "field": "lastName", "direction": "asc" },
  { "field": "firstName", "direction": "asc" },
  { "field": "customerId", "direction": "desc" }
]
```

Changing priority may be implemented using drag-and-drop or explicit move up/down controls.

### Column headers

The existing header indicators should remain synchronized with the dialog.

For active sort columns, show:

```text
Last Name ↑ 1
First Name ↑ 2
Customer ID ↓ 3
```

Columns not participating in sorting should not display a sort indicator.

### Integration

The dialog must use the same list query state as header-based sorting.

Changes made in the dialog must:

* update the active sort definition;
* update header indicators;
* reset paging to page 1;
* reload list data;
* not reload entity or list metadata;
* update the browser URL/query parameters if sorting state is persisted there.

Changes made through column headers must also be reflected when the Sorting dialog is opened.

### Validation

A field must not appear more than once in the sort definition.

Fields with `disableSorting: true` must not be available for selection.

### Actions

Provide:

* `Apply`
* `Cancel`
* `Clear sorting`

`Cancel` must leave the existing sort state unchanged.

### Out of scope

* filtering;
* grouping;
* saved sort presets;
* server-side changes to the sort protocol;
* per-user persistence beyond the existing URL/query-state mechanism.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
<!-- AC:END -->
