---
summary: "CLI reference for `Agent-I health` (gateway health endpoint via RPC)"
read_when:
  - You want to quickly check the running Gateway’s health
title: "health"
---

# `Agent-I health`

Fetch health from the running Gateway.

```bash
Agent-I health
Agent-I health --json
Agent-I health --verbose
```

Notes:

- `--verbose` runs live probes and prints per-account timings when multiple accounts are configured.
- Output includes per-agent session stores when multiple agents are configured.
