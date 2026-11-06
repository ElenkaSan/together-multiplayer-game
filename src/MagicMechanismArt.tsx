import { useId } from "react";
import type { MechanismPreview } from "../shared/expert-adventures";
import { ExpertGlyph, expertLabel, type PictureKind } from "./ExpertPicture";
export function MechanismTile({
  title,
  kind,
  value,
  caption,
  tint,
}: {
  title: string;
  kind: PictureKind;
  value?: string;
  caption?: string;
  tint?: string;
}) {
  return (
    <div
      className="mechanism-tile"
      data-unset={(!value && !caption) || undefined}
    >
      <strong>{title}</strong>
      <ExpertGlyph kind={kind} value={value} tint={tint} />
      <span>{caption || expertLabel(value)}</span>
    </div>
  );
}
const names = ["Circle", "Triangle", "Diamond"],
  colors = ["Blue", "Gold", "Violet"];
export function MagicMechanismArt({
  preview: p,
  settings: s,
  round,
}: {
  preview: MechanismPreview;
  settings: Record<string, string>;
  round: number;
}) {
  const gridId = useId().replaceAll(":", "");
  const title = [
    "Rainbow Gate · shape and color",
    "Mirror Garden · light path",
    "Floating Bridges · actual heights",
    "Clockwork Tower · both pointers",
    "Crystal Castle · Heart of Light",
  ][round];
  return (
    <figure
      className={`mechanism-illustration mechanism-${p.kind} expert-live-diagram`}
    >
      <figcaption>
        <h3>{title}</h3>
        <p>
          Live preview of your shared settings. Combine your private clues to
          choose the goal.
        </p>
      </figcaption>
      {round === 0 ? (
        <>
          <div className="mechanism-flow">
            <MechanismTile
              title="1 · Start sign"
              kind="shape"
              value={s.source}
              tint={["#8cc8ef", "#f6cf63", "#b5a1e0"][Number(s.color || 0)]}
              caption={`${names[Number(s.source || 0)]} · ${colors[Number(s.color || 0)]}`}
            />
            <div className="mechanism-step">
              <strong>2 · Magic wheels</strong>
              <ExpertGlyph kind="gear" />
              <span>
                Shape: {s.shapeTurn ?? "—"} turns
                <br />
                Color: {s.colorTurn ?? "—"} turns
                <br />
                Lens: {expertLabel(s.lens)}
              </span>
              <b aria-hidden="true">→</b>
            </div>
            <MechanismTile
              title="3 · Final sign"
              kind="shape"
              value={String(p.values[0])}
              tint={["#8cc8ef", "#f6cf63", "#b5a1e0"][p.values[1]]}
              caption={`${names[p.values[0]]} · ${colors[p.values[1]]}`}
            />
          </div>
          <div className="mechanism-settings">
            <span>Gate frame: {expertLabel(s.seal)}</span>
            <span>Compare the final sign with your clue.</span>
          </div>
        </>
      ) : round === 1 ? (
        <>
          <svg
            className="mirror-route-diagram"
            viewBox="0 0 600 280"
            role="img"
            aria-label={`Lamp and selected mirror path. Current endpoint ${p.values.join(", ")}. Filter ${expertLabel(s.filter)}. Exit ${expertLabel(s.gate)}.`}
          >
            <defs>
              <pattern
                id={gridId}
                width="36"
                height="34"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M36 0H0V34"
                  fill="none"
                  stroke="#d9d8e2"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect
              x="30"
              y="15"
              width="500"
              height="210"
              fill={`url(#${gridId})`}
            />
            <path d="M30 225H530M30 225V15" stroke="#87949e" strokeWidth="2" />
            <text x="535" y="230">
              Right →
            </text>
            <text x="31" y="12">
              Up ↑
            </text>
            <circle cx="88" cy="196" r="17" fill="#edc75d" stroke="#86704b" />
            <text x="68" y="257">
              Lamp
            </text>
            <polyline
              points={(p.beam || [[10, 80]])
                .map(([x, y]) => `${45 + x * 4.3},${20 + y * 2.2}`)
                .join(" ")}
              fill="none"
              stroke={s.filter === "gold" ? "#c69c35" : "#4389a9"}
              strokeWidth="6"
              strokeLinejoin="round"
            />
            {(p.beam || []).slice(1).map(([x, y], i) => (
              <g
                key={i}
                transform={`translate(${45 + x * 4.3} ${20 + y * 2.2})`}
              >
                <path
                  d="M-13 0h26"
                  stroke="#526d83"
                  strokeWidth="8"
                  transform={`rotate(${s[["a", "b", "c", "d"][i]] === "up" ? -45 : 45})`}
                />
                <circle
                  cx="0"
                  cy="-23"
                  r="10"
                  fill="#fffaf0"
                  stroke="#79718a"
                />
                <text x="0" y="-19" textAnchor="middle">
                  {i + 1}
                </text>
              </g>
            ))}
          </svg>
          <div className="mechanism-settings">
            {["a", "b", "c", "d"].map((key, i) => (
              <span key={key}>
                Mirror {i + 1}:{" "}
                {s[key] ? (s[key] === "up" ? "↑ Up" : "→ Right") : "Not set"}
              </span>
            ))}
            <span>Filter: {expertLabel(s.filter)}</span>
            <span>Exit: {expertLabel(s.gate)}</span>
          </div>
          <p>
            Find the receiver using your team’s private clues. Each UP turn
            moves 17 steps. Each RIGHT turn moves 18. Current endpoint:{" "}
            {p.values.join(", ")}.
          </p>
        </>
      ) : round === 2 ? (
        <>
          <div
            className="platform-diagram"
            role="img"
            aria-label={`Actual platform heights: left ${p.values[0]}, middle ${p.values[1]}, right ${p.values[2]}`}
          >
            <div className="platform-levels" aria-hidden="true">
              2<br />1<br />0
            </div>
            {p.values.map((v, i) => (
              <div className="platform-column" key={i}>
                <div className="platform-track">
                  <span style={{ bottom: `${v * 32 + 7}%` }}>
                    ↔<b>{v}</b>
                  </span>
                </div>
                <strong>{["Left", "Middle", "Right"][i]}</strong>
              </div>
            ))}
          </div>
          <div className="mechanism-settings">
            <span>Link: {expertLabel(s.link)}</span>
            <span>Counterweight: {expertLabel(s.weight)}</span>
            <span>Anchor: {expertLabel(s.anchor)}</span>
          </div>
          <p>
            The numbered platforms show actual heights after linked movement,
            not just lift settings.
          </p>
        </>
      ) : round === 3 ? (
        <>
          <div className="mechanism-flow two-stations">
            {p.values.map((v, i) => (
              <div className="mechanism-tile" key={i}>
                <strong>{i === 0 ? "First pointer" : "Second pointer"}</strong>
                <svg
                  viewBox="0 0 140 140"
                  role="img"
                  aria-label={`${i === 0 ? "First" : "Second"} pointer: ${v}`}
                >
                  <circle
                    cx="70"
                    cy="70"
                    r="55"
                    fill="#edddaf"
                    stroke="#8a775a"
                    strokeWidth="5"
                  />
                  {[0, 1, 2].map((n) => (
                    <text
                      key={n}
                      x={70 + Math.sin((n * 2 * Math.PI) / 3) * 40}
                      y={76 - Math.cos((n * 2 * Math.PI) / 3) * 40}
                      textAnchor="middle"
                    >
                      {n}
                    </text>
                  ))}
                  <path
                    d="M70 70V38"
                    stroke="#50657b"
                    strokeWidth="6"
                    transform={`rotate(${v * 120} 70 70)`}
                  />
                  <circle cx="70" cy="70" r="6" fill="#50657b" />
                </svg>
                <span>Position {v}</span>
              </div>
            ))}
          </div>
          <div className="mechanism-settings">
            <span>Size: {expertLabel(s.gear)}</span>
            <span>Direction: {expertLabel(s.direction)}</span>
            <span>Coupling: {expertLabel(s.coupling)}</span>
            <span>Light lock: {expertLabel(s.lock)}</span>
          </div>
        </>
      ) : (
        <>
          <div className="mechanism-flow">
            <MechanismTile
              title="Light wheel"
              kind="colors"
              caption={`Position ${p.values[0]} · ${colors[p.values[0]]}`}
            />
            <MechanismTile
              title="Mirror route"
              kind={s.mirror === "heart" ? "heart" : "mirror"}
              value={String(p.values[0])}
              caption={expertLabel(s.mirror)}
            />
            <MechanismTile
              title="Heart gears"
              kind="gear"
              caption={expertLabel(s.coupling)}
            />
          </div>
          <div className="mechanism-settings">
            <span>Left platform: height {p.values[1]}</span>
            <span>Right platform: height {p.values[2]}</span>
            <span>Lens: {expertLabel(s.lens)}</span>
          </div>
        </>
      )}
      <small>
        Every screen sees the same changes. This preview does not check the
        answer.
      </small>
    </figure>
  );
}
