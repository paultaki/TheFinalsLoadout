# What is this `.cursor/` Folder?

This folder is used by **Cursor AI** to load project-specific context and settings.

---

## Files Inside

- `context.md` — Deeply detailed snapshot of the project’s architecture, logic, component flow, and design constraints.
- `settings.json` — Preferred Cursor behavior: model, tab size, autosave, etc.
- *(Optional)* `README.md` — You’re reading it.

---

## Usage

When you open this project in Cursor, it will:
- Auto-load `context.md` for context-aware completions
- Apply formatting + behavior settings from `settings.json`
- Provide continuity across AI coding sessions

---

## Tips

- Update `context.md` anytime logic or layout changes significantly.
- Do not rename or move files arbitrarily — Cursor relies on consistency.
- Use `diff` blocks when making changes to show clear before/after code.

---

_Last updated: June 2025 by Paul Takisaki_
