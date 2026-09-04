---
id: TASK-9
title: Add read-only entity details view from form metadata
status: To Do
assignee: []
created_date: '2026-09-04 13:47'
updated_date: '2026-09-04 13:48'
labels: []
milestone: s-002
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement a reusable read-only entity details view for `rest-entity` nodes.

The view should use the existing entity metadata and form metadata to render a complete entity representation without editable controls.

The implementation should be designed so the same layout and field-definition logic can later be reused by Edit and Create modes.

### Data loading

When opening an entity:

* determine the form definition from entity metadata;
* load the selected form metadata;
* load the entity using the form projection, when specified;
* use the entity `idField` from metadata rather than assuming a specific ID property.

Example:

`GET /entities/{resource}/{id}?projection={projection}`

### Layout

Render fields according to the form metadata layout:

* respect `layout.columns`;
* respect each field item's `start`;
* respect each field item's `span`;
* preserve field ordering from metadata.

The layout implementation should be reusable by future editable forms.

### Field rendering

Render values as read-only content rather than disabled form controls.

Initial field rendering should support:

* `string`
* `integer`
* `decimal`
* `boolean`
* `date`
* `datetime`
* `enum`

Use type-aware display formatting where appropriate:

* enum values should display labels;
* boolean values should use a readable visual representation;
* dates and datetimes should use user-friendly formatting.

`reference` fields may initially fall back to their raw value if reusable reference display support is not yet available.

### Architecture

Separate layout rendering from field value rendering.

Prefer a structure that can later support:

`view | edit | create`

without duplicating form layout logic.

For example:

* a reusable entity form/details layout component;
* a read-only field renderer for view mode;
* future editable field controls for edit/create mode.

The current task should implement only the read-only mode, but the component boundaries should allow editable controls to be added later without rebuilding the layout system.

### UI

Provide a clear entity details view with:

* entity title;
* field labels;
* read-only values;
* consistent spacing and alignment;
* responsive layout where practical.

The view should not show Save or validation controls.

### Error and loading states

Handle:

* form metadata loading;
* entity data loading;
* missing entity;
* API errors.

### Out of scope

* editing values;
* saving changes;
* create mode;
* validation;
* reference lookup/editing;
* delete;
* print/PDF behavior;
* relation tabs or master-detail sections.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
<!-- AC:END -->
