# AdminMesh API Protocol

## Status

Draft — version 0.1

This document defines the HTTP protocol used by AdminMesh-compatible clients and administration backends.

A compatible backend exposes navigation, entity metadata, entity data, and supported operations using the protocol described here.

The protocol is intentionally limited. New capabilities should be added only when required by actual functionality.

---

## General Principles

* The API is REST-based.
* JSON is used for request and response bodies.
* Entity structure and supported operations are described by metadata.
* Paging, sorting, and filtering are performed by the server.
* Backend authorization is authoritative.
* Entity identifiers have no client-side semantics and must be passed between client and server without interpretation.

Example base URL:

```text
https://example.com/admin-api
```

All paths below are relative to this base URL.

---

# 1. Navigation

## GET /navigation

Returns the sections and working nodes available to the current user.

Navigation supports one level of grouping:

```text
Section
  ├── Node
  ├── Node
  └── Node
```

Example response:

```json
{
  "sections": [
    {
      "id": "sales",
      "title": "Sales",
      "nodes": [
        {
          "id": "customers",
          "title": "Customers",
          "type": "rest-entity",
          "icon": {
            "name": "users",
            "color": "#2f80ed"
          },
          "config": {
            "resource": "customers"
          }
        },
        {
          "id": "products",
          "title": "Products",
          "type": "rest-entity",
          "config": {
            "resource": "products"
          }
        }
      ]
    },
    {
      "id": "accounting",
      "title": "Accounting",
      "nodes": [
        {
          "id": "invoices",
          "title": "Invoices",
          "type": "rest-entity",
          "config": {
            "resource": "invoices"
          }
        }
      ]
    }
  ]
}
```

### Node Types

The initial protocol defines one node type:

```text
rest-entity
```

The structure of `config` is specific to the node type. Additional node types may define different configuration properties in future protocol versions.

---

# 2. Entity Metadata

## GET /entities/{resource}/metadata

Returns common metadata for a resource and identifies the named list and form definitions used by default.

Example:

```text
GET /entities/customers/metadata
```

Example response:

```json
{
  "title": "Customers",
  "singularTitle": "Customer",
  "idField": "customerId",

  "permissions": {
    "create": true,
    "edit": true,
    "delete": true
  },

  "views": {
    "list": "main",
    "form": "main"
  }
}
```

`idField` identifies the property that contains the entity identifier.

List and form identifiers are scoped to the resource. Their detailed metadata is requested only when the corresponding view is needed.

The same form is normally used for viewing and updating an entity. A resource may optionally specify a separate `createForm` when creation requires a different form definition.

---

## 2.1 List Metadata

### GET /entities/{resource}/lists/{listId}/metadata

Returns metadata describing one named list representation of a resource.

Example:

```text
GET /entities/customers/lists/main/metadata
```

Example response:

```json
{
  "fields": [
    { "name": "customerId", "label": "ID", "type": "integer" },
    { "name": "firstName", "label": "First Name", "type": "string" },
    { "name": "lastName", "label": "Last Name", "type": "string" },
    { "name": "email", "label": "Email", "type": "string" },
    {
      "name": "status",
      "label": "Status",
      "type": "enum",
      "values": [
        { "value": "new", "label": "New" },
        { "value": "active", "label": "Active" },
        { "value": "inactive", "label": "Inactive" }
      ]
    }
  ],

  "columns": [
    { "field": "firstName", "sizeType": "flex", "size": 2 },
    { "field": "lastName", "sizeType": "flex", "size": 2 },
    { "field": "email", "sizeType": "flex", "size": 3 },
    { "field": "status", "sizeType": "width", "size": 2 }
  ]
}
```

List columns support sorting and filtering unless `disableSorting` or `disableFiltering` is set to `true` for a column.

`sizeType` and `size` are optional. If omitted, the client uses its default column sizing.

The resource identifier field does not have to be displayed as a column, but query results must still include it.

A resource may expose additional named lists, for example a compact list used by a reference lookup.

For a reference field displayed in a list, the field keeps its shared `reference` metadata, while the column may define a list-specific display projection:

```json
{
  "field": "categoryId",
  "display": {
    "type": "reference",
    "valueField": "categoryName"
  }
}
```

`reference.displayField` identifies the human-readable field on the referenced entity. `column.display.valueField` identifies the field in the current list query result that contains the prepared display value. The query result must include both the raw reference ID and this projection field. If the projection value is unavailable, the client falls back to the raw ID.

---

## 2.2 Form Metadata

### GET /entities/{resource}/forms/{formId}/metadata

Returns metadata describing one named form representation of a resource.

Example:

```text
GET /entities/customers/forms/main/metadata
```

Example response:

```json
{
  "projection": "main",

  "fields": [
    {
      "name": "customerId",
      "label": "ID",
      "type": "integer",
      "readOnlyOnCreate": true,
      "readOnlyOnUpdate": true
    },
    {
      "name": "firstName",
      "label": "First Name",
      "type": "string",
      "required": true
    },
    {
      "name": "lastName",
      "label": "Last Name",
      "type": "string",
      "required": true
    },
    {
      "name": "email",
      "label": "Email",
      "type": "string",
      "required": true,
      "validation": {
        "pattern": "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
        "patternMessage": "Enter a valid email address."
      }
    },
    {
      "name": "status",
      "label": "Status",
      "type": "enum",
      "values": [
        { "value": "new", "label": "New" },
        { "value": "active", "label": "Active" },
        { "value": "inactive", "label": "Inactive" }
      ]
    },
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
  ],

  "layout": {
    "columns": 12,
    "items": [
      { "field": "customerId", "span": 4 },
      { "field": "firstName", "start": 1, "span": 5 },
      { "field": "lastName", "start": 7, "span": 5 },
      { "field": "email", "start": 1, "span": 8 },
      { "field": "status", "start": 10, "span": 3 },
      { "field": "categoryId", "start": 1, "span": 8 }
    ]
  }
}
```

Unless specified otherwise, boolean metadata properties default to `false`.

Fields are writable on create and update unless the corresponding `readOnlyOnCreate` or `readOnlyOnUpdate` property is `true`.

Validation rules are optional.

If `layout` is omitted, fields are displayed in their declared order using the default client layout.

`start` is optional and identifies the first grid column occupied by a field. `span` identifies how many grid columns the field occupies.

`projection` is optional and identifies the entity representation used when this form reads or writes entity data. If omitted, the resource default representation is used.

### Initial field types

```text
string
integer
decimal
boolean
date
datetime
enum
reference
```

For an `enum` field, `values` defines the values exchanged with the API and the corresponding labels displayed to the user.

For a `reference` field:

* `resource` identifies the target AdminMesh resource;
* `listId` identifies the named target list used for selection;
* `displayField` identifies the target field used as the human-readable selected value.

The actual stored reference value is the identifier of the referenced entity.

---

# 3. Entity List

## POST /entities/{resource}/lists/{listId}/query

Returns a paged collection using a named list representation.

The request body may contain paging, sorting, and filtering criteria.

Example:

```text
POST /entities/customers/lists/main/query
```

Example request:

```json
{
  "page": 1,
  "pageSize": 25,

  "sort": [
    {
      "field": "firstName",
      "direction": "asc"
    }
  ],

  "filter": {
    "operator": "and",
    "items": [
      {
        "field": "status",
        "operator": "eq",
        "value": "active"
      },
      {
        "operator": "or",
        "items": [
          {
            "field": "firstName",
            "operator": "contains",
            "value": "jo"
          },
          {
            "field": "email",
            "operator": "contains",
            "value": "jo"
          }
        ]
      }
    ]
  }
}
```

The filter structure is recursive:

* an object containing `field`, `operator`, and optionally `value` represents a filter condition;
* an object containing `operator` and `items` represents a filter group;
* filter groups may contain both conditions and nested groups.

This allows expressions such as:

```text
status = "active" AND (firstName contains "jo" OR email contains "jo")
```

Example response:

```json
{
  "items": [
    {
      "customerId": 101,
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@example.com",
      "status": "active"
    },
    {
      "customerId": 102,
      "firstName": "Joanna",
      "lastName": "Brown",
      "email": "joanna@example.com",
      "status": "active"
    }
  ],
  "page": 1,
  "pageSize": 25,
  "totalCount": 137
}
```

Each returned item must include the resource `idField`, even if that field is not displayed as a list column.

The backend is not required to return fields that are not needed by the named list representation. Additional properties may be returned and are ignored by the client if they are not described by the list metadata.

`sort` and `filter` are optional.

If no sorting or filtering is required:

```json
{
  "page": 1,
  "pageSize": 25
}
```

The exact set of supported filter operators will be defined separately.

---

# 4. Get Entity

## GET /entities/{resource}/{id}

Returns one entity record.

An optional `projection` query parameter selects a named representation of the entity.

Example:

```text
GET /entities/customers/101?projection=main
```

If `projection` is omitted, the backend returns the resource default representation:

```text
GET /entities/customers/101
```

Example response:

```json
{
  "customerId": 101,
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "status": "active",
  "categoryId": 12
}
```

When rendering a form, the client uses the projection declared by the selected form metadata, if any.

A projection may return only the fields needed by that representation. The response may omit fields declared by other forms and may contain additional properties. Properties not described by the selected form metadata are ignored by the client.

A missing declared property is not interpreted as `null` or as a default value.

---

# 5. Create Entity

## POST /entities/{resource}

Creates a new entity.

An optional `projection` query parameter identifies the representation used for the request and response.

Example:

```text
POST /entities/customers?projection=main
```

Example request:

```json
{
  "firstName": "New",
  "lastName": "Customer",
  "email": "new.customer@example.com",
  "status": "new",
  "categoryId": 12
}
```

Example response:

```json
{
  "customerId": 138,
  "firstName": "New",
  "lastName": "Customer",
  "email": "new.customer@example.com",
  "status": "new",
  "categoryId": 12
}
```

If `projection` is omitted, the resource default representation is used.

The backend determines which fields are writable and validates the request accordingly.

---

# 6. Update Entity

## PATCH /entities/{resource}/{id}

Updates an existing entity.

An optional `projection` query parameter identifies the representation used for the request and response.

Example:

```text
PATCH /entities/customers/101?projection=main
```

Example request:

```json
{
  "firstName": "Updated",
  "lastName": "Customer",
  "email": "updated.customer@example.com",
  "status": "active",
  "categoryId": 12
}
```

Example response:

```json
{
  "customerId": 101,
  "firstName": "Updated",
  "lastName": "Customer",
  "email": "updated.customer@example.com",
  "status": "active",
  "categoryId": 12
}
```

If `projection` is omitted, the resource default representation is used.

`PATCH` is used because a form or projection may submit only a subset of the complete entity representation.

---

# 7. Delete Entity

## DELETE /entities/{resource}/{id}

Deletes an entity.

A successful deletion may return:

```text
204 No Content
```

The backend determines whether deletion is permitted.

---

# 8. Reference Fields

A reference field points to another AdminMesh resource and uses a named list of that resource for selection.

Example metadata inside a form definition:

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

A reference selector can reuse the standard list protocol:

```text
GET  /entities/categories/lists/metadata/lookup
POST /entities/categories/lists/query/lookup
```

The target resource metadata provides its `idField`. The selected identifier is stored as the reference value, while `displayField` provides the human-readable representation.

No separate lookup query protocol is required for the initial version.

---

# 9. Error Responses

The exact error format is not finalized.

The protocol should define a consistent structure for:

* validation errors
* authentication errors
* authorization errors
* entity not found
* conflicts
* server errors

Possible initial format:

```json
{
  "error": {
    "code": "validation_error",
    "message": "The request contains invalid data.",
    "fields": {
      "firstName": [
        "First Name is required."
      ]
    }
  }
}
```

---

# 10. Authentication

Authentication is outside the AdminMesh API protocol.

A deployment may use OAuth 2.0 / OpenID Connect and send an access token with API requests:

```text
Authorization: Bearer <access-token>
```

The Admin API is responsible for authorization of every protected operation.

---

# Future Protocol Extensions

The following capabilities are planned but are not part of protocol version 0.1:

* additional filter operators
* master/detail entities
* relation tabs
* many-to-many relations
* richer permissions
* protocol capability/version discovery

These extensions should be specified when their protocol contracts are designed.
