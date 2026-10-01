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

Push this directory to `together-multiplayer-game` on GitHub. Create a Render Node web service with `npm ci && npm run build`, start command `npm start`, and `/health` health check. `render.yaml` defines a free service in Virginia. Use one instance: in-memory room state is not shared between processes. Production round timers are 7-second briefing, 60-second action phase and 12-second result display.

The free service may sleep when idle. Server restart, redeployment or idle shutdown loses rooms. Refresh and transient network interruption restore an anonymous seat as long as the room's server process survives. PostgreSQL persistence is intentionally deferred.

## Missions

**Tiny Heroes / Sunny Valley Rescue:** five distinct animal rescues. Helpers receive simple tool clues and choose visual tool buttons. A Team Captain manages three kindness stars, each covering one incorrect or missing helper action. Every fully successful rescue earns a badge; no child is eliminated.

**Signal Lost / Return the Signal:** five sectors with navigation, engineering and communications settings, plus a shared shield decision. Responsibilities combine for two players and duplicate above three. All assigned system orders and shield choices must align. Each failed sector costs one integrity. Victory requires at least four successful sectors and positive remaining integrity. All five sectors play even after integrity reaches zero, allowing the crew to practice.

Discuss in person or through an existing phone/video call. Built-in chat and voice are not included.

## Shared engine

`server/engine.ts` owns rooms, opaque seat tokens, readiness, host transfer, deadlines, duplicate submission rejection, reconnection, capacity, expiry and round progression. `server/modes.ts` supplies only game-specific briefs and resolution. `server/index.ts` transports individualized snapshots using Socket.IO; private information and other players' submissions never appear in shared snapshots. The React app renders only the server's state and local unsubmitted choices.

Lobby → briefing → action → locked → result → next briefing / finished. A room pauses between rounds with fewer than two connected players. Missing actions time out as waiting. Joining an active mission is blocked; existing seats can reconnect. The host can return a finished mission to the lobby, pruning disconnected seats. Anonymous seat tokens are stored locally, never in invite URLs.

## Validation

```sh
npm test
npm run build
```

Engine tests cover five rounds for each player count in both modes, snapshot privacy, host transfer, reconnect, invalid/stale/duplicate orders, missing submissions, pause/resume, capacity, expiry and kindness-star spending. Socket integration tests use two independent real clients, verify synchronized results through both complete missions, and reconnect an already-submitted player.

Browser and physical-device checks still need the live deployment. No database or paid resource is required for this version.
