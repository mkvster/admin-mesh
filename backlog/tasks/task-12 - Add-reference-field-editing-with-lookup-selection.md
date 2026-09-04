---
id: TASK-12
title: Add reference field editing with lookup selection
status: To Do
assignee: []
created_date: '2026-09-04 14:06'
updated_date: '2026-09-04 14:08'
labels: []
milestone: s-002
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Extend the existing entity edit mode introduced in Phases 1 (task-10) and 2 (task-11) to support `reference` fields.

This phase should reuse the existing form metadata, layout, edit workflow, validation, Save/Cancel behavior, and PATCH logic. It should add a reusable reference selector that can later also be reused by reference filtering.

### Reference metadata

Use the existing reference field metadata:

```json
{
  "name": "categoryId",
  "label": "Category",
  "type": "reference",
  "reference": {
    "resource": "categories",
    "listId": "lookup",
    "displayField": "name"
  }
}
```

The stored field value remains the referenced entity identifier.

The UI should show a human-readable representation rather than only the raw identifier.

### Reference editor

Implement a reusable reference editor for edit mode.

The editor should:

* display the currently selected reference using its human-readable value;
* provide an action to choose another referenced entity;
* provide an action to clear the value when the field is not required;
* store the selected referenced entity ID as the actual form value.

Do not expose the raw foreign key as the primary editing experience.

### Lookup selector

Selecting a reference should open a reusable lookup UI based on the standard named-list protocol.

Use:

`GET /entities/{resource}/lists/{listId}/metadata`

`POST /entities/{resource}/lists/{listId}/query`

For the example above:

`GET /entities/categories/lists/lookup/metadata`

`POST /entities/categories/lists/lookup/query`

The lookup should reuse the existing list infrastructure where practical, including `ListGrid`.

### Lookup behavior

The lookup UI should:

* show the configured lookup list;
* support selecting a single row;
* identify the selected value using the target resource `idField`;
* display the field configured by `reference.displayField` as the human-readable value;
* return the selected ID and display value to the reference editor;
* allow cancellation without changing the current value.

Existing paging, sorting, and supported filtering behavior should be reused by the lookup list where practical.

### Initial reference value

When editing an existing entity, the reference editor must show the current human-readable value.

Avoid issuing one lookup request per reference field or per row.

The entity/form representation should provide enough information to render the current reference display value, or the implementation should use an efficient reusable lookup mechanism without introducing N+1 requests.

### Form integration

Reference fields should participate in the existing Angular form state.

Support:

* initial referenced ID;
* changing the selected reference;
* clearing an optional reference;
* dirty/pristine state;
* `required` validation where defined.

The PATCH payload should contain the referenced ID, not the display text.

Example:

```json
{
  "categoryId": 12
}
```

### Read-only mode

The existing read-only entity view should continue to display the human-readable reference value.

The reference editor must not replace or remove the dedicated read-only view.

### Architecture

Keep the reference selection UI reusable.

Prefer separate responsibilities such as:

* reference field editor;
* reference lookup dialog/popover;
* reusable lookup list based on existing list infrastructure.

Do not embed lookup loading and selection logic directly into the general form layout component.

The reference selector should be designed so it can later be reused by reference filtering.

### Mock API

Extend mock metadata and entity data where needed so reference editing can be tested end-to-end.

Mock relationships should use real IDs between existing mock entities, for example:

* Product → Category
* Invoice → Customer
* Payment → Invoice

Lookup list endpoints should return appropriate named-list metadata and data.

PATCH requests must persist the selected reference ID in the in-memory mock data.

### Out of scope

* multi-reference / many-to-many editing;
* relation tabs;
* master-detail editing;
* creating a referenced entity from inside the lookup;
* reference filtering itself;
* bulk reference assignment;
* cascading reference changes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
<!-- AC:END -->
