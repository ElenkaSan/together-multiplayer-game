# Tiny Heroes adventures

An Adventure is a room-scoped content pack containing an ordered list of rescue situations. Forest Rescue is the only released pack. The nine future worlds in the chooser are roadmap labels, not selectable or implemented games.

## Content boundaries

- `shared/tiny-adventures.ts`: typed public pack registry, introduction, world/map, stable rescue IDs, stories, character/scene keys, map positions, tool menus, clues, optional original image assets, sound cues and attempt policy. Views use content keys and actual rescue count, not five hard-coded index cases.
- `server/tiny-adventures.ts`: private solution registry, pack validation, per-room attempts and outcome ledger, retry/assistance policy. Answer keys and explicit hint tools are only projected after an unsuccessful attempt.
- `server/modes.ts`: brief and resolution adapters; Tiny reads the room's content pack. Signal Lost retains its original content and rules.
- `server/engine.ts`: existing phases and room/reconnect/timer transport remain. Narrow Tiny hooks select the pack, record an outcome and repeat the same rescue after a miss. There is no client-side result or progression authority and no new phase. Ending uses the content pack length.

## Feedback policy

Each rescue has two timed attempts. A successful attempt (including existing kindness-star support) earns one badge and completes the rescue. First miss: no badge, no completed progress, gentle feedback, illustrated narrated hint, automatic same-rescue briefing and a second submission window. Second miss: the crew helps the friend home, with an explicit assistance message and no rescue badge. This makes every adventure completable even after timeouts. No failure celebration is rendered. Overall completion celebrates reaching the end, while the summary distinguishes badges, hints, kindness support and crew assistance.

Every Tiny submit carries an attempt number as well as the existing round number; stale first-attempt submissions cannot be accepted in the second attempt. First attempts accept the legacy missing attempt field for compatibility. Retry attempts require the current number. Reconnect restores this server state, submissions, hints and accumulated outcomes. Signal's submit payload and state projection are unchanged.

Progress is the completed outcome ledger (friends home). Performance is the badge score plus each outcome's attempts, hintUsed, kindnessUsed and crewHelp. Kindness stars are the existing spendable resource, not completion progress. Replay clears the ledger and restores the same selected pack.

## Add a future pack

1. Add an original pack to the shared registry with a unique ID, stable rescue IDs, any ordered number of situations and at least two attempts. Use existing tool/scene illustration keys or provide optional `art.scene`, `art.character`, `art.clue` and `environment.mapAsset` paths. New custom illustration renderers/tools require a UI asset renderer, never a networking rewrite.
2. Add the server-only solution and hint for each rescue ID. Validation rejects missing solutions, duplicate rescue IDs, invalid policy or answer tools outside the menu before room creation.
3. Remove the corresponding roadmap label and run the adventure tests. The chooser automatically lists registered packs. Selection is sent only at creation; joining/reconnecting inherits the room's pack.
4. Add original art/sound cues, keep touch targets large and clues short, and verify Read to me for introduction, retries, results and completion. Current generated sound cues are opt-in and narration never autoplays.

The data-only extension test supplies a reordered, three-rescue pack and finishes it through the same engine. Full engine tests cover 2–6 players in both modes; real socket tests cover wrong-answer synchronization, retry, stale attempts and reconnect.

## Forest expedition artwork

The original illustrated 2D assets in `public/art/tiny` were generated with the built-in image-generation tool using the approved richer 2D concept as a style reference. Generation briefs: six text-free layered forest environments (map, broken bridge, tall tree, dark cave, snow trail, flooded village); five original animal adventurers in five expressions (idle, thinking, oops, happy, celebrate); nine distinct future-world preview illustrations. Atlases were sliced into individual optimized WebP assets; no UI or labels are baked into images.

The map uses HTML markers positioned by each rescue's `mapPosition` in normalized 900×540 coordinates over the complete image, preserving progress and current-step state. The original SVG renderer remains a fallback for content packs without `mapAsset`. All five scenes and the Captain use the same environment and hero artwork. CSS supplies subtle clouds, glints, drifting foliage, idle/reaction motion and marker glow, with reduced-motion support. Future cards are locked previews, not new playable packs. Text, tools, buttons, room commands, timers, narration and sound controls remain HTML and existing APIs.

Shared `story` is a neutral question describing the rescue, without naming its solution. Private `clue` describes a useful property (strong/bendy, steps, light, warmth, floating), so players reason and communicate. Retry hints still reveal a tool after a missed attempt under the existing policy. No networking, phase, score, seat, reconnect or speech implementation is changed by this art update.
