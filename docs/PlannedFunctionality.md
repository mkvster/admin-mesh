# AdminMesh — Planned Functionality

AdminMesh is a generic, metadata-driven administration UI for REST APIs.

The UI is not tied to a specific database, entity model, or backend implementation. A backend that implements the AdminMesh API protocol provides navigation metadata, entity metadata, data, and supported operations. The same AdminMesh deployment can therefore be used with different services and databases.

## Core

### Navigation

- The server provides a list of admin nodes grouped into sections.
- Group nesting is limited to one level: section → nodes.
- Sections and nodes are displayed in the left sidebar.
- On small screens, navigation is available through a hamburger menu.
- Each node has a type.
- The initial version supports one node type: REST Entity Editor.

### Entity List

When a REST Entity Editor node is activated:

- AdminMesh loads metadata describing the entity.
- AdminMesh loads a paged list of entity records.
- Records are displayed in a metadata-driven table.
- Supported operations:
  - paging
  - sorting
  - filtering
  - opening a record
  - creating a record
  - editing a record
  - deleting a record

Metadata determines which operations are available.

### Entity Fields

The initial version should support common scalar field types:

- string
- integer / decimal
- boolean
- date / date-time
- enum

Metadata may define:

- display label
- field type
- required / optional
- read-only / editable
- visible / hidden
- validation constraints
- table visibility
- sorting support
- filtering support

### Entity References

A field may reference another entity.

Such a field is represented by a reference selector rather than a plain scalar input.

The selector:

- displays a human-readable value
- stores the referenced entity identifier
- opens a lookup dialog
- supports searching available target records
- supports paging through lookup results
- allows the user to select one record

The first version supports only single-record references.

### Entity Form

The entity form is generated from metadata.

The same form infrastructure is used for:

- creating a new entity
- viewing an existing entity
- editing an existing entity

Fields and operations may be read-only or unavailable according to metadata and permissions.

---

## Extension 1 — Master / Detail

A REST Entity Editor may optionally use a master-detail layout.

Example:

- Invoice — master record
- Invoice Lines — detail records

The main area contains:

1. the master entity form
2. one detail collection below it

Only one detail collection is supported per entity.

Detail records are displayed in a table and support:

- create
- view
- edit
- delete

Creating or editing a detail record opens a metadata-driven detail form.

The initial implementation may require the master record to exist before detail records can be created.

---

## Extension 2 — Relation Tabs

An entity editor may expose additional tabs besides the main entity tab.

These tabs represent collections of related entities.

Typical use cases:

- users assigned to a role
- products assigned to a category
- members assigned to a team
- permissions assigned to a user

The primary target is many-to-many relationships exposed through the AdminMesh API.

A relation tab:

- displays related records in a table
- supports paging, sorting, and filtering where available
- allows an existing related entity to be added
- allows an existing relationship to be removed

Adding a relationship uses the same reusable entity lookup mechanism used by reference fields.

Nested relation tabs are not supported.

---

## Explicit Non-Goals for the Initial Versions

The initial scope does not include:

- arbitrary nested object editors
- nested master-detail structures
- multiple detail collections on the main tab
- nested relation tabs
- many-to-many inline editing
- composite foreign keys
- drag-and-drop editing
- arbitrary custom UI layouts
- server-specific business workflows

The goal is to keep AdminMesh generic, predictable, and driven by a deliberately limited metadata protocol rather than turning it into a general-purpose low-code platform.