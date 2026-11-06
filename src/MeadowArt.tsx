import type { ReactNode } from "react";
import { Animal } from "./TinyWorld";
import { meadowStages } from "../shared/collection-adventures";
const ink = "#59634b",
  blue = "#78bfcf",
  green = "#92b47b",
  gold = "#e4bd63";
function Frame({
  label,
  kind,
  value,
  children,
}: {
  label: string;
  kind: string;
  value?: string;
  children: ReactNode;
}) {
  return (
    <svg
      className="meadow-art"
      viewBox="0 0 160 110"
      role="img"
      aria-label={label}
      data-meadow-art={kind}
      data-value={value}
    >
      <g
        stroke={ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {children}
      </g>
    </svg>
  );
}
function Drop({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <path
      transform={`translate(${x} ${y})`}
      d="M0 0C-8 13-13 17-13 25a13 13 0 0 0 26 0C13 17 8 13 0 0Z"
      fill={blue}
    />
  );
}
function Flower({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0v32m0-10-12-7m12 3 12-8" fill="none" stroke="#759457" />
      <g fill="#e6c56c">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cy="-9" rx="5" ry="10" transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r="6" fill="#a9864e" />
    </g>
  );
}
function Tree({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M0 5v45m0-17-12-13M0 25l13-14"
        fill="none"
        stroke="#977b53"
        strokeWidth="6"
      />
      <path
        d="M-24 4q-9-19 10-25 10-20 27-5 27-5 25 19 9 24-15 26-20 10-28-3-25 7-19-12Z"
        fill={green}
      />
      <g fill="#dc9b60" stroke="none">
        <circle cx="-13" cy="-4" r="4" />
        <circle cx="14" cy="-9" r="4" />
        <circle cx="8" cy="9" r="4" />
      </g>
    </g>
  );
}
function Lantern({
  x = 0,
  y = 0,
  on = true,
}: {
  x?: number;
  y?: number;
  on?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-6-16v-6q6-8 12 0v6" fill="none" />
      <path d="M-16-13h32l-3 33h-26Z" fill={on ? "#f5da86" : "#b5b9ad"} />
      <path d="M-19-13h38M-16 20h32" strokeWidth="4" />
      {on && (
        <>
          <path d="M0-3v14m-5-7 5 7 5-7" stroke="#fff8d7" strokeWidth="3" />
          <path d="M-29 0h-7m65 0h7M0-29v-6" stroke={gold} />
        </>
      )}
    </g>
  );
}
function Crate({ closed = true }: { closed?: boolean }) {
  return (
    <g>
      <path d="M40 43h80v49H40Z" fill="#c69d64" />
      <path d="M40 58h80M40 75h80M52 43v49m56-49v49" fill="none" />
      {!closed && (
        <g data-crate-fruit="visible" fill="#e9ad62">
          <circle cx="59" cy="41" r="10" />
          <circle cx="80" cy="35" r="11" />
          <circle cx="103" cy="42" r="10" />
        </g>
      )}
      {closed ? (
        <>
          <path d="M37 39h86v12H37Z" fill="#e0bd85" />
          <path d="M42 42h76" stroke="#96784e" />
        </>
      ) : (
        <path d="m37 34 72-19 5 12-72 19Z" fill="#e0bd85" />
      )}
    </g>
  );
}
function Route({ value }: { value: string }) {
  return (
    <>
      <path
        d="M58 10q-25 46 10 90h44q-42-47-8-90Z"
        fill="#b8dfe4"
        stroke="none"
      />
      {value === "bridge" ? (
        <>
          <path d="M17 61q64-42 126-1v19q-62-34-126 0Z" fill="#c4a06c" />
          <path
            d="M17 47q64-42 126-1M17 47v31m23-44v34m28-42v34m28-32v32m26-22v31m21-17v19"
            fill="none"
            stroke="#8d7755"
          />
        </>
      ) : (
        <g fill="#c5c8ac">
          {[
            [24, 79],
            [53, 61],
            [81, 53],
            [112, 41],
            [139, 28],
          ].map(([x, y]) => (
            <ellipse key={x} cx={x} cy={y} rx="14" ry="9" />
          ))}
        </g>
      )}
    </>
  );
}
function Task({ kind }: { kind: string }) {
  return kind === "water" ? (
    <>
      <path d="M47 45h57l-6 41H53Z" fill="#accdbe" />
      <path
        d="M47 52q-28-7-24 15 1 14 28 9M103 54l24-16 7 8-31 26"
        fill="none"
        strokeWidth="7"
      />
      <Drop x={136} y={52} />
      <path d="M65 44q0-31 20-24 13 4 13 24" fill="none" />
    </>
  ) : kind === "plant" ? (
    <>
      <path d="M28 89q45-22 102 0" fill="#c2a476" />
      <path d="M81 79V44" stroke="#70915c" strokeWidth="5" />
      <path
        d="M80 60Q45 61 47 35q27-4 33 25ZM82 53q0-31 29-29 6 25-29 29Z"
        fill={green}
      />
      <path d="M35 91h92" fill="none" />
    </>
  ) : kind === "delivery" ? (
    <>
      <Crate />
      <path
        d="M12 98h28m-5-6 6 6-6 6m91-6h24m-5-6 6 6-6 6"
        fill="none"
        stroke={blue}
      />
    </>
  ) : (
    <Lantern x={80} y={52} />
  );
}
const helperNames: Record<string, number> = {
  rabbit: 0,
  cat: 1,
  dog: 2,
  bear: 3,
};
export function MeadowChoiceArt({
  field,
  value,
}: {
  field: string;
  value: string;
}) {
  if (field.endsWith("Helper"))
    return (
      <span
        className="meadow-helper-art"
        data-meadow-art={field}
        data-value={value}
      >
        <Animal kind={helperNames[value]} expression="idle" />
      </span>
    );
  let art: ReactNode,
    kind = field;
  if (
    ["fruitRoute", "flowerRoute", "foodRoute", "friendRoute"].includes(field)
  ) {
    art = <Route value={value} />;
  } else if (["orchard", "meadow"].includes(field)) {
    art = (
      <>
        {Array.from({ length: Number(value) }, (_, i) => (
          <Drop key={i} x={44 + i * 36} y={10} />
        ))}
        {field === "orchard" ? (
          <Tree x={80} y={65} />
        ) : (
          <Flower x={80} y={70} />
        )}
      </>
    );
  } else if (field === "water") {
    const a = value === "orchard-2" ? 2 : 1,
      b = 3 - a;
    art = (
      <>
        <Tree x={42} y={37} />
        <Flower x={122} y={38} />
        {Array.from({ length: a }, (_, i) => (
          <Drop key={i} x={28 + i * 28} y={69} />
        ))}
        {Array.from({ length: b }, (_, i) => (
          <Drop key={i} x={108 + i * 28} y={69} />
        ))}
      </>
    );
  } else if (field === "schedule") return <MeadowSchedule value={value} />;
  else if (field === "bridgeGate") {
    const open = value === "open";
    art = (
      <>
        <Route value="bridge" />
        <path d="M44 90V31h58v59" fill="none" strokeWidth="5" />
        <path
          d={open ? "M49 65 76 25" : "M49 65h47"}
          fill="none"
          stroke="#ac8559"
          strokeWidth="8"
        />
      </>
    );
  } else if (field === "valve") {
    const open = value === "open";
    art = (
      <>
        <path
          d="M16 77h126"
          stroke={open ? blue : "#b6bba9"}
          strokeWidth="20"
        />
        <path d="M80 70V38" strokeWidth="7" />
        <ellipse cx="80" cy="29" rx="27" ry="14" fill="#d6b56e" />
        <path
          d={open ? "M58 29h44M80 17v24" : "M62 19 98 39m-36 0 36-20"}
          fill="none"
        />
        {open && (
          <path
            d="M112 77h21m-7-6 7 6-7 6"
            fill="none"
            stroke="#eef8f4"
            strokeWidth="3"
          />
        )}
      </>
    );
  } else if (["return", "gate"].includes(field)) {
    kind = field === "gate" ? "sluice" : field;
    const open = value === "open";
    art = (
      <>
        <path
          d="M13 72h134v23H13Z"
          fill={open ? "#b6e0e5" : "#e5ddc0"}
          stroke="none"
        />
        <path
          d="M60 35h40v52H60Z"
          fill={open ? "#e9d29e" : "#b7b9a2"}
          transform={open ? "translate(0 -23)" : undefined}
        />
        <path d="M53 88V18h54v70M80 18V5" fill="none" strokeWidth="5" />
        <path d="M66 5h28" fill="none" strokeWidth="5" />
        {open && (
          <path
            d="M18 84h27m-5-5 6 5-6 5m67-5h30m-5-5 6 5-6 5"
            fill="none"
            stroke={blue}
            strokeWidth="3"
          />
        )}
      </>
    );
  } else if (field === "stones") {
    const aligned = value === "aligned";
    art = (
      <>
        <path
          d="M54 0q-20 55 20 110h40Q73 59 105 0Z"
          fill="#b8dfe4"
          stroke="none"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx={aligned ? 25 + i * 28 : [24, 57, 76, 117, 137][i]}
            cy={aligned ? 80 - i * 14 : [83, 28, 85, 60, 21][i]}
            rx="15"
            ry="10"
            fill="#c5c8ac"
          />
        ))}
      </>
    );
  } else if (field === "crate") art = <Crate closed={value === "closed"} />;
  else if (field === "flowers")
    art = (
      <g transform={value === "tilted" ? "rotate(30 80 70)" : undefined}>
        <path d="M48 67h64l-10 30H58Z" fill="#c9ae79" />
        <Flower x={65} y={42} />
        <Flower x={94} y={33} />
        <path d="M51 66q29-45 58 0" fill="none" />
      </g>
    );
  else if (field === "filter")
    art = (
      <>
        <path d="M20 27h120v17H20Z" fill="#a7d2dc" />
        <path d="M43 44h74l-17 37H61Z" fill="#d9dec6" />
        {[53, 68, 83, 98].map((x) => (
          <path key={x} d={`M${x} 48v25`} stroke="#96a78d" />
        ))}
        {value === "blocked" ? (
          <g fill="#9e8765">
            <ellipse cx="68" cy="52" rx="17" ry="9" />
            <ellipse cx="98" cy="62" rx="14" ry="10" />
          </g>
        ) : (
          <>
            <Drop x={70} y={76} />
            <Drop x={100} y={76} />
          </>
        )}
      </>
    );
  else if (field === "pump")
    art = (
      <>
        <path
          d="M19 79h33V48h53v31h35"
          fill="none"
          stroke="#a3b6a7"
          strokeWidth="12"
        />
        <circle cx="78" cy="48" r="24" fill="#e6d7af" />
        <path d="M78 48V27m0 21 17 13m-17-13-17 13" fill="none" />
        <path
          d={
            value === "steady"
              ? "M13 96q12-10 24 0t24 0t24 0t24 0t24 0"
              : "M10 98 32 90 43 103 56 73 68 104 78 88 92 102 110 74 127 101 149 90"
          }
          fill="none"
          stroke={blue}
          strokeWidth="4"
        />
      </>
    );
  else if (field === "power")
    art =
      value === "solar" ? (
        <>
          <circle cx="40" cy="26" r="17" fill={gold} />
          <path
            d="M40 2v-7m0 55v7M16 26H7m66 0h-9M21 7l-6-6m43 43 6 6"
            fill="none"
            stroke={gold}
          />
          <path d="m62 44 66-8 15 43-67 9Z" fill="#91bfce" />
          <path
            d="m85 41 14 43m7-46 14 44M67 58l68-8M72 73l68-8m-32 20v15"
            fill="none"
            stroke="#e3f0e8"
          />
        </>
      ) : (
        <>
          <path
            d="M12 87q30-24 55 0t67 0v23H12Z"
            fill="#b8dfe4"
            stroke="none"
          />
          <circle cx="80" cy="47" r="34" fill="#d5bb83" />
          {[0, 45, 90, 135].map((a) => (
            <path key={a} d="M47 47h66" transform={`rotate(${a} 80 47)`} />
          ))}
          <circle cx="80" cy="47" r="9" fill="#9b835a" />
        </>
      );
  else if (field === "signal")
    art =
      value === "tree" ? (
        <Tree x={111} y={47} />
      ) : (
        <>
          <path d="M88 50h54v40H88Z" fill="#e6d6ab" />
          <path d="m81 50 34-28 34 28Z" fill="#bd9a75" />
        </>
      );
  else if (field === "arrival")
    art = (
      <>
        {[0, 1, 2, 3].map((i) => (
          <g
            key={i}
            transform={`translate(${value === "together" ? 40 + i * 25 : 22 + i * 32} ${value === "groups" && i > 1 ? 57 : 30})`}
          >
            <circle r="8" fill={green} />
            <path d="M-10 24v-8q10-14 20 0v8Z" fill="#ccae76" />
          </g>
        ))}
        {value === "groups" && (
          <path d="M74 18v79" stroke="#bdc4b5" strokeDasharray="4 5" />
        )}
      </>
    );
  else if (field === "lanes")
    art = (
      <>
        {[0, ...(value === "two" ? [1] : [])].map((i) => (
          <path
            key={i}
            d={`M${40 + i * 75} 104q40-45 0-98`}
            fill="none"
            stroke="#d4ba83"
            strokeWidth="20"
          />
        ))}
        {[0, ...(value === "two" ? [1] : [])].map((i) => (
          <path
            key={i}
            d={`M${40 + i * 75} 104q40-45 0-98`}
            fill="none"
            stroke="#f9f2d8"
            strokeDasharray="4 5"
          />
        ))}
      </>
    );
  else if (field === "lights")
    art = (
      <>
        <path d="M14 24q66 29 132 0" fill="none" />
        <Lantern x={46} y={56} on={value === "on"} />
        <Lantern x={113} y={56} on={value === "on"} />
      </>
    );
  else throw Error(`Unknown Meadow illustration: ${field}`);
  if (field === "signal")
    art = (
      <>
        <path d="M12 91V36h28v55" fill="#c9b98f" />
        <path d="M20 39V24h12v15" />
        <path
          d="M44 40h27m-8-7 8 7-8 7"
          fill="none"
          stroke={gold}
          strokeWidth="4"
        />
        {art}
      </>
    );
  return (
    <Frame
      label={`${field}: ${value.replaceAll("-", " ")}`}
      kind={kind}
      value={value}
    >
      {art}
    </Frame>
  );
}
const taskNames: Record<string, string> = {
  water: "Water",
  plant: "Plant",
  delivery: "Delivery",
  lanterns: "Lanterns",
};
export function MeadowTaskArt({ task }: { task: string }) {
  return (
    <Frame label={taskNames[task] || task} kind={`task-${task}`}>
      <Task kind={task} />
    </Frame>
  );
}
export function MeadowSchedule({ value }: { value: string }) {
  const order =
    value === "plant-first"
      ? ["plant", "water", "delivery", "lanterns"]
      : value === "lanterns-first"
        ? ["lanterns", "delivery", "water", "plant"]
        : value === "parallel"
          ? ["water", "delivery", "plant", "lanterns"]
          : ["water", "plant", "delivery", "lanterns"];
  return (
    <span
      className={`meadow-schedule ${value === "parallel" ? "parallel" : ""}`}
      data-meadow-art="schedule"
      data-value={value}
      role="img"
      aria-label={`Task plan: ${value}`}
    >
      {order.map((task, i) => (
        <span key={task}>
          <small>{value === "parallel" ? Math.floor(i / 2) + 1 : i + 1}</small>
          <MeadowTaskArt task={task} />
        </span>
      ))}
    </span>
  );
}
function Pair({ children }: { children: ReactNode }) {
  return <span className="meadow-art-pair">{children}</span>;
}
function Helpers({ names, task }: { names: string[]; task: string }) {
  return (
    <span className="meadow-helper-pair">
      <Pair>
        {names.map((name) => (
          <Animal key={name} kind={helperNames[name]} expression="idle" />
        ))}
      </Pair>
      <Pair>
        <MeadowTaskArt task={task} />
        <MeadowTaskArt task={task === "plant" ? "water" : "lanterns"} />
      </Pair>
    </span>
  );
}
export const meadowCluePictures: Record<string, () => ReactNode> = {
  "meadow-garden-helpers": () => (
    <Helpers names={["rabbit", "bear"]} task="plant" />
  ),
  "meadow-water-before-plant": () => (
    <Pair>
      <MeadowTaskArt task="water" />
      <span>→</span>
      <MeadowTaskArt task="plant" />
    </Pair>
  ),
  "meadow-celebration-helpers": () => (
    <Helpers names={["cat", "dog"]} task="delivery" />
  ),
  "meadow-delivery-before-lanterns": () => (
    <Pair>
      <MeadowTaskArt task="delivery" />
      <span>→</span>
      <MeadowTaskArt task="lanterns" />
    </Pair>
  ),
  "meadow-schedule": () => (
    <Pair>
      <span className="meadow-clue-case">
        <strong>Parallel</strong>
        <MeadowSchedule value="parallel" />
      </span>
      <span className="meadow-clue-case">
        <strong>Serial</strong>
        <MeadowSchedule value="serial" />
      </span>
    </Pair>
  ),
  "meadow-valve": () => <MeadowChoiceArt field="valve" value="open" />,
  "meadow-routes": () => (
    <Pair>
      <MeadowChoiceArt field="foodRoute" value="bridge" />
      <MeadowChoiceArt field="friendRoute" value="ford" />
    </Pair>
  ),
  "meadow-route-capacity": () => (
    <Pair>
      <MeadowChoiceArt field="foodRoute" value="bridge" />
      <strong>1</strong>
      <MeadowChoiceArt field="friendRoute" value="ford" />
      <strong>1</strong>
    </Pair>
  ),
  "meadow-bridge-gate": () => (
    <MeadowChoiceArt field="bridgeGate" value="open" />
  ),
  "meadow-stones": () => <MeadowChoiceArt field="stones" value="aligned" />,
  "meadow-crate": () => <MeadowChoiceArt field="crate" value="closed" />,
  "meadow-flowers": () => <MeadowChoiceArt field="flowers" value="upright" />,
  "meadow-source": () => (
    <Frame label="Three water units" kind="water-source">
      {[40, 80, 120].map((x) => (
        <Drop key={x} x={x} y={28} />
      ))}
    </Frame>
  ),
  "meadow-orchard-water": () => <MeadowChoiceArt field="orchard" value="1" />,
  "meadow-flower-water": () => <MeadowChoiceArt field="meadow" value="1" />,
  "meadow-return": () => <MeadowChoiceArt field="return" value="open" />,
  "meadow-clean-flow": () => (
    <Pair>
      <MeadowChoiceArt field="filter" value="clean" />
      <MeadowChoiceArt field="pump" value="steady" />
    </Pair>
  ),
  "meadow-sluice": () => (
    <Pair>
      <MeadowChoiceArt field="gate" value="open" />
      {meadowCluePictures["meadow-source"]()}
    </Pair>
  ),
  "meadow-light-sources": () => (
    <Pair>
      <MeadowChoiceArt field="power" value="solar" />
      <MeadowChoiceArt field="power" value="water" />
    </Pair>
  ),
  "meadow-water-return": () => (
    <Pair>
      <MeadowChoiceArt field="power" value="water" />
      <MeadowChoiceArt field="return" value="open" />
    </Pair>
  ),
  "meadow-welcome-tree": () => <MeadowChoiceArt field="signal" value="tree" />,
  "meadow-path-groups": () => (
    <Pair>
      <MeadowChoiceArt field="lanes" value="one" />
      <MeadowChoiceArt field="arrival" value="groups" />
    </Pair>
  ),
  "meadow-paths": () => (
    <Pair>
      <MeadowChoiceArt field="lanes" value="one" />
      <MeadowChoiceArt field="lanes" value="two" />
    </Pair>
  ),
  "meadow-lanterns": () => <MeadowChoiceArt field="lights" value="on" />,
  "meadow-water-share": () => (
    <Pair>
      <MeadowChoiceArt field="water" value="orchard-2" />
      <MeadowChoiceArt field="water" value="flowers-2" />
    </Pair>
  ),
  "meadow-food-routes": () => (
    <>
      <MeadowTaskArt task="delivery" />
      {meadowCluePictures["meadow-routes"]()}
    </>
  ),
  "meadow-friend-routes": () => (
    <>
      <MeadowChoiceArt field="arrival" value="together" />
      {meadowCluePictures["meadow-routes"]()}
    </>
  ),
  "meadow-route-arrival": () => (
    <span className="meadow-route-rule">
      <span className="meadow-clue-case">
        <strong>Same route</strong>
        <Pair>
          <MeadowChoiceArt field="foodRoute" value="bridge" />
          <MeadowChoiceArt field="friendRoute" value="bridge" />
        </Pair>
        <span>Groups</span>
      </span>
      <span className="meadow-clue-case">
        <strong>Different routes</strong>
        <Pair>
          <MeadowChoiceArt field="foodRoute" value="bridge" />
          <MeadowChoiceArt field="friendRoute" value="ford" />
        </Pair>
        <span>Groups or together</span>
      </span>
    </span>
  ),
};
export function MeadowClueArt({ icon, text }: { icon: string; text: string }) {
  const picture = meadowCluePictures[icon];
  if (!picture) throw Error(`Unknown Meadow clue illustration: ${icon}`);
  return (
    <span
      className="meadow-clue-art"
      data-meadow-clue={icon}
      role="img"
      aria-label={text}
    >
      {picture()}
    </span>
  );
}
export function MeadowStageArt({ round }: { round: number }) {
  return round === 0 ? (
    <MeadowTaskArt task="plant" />
  ) : round === 1 ? (
    <MeadowTaskArt task="delivery" />
  ) : round === 2 ? (
    meadowCluePictures["meadow-water-share"]()
  ) : round === 3 ? (
    <MeadowChoiceArt field="lights" value="on" />
  ) : (
    <Frame label="Great Friendship Tree" kind="friendship-tree">
      <Tree x={80} y={50} />
    </Frame>
  );
}
export function MeadowMissionScene({
  round,
  settings,
  completed,
}: {
  round: number;
  settings: Record<string, string>;
  completed: number;
}) {
  const stage = meadowStages[round];
  return (
    <section
      className="panel collection-live meadow-mission-scene"
      aria-label={`${stage.location} shared meadow plan`}
    >
      <h3>Our connected meadow · {stage.location}</h3>
      <p>Current shared settings. Compare them with your clues.</p>
      <div className="meadow-plan-grid">
        {stage.fields.map((f) => (
          <article key={f.key}>
            <strong>{f.title}</strong>
            {settings[f.key] ? (
              <MeadowChoiceArt
                field={round === 1 && f.key === "gate" ? "bridgeGate" : f.key}
                value={settings[f.key]}
              />
            ) : (
              <span className="meadow-unset">Not set</span>
            )}
            <span>
              {settings[f.key]?.replaceAll("-", " ") || "Choose together"}
            </span>
          </article>
        ))}
      </div>
      {round === 2 && (
        <p>
          Shared water:{" "}
          <strong>
            {Number(settings.orchard || 0) + Number(settings.meadow || 0)} / 3
          </strong>
        </p>
      )}
      <p>
        {completed} / 5 meadow systems restored. This preview does not check the
        answer.
      </p>
    </section>
  );
}
