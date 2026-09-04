---
id: TASK-13
title: Add hover preview for reference fields
status: To Do
assignee: []
created_date: '2026-09-04 14:21'
updated_date: '2026-09-04 14:21'
labels: []
milestone: s-002
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add an optional hover preview for `reference` fields displayed in entity lists.

The preview should reuse the existing read-only entity details renderer and show a small dedicated form representation of the referenced entity inside a non-modal overlay.

### Reference display metadata

Extend reference column display metadata with an optional preview form identifier.

Example:

```json
{
  "field": "categoryId",
  "display": {
    "type": "reference",
    "valueField": "categoryName",
    "previewForm": "preview"
  }
}
```

Behavior:

* `valueField` identifies the human-readable value already returned by the list projection.
* `previewForm` identifies the named form used to render the hover preview.
* if `previewForm` is absent, no hover preview should be enabled for that column.

Do not introduce separate `compact` flags. The preview form itself defines exactly which fields and layout should be shown.

### Hover behavior

When the user hovers over a reference value:

* wait for a short hover delay before opening the preview;
* if the pointer leaves before the delay expires, do nothing;
* after the delay, open a lightweight anchored overlay near the reference value;
* only after the overlay is opened should preview loading begin.

The preview should not use a modal dialog.

Prefer Angular CDK Overlay or an equivalent anchored overlay mechanism rather than `matTooltip`, since the content is interactive/rich UI rather than plain text.

### Loading state

The overlay should appear immediately after the hover delay and show a loading representation while data is being fetched.

Loading behavior should use the preview form metadata where possible:

* if form metadata is already cached, use its layout to render skeleton placeholders;
* show field labels immediately when available;
* render placeholder rectangles for values while entity data is loading;
* replace placeholders with the final read-only entity content once data arrives.

A spinner may be used as a fallback, but prefer skeleton-style placeholders when the form layout is known.

### Data loading

Use the existing named form metadata and entity APIs.

For example:

`GET /entities/{resource}/forms/{previewForm}/metadata`

and:

`GET /entities/{resource}/{id}?projection={projection}`

The preview form metadata determines the projection used to retrieve the referenced entity.

### Renderer reuse

Reuse the same read-only field/layout renderer used by the full entity details view.

The hover preview should render only the central entity details content, without:

* page toolbar;
* breadcrumbs;
* navigation;
* edit/delete actions;
* modal chrome.

Do not implement a separate reference-preview renderer.

### Caching

Reuse existing metadata caches for preview form metadata.

Also cache loaded preview entity data by a key that includes at least:

* referenced resource;
* referenced entity ID;
* projection or preview form.

Repeated hover over the same reference should therefore open quickly without unnecessary API calls.

Cached preview data must be cleared together with other AdminMesh caches when switching to another Admin API source.

### Error handling

If preview loading fails:

* keep the overlay open long enough to show a compact error state;
* do not navigate away or affect the underlying list;
* allow the overlay to close normally when the pointer leaves.

### Out of scope

* editing from the preview;
* navigation from preview fields;
* actions inside the preview;
* nested reference previews inside the preview;
* custom preview sizes defined by metadata;
* preloading preview data before hover;
* previews when `previewForm` is not configured.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
<!-- AC:END -->
