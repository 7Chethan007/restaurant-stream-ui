# restaurant-stream-ui

Browser frontend for the [restaurant-stream pipeline](https://github.com/7Chethan007/restaurant-stream-infra#readme).
Type something about a Bangalore restaurant, get a real-time response pushed
back once it's been processed by the Flink job.

## What this repo owns

- The UI only: a text input and a feed of responses. No business logic, no
  data processing — that all happens in `restaurant-stream-backend` and
  `restaurant-stream-flink`.
- Deployment target: **Firebase Hosting** (static build, deployed by this
  repo's own `.github/workflows` on push to `main`).

## How it talks to the rest of the system

- `POST` the typed text to the backend's static IP (`restaurant-stream-backend`,
  provisioned by `restaurant-stream-infra`).
- Open an `EventSource` (SSE) connection to the same backend to receive the
  matched result once Flink has processed it.
- No direct connection to Pub/Sub or Flink — the backend is the only thing
  this UI talks to.

## Status

Not yet built. Planned stack: Vite + React, plain `fetch` + `EventSource`,
no state library needed for a single input/output loop.
