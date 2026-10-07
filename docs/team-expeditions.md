# Jungle Adventure and Treasure Island

Both released worlds are always playable. Levels indicate difficulty, not access.
Jungle is Level 3 / Medium; Treasure is Level 4 / Medium+.

The existing engine owns rooms, seats, deadlines, simultaneous submission, retry,
Team Assist, scores and reconnection. `team-expeditions.ts` adds only adventure
briefing/resolution adapters. A Captain submits a plan; each helper submits a
Ready confirmation. The immutable submitted Captain plan is visible to helpers.
No extra multiplayer phase or animation deadline is introduced.

Six distinct observations per stage stay in server-only content. Two-player
teams split complementary bundles; larger teams distribute observations across
all seats. Captain screens do not automatically reveal other heroes' clues.
Public stories/options/maps contain no answer keys. Failure hints may reveal
useful solution information after an unsuccessful attempt.

Jungle: River Landing, Vine Crossing, Ancient Ruins, Waterfall Caves, Hidden
Temple. Interaction varies between environment routes, ordered pictograms and
combined route/sign/action finale.

Treasure: Coral Cove, Shipwreck Bay, Whispering Palms, Skull Rock Caves, Hidden
Lagoon. High Cave (lift/turn/open) and Jungle Path (mark/follow/enter) are equally
valid in stage 4. Tide Tunnel is flooded in this expedition. No speed rewards.
The fifth compass piece is awarded when the final stage completes, including
Team Assist. Badges remain separate from completion and compass pieces.

Map transitions are 3.5 seconds, immediately skippable, client-only. Initial
render/reconnect and effects-off/reduced-motion render authoritative positions.
Characters rotate with stages. Maps and icons are original, UI stays HTML/SVG.

Verification: full automated suite; 2–6-player rules; two independent Socket.IO
clients across all ten stages with retries and reconnects; child UI/narration;
privacy of bundled public content; existing Forest/Ice/Signal regressions.
Physical iPhone/iPad Safari audio quality and touch feel require real-device QA.
