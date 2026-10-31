# Signal Lost — Sector 2 reference implementation

Scope: first incremental scene only. Sectors 1, 3, 4 and 5 retain their existing UI and puzzles until this reference is visually validated. Tiny Heroes source, assets, progression and gameplay are unchanged.

## Architecture reused

- React/TypeScript/Vite application, existing room entry, invitations, roles and roster.
- Engine-generated, exhaustively validated Signal puzzles with complementary telemetry at 2–6 seats.
- Existing server-scoped Share with Crew, per-player private facts and delivery confirmations.
- Existing submit/Lock orders, 90-second Sector 2 deadline, integrity, scoring, recovered archive and five-sector progression.
- Existing reconnect tokens and authoritative state ingestion.

## Scene

DebrisMission renders an SVG star field, asteroid silhouettes, four plotted corridors, entry spacecraft and rendezvous relay. Native HTML buttons placed on the map select corridors; other stations see these proposals but cannot operate navigation. Role-owned thruster, relay and hull consoles replace the Sector 2 generic private form. Public equipment codes remain available in a disclosure. Private telemetry remains in Crew Communications.

The existing numeric equipment/constraint puzzle is preserved; asteroid placement is atmospheric, not a hidden collision rule. Route highlighting indicates a proposal, never a safe/unsafe prediction. No early answer validation is sent to clients.

During resolution, all clients use the lead Navigator's submitted path. A successful flight reaches the relay; an unaligned flight stops partway with emergency recovery feedback. If no Navigator submitted, no fictitious flight is shown. Reduced motion and the scene Effects button disable animation.

## Multiplayer addition

`signal-draft` publishes an explicitly selected console setting, not private telemetry. The server verifies actual room membership, connection, current sector/run/puzzle, unexpired action phase, unlocked station, assigned task key and valid option. It never accepts supplied player IDs, another station's controls or client-provided clues.

Drafts are room-scoped, included in public flight proposals, and restored after reconnect. Client controls use the server echo; delayed acknowledgements cannot overwrite the next sector's actions. Drafts clear on sector transition, replay and crew rebalancing. Existing submitted orders determine scoring, regardless of proposals.

## Reproducible two-player reasoning example

Generated Sector 2 puzzle, seed 17 (illustration of reasoning; production seeds remain private):

Navigator + Signal Analyst receives:

- Thruster overhead + protection drag = 2.
- Relay delay + protection drag = 3.
- Corridor burn + protection drag = 3.

Engineer receives:

- Corridor burn + thruster overhead = 5.
- Corridor burn + relay delay = 6.
- Thruster overhead + relay delay = 5.

Each player's private observations leave two valid configurations. Combining the shared observations yields burn 3, overhead 2, relay delay 3, drag 0: South, Boost, Green, protection retracted. The Navigator plots South and Green; Engineer sets Boost; both independently confirm protection and lock orders. Neither private brief states this full solution.

## Validation boundary

Automated tests cover generated uniqueness/asymmetry, all crew sizes, role ownership, private data isolation, synchronized proposals, stale/invalid commands, reconnect, result paths, timers, scoring and five-sector completion. Socket tests use separate real Socket.IO connections against the real application server.

Browser validation is outstanding. Connected Chrome's localhost addresses another application; the cloud browser cannot reach this workspace's local server. Consequently desktop/mobile layout, actual pointer/touch handling, SVG motion-path rendering and visual quality are not claimed verified. SSR markup checks are not browser tests. The reference must pass those checks before propagation to the remaining scenes or production deployment.
