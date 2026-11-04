# Signal Lost: responsive shared missions

## Baseline and recovered work

PR #2 is merged (head 5eebcc7); it introduced only the Sector 2 scene. PR #5 is merged and production is Live on 72a8ad0b93b4f5e3dbd343483fae514d52385cc0, confirmed through Render. The unfinished local work contained the other four scene implementations and responsive CSS, but was not present on main. This branch recovers and completes only that work on the production baseline. Unrelated local homepage, Tiny Heroes, speech, build configuration and documentation edits were excluded.

## Layout causes and fixes

Source inspection found intrinsic minimum widths in grid/flex children and fieldsets, a fixed desktop crew column, non-wrapping header/mission groups, and narrow-screen two-column consoles. Those constraints allowed children to demand more width than the available column. The document background was light while only the application element was dark, making exposed canvas/overscroll light. These are source findings; no new mobile-browser geometry measurements have been obtained.

Signal-only CSS resets intrinsic minimums, uses minmax(0, 1fr), stacks consoles and sensor cards on phones, wraps headers/resources/actions, and makes SVG scenes fluid. The document canvas becomes dark only while Signal Lost is selected, including invitations. Safe-area padding and small viewport height are supported. Horizontal overflow is not merely hidden. Tiny Heroes styles and components are unchanged.

## Shared scene and private station boundaries

The server validates every proposal against actual room membership, connection, phase, deadline, run, puzzle and role-owned task/options. Proposals are explicitly selected equipment settings, not private telemetry. They reset on sector change/rebalancing and restore with the existing seat after a temporary disconnect. Submission, puzzle generation, timing, scoring, integrity, archive recovery and victory rules are preserved.

SignalSceneModel is an allowlist: sector, phase, public board, public proposals, score, integrity, success and server resolution timestamp. Shared SVG components receive that model, never the private brief or telemetry. Every station renders the same model. Role-owned controls are separate; duplicate operators must still agree. Share with Crew remains the only way to publish selected private telemetry.

Resolution animations use the server resolvedAt timestamp to resume at elapsed progress after reconnect. Effects controls and reduced-motion CSS disable animation.

| Sector | Shared environment and public visual changes |
| --- | --- |
| 1 Wake the Relay | Damaged station, antenna alignment, gain, carrier waves and echo gate |
| 2 Cross the Debris Field | Same asteroid map for every station; server-echoed route proposals and submitted-route animation |
| 3 Power Failure | Reactor, four labelled branches, proposed cell allocations and total budget |
| 4 The Ghost Telemetry | Radar, conflicting public sensor reports, proposed source, heading, reactor and diagnostic gate |
| 5 Final Transmission | Main array, return signal path, power, handshake pattern, transmission gate and crew authorization |

## Validation and open acceptance checks

Automated suites exercise 2–6 seats, equality of public scene models, role ownership, private asymmetry, selective sharing, wrong room/stale/expired writes, locked controls, reconnect, synchronized deadlines/results and all five sectors. Independent Socket.IO clients at 2 and 6 seats complete with 5/5 and integrity 3/3. These are network integration tests against an isolated server, not browser verification.

A pre-existing QA captain-sharing test could send a new versioned edit before the other socket consumed the prior state event. The test now waits for both sockets to receive the new version; application Tiny Heroes logic was not changed.

The connected Chrome attempt timed out. A cloud browser opened the existing production homepage and Signal setup, but that version lacks these new scenes. No claim is made for new-scene screenshots, 320/375/390/430/768px or desktop geometry, touch, keyboard flow, Safari safe areas, reduced-motion rendering, or two isolated browser sessions completing the new UI. Those checks remain required before acceptance. Automated/SSR evidence does not replace them.

This branch is not merged or deployed. Production remains unchanged. Public staging/deployment requires user approval under the task's explicit delivery constraint.
