---
name: gmail-win
description: Read, search and send Gmail on Windows via a local Node.js CLI. Supports listing inbox, reading full emails, searching, sending, and creating drafts.
---

# gmail-win

Use `node "D:\panda-ai\panda-ai\skills\gmail-win\scripts\gmail.mjs"` to interact with Gmail.

The Gmail token is already saved and authentication is complete — no setup needed.

## Common Commands

### List inbox emails (most recent first)
```
node "D:\panda-ai\panda-ai\skills\gmail-win\scripts\gmail.mjs" list --max 5
node "D:\panda-ai\panda-ai\skills\gmail-win\scripts\gmail.mjs" list --max 10
```

### Search emails
```
node "D:\panda-ai\panda-ai\skills\gmail-win\scripts\gmail.mjs" search "from:github.com"
node "D:\panda-ai\panda-ai\skills\gmail-win\scripts\gmail.mjs" search "newer_than:7d subject:invoice" --max 20
node "D:\panda-ai\panda-ai\skills\gmail-win\scripts\gmail.mjs" search "in:inbox is:unread"
```

### Read a full email
```
node "D:\panda-ai\panda-ai\skills\gmail-win\scripts\gmail.mjs" read <messageId>
```
(Get the messageId from `list` or `search` output)

### Send an email
```
node "D:\panda-ai\panda-ai\skills\gmail-win\scripts\gmail.mjs" send --to recipient@example.com --subject "Hello" --body "Hi there!"
```

### Reply to an email
```
node "D:\panda-ai\panda-ai\skills\gmail-win\scripts\gmail.mjs" send --to sender@example.com --subject "Re: Topic" --body "Thanks!" --reply-to-message-id <msgId>
```

### Create a draft
```
node "D:\panda-ai\panda-ai\skills\gmail-win\scripts\gmail.mjs" drafts create --to recipient@example.com --subject "Draft subject" --body "Draft body"
```

## Gmail Search Syntax

- `from:email@domain.com` — from a specific sender
- `to:me` — sent to you
- `subject:keyword` — subject contains keyword
- `newer_than:Nd` — emails from last N days (e.g. `newer_than:7d`)
- `older_than:Nd` — emails older than N days
- `in:inbox` — in inbox
- `is:unread` — unread only
- `has:attachment` — has attachment

## Notes

- Always confirm with the user before sending an email or creating a draft.
- Use `list` for recent inbox; use `search` for targeted lookups.
- The messageId shown in `list`/`search` is needed to `read` a specific email.
- Token is stored at `C:\Users\adars\.agenti\gmail-token.json` and refreshes automatically.
