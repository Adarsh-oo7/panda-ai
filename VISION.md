## Agent-I Vision

Agent-I is the AI that actually does things.
It runs on your devices, in your channels, with your rules.
Developed by **Adarsh B S**.

---

### What is Agent-I?

Agent-I is a personal AI assistant gateway. It connects messaging apps you already use to powerful AI models, running entirely on your own hardware. You own the data, you own the assistant.

It started as a fork of the Agent-I open-source project and has been rebranded and extended for personal use.

### Current Focus

**Priority:**
- Security and safe defaults
- Bug fixes and stability
- Setup reliability and first-run UX

**Next priorities:**
- Supporting all major model providers
- Improving support for major messaging channels
- Performance and test infrastructure
- Better computer-use and agent harness capabilities
- Ergonomics across CLI and web frontend
- Companion apps on macOS, iOS, Android, Windows, and Linux

### Technology

Agent-I is primarily an orchestration system: prompts, tools, protocols, and integrations.
Built in TypeScript for hackability — widely known, fast to iterate in, easy to read and extend.

### Security

Security in Agent-I is a deliberate tradeoff: strong defaults without killing capability.
The goal is to stay powerful for real work while making risky paths explicit and operator-controlled.

Default: DM pairing — unknown senders receive a pairing code before the agent processes their messages.

### Plugins & Memory

Agent-I has an extensive plugin API. Core stays lean; optional capability ships as plugins.

Memory is a special plugin slot — only one memory plugin can be active at a time.

### Skills

Bundled skills provide baseline UX. New skills should be workspace skills or published to ClawHub.

---

MIT License. Developed by Adarsh B S.
