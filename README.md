<div align="center">

# ⚽ Sports Team Manager

**A React + TypeScript single-page app for managing football teams and their squads, with a typed API layer, client-side routing and cascading deletes over a REST backend.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React%20Router-6.28-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-1.7-5A29E4?logo=axios&logoColor=white)](https://axios-http.com/)

</div>

---

## Overview

Sports Team Manager is a small CRUD application built to practise the core building blocks of a modern React front end: typed data contracts, a centralised API layer, client-side routing with URL parameters, controlled forms, and state that has to stay consistent across parent and child components.

You can create teams, browse them as a grid of cards, open a team to see its squad, add and remove players, and delete a whole team along with everyone in it. The app talks to a REST API served by `json-server`, so the backend is a single JSON file and the focus stays on the front end.

The scope is deliberately small — roughly 480 lines of TypeScript across 13 files. The point was not to build something large, but to build something where every piece has a clear reason to exist.

<!--
📸 SCREENSHOTS: create a `docs/` folder, drop your images in, and uncomment this block.
Two shots do the job: the team grid and a team detail page with the squad warning visible.

<div align="center">
  <img src="docs/team-list.png" width="420" alt="Team list view">
  <img src="docs/team-details.png" width="420" alt="Team details with squad">
</div>
-->

---

## Features

| | |
|---|---|
| 🏟️ **Team management** | Create teams with name, city, coach and logo; browse them as a card grid |
| 👥 **Squad management** | Add and remove players with name, shirt number and position |
| 🔗 **Deep linking** | Every team has its own URL (`/teams/:id`), so detail pages are shareable and bookmarkable |
| ⚠️ **Squad validation** | Live feedback on whether a team has reached the 11-player minimum |
| 🗑️ **Cascading deletes** | Deleting a team removes its players too, keeping orphan records out of the database |
| 🖼️ **Image fallbacks** | Broken or missing logo URLs degrade to a placeholder instead of a broken image icon |
| 🛡️ **Full type coverage** | Shared `Team` and `Player` interfaces flow through the API layer, pages and components |
| ⏳ **Loading and error states** | Every async operation reports its status to the user |

---

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
git clone https://github.com/jezuzo/SportsTeamManager.git
cd SportsTeamManager
npm install
```

### Running

The app needs **two processes**: the mock REST API and the Vite dev server. Open two terminals.

```bash
# Terminal 1 — REST API on http://localhost:3001
npm run json-server
```

```bash
# Terminal 2 — app on http://localhost:5173
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

> The API base URL is hardcoded to `http://localhost:3001` in `src/api.ts`. If you change the `json-server` port, change it there too.

### Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot module replacement |
| `npm run build` | Type-check and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run json-server` | Start the mock REST API against `db.json` on port 3001 |

---

## Architecture

```
main.tsx                    BrowserRouter mounts the app
└── App.tsx                 Layout shell + route table
    ├── Menu                Header
    ├── Body                Main content wrapper
    │   ├── TeamList        "/"            list + create form
    │   │   └── TeamCard    per-team card, handles its own deletion
    │   └── TeamDetails     "/teams/:id"   squad + add-player form
    │       ├── Warning     shown when squad < 11
    │       ├── Info        shown when squad >= 11
    │       └── Player      per-player card, handles its own deletion
    └── Footer

api.ts                      Axios instance + all HTTP calls
types.ts                    Shared Team and Player interfaces
```

The layout shell lives in `App.tsx` and stays mounted across navigation; only the routed content swaps out. That is what makes navigating between the team list and a team page feel instant rather than like a page load.

---

## Data model

Two entities with a one-to-many relationship, both defined once in `src/types.ts` and reused everywhere:

```ts
export interface Team {
  id?: string;
  name: string;
  city: string;
  coach: string;
  logoUrl?: string;
}

export interface Player {
  id?: string;
  name: string;
  position: string;
  number: number;
  teamId: string;   // foreign key
}
```

`id` is optional because a team or player exists in the form state before it has been persisted. Marking it optional means TypeScript forces every call site to acknowledge it might be absent, instead of failing at runtime.

Players are linked to teams through `teamId`, and `json-server` exposes that as a query: `GET /players?teamId=123`.

---

## Implementation notes

### A single API layer

Every HTTP call lives in `src/api.ts` behind a configured Axios instance. No component imports `axios` directly.

```ts
export const api = axios.create({ baseURL: "http://localhost:3001" });

export const getTeams        = () => api.get("/teams");
export const getTeamById     = (id: string) => api.get(`/teams/${id}`);
export const getPlayersByTeam = (teamId: string) =>
  api.get("/players", { params: { teamId } });
```

The payoff is that the base URL, headers and error handling all have exactly one place to change. Swapping `json-server` for a real backend would touch this file and nothing else.

### Cascading deletes without a real database

`json-server` has no foreign keys and no referential integrity, so deleting a team would silently leave its players behind as orphans. `deletePlayersByTeam` closes that gap in the client:

```ts
export const deletePlayersByTeam = async (teamId?: string) => {
  const res = await api.get(`/players?teamId=${teamId}`);
  for (const player of res.data) {
    await api.delete(`/players/${player.id}`);
  }
};
```

`TeamCard` calls it before deleting the team itself, so the two operations always happen in the right order. Recognising that the backend does not enforce this — and handling it explicitly rather than assuming it works — was the more interesting half of the problem.

### Keeping UI state in sync with the server

Child components own their own deletion (they know which record they represent), but the parent owns the list. The child performs the request and then notifies the parent through a callback so the array can be filtered:

```tsx
// TeamCard.tsx
await deletePlayersByTeam(team.id);
await deleteTeam(team.id);
onDelete(team.id);            // parent removes it from state

// TeamList.tsx
const handleDeleteTeam = (id?: string) =>
  setTeams(prev => prev.filter(t => t.id !== id));
```

This avoids refetching the entire list after every delete. The trade-off is that the parent's state and the server can drift apart if a request fails silently — see the roadmap.

### URL parameters as the source of truth

`TeamDetails` reads the team ID from the route rather than from props or shared state:

```tsx
const { id: teamId } = useParams();
```

Two separate `useEffect` hooks then fetch the team and its players, both keyed on `teamId`. Keeping them separate means the page header can render as soon as the team arrives, without waiting for the squad request to finish.

### Conditional rendering driven by a domain rule

A football team needs eleven players. That rule drives which of two components renders:

```tsx
{playerCount < 11 ? <Warning playerCount={playerCount} /> : <Info playerCount={playerCount} />}
```

`Warning` and `Info` are separate components rather than one component with a boolean prop, because they carry different messages and different styling. Splitting them keeps each one trivial to read.

### Graceful image failures

Team logos are arbitrary user-supplied URLs, which means they will break. Rather than leaving a broken image icon, the `onError` handler swaps in a placeholder:

```tsx
<img src={team.logoUrl} onError={e => e.currentTarget.src = "https://via.placeholder.com/80"} />
```

---

## Project structure

```
src/
├── api.ts                   Axios instance and all HTTP calls
├── types.ts                 Shared Team and Player interfaces
├── App.tsx                  Layout shell and route table
├── main.tsx                 Entry point, BrowserRouter
├── index.css                Global styles
├── pages/
│   ├── TeamList.tsx         Team grid + create-team form
│   └── TeamDetails.tsx      Squad view + add-player form
└── components/
    ├── TeamCard.tsx         Team card with delete
    ├── Player.tsx           Player card with delete
    ├── Warning.tsx          Incomplete-squad notice
    ├── Info.tsx             Complete-squad notice
    ├── Menu.tsx             Header
    ├── Body.tsx             Content wrapper
    └── Footer.tsx           Footer
db.json                      Mock database for json-server
```

## Author

**Jesús Navarro** — [@jezuzo](https://github.com/jezuzo)

Built as a practice project for learning React with TypeScript.
