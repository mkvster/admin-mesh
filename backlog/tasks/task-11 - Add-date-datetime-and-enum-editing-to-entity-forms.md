---
id: TASK-11
title: 'Add date, datetime, and enum editing to entity forms'
status: To Do
assignee: []
created_date: '2026-09-04 13:59'
updated_date: '2026-09-04 14:00'
labels: []
milestone: s-002
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Extend the existing entity edit mode introduced in Phase 1 to support additional field types.

This phase should reuse the existing form metadata, layout, edit workflow, validation, Save/Cancel behavior, and PATCH logic. It should only add new type-specific editors.

### Supported editable field types

Add editing support for:

* `date`
* `datetime`
* `enum`

Existing Phase 1 support for:

* `string`
* `integer`
* `decimal`
* `boolean`

must continue to work unchanged.

### Date fields

For `date` fields:

* use Angular Material date picker controls;
* preserve date-only semantics;
* do not introduce timezone conversion;
* send values using the Admin API date format:

`YYYY-MM-DD`

Example:

`2026-09-04`

### Datetime fields

For `datetime` fields:

* use Angular Material date + time controls;
* use `MatDatepicker` and `MatTimepicker` together;
* treat the UI value as local browser time;
* convert to UTC before sending to the Admin API;
* send values in ISO 8601 UTC format.

Example:

`2026-09-04T14:30:00.000Z`

The implementation should keep date and time parts synchronized as one logical datetime value.

### Enum fields

For `enum` fields:

* render a Material select control;
* display enum labels from field metadata;
* store/send the underlying enum values;
* initialize the selected value from the loaded entity.

Example metadata:

`values: [{ value: 'active', label: 'Active' }]`

The UI should display `Active`, while the PATCH payload should contain `active`.

### Validation

Reuse the existing validation infrastructure.

Supported editors should respect applicable metadata rules such as:

* `required`
* valid date/datetime input
* enum value must be one of the declared values

Invalid forms must not be submitted.

### Unsupported fields

Field types still not covered by editing should remain visible using the existing read-only renderer or placeholder behavior.

At this phase, this primarily includes:

* `reference`

### Architecture

Keep all new editors type-specific and reusable.

Prefer separate components such as:

* date field editor
* datetime field editor
* enum field editor

Do not add field-type branching directly into the general form layout component.

The overall edit architecture should remain extensible so later phases can add `reference` editing without changing the form layout or Save/Cancel workflow.

### Mock API

No new PATCH endpoint behavior is required beyond the existing Phase 1 update support.

Mock data should include representative date, datetime, and enum values so these editors can be tested end-to-end.

### Out of scope

* reference editing
* reference lookup selector
* create mode
* relation editing
* custom timezone selection
* multi-select enum fields
* print/PDF behavior
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
<!-- AC:END -->
