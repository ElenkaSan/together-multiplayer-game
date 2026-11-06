# Contributing to TOGETHER!

Thanks for helping make cooperative play more reliable and accessible.
The project is maintained by Elena Nurullina. Contributions can be small:
a reproducible bug report, clearer instructions, a focused test or a code fix.

## Start here

1. Read the architecture, gameplay and operational limitations in [README.md](README.md).
2. Check existing issues and pull requests when you have repository access.
   For a larger feature, discuss the proposal before building it.
3. Keep a contribution focused on one problem. Avoid unrelated redesigns.
4. Fork the public repository, or use an authorized branch if you are a
   collaborator. Work on a separate branch and open a pull request against `main`.

The licensing documents do not change repository visibility. Until a public
release is enabled, repository access is limited to authorized collaborators.

## Local development

Use Node.js 22 or later and npm.

```bash
npm ci
npm run build
npm start
```

Open http://localhost:3000. For development, run `npm run server` and
`npm run dev` in separate terminals. See README for LAN testing.

```bash
npm test
npm run build
```

Run checks appropriate to your change. Explain any failing or unexecuted checks;
do not describe Socket.IO tests as physical-device or browser verification.

## Useful first contributions

- Reproduce responsive behavior at 320, 375, 390, 430 and 768 pixels and desktop.
  Record actual viewport/document widths and screenshots.
- Improve keyboard navigation, focus visibility and instructions without
  changing a player's authorized actions.
- Add meaningful tests for reconnect recovery, stale commands and private clue
  boundaries.
- Improve setup documentation and explain role-specific cooperation clearly.

These are starting points, not claims that an unverified defect exists or that
any external contribution has already been accepted.

## Protect the multiplayer contract

Keep room state, action validation, timers, integrity, scoring and progression
server-authoritative. Never put server puzzle answers, seat tokens or another
player's unshared private clues into public snapshots or shared scenes.

Preserve both game modes. Test the smallest relevant scenario with independent
clients, then check larger crews if the change affects role allocation or
synchronization. Label local tests, production tests, browser tests and
physical-device tests accurately. Do not load-test the public service.

For layout fixes, correct intrinsic sizing and container constraints rather
than hiding the problem with overflow clipping.

## Bug reports and pull requests

Include:
- mode, adventure/sector, browser/device and viewport;
- concise reproduction steps and expected versus actual behavior;
- a screenshot or log excerpt when useful, with private data removed;
- what changed, why, and which checks were actually run.

Do not include credentials, reconnection tokens, personal information or private
telemetry from real players in public reports. For a potential security issue,
contact the maintainer privately at elenka_san@yahoo.com instead of publishing
exploit details.

## Licensing and attribution

Read [LICENSE](LICENSE), [COPYRIGHT.md](COPYRIGHT.md) and [ASSETS.md](ASSETS.md).
Submit only material you have the right to contribute. Unless explicitly
identified and agreed otherwise, contributions to the covered source code and
documentation are offered under AGPL-3.0-only. Contributors retain their
copyright; submission does not assign ownership to the maintainer.

Preserve existing third-party license notices. Include provenance and permission
for non-code assets. There is no requirement to purchase a service, donate or
transfer copyright to participate.
