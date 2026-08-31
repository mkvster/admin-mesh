# AdminMesh

**Live demo:** https://mkvster.github.io/admin-mesh/

AdminMesh is a metadata-driven administrative UI built with Angular.

The goal is to provide a reusable admin frontend that can connect to any
compatible Admin API and dynamically adapt its navigation, entity lists,
forms, lookups, and relationships to the metadata exposed by that API.

Instead of building a separate admin application for every backend,
AdminMesh renders the UI from server-provided metadata.

## Current functionality

- Dynamic navigation loaded from the Admin API
- Section and node based navigation
- `rest-entity` node type
- Entity metadata loading
- Named list metadata
- Server-side list query protocol
- Dynamic Angular Material tables
- Metadata-driven cell rendering
  - enums
  - booleans
  - plain values
- Runtime API configuration
- Metadata caching
- Mock Admin API using MSW
- GitHub Pages demo support

## Architecture

The application separates API orchestration from reusable UI rendering.

- `navigation` — dynamic application navigation
- `entity` — entity metadata, list loading, and entity UI components
- `cache` — shared metadata cache infrastructure
- `layout` — application shell
- `node` — dispatches navigation nodes to the appropriate renderer
- `mocks` — browser-side mock Admin API for the demo

For example, an entity list is rendered approximately as:

```text
Navigation
    ↓
EntityList
    ↓
Entity Metadata
    ↓
List Metadata + List Query
    ↓
ListGrid
    ↓
ListGridCell
````

`ListGrid` and `ListGridCell` do not access the API directly. They receive
already prepared metadata and data, making them reusable for normal entity
lists, reference lookups, and other list-based UI.

## Admin API

AdminMesh communicates with a REST-based metadata protocol.

The current protocol supports:

```text
GET  /navigation

GET  /entities/{resource}/metadata

GET  /entities/{resource}/lists/{listId}/metadata
POST /entities/{resource}/lists/{listId}/query
```

Forms, references, create/update/delete operations, and relationships are
part of the evolving protocol.

See:

* [Admin API Protocol](docs/AdminApiProtocol.md)
* [Planned Functionality](docs/PlannedFunctionality.md)

## Demo API

The GitHub Pages demo uses [Mock Service Worker (MSW)](https://mswjs.io/)
to provide an Admin API directly in the browser.

The application itself uses the same API URLs regardless of whether the
backend is mocked or real.

Runtime configuration is stored in:

```text
public/adminmesh-config.json
```

Example:

```json
{
  "apiBaseUrl": "admin-api",
  "mockApi": true
}
```

Setting `mockApi` to `false` allows AdminMesh to use a real compatible
Admin API instead.

## Technology

* Angular 21
* Angular Material
* TypeScript
* RxJS / Angular Signals
* MSW

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

Build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Status

AdminMesh is currently under active development.

The initial implementation focuses on establishing the metadata protocol
and the reusable entity-list infrastructure. Forms, filtering, sorting,
paging, reference selection, and relationships will be added incrementally.
