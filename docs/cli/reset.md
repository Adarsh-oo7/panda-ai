---
summary: "CLI reference for `Agent-I reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `Agent-I reset`

Reset local config/state (keeps the CLI installed).

```bash
Agent-I reset
Agent-I reset --dry-run
Agent-I reset --scope config+creds+sessions --yes --non-interactive
```
