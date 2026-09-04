# AdminMesh Filter Operators

This document defines the filter condition syntax used by AdminMesh list
queries. Filter conditions are combined with `AND` by the current list
implementation.

## Condition shape

Each condition has a field, an operator, and a value:

```json
{
  "field": "total",
  "operator": "greaterThanOrEqual",
  "value": 100
}
```

The operator names below are the wire contract. Clients must use these names;
short aliases such as `eq` are not supported.

## String fields

| Operator | Meaning |
| --- | --- |
| `equals` | The field equals the supplied string. |
| `contains` | The field contains the supplied string. |
| `startsWith` | The field starts with the supplied string. |
| `endsWith` | The field ends with the supplied string. |

String matching is case-insensitive in the shared mock processor.

## Enum fields

Enum fields use the values defined in field metadata and support:

| Operator | Value shape | Meaning |
| --- | --- | --- |
| `equals` | scalar | The field equals one enum value. |
| `notEquals` | scalar | The field differs from one enum value. |
| `in` | array | The field matches one of the supplied enum values. |
| `notIn` | array | The field matches none of the supplied enum values. |

The API exchanges the underlying enum values, which may be strings or integers.
The labels associated with those values in field metadata are for display only.

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

## Numeric fields

`integer` and `decimal` fields support:

| Operator | Meaning |
| --- | --- |
| `equals` | Equal numeric value. |
| `notEquals` | Different numeric value. |
| `greaterThan` | Greater than the supplied value. |
| `greaterThanOrEqual` | Greater than or equal to the supplied value. |
| `lessThan` | Less than the supplied value. |
| `lessThanOrEqual` | Less than or equal to the supplied value. |
| `between` | Within the supplied inclusive range. |

Single-value examples use a JSON number. `between` uses two values in
`[from, to]` order:

```json
{
  "field": "total",
  "operator": "between",
  "value": [100, 500]
}
```

## Boolean fields

Boolean fields use `equals` with a JSON boolean:

```json
{
  "field": "enabled",
  "operator": "equals",
  "value": true
}
```

The UI offers `Any`, `Yes`, and `No`. `Any` does not generate a condition.

## Date and datetime fields

Date and datetime fields support:

| Operator | Meaning |
| --- | --- |
| `equals` | Equal date or instant. |
| `before` | Earlier than the supplied date or instant. |
| `after` | Later than the supplied date or instant. |
| `between` | Within the supplied inclusive range. |
| `inThePast` | Within a dynamic rolling period before the current time. |

`date` values are calendar dates in `YYYY-MM-DD` format and have no timezone.

`datetime` values are UTC ISO 8601 instants with millisecond precision:
`YYYY-MM-DDTHH:mm:ss.SSSZ`. The UI may edit the value in the browser's local
timezone, but the API representation is always UTC.

`inThePast` uses one of these relative period values:

| Value | Meaning |
| --- | --- |
| `hour` | The previous hour. |
| `24hours` | The previous 24 hours. |
| `week` | The previous 7 days. |
| `month` | The previous 30 days. |
| `year` | The previous 365 days. |

Relative periods are evaluated against the current time for every query. They
are stored as relative values so a saved URL remains dynamic.

Example:

```json
{
  "field": "paymentDate",
  "operator": "inThePast",
  "value": "24hours"
}
```

Examples:

```json
{
  "field": "issueDate",
  "operator": "between",
  "value": ["2026-08-01", "2026-08-31"]
}
```

```json
{
  "field": "paymentDate",
  "operator": "after",
  "value": "2026-09-03T14:30:00.000Z"
}
```

## Groups and scope

The current client implementation emits one `and` group containing flat
conditions. Nested `AND`/`OR` groups are not part of the current filtering
feature.
