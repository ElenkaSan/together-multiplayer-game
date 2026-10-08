# Level 5 Desert Rescue and Level 6 Ocean Adventure

Both worlds are complete five-stage content packs and accessible immediately.
Level 5 is Hard; Level 6 is Hard+. Completion is session/room scoped and never
restricts access. All older world gameplay and Signal Lost remain unchanged.

Desert: Oasis Outpost → Mirage Dunes → Red Rock Canyon → Sandstorm Shelter → Lost
Caravan. One Captain submits an Expedition Plan; other players share private
clues and confirm. Supplies, landmark/approach, character job assignments and
ordered actions introduce planning, dependencies and priorities. Scout/Builder
are fictional workers, not required human seats. Wind feedback explains unsecured
supplies on a missed shelter sequence. The finale repairs, signals and guides the
caravan. Completion/progress describe caravan rescue, not five animal friends.

Ocean: Coral Harbor → Kelp Forest → Coral Nursery → Deep-Sea Station → Lighthouse
Reef. Geography descends from sunny surface to a deep station then rises to a
compact underwater navigation beacon. The submarine is an original SVG overlay.
Each stage has six interactive controls (navigation/depth, engine/equipment,
sensors/signal), partitioned by seat across 2–6 players. Two seats operate three
controls each; six seats operate one each. Every seat has useful private evidence.

The server keeps a round/attempt scoped draft and version. Settings broadcast to
all players; only owners can change their assigned fields. Any edit clears all
station Ready confirmations and increments the version. Ready is distinct from
final submission. The Captain must own slot 0, use the current draft version, and
wait for every connected station to confirm before launch. Launch atomically locks
all station actions into the existing simultaneous resolution flow. Reconnect
restores station ownership, draft, Ready status and the unchanged deadline. Missing
launch/timeout uses the existing retry and Team Assist policy. Stale run/attempt,
unowned controls, expired rounds and stale draft versions are rejected server-side.

Power is reusable working capacity, not consumed fuel. Engine/sensor/equipment
costs remain visible; switching off one frees capacity. Nursery, station and beacon
have two equally rewarded compatible configurations. Incompatible dependencies or
excess power produce Oops; public objectives never reveal complete configurations.
Answer keys and clues stay in server files. Hints are revealed only after a miss.

Two allowed misses complete the stage via labeled Team Assist without a badge.
Every successful stage earns one Adventure Badge. Completion, next-level
recommendation, free adventure choice and independent replay preserve room seats
and best session results. Living-map motion is client-only, 3.5 seconds and
immediately skippable. Effects Off/reduced motion and reconnect render current
server state without waiting. Read to Me remains tap-initiated; other station
edits do not interrupt the private briefing narration.

Verification includes real Socket.IO clients with 2, 3 and 6 seats across all ten
missions, wrong attempts, Assist, draft/Ready synchronization, reconnect and replay;
ownership/version/launch/power/alternative-plan tests and existing regression
suite. Real iPhone/iPad Safari speech voices, physical speaker volume, touch feel
and flaky cellular behavior require physical-device testing.

Artwork: built-in image generation, original stylized 2D desert/ocean expedition
maps. Final ocean prompt preserves five unique locations and directs a coherent
descending-then-rising route, replacing the conventional tower with a squat
three-legged navigation lens; no labels/markers/buttons are baked into art.
Assets: `public/art/tiny/desert-map.webp`, `public/art/tiny/ocean-map.webp`.
