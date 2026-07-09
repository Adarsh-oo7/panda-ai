---
summary: "CLI reference for `Agent-I approvals` (exec approvals for gateway or node hosts)"
read_when:
  - You want to edit exec approvals from the CLI
  - You need to manage allowlists on gateway or node hosts
title: "approvals"
---

# `Agent-I approvals`

Manage exec approvals for the **local host**, **gateway host**, or a **node host**.
By default, commands target the local approvals file on disk. Use `--gateway` to target the gateway, or `--node` to target a specific node.

Related:

- Exec approvals: [Exec approvals](/tools/exec-approvals)
- Nodes: [Nodes](/nodes)

## Common commands

```bash
Agent-I approvals get
Agent-I approvals get --node <id|name|ip>
Agent-I approvals get --gateway
```

## Replace approvals from a file

```bash
Agent-I approvals set --file ./exec-approvals.json
Agent-I approvals set --node <id|name|ip> --file ./exec-approvals.json
Agent-I approvals set --gateway --file ./exec-approvals.json
```

## Allowlist helpers

```bash
Agent-I approvals allowlist add "~/Projects/**/bin/rg"
Agent-I approvals allowlist add --agent main --node <id|name|ip> "/usr/bin/uptime"
Agent-I approvals allowlist add --agent "*" "/usr/bin/uname"

Agent-I approvals allowlist remove "~/Projects/**/bin/rg"
```

## Notes

- `--node` uses the same resolver as `Agent-I nodes` (id, name, ip, or id prefix).
- `--agent` defaults to `"*"`, which applies to all agents.
- The node host must advertise `system.execApprovals.get/set` (macOS app or headless node host).
- Approvals files are stored per host at `~/.Agent-I/exec-approvals.json`.
