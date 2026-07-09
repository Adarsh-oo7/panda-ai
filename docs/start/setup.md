---
summary: "Advanced setup and development workflows for Agent-I"
read_when:
  - Setting up a new machine
  - You want “latest + greatest” without breaking your personal setup
title: "Setup"
---

# Setup

<Note>
If you are setting up for the first time, start with [Getting Started](/start/getting-started).
For wizard details, see [Onboarding Wizard](/start/wizard).
</Note>

Last updated: 2026-01-01

## TL;DR

- **Tailoring lives outside the repo:** `~/.Agent-I/workspace` (workspace) + `~/.Agent-I/Agent-I.json` (config).
- **Stable workflow:** install the macOS app; let it run the bundled Gateway.
- **Bleeding edge workflow:** run the Gateway yourself via `pnpm gateway:watch`, then let the macOS app attach in Local mode.

## Prereqs (from source)

- Node `>=22`
- `pnpm`
- Docker (optional; only for containerized setup/e2e — see [Docker](/install/docker))

## Tailoring strategy (so updates don’t hurt)

If you want “100% tailored to me” _and_ easy updates, keep your customization in:

- **Config:** `~/.Agent-I/Agent-I.json` (JSON/JSON5-ish)
- **Workspace:** `~/.Agent-I/workspace` (skills, prompts, memories; make it a private git repo)

Bootstrap once:

```bash
Agent-I setup
```

From inside this repo, use the local CLI entry:

```bash
Agent-I setup
```

If you don’t have a global install yet, run it via `pnpm Agent-I setup`.

## Run the Gateway from this repo

After `pnpm build`, you can run the packaged CLI directly:

```bash
node Agent-I.mjs gateway --port 18789 --verbose
```

## Stable workflow (macOS app first)

1. Install + launch **Agent-I.app** (menu bar).
2. Complete the onboarding/permissions checklist (TCC prompts).
3. Ensure Gateway is **Local** and running (the app manages it).
4. Link surfaces (example: WhatsApp):

```bash
Agent-I channels login
```

5. Sanity check:

```bash
Agent-I health
```

If onboarding is not available in your build:

- Run `Agent-I setup`, then `Agent-I channels login`, then start the Gateway manually (`Agent-I gateway`).

## Bleeding edge workflow (Gateway in a terminal)

Goal: work on the TypeScript Gateway, get hot reload, keep the macOS app UI attached.

### 0) (Optional) Run the macOS app from source too

If you also want the macOS app on the bleeding edge:

```bash
./scripts/restart-mac.sh
```

### 1) Start the dev Gateway

```bash
pnpm install
pnpm gateway:watch
```

`gateway:watch` runs the gateway in watch mode and reloads on TypeScript changes.

### 2) Point the macOS app at your running Gateway

In **Agent-I.app**:

- Connection Mode: **Local**
  The app will attach to the running gateway on the configured port.

### 3) Verify

- In-app Gateway status should read **“Using existing gateway …”**
- Or via CLI:

```bash
Agent-I health
```

### Common footguns

- **Wrong port:** Gateway WS defaults to `ws://127.0.0.1:18789`; keep app + CLI on the same port.
- **Where state lives:**
  - Credentials: `~/.Agent-I/credentials/`
  - Sessions: `~/.Agent-I/agents/<agentId>/sessions/`
  - Logs: `/tmp/Agent-I/`

## Credential storage map

Use this when debugging auth or deciding what to back up:

- **WhatsApp**: `~/.Agent-I/credentials/whatsapp/<accountId>/creds.json`
- **Telegram bot token**: config/env or `channels.telegram.tokenFile`
- **Discord bot token**: config/env (token file not yet supported)
- **Slack tokens**: config/env (`channels.slack.*`)
- **Pairing allowlists**:
  - `~/.Agent-I/credentials/<channel>-allowFrom.json` (default account)
  - `~/.Agent-I/credentials/<channel>-<accountId>-allowFrom.json` (non-default accounts)
- **Model auth profiles**: `~/.Agent-I/agents/<agentId>/agent/auth-profiles.json`
- **File-backed secrets payload (optional)**: `~/.Agent-I/secrets.json`
- **Legacy OAuth import**: `~/.Agent-I/credentials/oauth.json`
  More detail: [Security](/gateway/security#credential-storage-map).

## Updating (without wrecking your setup)

- Keep `~/.Agent-I/workspace` and `~/.Agent-I/` as “your stuff”; don’t put personal prompts/config into the `Agent-I` repo.
- Updating source: `git pull` + `pnpm install` (when lockfile changed) + keep using `pnpm gateway:watch`.

## Linux (systemd user service)

Linux installs use a systemd **user** service. By default, systemd stops user
services on logout/idle, which kills the Gateway. Onboarding attempts to enable
lingering for you (may prompt for sudo). If it’s still off, run:

```bash
sudo loginctl enable-linger $USER
```

For always-on or multi-user servers, consider a **system** service instead of a
user service (no lingering needed). See [Gateway runbook](/gateway) for the systemd notes.

## Related docs

- [Gateway runbook](/gateway) (flags, supervision, ports)
- [Gateway configuration](/gateway/configuration) (config schema + examples)
- [Discord](/channels/discord) and [Telegram](/channels/telegram) (reply tags + replyToMode settings)
- [Agent-I assistant setup](/start/Agent-I)
- [macOS app](/platforms/macos) (gateway lifecycle)
