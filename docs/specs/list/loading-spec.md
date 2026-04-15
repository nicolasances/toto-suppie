# List Page — Loading Behaviour Spec

## 1. Context

This spec defines the expected behaviour of the supermarket list page (`/list`) with respect to data loading and user feedback.

---

## 2. Expected behaviour

### 2.1 Loading state

While the list request is in flight, the list page must display a visual loading indicator in place of the real list items.

- The indicator consists of **2 skeleton items** rendered where real items would appear.
- Each skeleton item:
  - Has the same shape and dimensions as a real list item.
  - Uses a **greyed-out background** that communicates an inactive / placeholder state.
  - Displays a **left-to-right shimmer animation** (a gradient sweeping across the item) to signal that loading is actively in progress.
  - Shows the label **"Loading items…"** in place of an item name.
- Skeleton items are **not interactive** — clicking them has no effect.

### 2.2 Adding items during loading

The user must not be blocked from adding new items while the list is loading.

- The "Add an item" bottom bar remains visible and functional at all times.
- If the user adds an item before loading completes, the new item is optimistically prepended to the list.
- When loading completes, the list refreshes and reflects both the loaded items and any items added in the meantime.

### 2.3 Loaded state

Once the request resolves:

- Skeleton items are replaced by the real list items.
- If the list is genuinely empty, an empty list is shown (no skeleton items).

---

## 3. Behaviour summary

| State | What the user sees |
|---|---|
| Loading | 2 skeleton items with shimmer animation and "Loading items…" label |
| Loaded, non-empty | Real list items |
| Loaded, empty | Empty list |
| User adds item while loading | New item prepended above skeletons; skeletons still visible |

---

## 4. Out of scope

- Error state (e.g. request failure).
- Pagination or infinite scroll loading indicators.
- Pull-to-refresh behaviour.
