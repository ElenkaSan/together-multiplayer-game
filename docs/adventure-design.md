# Tiny Heroes content contract

Each playable world defines its own level, environment/map, five situations,
public objectives, role-specific private observations, visual options, resources,
server-only resolution rules, gentle hints and a finale that combines its lessons.
Public content and artwork never identify a winning choice. Numbered world markers
show expedition progress, not mission answers. Keep UI text and controls in HTML.

Forest stays the introductory tool and teamwork mechanic. Ice introduces route
agreement and two shared Warm Packs for extreme cold. Environmental clues determine
whether a path is safe, blocked or needs warmth. The Windy Crossing cave is blocked,
so the team must reserve one pack for its exposed bridge. The finale always offers
a protected tunnel even at zero packs. No route has a speed/scoring advantage.
Consume exactly one pack only after a successful, aligned warmth-required route.
Wrong/missing choices, retry, Team Assist and sheltered routes consume nothing.
Warm Packs never correct another player's mistake or add time.

Add future gameplay through a content pack and a registered server mechanic in
`server/adventure-mechanics.ts`. The existing Engine still owns room codes, seats,
phases, deadlines, submissions, retry, resolution broadcast, reconnect and session results.
Answer keys stay in server modules; public snapshots strip private clue lists.

Do not ship a future world by copying Forest tools and changing its art. Intended
progression: Jungle combines distributed information; Treasure adds exploration and
sequence; Desert uses routes/priorities; Ocean combines decisions; Magic uses visual
patterns; Moon combines systems, resources and coordination. These worlds remain
Coming Soon previews until each has complete content, rules, art, tests and accessibility.

Every friend reaches safety after a successful rescue or the existing two-attempt
Team Assist. Only successful resolution earns a Rescue Badge. Completion depends on all friends reaching home. Every released world is
playable immediately; levels describe difficulty, not access requirements. Room
completion and best badge results survive replay, world changes and reconnect. Team Assist is explicitly labeled and never
shown as an unexplained heart or as an earned badge.

Before shipping a pack, verify 2–6 player clue coverage, multiple strategies where
appropriate, resource exhaustion, synchronized retry, stale action rejection,
reconnect, truthful narration, Effects Off and mobile layout. Presentation animations
never gate the authoritative state machine.

