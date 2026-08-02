# ETM — Enterprise Task Manager

A Kanban-style task management app built with vanilla **HTML, CSS, and JavaScript** —
mirroring enterprise tools like Jira, with tickets, priorities, drag-and-drop
status columns, and keyword search.

![status](https://img.shields.io/badge/build-passing-2F5FED) ![stack](https://img.shields.io/badge/stack-HTML%2FCSS%2FJS-14213D)

## Features

- **Ticket CRUD** — create, edit, and delete tickets, each with an auto-generated
  key (`ETM-1`, `ETM-2`, …) like a real issue tracker.
- **Kanban board** — three columns (To Do / In Progress / Done) with native
  drag-and-drop to move tickets between statuses, plus a checkbox for quick
  completion.
- **Live counters** — per-column counts and workspace-wide totals (total,
  open, done) update instantly on every change.
- **Keyword search** — filter the board live by ticket text or ticket key.
- **Persistent storage** — the board is saved to `localStorage`, so tickets
  survive a page refresh.
- **Priority tags** — Low / Medium / High, color-coded on each ticket.

## Project structure

```
todo-enterprise/
├── index.html      # markup
├── css/
│   └── style.css   # design system + layout
└── js/
    └── app.js       # state, CRUD, drag-and-drop, search, storage
```

## Running it

No build step — it's a static site.

```bash
# open directly
open index.html

# or serve locally
npx serve .
```

## Assignment coverage

| Level | Requirement | Where it lives |
|---|---|---|
| 1 | Add a todo via input + button | `#ticket-form` in `index.html`, `addTask()` in `app.js` |
| 1 | Render the list with checkbox + description | `buildCard()` in `app.js` |
| 1 | Delete a todo | `card__action--danger` handler → `deleteTask()` |
| 2 | Edit a todo | `card__action--edit` handler → `openEditModal()` / `updateTask()` |
| 2 | Todo counter | `#stat-total`, `#stat-open`, `#stat-done`, per-column `.column__count` |
| 3 | Persistent storage (localStorage) | `loadTasks()` / `saveTasks()` |
| 3 | Keyword search | `#search-input` listener → `render()` filter |

## Notes

Built as a portfolio-oriented extension of a basic to-do list assignment,
restyled as a small enterprise tool to demonstrate CRUD, state management,
and UI structure beyond the minimum requirements.
