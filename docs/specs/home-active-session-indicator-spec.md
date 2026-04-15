# Home Page — Active Shopping Session Indicator

## 1. Overview

When a user has already started a shopping session (i.e. a location list for a
supermarket has been opened but not yet closed), the home page should make this
immediately visible. The shopping button should reflect the active state visually
and navigating to the shopping screen should bring the user directly into the
ongoing session without requiring them to select a supermarket again.

---

## 2. Definitions

**Active shopping session:** A shopping session is considered active when at
least one supermarket has a non-empty location list — i.e. items have been
loaded into a supermarket's location list and the session has not yet been
closed or completed.

**No active session:** The normal state of the app — no supermarket has items
in its location list.

---

## 3. Home Page Behavior

### 3.1 No active session (default state)

The home page behaves exactly as it does today:

- The shopping button is displayed with its standard appearance (lime-green
  filled circle, cart icon).
- No additional label is shown next to the shopping button.
- Tapping the shopping button navigates to the shop screen, where the user
  selects a supermarket to begin a new session.

### 3.2 Active session detected

When the app detects that a shopping session is already ongoing, the home page
changes as follows:

#### Shopping button appearance

- The shopping button displays an **animated spinning border** — a rotating arc
  drawn around the circumference of the button — to signal that something is
  actively in progress.
- The interior of the button (background color, cart icon) remains unchanged so
  the button is still clearly recognizable.

> Note: `RoundButton` already has a `loading` prop that renders exactly this
> animation. This prop will be reused for this purpose.

#### "Shopping ongoing!" label

- A short text label reading **"Shopping ongoing!"** is displayed visually
  adjacent to (to the right of) the shopping button.
- The label is always visible when a session is active; it does not require any
  user interaction to appear.
- The label styling should be consistent with other contextual labels already
  present on the home page (e.g. the hint bubbles).

#### Navigation on tap

- Tapping the shopping button **navigates directly into the active shopping
  session**, bypassing the supermarket selection screen entirely.
- The user lands on the shopping screen already scoped to the supermarket whose
  session is ongoing, with its location list loaded and ready to interact with.

---

## 4. Session Detection

The app determines whether a session is active by checking the supermarkets
registered in the system. For each supermarket, it queries whether its location
list contains any items. If any supermarket returns a non-empty list, a session
is considered active for that supermarket.

Because only one session can be active at a time (a new session can only be
started after a supermarket selection, and selecting a supermarket implicitly
closes any prior session for that supermarket), there will be at most one active
session at any given time.

---

## 5. Session Check Timing

The active session check happens as part of the home page's initial data load —
in parallel with (not after) the existing call that retrieves the main shopping
list items. The indicator appears as soon as the check resolves; it does not
block the rest of the home page from rendering.

If the session check has not yet completed when the home page renders, the
shopping button is displayed in its default (no-session) state until the check
resolves.

---

## 6. Out of Scope

- Displaying the specific items in the active session on the home page.
- Showing progress (e.g. "3 of 12 items ticked") on the home page.
- Allowing the user to close/cancel the active session from the home page.
- Handling more than one simultaneous active session.
