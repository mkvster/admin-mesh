---
id: TASK-2
title: ListGrid - Add string filtering
status: In Progress
assignee: []
created_date: '2026-09-02 13:16'
updated_date: '2026-09-02 17:15'
labels: []
milestone: s-001
dependencies: []
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the first complete vertical slice of list filtering for `string` fields, including UI, query state, Admin API request generation, and mock backend processing.

### UI

Add a `Filters` action for the whole entity list.

Clicking it opens a large `MatDialog` that displays all currently configured filters for the list. For this task, only `string` fields are supported.

A string filter should allow:

* selecting a string field;
* selecting an operator:

  * `contains`
  * `equals`
  * `startsWith`
  * `endsWith`
* entering the comparison value;
* adding/removing multiple filter conditions.

For the initial implementation, all conditions are combined with `AND`.

Example:

```text
Last Name    contains      smith
Email        ends with     @example.com
```

The dialog should provide `Apply`, `Cancel`, and `Clear all` actions.

### Reusable filter value editors

The Filters dialog should use a small dispatcher component and specialized value editors by field type:

```text
filter/
  filter-value-editor/
    filter-value-editor.ts        // dispatcher

  string-filter-editor/
    string-filter-editor.ts

  numeric-filter-editor/          // later
  boolean-filter-editor/          // later
  date-filter-editor/             // later
  enum-filter-editor/             // later
  reference-filter-editor/        // later
```

`FilterValueEditor` should receive:

```ts
field = input.required<ListField>();
operator = input.required<FilterOperator>();
value = model<unknown>();
```

It dispatches by `field.type`. This task implements `FilterValueEditor` and `StringFilterEditor`; future tasks add the other specialized editors. The dispatcher passes the selected operator to the specialized editor because the operator can determine the value UI, such as one or two inputs for a future range operator.

The Filters dialog owns field and operator selection. The value editor owns only value editing and validation. Future inline editing from the active column indicator must reuse the same `FilterValueEditor` instead of implementing a second set of type-specific controls.
### Column indication

If a column has an active filter, show a funnel icon in that column header.

If the column has no active filter, do not show a funnel icon.

Hovering over the active funnel icon should show a read-only summary, for example:

```text
Contains "smith"
```

Direct editing from the header indicator is out of scope for this task.

### Client query state

Store active filters as part of the entity-list query state.

Example:

```json
{
  "operator": "and",
  "items": [
    {
      "field": "lastName",
      "operator": "contains",
      "value": "smith"
    },
    {
      "field": "email",
      "operator": "endsWith",
      "value": "@example.com"
    }
  ]
}
```

Applying or clearing filters must reset the list to page 1 and reload only the list data; entity metadata and list metadata must not be reloaded.

### Admin API

Send the filter expression in the existing list query request:

```text
POST /entities/{resource}/lists/{listId}/query
```

String filtering must remain semantic. The client sends values such as `"smith"` and operators such as `"contains"`; it must not generate SQL wildcards such as `%smith%`.

### Mock API

Extend the shared mock list-query processor so all mock entities automatically support the same string filtering behavior.

Processing order should be:

```text
filter
ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ sort
ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ totalCount
ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ paging
```

The mock implementation must support:

```text
contains
equals
startsWith
endsWith
```

Filtering should be case-insensitive for the initial implementation.

### Clarifications

* Multiple conditions for the same field are allowed; all conditions are combined with `AND`.
* A newly added condition is valid only when it has a field, an operator, and a required value. `Apply` is disabled and validation is shown while any condition is incomplete.
* An empty string value is not an active filter and must not be applied.
* `Clear all` clears only the draft conditions inside the dialog. It does not reload the list until `Apply` is pressed.
* `Cancel` discards all draft changes and restores the filter state that existed when the dialog was opened.
* If a column has multiple active filters, show all of them in the tooltip, joined with `AND`, for example `Contains "apple"` followed by `AND Ends with "juice"`.
* The UI is English-only for this task, without i18n. Use the labels `Contains`, `Equals`, `Starts with`, `Ends with`, and the buttons `Apply`, `Cancel`, `Clear all`.
### Out of scope

* numeric filters;
* date/datetime filters;
* boolean filters;
* enum filters;
* reference filters;
* OR/nested filter groups;
* regex;
* SQL wildcard syntax;
* inline editing from the column funnel indicator.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The whole entity list exposes a Filters action that opens a large Angular Material dialog listing the currently configured string filters.
- [ ] #2 Each filter condition supports selecting a string field, selecting contains/equals/startsWith/endsWith, entering a value, and adding or removing conditions; multiple conditions for the same field are supported.
- [ ] #3 Apply is disabled and validation is shown when any draft condition is incomplete; empty string values are not applied as filters.
- [ ] #4 Clear all changes only the dialog draft; Apply commits the draft, Cancel discards it, and applying or clearing filters resets the list to page 1.
- [ ] #5 The active filter state is stored in the entity-list query state using an AND expression with semantic field, operator, and value entries.
- [ ] #6 Applying or clearing filters reloads only list data; entity metadata and list metadata are not reloaded.
- [ ] #7 The Admin API list-query request sends semantic string operators and raw values, without SQL wildcard transformation.
- [ ] #8 The shared mock list-query processor supports all four string operators case-insensitively and processes filter before sort, totalCount, and paging.
- [ ] #9 A funnel icon is shown only for columns with active filters, and its read-only tooltip shows all filters for that column joined with AND.
- [ ] #10 The dialog uses a reusable FilterValueEditor dispatcher with a StringFilterEditor implementation; the dispatcher receives field, operator, and value and future inline editing can reuse it without duplicating type-specific value-editing logic.
<!-- AC:END -->
