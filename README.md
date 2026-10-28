# TOGETHER!

Two cooperative web games for 2–6 players on independent devices. No login: choose a world, create a room, share its six-character code, and ready up.

## Run

Requires Node.js 22 or newer.

```sh
npm ci
npm run build
npm start
```

Open http://localhost:3000. Other devices on the same network can use the host computer's LAN address and port 3000. For development run `npm run server` and `npm run dev` in separate terminals.

## Deploy

Push this directory to `together-multiplayer-game` on GitHub. Create a Render Node web service with `npm ci && npm run build`, start command `npm start`, and `/health` health check. `render.yaml` is included for deployment configuration.

The free service may sleep when idle. Server restart, redeployment or idle shutdown loses rooms. Refresh and transient network interruption restore an anonymous seat as long as the room's server process remains alive.

## Missions

**Tiny Heroes / Sunny Valley Rescue:** five distinct animal rescues. Helpers receive simple tool clues and choose visual tool buttons. A Team Captain manages three kindness stars, each covering one of three possible rescue outcomes. The game is structured around quick cooperative interpretation and shared timing.

**Signal Lost / Return the Signal:** five sectors with navigation, engineering and communications settings, plus a shared shield decision. Responsibilities combine for two players and duplicate actions are rejected, creating a strong coordination requirement across separate devices.

Discuss in person or through an existing phone/video call. Built-in chat and voice are not included.

## Shared engine

`server/engine.ts` owns rooms, opaque seat tokens, readiness, host transfer, deadlines, duplicate submission rejection, reconnection, capacity, expiry and round progression. `server/modes.ts` supplements this with per-mode logic, while `shared/*.ts` defines the game data used by both client and server.

Lobby → briefing → action → locked → result → next briefing / finished. A room pauses between rounds with fewer than two connected players. Missing actions time out as waiting. Joining a room after the current round has started depends on state and reconnection behavior defined by the engine.

## Validation

```sh
npm test
npm run build
```

Engine tests cover five rounds for each player count in both modes, snapshot privacy, host transfer, reconnect, invalid/stale/duplicate orders, missing submissions, pause/resume, capacity, expiry and progression. Browser and physical-device checks still need the live deployment. No database or paid resource is required for this version.

┌─────────────────────────────────────────────────────────────────────┐
│                         Browser / Client                          │
│  React + TypeScript + Vite                                          │
│  - room join / create                                               │
│  - lobby + game UI                                                 │
│  - ready state                                                     │
│  - submit actions                                                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Socket.IO
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Authoritative Server                         │
│  Node.js + Express + Socket.IO                                      │
│  - room lifecycle                                                   │
│  - seat assignment                                                  │
│  - validity checks / duplicate rejection                             │
│  - reconnect + timeout handling                                     │
│  - round progression                                                │
└──────────────┬───────────────────────┬──────────────────────────────┘
               │                       │
               ▼                       ▼
┌──────────────────────┐   ┌─────────────────────────────────────┐
│ Game Logic / Modes   │   │ In-memory Room State               │
│ server/modes.ts      │   │ room code, seats, readiness,       │
│ server/*.ts          │   │ phase, actions, result, timeouts    │
└──────────────────────┘   └─────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Shared Domain / Rules                          │
│  shared/*.ts                                                       │
│  mission definitions, rules, turn structure, scenario metadata     │
└─────────────────────────────────────────────────────────────────────┘

## Architecture
flowchart LR
    subgraph Client["Frontend (React + Vite)"]
        UI["src/ UI Components\nRoomEntry, TinyHeroExperience,\nTeamExpedition, CollectionAdventure, ..."]
        SocketClient["Socket.IO Client"]
    end

    subgraph Shared["Shared Game Layer"]
        Rules["shared/*.ts\nMission data, round rules,\nscenario definitions"]
    end

    subgraph Server["Backend (Node.js + Express + Socket.IO)"]
        HTTP["Express HTTP server\n/health, room endpoints"]
        Engine["server/engine.ts\nRoom lifecycle, seats, readiness,\nvalidation, reconnects"]
        Modes["server/modes.ts\nGame mode orchestration"]
        ModeLogic["Mode-specific logic\nserver/*.ts\ntiny-adventures, team-expeditions,\ncollection-mechanisms, expert-mechanisms"]
        Store["In-memory Room Store\nCurrent room state"]
    end

    UI --> SocketClient
    SocketClient -->|join room / ready / submit action| Engine
    HTTP --> Engine

    Engine --> Store
    Engine --> Modes
    Modes --> ModeLogic
    ModeLogic --> Rules
    Rules --> UI

    Engine -->|state snapshots| SocketClient
    SocketClient -->|render state| UI

### Overview

`TOGETHER!` is a full-stack real-time browser game built around a single authoritative server and a React/Vite client. The project intentionally keeps all multiplayer coordination in memory on the server and exposes a small websocket API to clients, which makes the game easy to run locally and deploy to a lightweight Node host without a database.

### High-level architecture

- Frontend: React + TypeScript + Vite in `src/`
- Shared domain models and rules: TypeScript definitions in `shared/`
- Backend runtime: Express + Socket.IO in `server/`
- Runtime entry point: `server/index.ts`
- Testing: Node test runner against `tests/*.test.ts`

### 1. Client layer

The browser app in `src/` renders each game mode as a distinct experience:

- `TinyHeroExperience.tsx` and related files for the Tiny Heroes flow
- `TeamExpedition.tsx` and `IceExpedition.tsx` for expedition-style coordination modes
- `CollectionAdventure.tsx` and `ExpertAdventure.tsx` for the collection/expert experiences
- `RoomEntry.tsx` for room creation/joining and lobby setup
- `main.tsx` for client bootstrapping and app composition

The UI is strongly game-state driven: the client renders a current round snapshot, player status, and interactive actions, while the server remains the source of truth for room state transitions and validation.

### 2. Shared game rules layer

The `shared/` directory contains the canonical game definitions used by both client and server:

- `tiny-adventures.ts`
- `new-adventures.ts`
- `collection-adventures.ts`
- `expert-adventures.ts`
- `advanced-adventures.ts`

These modules define mission metadata, round structures, clues, decisions, and rules used by both the UI and the backend. This reduces drift between client-side hints and server-side validation.

### 3. Server layer

The `server/` directory is where the game runtime lives.

Key files:

- `index.ts` — starts Express, Socket.IO, health endpoint, and server lifecycle
- `engine.ts` — central room management, state transitions, seat lifecycle, timeouts, reconnects, and validation
- `modes.ts` — mode registration and game-specific orchestration
- `tiny-adventures.ts`, `team-expeditions.ts`, `collection-mechanisms.ts`, `expert-mechanisms.ts`, `advanced-evidence.ts` — mode-specific behaviors and rule logic

The server is authoritative for:

- room creation, join, and leave behavior
- seat assignment and anonymous identity management
- readiness and host transfer
- round deadlines and duplicate-submission rejection
- reconnection and stale action cleanup
- state progression across lobby, briefing, action, locked, and result phases

### 4. Real-time communication model

The application uses Socket.IO to synchronize multiplayer state across devices.

Typical flow:

1. A client creates or joins a room using a short room code.
2. The server creates a `Room` instance and assigns a seat token.
3. Players ready up and the server transitions the room to the briefing phase.
4. Each player submits actions for their role or objective.
5. The server validates submissions, rejects duplicates or invalid moves, and advances the round.
6. The client receives snapshots or state deltas and renders UI updates.

This design keeps the multiplayer logic simple and deterministic while making each room instance isolated and self-contained.

### 5. State and lifecycle design

The game state follows a staged lifecycle:

- Lobby
- Briefing
- Action
- Locked
- Result
- Next briefing / finished

A room is ephemeral in memory, and the server automatically handles:

- reconnects after transient network interruption
- missing actions via timeouts
- pause/resume behavior when fewer than two players remain
- capacity and expiry policies
- host transfer if the original host disconnects

This makes the runtime suitable for lightweight co-op sessions without a persistent database layer.

### 6. Data flow and boundaries

A useful mental model is:

- `shared/` = canonical game definitions and rules
- `server/` = authoritative state machine and validation
- `src/` = user-visible presentation and interaction layer

The boundary is intentionally clean:

- clients never mutate room state directly
- the server validates all game actions before accepting them
- the UI only reflects current snapshots and emits user intent

### 7. Deployment architecture

The project is designed for a single Node process deployment:

- `npm start` runs the server directly
- `server/index.ts` exposes an HTTP health endpoint (`/health`)
- `render.yaml` configures deployment to Render
- no external database required for the current version

This is a practical architecture for a small, low-cost multiplayer game: one server process, in-memory room state, and browser clients connected over Socket.IO.

### 8. Strengths

- Simple deployment model
- Zero login / zero database friction
- Shared rules reduce frontend/backend drift
- Room-scoped multiplayer state is easy to reason about
- Clean separation of authoritative logic and UI rendering

### 9. Constraints and trade-offs

- Rooms are not durable across process restarts or idle shutdowns
- All room state lives in memory, so horizontal scaling requires a shared state layer
- There is no built-in chat, voice, or persistent account system
- Game logic is intentionally tuned for local-network and lightweight hosting scenarios

### 10. Recommended evolution path

If the project grows, the architecture can be extended without rewriting the game model:

- Add Redis for room persistence and cross-instance state sync
- Add a real database for analytics and moderation
- Separate rule engines and UI components into more explicit domains
- Add websocket event versioning and room snapshots for debugging
- Introduce a service layer for authentication, session management, and telemetry

### Summary

This repository follows a classic authoritative-server game architecture: an in-memory Node server coordinates rooms, validates actions, and drives game progression, while a React client renders the game state and captures player interaction. The design is intentionally lightweight, fast to run, and well-suited for small cooperative multiplayer sessions without requiring infrastructure beyond a Node host.


# System Design / Architecture Overview

## Overview

This project is a real-time cooperative multiplayer web game for 2–6 players on independent devices. Players join a room by code, ready up, and complete shared objectives coordinated by a single authoritative server.

The system is intentionally lightweight:
- no login
- no database
- no user accounts
- room state is kept in memory
- multiplayer coordination is handled in real time using Socket.IO

## High-level architecture

The application is split into three layers:

- Frontend: React + TypeScript + Vite (`src/`)
- Shared game logic: TypeScript definitions and rules (`shared/`)
- Backend: Express + Socket.IO server (`server/`)

## Client layer

The browser client renders the game UI, room flow, and player interactions. It is responsible for:
- creating and joining rooms
- displaying lobby and phase transitions
- rendering game state and decisions
- sending actions to the server
- updating views from server snapshots

## Shared layer

The `shared/` folder defines the canonical game rules and data structures used by both the client and server. This includes mission definitions, round logic, clues, and gameplay constraints.

## Server layer

The server is the authoritative source of truth. It manages:
- room creation and lifecycle
- seat assignment and host transfer
- player readiness
- validation of actions and duplicate submissions
- reconnect and timeout handling
- round progression and result resolution

Key files:
- `server/index.ts`
- `server/engine.ts`
- `server/modes.ts`

## Real-time communication

The game uses Socket.IO to synchronize room state across players. Clients send intent (join, ready, submit action), and the server validates and broadcasts the updated authoritative state.

## State model

Each room is an in-memory state machine with the flow:
- lobby
- briefing
- action
- locked
- result
- next briefing / finished

The room lifecycle includes reconnects, expiry, and pause behavior when player count drops below the minimum requirement.

## Deployment model

The project is designed for a single-process Node deployment:
- `npm run build`
- `npm start`

No database is required for the current version. Deployment is simple and suitable for lightweight hosting providers.

## Design trade-offs

Strengths:
- fast local setup
- low operational cost
- simple multiplayer model
- clear separation between UI and game logic

Trade-offs:
- room state is ephemeral
- no persistence across server restarts
- no built-in lobby/chat/account systems
- limited scaling beyond a single server instance

## Summary

This is an authoritative-server multiplayer game architecture: the browser client handles UX and interaction, while the Node server owns validation and game state progression. The design prioritizes simplicity, speed, and low infrastructure requirements over persistence and large-scale online infrastructure.