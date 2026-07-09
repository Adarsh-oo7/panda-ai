---
summary: "CLI reference for `Agent-I completion` (generate/install shell completion scripts)"
read_when:
  - You want shell completions for zsh/bash/fish/PowerShell
  - You need to cache completion scripts under Agent-I state
title: "completion"
---

# `Agent-I completion`

Generate shell completion scripts and optionally install them into your shell profile.

## Usage

```bash
Agent-I completion
Agent-I completion --shell zsh
Agent-I completion --install
Agent-I completion --shell fish --install
Agent-I completion --write-state
Agent-I completion --shell bash --write-state
```

## Options

- `-s, --shell <shell>`: shell target (`zsh`, `bash`, `powershell`, `fish`; default: `zsh`)
- `-i, --install`: install completion by adding a source line to your shell profile
- `--write-state`: write completion script(s) to `$Agent-I_STATE_DIR/completions` without printing to stdout
- `-y, --yes`: skip install confirmation prompts

## Notes

- `--install` writes a small "Agent-I Completion" block into your shell profile and points it at the cached script.
- Without `--install` or `--write-state`, the command prints the script to stdout.
- Completion generation eagerly loads command trees so nested subcommands are included.
