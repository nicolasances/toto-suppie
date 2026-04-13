# App loading process spec - Phase 1

## 1. Description of the issue

The app currently feels slow during initial load because the first user-visible screen depends on multiple synchronous operations before the main UI is shown.

Current loading behavior:

1. The app boots and wraps the page in the global layout and auth wrapper.
2. The auth wrapper checks local storage for a Toto token.
3. The frontend then performs a blocking call to `toto-ms-auth /verify`.
4. Only after auth is resolved does the home page continue loading.
5. The home page then performs a blocking call to `toto-ms-supermarket /list/items`.
6. The main home actions are shown only after that request completes.
7. If the request takes long enough, the loading animation is displayed.

Why this is a problem:

- the home screen is blocked on backend availability
- the auth service is unnecessarily placed on the startup critical path
- Cloud Run cold starts can stack across services
- the loading animation makes backend latency very visible
- the user waits for data before seeing the main actions of the app

In practice, the app loading process currently behaves like:

`app boot -> auth verification request -> list request -> render home UI`

That is the behavior this Phase 1 change is meant to improve.

## 2. Expected behavior

Phase 1 should make the app load as if the UI is available first and backend enrichment happens afterward.

Expected loading behavior:

1. The app boots and renders the main app shell immediately.
2. If a Toto token exists in local storage, the frontend considers the user logged in.
3. The frontend does **not** call `toto-ms-auth /verify` during boot.
4. The home screen renders immediately without waiting for `toto-ms-supermarket /list/items`.
5. The list request runs in the background after the initial home UI is already visible.
6. Any list-dependent UI is updated once the response arrives.
7. The loading state, if needed, should be local and non-blocking rather than replacing the whole screen.

Expected auth behavior:

- token presence in local storage is sufficient for frontend boot
- backend Toto microservices remain responsible for validating the token
- if an API request fails because the token is invalid or expired, the frontend API layer must:
  - clear stored authentication state
  - trigger the sign-in flow again

Expected home-screen behavior:

- the user should see the main home UI immediately after app boot
- the app should not wait for the list API before showing the page structure
- list data should only control list-dependent elements, such as whether the shopping action is enabled or shown
- the page should avoid a full-screen blank state during normal loading

Target loading model after Phase 1:

`app boot -> render app shell -> start background list request -> enrich UI when data arrives`

## Scope of this spec

This spec covers only the Phase 1 frontend loading behavior:

- removal of boot-time auth verification
- immediate rendering of the app shell
- background loading of home-page data
- re-authentication triggered by backend auth failures

This spec does not cover:

- backend cold-start optimizations
- Cloud Run configuration changes
- supermarket service startup refactoring
