# 🤖 Agent-I User Manual & Run Guide

Welcome to the **Agent-I** user manual. This guide will walk you through setting up, configuring, running, and developing **Agent-I** on your local machine.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [Running Agent-I](#3-running-agent-i)
4. [Configuration System](#4-configuration-system)
5. [Connecting Channels](#5-connecting-channels)
6. [Connecting Services (GitHub, Gmail, Google Docs)](#6-connecting-services-github-gmail-google-docs)
7. [Security & Pairing](#7-security-pairing)
8. [Developer Guidelines](#8-developer-guidelines)

---

## 1. Prerequisites
Before running Agent-I, make sure you have installed:
- **Node.js**: version 22 or higher
- **Package Manager**: `npm` or `pnpm` (pnpm is recommended for workspace builds)
- **Git** (optional, for tracking agent memory changes)

---

## 2. Installation

### Global Installation (From npm)
If you want to install Agent-I to use immediately:
```bash
npm install -g agenti@latest
```

### Local Development Installation (From Source)
If you are compiling and developing the project locally:
1. Clone the repository and navigate inside:
   ```bash
   git clone <repository-url>
   cd agenti
   ```
2. Install the workspaces and package dependencies:
   ```bash
   pnpm install
   ```
3. Build the core and Control UI:
   ```bash
   pnpm build
   ```

---

## 3. Running Agent-I

### Onboarding Wizard
To initialize configurations, run the onboarding wizard:
```bash
# Global CLI
agenti onboard --install-daemon

# Local Dev Mode
pnpm agenti onboard --install-daemon
```

### Starting the Gateway Server
The Gateway acts as the central router connecting all of your chat channels:
```bash
# Start on default port 18789
agenti gateway --verbose

# Run in development watch mode (auto-rebuilds on change)
pnpm gateway:watch
```
Once started, the Web Control UI is accessible at: **[http://127.0.0.1:18789](http://127.0.0.1:18789)**

### Checking Status
To inspect running gateways, credentials, and queued events:
```bash
agenti status
```

---

## 4. Configuration System
Agent-I stores its configuration file in your home directory:
- Path: `~/.agenti/Agent-I.json` (JSON5 format)

### Example Config:
```json5
{
  agent: {
    model: "anthropic/claude-3-5-sonnet",
    workspace: "~/.agenti/workspace"
  },
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"]
    },
    telegram: {
      botToken: "your-telegram-bot-token"
    }
  }
}
```

---

## 5. Connecting Channels

Here is how you link your messaging platforms:

### 🟢 WhatsApp
1. Run the login command:
   ```bash
   agenti channels login
   ```
2. Scan the generated QR code in your WhatsApp mobile app under "Linked Devices".

### 🔵 Telegram
1. Create a bot via **@BotFather** on Telegram to get a token.
2. Put the token in `~/.agenti/Agent-I.json` under `channels.telegram.botToken`.
3. Start the gateway.

### 🟡 WebChat
- Built-in directly into the Gateway. Simply open **[http://127.0.0.1:18789](http://127.0.0.1:18789)** in your web browser.

---

## 6. Connecting Services (GitHub, Gmail, Google Docs)

Agent-I can easily connect to your development, emailing, and document systems using local CLIs or the **Model Context Protocol (MCP)**.

### 🐙 GitHub Integration
Agent-I uses the GitHub CLI (`gh`) natively for repository operations.
1. Install GitHub CLI:
   ```bash
   # Windows (winget)
   winget install --id GitHub.cli
   
   # macOS (Homebrew)
   brew install gh
   ```
2. Authenticate the CLI on your machine:
   ```bash
   gh auth login
   ```
3. Agent-I will automatically detect the authentication and can perform code reviews, manage issues/PRs, and query CI runs.

### 📧 Gmail Integration
You can connect Gmail using **Himalaya Email CLI** or an **MCP Gmail Server**.

#### Method A: Himalaya (Recommended)
1. Install Himalaya:
   ```bash
   brew install himalaya
   ```
2. Configure account credentials:
   ```bash
   himalaya account configure
   ```
   Select IMAP/SMTP and enter your Gmail address and **App Password** (generated from your Google Account security settings).
3. The `himalaya` skill inside Agent-I will read the configuration from `~/.config/himalaya/config.toml` automatically.

#### Method B: Gmail MCP Server
Add the official Google Gmail MCP server in your MCP config file (`~/.agenti/claude-mcp.json`):
```json
{
  "mcpServers": {
    "gmail": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-gmail"]
    }
  }
}
```

### 📄 Google Docs & Google Drive Integration
To let Agent-I access, search, and edit your Google Docs:
1. Configure the Google Drive/Docs MCP server in `~/.agenti/claude-mcp.json`:
   ```json
   {
     "mcpServers": {
       "google-drive": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-google-drive"]
       }
     }
   }
   ```
2. On first launch, follow the terminal instructions to authorize the MCP client with your Google Account.

---

## 7. Security & Pairing
By default, Agent-I runs in secure mode. When someone messages the assistant, they will be prompted with a pairing code.

To approve a conversation pair:
```bash
agenti pairing list                   # List pending pairing requests
agenti pairing approve <channel> <code> # Approve pairing
```

---

## 8. Developer Guidelines

### Useful Commands
- **Check formatting and linting**: `pnpm check`
- **Fix formatting**: `pnpm format`
- **Run Unit Tests**: `pnpm test`
- **Rebuild A2UI Canvas Bundles**: `pnpm canvas:a2ui:bundle`

### Workspace File Structure
- `src/` — Contains core logic (channels, agents, CLI inputs).
- `extensions/` — Holds optional plugins and external messaging connectors.
- `docs/` — Full Mintlify documentation files.
- `ui/` — Web-based Control UI built using Lit components.
