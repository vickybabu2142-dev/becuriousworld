# Antigravity Skills & Tools — Reference Guide

> Quick-access reference for all available Antigravity (AGY) skills, surfaces,
> slash commands, CLI settings, and customization options for this project.

---

## 📦 Available Skills

Skills are auto-discovered from two locations:

| Location | Path |
|---|---|
| **Built-in (Global)** | `C:\Users\Win\.gemini\antigravity-cli\builtin\skills\` |
| **Workspace** | `C:\Jainendra\Project\.agents\skills\` *(not yet created)* |

### 🔧 `antigravity-guide`

**Trigger:** Questions about using, configuring, or customizing Antigravity / AGY / the CLI / IDE.

| Property | Value |
|---|---|
| **Location** | `builtin/skills/antigravity_guide/` |
| **Description** | Comprehensive guide & sitemap for all Antigravity surfaces |

**Reference files included:**

| File | Covers |
|---|---|
| `cli.md` | TUI navigation, all `/` commands, `settings.json` keys |
| `app.md` | Antigravity 2.0 desktop app, sidebar, permissions |
| `ide.md` | Antigravity IDE, autocomplete, inline edits, agent mode |
| `sdk.md` | Python SDK — `pip install google-antigravity`, async agent API |

---

## ⚡ Slash Commands (Available in Chat)

Type `/` in the chat to trigger these:

| Command | What it does |
|---|---|
| `/goal` | Long-running task mode — agent works until fully done |
| `/schedule` | Set a one-time timer or recurring cron job |
| `/grill-me` | Interactive interview to align on design decisions |
| `/teamwork-preview` | Spawns a team of parallel agents for large projects |
| `/learn` | Saves a corrected behavior or pattern for future sessions |

---

## 🖥️ CLI-Only Commands (`agy` terminal)

| Command | Description |
|---|---|
| `/skills` | List all active agent skills |
| `/diff` | Show current codebase diff of agent changes |
| `/context` | List all files/symbols in the agent's context |
| `/fork` | Fork conversation into a new thread |
| `/rewind` | Undo conversation to a previous checkpoint |
| `/mcp` | List active MCP servers and tools |
| `/model` | Change the active Gemini model |
| `/permissions` | Manage allow/deny lists for tools |
| `/usage` | Show token usage and session cost |
| `/add-dir` | Add a directory to the active workspace |
| `/btw` | Ask a quick side-question without a full agent run |
| `Ctrl+D Ctrl+D` | Exit the CLI |

---

## ⚙️ CLI Settings (`settings.json`)

Located at: `~/.gemini/antigravity-cli/settings.json`

| Key | Type | Description | Default |
|---|---|---|---|
| `model` | string | Active Gemini model | `gemini-3.5-flash` |
| `toolPermission` | string | `always-proceed` / `request-review` / `strict` | `request-review` |
| `enableTerminalSandbox` | bool | Run commands in a sandboxed env | `false` |
| `allowNonWorkspaceAccess` | bool | Read/write outside workspace root | `false` |
| `colorScheme` | string | `terminal` / `dark` / `light` | `terminal` |
| `verbosity` | string | `high` / `low` agent trace rendering | `high` |
| `historySize` | int | Max history entries (`-1` = unlimited) | `2000` |
| `artifactReviewPolicy` | string | When to ask for artifact review | `asks-for-review` |
| `notifications` | bool | System notifications on task completion | `false` |

---

## 🛠️ Surfaces Overview

### Antigravity CLI (`agy`)
- Lightweight terminal TUI
- Auth: `agy` then press Enter for OAuth browser flow
- Navigate with arrow keys, `ESC` to close menus

### Antigravity 2.0 (Desktop App)
- Electron desktop app
- Left sidebar: Conversations, Projects, Scheduled Tasks, Skills, Settings
- Chat canvas supports `/` slash commands and `@` mentions
- Drag-and-drop images/files into chat

### Antigravity IDE (VS Code-based)
- Three AI modalities:
  1. **Tab Autocomplete** — passive next-intent prediction
  2. **Inline Command** (`Ctrl+I`) — targeted edits on selection
  3. **Sidebar Agent** — multi-step pair programmer
- Inline code lenses above functions (Refactor / Test / Explain)
- Visual diff overlays in-editor

### Antigravity Python SDK
```sh
pip install google-antigravity
```
```python
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig
async with Agent(LocalAgentConfig(capabilities=CapabilitiesConfig())) as agent:
    response = await agent.chat("Your prompt here")
    async for token in response:
        print(token, end="")
```

---

## 📁 Adding Custom Skills to This Project

Create a skill at `.agents/skills/<skill-name>/SKILL.md`:

```
C:\Jainendra\Project\
└── .agents\
    └── skills\
        └── my-skill\
            ├── SKILL.md        <- Required: name + description frontmatter
            ├── scripts\        <- Optional helper scripts
            ├── examples\       <- Optional usage examples
            └── references\     <- Optional extra docs
```

**SKILL.md template:**
```markdown
---
name: my-skill
description: What triggers this skill and what it does.
---

# My Skill

Instructions for the agent when this skill is activated...
```

---

## 🌐 Live Documentation

| Topic | URL |
|---|---|
| Main Docs | https://antigravity.google/docs |
| Skills | https://antigravity.google/docs/skills |
| Rules | https://antigravity.google/docs/rules |
| MCP | https://antigravity.google/docs/mcp |
| Permissions | https://antigravity.google/docs/agent-permissions |
| Changelog | https://antigravity.google/changelog |

---

*Last updated: 2026-06-24 — auto-generated by Antigravity agent.*
