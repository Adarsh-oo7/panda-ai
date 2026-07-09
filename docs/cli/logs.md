---
summary: "CLI reference for `Agent-I logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `Agent-I logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
Agent-I logs
Agent-I logs --follow
Agent-I logs --json
Agent-I logs --limit 500
Agent-I logs --local-time
Agent-I logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.
