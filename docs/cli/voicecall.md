---
summary: "CLI reference for `Agent-I voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
title: "voicecall"
---

# `Agent-I voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
Agent-I voicecall status --call-id <id>
Agent-I voicecall call --to "+15555550123" --message "Hello" --mode notify
Agent-I voicecall continue --call-id <id> --message "Any questions?"
Agent-I voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
Agent-I voicecall expose --mode serve
Agent-I voicecall expose --mode funnel
Agent-I voicecall expose --mode off
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.
