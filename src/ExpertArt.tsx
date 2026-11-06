import { MechanismTile } from "./MagicMechanismArt";
import { ExpertGlyph, expertLabel } from "./ExpertPicture";
import type { MoonBoard, MechanismPreview } from "../shared/expert-adventures";
export function LunarRover({ research = false }: { research?: boolean }) {
  return (
    <svg
      className="lunar-rover-art"
      viewBox="0 0 110 75"
      role="img"
      aria-label={
        research ? "White and red research rover" : "Blue team expedition rover"
      }
    >
      <g
        stroke="#4d526c"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 43h84l-6 17H20Z" fill={research ? "#e8e8eb" : "#809fc9"} />
        <path
          d="m24 42 12-23h35l13 23Z"
          fill={research ? "#d29a98" : "#c5dce9"}
        />
        <path d="M42 21v-9h18l12-7" fill="none" />
        <path d="M36 26h29v12H30Z" fill="#465778" />
        <circle cx="28" cy="62" r="10" fill="#50576d" />
        <circle cx="79" cy="62" r="10" fill="#50576d" />
        <path
          d="M45 49h20"
          stroke={research ? "#b5686b" : "#efd992"}
          strokeWidth="5"
        />
        <circle cx="91" cy="46" r="4" fill="#f6dc8a" />
      </g>
    </svg>
  );
}
export function MoonMechanismArt({
  round,
  settings: s,
  board: b,
  preview: p,
}: {
  round: number;
  settings: Record<string, string>;
  board: MoonBoard;
  preview: MechanismPreview;
}) {
  const titles = [
    "Moon Base · pack the expedition",
    "Crater Crossing · route and support",
    "Solar Ridge · connect the relay",
    "Lost Rover Valley · find and recover",
    "Earth Signal · return and transmit",
  ];
  return (
    <figure className="moon-mechanism-art expert-live-diagram">
      <figcaption>
        <h3>{titles[round]}</h3>
        <p>
          Our current choices, shared across the team. Use your clues before
          launching.
        </p>
      </figcaption>
      {round === 0 ? (
        <div className="mechanism-flow lunar-kit">
          <MechanismTile
            title="Explore module"
            kind={
              s.mobility === "grip"
                ? "grip"
                : s.mobility === "scanner"
                  ? "scanner"
                  : "rover"
            }
            value={s.mobility}
          />
          <MechanismTile
            title="Power module"
            kind={s.supply === "solar" ? "solar" : "battery"}
            value={s.supply}
          />
          <MechanismTile title="Base hatch" kind="hatch" value={s.hatch} />
          <MechanismTile title="Return beacon" kind="beacon" value={s.beacon} />
          <MechanismTile title="Return map" kind="map" value={s.map} />
          <MechanismTile
            title="Equipment straps"
            kind="cargo"
            value={s.cargo}
          />
        </div>
      ) : round === 1 ? (
        <>
          <div className="mechanism-flow">
            <MechanismTile
              title="Chosen crossing"
              kind={s.route === "rim" ? "rails" : "crater"}
              value={s.route}
            />
            <div className="mechanism-tile">
              <strong>Our expedition rover</strong>
              <LunarRover />
              <span>Module packed: {expertLabel(b.mobility)}</span>
            </div>
            <MechanismTile
              title="Crossing support"
              kind={s.support === "rails" ? "rails" : "grip"}
              value={s.support}
            />
          </div>
          <div className="mechanism-settings">
            <span>Pace: {expertLabel(s.pace)}</span>
            <span>Path light: {expertLabel(s.lamp)}</span>
            <span>Return markers: {expertLabel(s.marker)}</span>
            <span>Cargo: {expertLabel(s.balance)}</span>
          </div>
        </>
      ) : round === 2 ? (
        <>
          <div className="mechanism-flow">
            <MechanismTile
              title="1 · Solar panel"
              kind="solar"
              value={s.panel}
            />
            <MechanismTile
              title="2 · Relay cable"
              kind="cable"
              value={s.cable}
            />
            <MechanismTile
              title="3 · Relay destination"
              kind={s.mode === "scan" ? "scanner" : "battery"}
              value={s.mode}
            />
          </div>
          <div className="mechanism-settings">
            <span>Engine: {expertLabel(s.engine)}</span>
            <span>Return reserve: {expertLabel(s.reserve)}</span>
            <span>Panel mount: {expertLabel(s.mount)}</span>
            <span>Packed power kit: {expertLabel(b.supply)}</span>
          </div>
          <p>
            The cable picture shows whether the connector is joined. The relay
            setting selects storage or scanning.
          </p>
        </>
      ) : round === 3 ? (
        <>
          <div className="mechanism-flow">
            <MechanismTile
              title="1 · Search evidence"
              kind={s.search === "glint" ? "shape" : "tracks"}
              value={s.search}
            />
            <MechanismTile
              title="2 · Search method"
              kind={s.method === "scanner" ? "scanner" : "tracks"}
              value={s.method}
            />
            <div className="mechanism-tile">
              <strong>Research rover</strong>
              <LunarRover research />
              <span>Recovery: {expertLabel(s.recovery)}</span>
            </div>
          </div>
          <div className="mechanism-settings">
            <span>Recovery power: {expertLabel(s.source)}</span>
            <span>Rover stabilizer: {expertLabel(s.stabilizer)}</span>
            <span>Radio: {expertLabel(s.link)}</span>
            <span>
              Power requested: {p.power} / {p.capacity}
            </span>
          </div>
          <div className="mechanism-flow two-stations">
            <MechanismTile
              title="Bring the rover home"
              kind={s.recovery === "repair" ? "repair" : "tow"}
              value={s.recovery}
            />
            <MechanismTile
              title="Power source"
              kind={s.source === "stored" ? "battery" : "solar"}
              value={s.source}
            />
          </div>
        </>
      ) : (
        <>
          <div className="mechanism-flow">
            <MechanismTile
              title="Return journey"
              kind="map"
              value={s.returnRoute}
            />
            <MechanismTile
              title="Antenna"
              kind={s.antenna === "earth" ? "earth" : "radio"}
              value={s.antenna}
            />
            <MechanismTile
              title="Research rover"
              kind="rover"
              value={s.rover}
            />
          </div>
          <div
            className="transmission-steps"
            aria-label="Selected communication order"
          >
            {(s.exchange
              ? s.exchange.split("-")
              : ["Choose", "the", "order"]
            ).map((step, i) => (
              <span key={`${i}:${step}`}>
                <b>{i + 1}</b>
                {step}
                {i < 2 && <i aria-hidden="true">→</i>}
              </span>
            ))}
          </div>
          <div className="mechanism-settings">
            <span>Antenna power: {expertLabel(s.power)}</span>
            <span>Engine: {expertLabel(s.engine)}</span>
            <span>
              Power requested: {p.power} / {p.capacity}
            </span>
            <span>Surveyed crossing: {expertLabel(b.crossing)}</span>
          </div>
        </>
      )}
      <small>
        This is the current plan, not an answer check. Unselected controls say
        “Not set”.
      </small>
    </figure>
  );
}
