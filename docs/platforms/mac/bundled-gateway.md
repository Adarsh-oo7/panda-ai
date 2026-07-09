---
summary: "Gateway runtime on macOS (external launchd service)"
read_when:
  - Packaging Agent-I.app
  - Debugging the macOS gateway launchd service
  - Installing the gateway CLI for macOS
title: "Gateway on macOS"
---

# Gateway on macOS (external launchd)

Agent-I.app no longer bundles Node/Bun or the Gateway runtime. The macOS app
expects an **external** `Agent-I` CLI install, does not spawn the Gateway as a
child process, and manages a per‑user launchd service to keep the Gateway
running (or attaches to an existing local Gateway if one is already running).

## Install the CLI (required for local mode)

You need Node 22+ on the Mac, then install `Agent-I` globally:

```bash
npm install -g Agent-I@<version>
```

The macOS app’s **Install CLI** button runs the same flow via npm/pnpm (bun not recommended for Gateway runtime).

## Launchd (Gateway as LaunchAgent)

Label:

- `ai.Agent-I.gateway` (or `ai.Agent-I.<profile>`; legacy `com.Agent-I.*` may remain)

Plist location (per‑user):

- `~/Library/LaunchAgents/ai.Agent-I.gateway.plist`
  (or `~/Library/LaunchAgents/ai.Agent-I.<profile>.plist`)

Manager:

- The macOS app owns LaunchAgent install/update in Local mode.
- The CLI can also install it: `Agent-I gateway install`.

Behavior:

- “Agent-I Active” enables/disables the LaunchAgent.
- App quit does **not** stop the gateway (launchd keeps it alive).
- If a Gateway is already running on the configured port, the app attaches to
  it instead of starting a new one.

Logging:

- launchd stdout/err: `/tmp/Agent-I/Agent-I-gateway.log`

## Version compatibility

The macOS app checks the gateway version against its own version. If they’re
incompatible, update the global CLI to match the app version.

## Smoke check

```bash
Agent-I --version

Agent-I_SKIP_CHANNELS=1 \
Agent-I_SKIP_CANVAS_HOST=1 \
Agent-I gateway --port 18999 --bind loopback
```

Then:

```bash
Agent-I gateway call health --url ws://127.0.0.1:18999 --timeout 3000
```
