# What is this `.cursor/` Folder?

This folder is used by **Cursor AI** to load project-specific context and settings.

---

## Files Inside

- `context.md` — detailed overview of the project, logic, file structure, hard rules, and dev workflow.
- `settings.json` *(optional)* — preferred editor behavior (e.g. tab size, model, autosave, formatting).

---

## Usage

When you open this project in Cursor, it will:
- Auto-load `context.md` to prime AI completions
- Respect `settings.json` for formatting and linting
- Maintain continuity across prompts (like Claude’s `.claude/CLAUDE.md`)

---

## Tips

- Only one `context.md` per project.
- Keep it updated as structure or logic evolves.
- You can symlink or copy this format across other Cursor projects.

---

> Last updated: June 2025 by Paul Takisaki
