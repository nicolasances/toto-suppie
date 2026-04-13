# Initial load performance analysis

## Summary

The app's slow initial load is most likely caused by **stacked runtime waits on the critical path**, not by the frontend bundle itself.

The highest-probability bottlenecks are:

1. A **boot-time call from the frontend to `toto-ms-auth`** to verify the token before rendering.
2. A **boot-time call from the frontend to `toto-ms-supermarket`** to load the main list before showing the home UI.
3. **Cloud Run cold starts** on the frontend and backend services.
4. **Extra startup work inside `toto-ms-supermarket`**, including secrets loading, Mongo connection setup, and agent-related initialization.

The best first step is to **shorten the critical path in the app itself**, then apply **selective Cloud Run warming/tuning** only where still needed.

## What I analyzed

### Frontend: `toto-react-supermarket`

The home page is statically built successfully, so the problem does not appear to be caused by a large or slow Next.js production build.

What happens at runtime:

- `app/layout.tsx` wraps the whole app in `MainLayout`.
- `MainLayout` wraps page content in `AuthWrapper`.
- `AuthWrapper` blocks rendering until it:
  - reads the user token from local storage
  - calls `toto-ms-auth /verify`
  - decides whether to show the app or trigger login
- After that, `app/page.tsx` calls `toto-ms-supermarket /list/items`.
- Only once that finishes does the main home UI appear.

This means the initial experience depends on **two remote services being awake and responsive before the user sees the real screen**.

### Auth service: `toto-ms-auth`

The auth service exposes:

- `GET /token`: exchanges a Google token for a Toto token
- `POST /verify`: verifies the Toto JWT

Important detail:

- `POST /verify` appears to verify the Toto JWT **locally** using the signing key.
- It does **not** appear to require a Google token verification on each `/verify` request.

That makes the frontend's boot-time `/verify` call a strong candidate for removal from the startup path.

Important nuance:

- The preferred frontend rule is now: **if a Toto token exists in local storage, the user is considered logged in for UI boot purposes**.
- The frontend should **not** verify or decode the token during startup.
- Backend Toto microservices remain responsible for rejecting invalid or expired tokens.
- If an API call fails because the token is invalid, the frontend API layer should clear auth state and trigger re-authentication.

### Supermarket service: `toto-ms-supermarket`

The first business request is:

- `GET /list/items`

This service appears to have several cold-start-sensitive steps:

1. `totoms` loads multiple secrets during startup.
2. The first DB-backed request opens a Mongo connection if one is not already established.
3. The service initializes broader platform features, including message bus setup.
4. It also wires and registers `SuppieAgent` with Gale Broker during startup.

That last point is especially interesting: even if the home page only needs `/list/items`, the service startup includes work that is more related to the agent capability than to the basic list API.

## Most likely bottlenecks

## 1. Boot-time auth verification network hop

This is probably the clearest unnecessary synchronous dependency.

Why it matters:

- It blocks rendering.
- It wakes `toto-ms-auth` even though `/verify` is logically cheap.
- On Cloud Run, a cheap endpoint can still be slow if the container has to cold start.

## 2. Home screen blocked on `GET /list/items`

The homepage currently waits for data before showing the main controls.

Why it matters:

- It turns backend readiness into UX readiness.
- Even one cold backend makes the app feel slow.
- The full-screen loader makes the delay highly visible.

## 3. Compounded Cloud Run cold starts

There is no visible `--min-instances` configuration in the deployment workflows for:

- `toto-react-supermarket`
- `toto-ms-auth`
- `toto-ms-supermarket`

That suggests scale-to-zero behavior is likely in play. When the user visits after inactivity, several cold starts can accumulate:

- frontend container
- auth service
- supermarket service
- downstream setup such as secrets and DB connection

## 4. Supermarket service startup doing too much for the critical path

`toto-ms-supermarket` appears to mix low-latency list endpoints with more advanced initialization concerns.

Why it matters:

- first-request latency may pay for features unrelated to the home page
- agent registration can add startup time even when the user is not using the agent

## What is probably *not* the main issue

- The Next.js production build itself does not look problematic.
- The Lottie loading animation file is not tiny, but it is not large enough to explain the slow experience by itself.
- `toto-ms-auth /verify` is probably not expensive because of its business logic; it is expensive because it is a **network hop to a potentially cold service**.

## Proposed solution

## Phase 1: shorten the frontend critical path

### A. Remove the boot-time dependency on `toto-ms-auth /verify`

Instead of calling `/verify` on every app boot:

- treat presence of the Toto token in local storage as sufficient to boot the UI
- do not verify or decode the token on the frontend
- when backend APIs reject the token, clear stored auth state and trigger sign-in again

Keep real authorization checks on the backend APIs where they belong.

Expected impact:

- removes one service from the initial critical path
- avoids waking `toto-ms-auth` during normal boot
- makes the app feel faster immediately

### B. Render the home shell before list data loads

The main home buttons should render immediately, with list-dependent UI enhanced afterward.

Possible approach:

- show the home layout immediately
- fetch `GET /list/items` in the background
- only conditionally enable or show “Start shopping” once data is known
- use a small inline skeleton or subtle loading state instead of a blocking full-screen loader

Expected impact:

- app becomes interactive earlier
- backend cold starts become less visible

### C. Reduce or remove blank-screen auth gating

`AuthWrapper` currently returns an empty screen while it is resolving auth state.

Instead:

- render an app shell immediately
- keep auth resolution lightweight
- only fall back to sign-in UI when really required

## Phase 2: reduce backend startup cost

### D. Instrument `toto-ms-supermarket`

Add explicit timing logs for:

- service boot start/end
- secrets loading
- agent registration
- first Mongo connection
- first `GET /list/items` execution

This will show which part is dominating cold-start latency.

### E. Separate or defer agent initialization

If possible:

- keep list APIs in a lightweight path
- defer Gale/agent registration
- or split agent functionality into a separate service

Expected impact:

- lower cold-start cost for regular list usage

## Phase 3: selective Cloud Run mitigation

### F. Keep only critical services warm

After shortening the code path, selectively apply Cloud Run warming:

- likely `toto-ms-supermarket`
- maybe the frontend service
- probably not `toto-ms-auth` if it is no longer needed during app boot

This is preferable to warming everything.

### G. Review runtime settings

Check whether these need tuning for latency-sensitive services:

- min instances
- concurrency
- CPU allocation
- memory

## Recommended order

1. Remove boot-time `/verify` dependency from the frontend.
2. Render the home screen without waiting for `/list/items`.
3. Instrument `toto-ms-supermarket` startup and first request timings.
4. Reduce or defer non-essential supermarket-service startup work.
5. Add selective Cloud Run warming/tuning only for services that remain on the initial path.

## Recommendation

If you want the fastest improvement with the least infrastructure cost increase, start with:

1. **token-presence boot gating instead of boot-time `/verify`**
2. **render-first home page without waiting for `/list/items`**

Those two changes should remove the most obvious unnecessary waits. After that, measure the remaining latency and use Cloud Run `min-instances` strategically where it still makes sense.
