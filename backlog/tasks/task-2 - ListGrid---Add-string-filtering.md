---
id: TASK-2
title: ListGrid - Add string filtering
status: To Do
assignee: []
created_date: '2026-09-02 13:16'
updated_date: '2026-09-02 13:17'
labels: []
milestone: s-001
dependencies: []
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
→ sort
→ totalCount
→ paging
```

The mock implementation must support:

```text
contains
equals
startsWith
endsWith
```

Filtering should be case-insensitive for the initial implementation.

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
<!-- AC:END -->
