---
summary: "CLI reference for `Agent-I daemon` (legacy alias for gateway service management)"
read_when:
  - You still use `Agent-I daemon ...` in scripts
  - You need service lifecycle commands (install/start/stop/restart/status)
title: "daemon"
---

# `Agent-I daemon`

Legacy alias for Gateway service management commands.

`Agent-I daemon ...` maps to the same service control surface as `Agent-I gateway ...` service commands.

## Usage

```bash
Agent-I daemon status
Agent-I daemon install
Agent-I daemon start
Agent-I daemon stop
Agent-I daemon restart
Agent-I daemon uninstall
```

## Subcommands

- `status`: show service install state and probe Gateway health
- `install`: install service (`launchd`/`systemd`/`schtasks`)
- `uninstall`: remove service
- `start`: start service
- `stop`: stop service
- `restart`: restart service

## Common options

- `status`: `--url`, `--token`, `--password`, `--timeout`, `--no-probe`, `--deep`, `--json`
- `install`: `--port`, `--runtime <node|bun>`, `--token`, `--force`, `--json`
- lifecycle (`uninstall|start|stop|restart`): `--json`

## Prefer

Use [`Agent-I gateway`](/cli/gateway) for current docs and examples.
