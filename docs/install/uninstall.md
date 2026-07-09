---
summary: "Uninstall Agent-I completely (CLI, service, state, workspace)"
read_when:
  - You want to remove Agent-I from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

# Uninstall

Two paths:

- **Easy path** if `Agent-I` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
Agent-I uninstall
```

Non-interactive (automation / npx):

```bash
Agent-I uninstall --all --yes --non-interactive
npx -y Agent-I uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
Agent-I gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
Agent-I gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${Agent-I_STATE_DIR:-$HOME/.Agent-I}"
```

If you set `Agent-I_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.Agent-I/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g Agent-I
pnpm remove -g Agent-I
bun remove -g Agent-I
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/Agent-I.app
```

Notes:

- If you used profiles (`--profile` / `Agent-I_PROFILE`), repeat step 3 for each state dir (defaults are `~/.Agent-I-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `Agent-I` is missing.

### macOS (launchd)

Default label is `ai.Agent-I.gateway` (or `ai.Agent-I.<profile>`; legacy `com.Agent-I.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.Agent-I.gateway
rm -f ~/Library/LaunchAgents/ai.Agent-I.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.Agent-I.<profile>`. Remove any legacy `com.Agent-I.*` plists if present.

### Linux (systemd user unit)

Default unit name is `Agent-I-gateway.service` (or `Agent-I-gateway-<profile>.service`):

```bash
systemctl --user disable --now Agent-I-gateway.service
rm -f ~/.config/systemd/user/Agent-I-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `Agent-I Gateway` (or `Agent-I Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "Agent-I Gateway"
Remove-Item -Force "$env:USERPROFILE\.Agent-I\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.Agent-I-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://Agent-I.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g Agent-I@latest`.
Remove it with `npm rm -g Agent-I` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `Agent-I ...` / `bun run Agent-I ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.
