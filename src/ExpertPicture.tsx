import { ExpeditionIcon } from "./ExpeditionArt";
export type PictureKind =
  | "shape"
  | "colors"
  | "lens"
  | "mirror"
  | "flower"
  | "gate"
  | "platform"
  | "gear"
  | "heart"
  | "rover"
  | "scanner"
  | "grip"
  | "battery"
  | "solar"
  | "hatch"
  | "beacon"
  | "map"
  | "cargo"
  | "crater"
  | "rails"
  | "lamp"
  | "marker"
  | "cable"
  | "reserve"
  | "tracks"
  | "tow"
  | "repair"
  | "radio"
  | "earth"
  | "engine"
  | "sequence";
export function ExpertGlyph({
  kind,
  value = "",
  label,
  tint,
}: {
  kind: PictureKind;
  value?: string;
  label?: string;
  tint?: string;
}) {
  const gold = "#e6bf60",
    blue = "#92c8df",
    green = "#80ac92",
    ink = "#485868";
  const signColor =
    tint ||
    (/triangle|1/.test(value)
      ? gold
      : /diamond|2/.test(value)
        ? "#b5a1db"
        : blue);
  let art;
  switch (kind) {
    case "shape":
      art = /1|triangle/i.test(value) ? (
        <path d="m60 15 36 65H24Z" fill={signColor} />
      ) : /2|diamond/i.test(value) ? (
        <path d="m60 10 37 37-37 37-37-37Z" fill={signColor} />
      ) : (
        <circle cx="60" cy="48" r="33" fill={signColor} />
      );
      break;
    case "colors":
      if (value) {
        const color = (
          {
            blue,
            gold,
            violet: "#b5a1db",
            "0": blue,
            "1": gold,
            "2": "#b5a1db",
          } as Record<string, string>
        )[value];
        if (color)
          return (
            <svg
              className="expert-picture"
              viewBox="0 0 120 96"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="46"
                r="32"
                fill={color}
                stroke={ink}
                strokeWidth="3"
              />
            </svg>
          );
      }
      art = (
        <>
          {[blue, gold, "#b5a1db"].map((c, i) => (
            <g key={c}>
              <circle cx={25 + i * 35} cy="45" r="15" fill={c} />
              {i < 2 && (
                <path d={`M${42 + i * 35} 45h10m-4-4 4 4-4 4`} fill="none" />
              )}
            </g>
          ))}
        </>
      );
      break;
    case "lens":
      art = (
        <>
          <circle
            cx="60"
            cy="46"
            r="32"
            fill="#d8edf199"
            stroke={gold}
            strokeWidth="5"
          />
          <path
            d={
              value === "swap"
                ? "M20 27 97 64m-9-1 9 1-5-8M20 64 97 27m-9 1 9-1-5 8"
                : "M20 33h77m-8-6 8 6-8 6M20 60h77m-8-6 8 6-8 6"
            }
            fill="none"
            stroke={green}
            strokeWidth="4"
          />
        </>
      );
      break;
    case "mirror":
      art = (
        <>
          <ellipse
            cx="60"
            cy="39"
            rx="25"
            ry="32"
            fill="#c7e5ef"
            stroke={gold}
            strokeWidth="5"
          />
          <path
            d="m45 47 27-28M60 71v15H42h36"
            fill="none"
            stroke={ink}
            strokeWidth="3"
          />
          <path
            d={
              value === "up"
                ? "M12 63V25m-8 9 8-9 8 9"
                : value === "right"
                  ? "M7 55h29m-9-8 9 8-9 8"
                  : "M9 28h13v30h13"
            }
            fill="none"
            stroke={green}
            strokeWidth="4"
          />
        </>
      );
      break;
    case "beacon":
    case "lamp":
      art = (
        <>
          <path d="M49 84h22M60 84V53" strokeWidth="5" />
          <rect
            x="37"
            y="22"
            width="46"
            height="32"
            rx="8"
            fill={value === "off" ? "#b2bec7" : gold}
          />
          {value !== "off" && (
            <path
              d="M60 4v10m-33 7-9-6m84 0-9 6M18 42h10m65 0h10"
              stroke={gold}
              strokeWidth="4"
            />
          )}
        </>
      );
      break;
    case "engine":
      art = (
        <>
          <rect x="25" y="20" width="70" height="42" rx="8" fill={blue} />
          <circle
            cx="60"
            cy="41"
            r="13"
            fill={value === "off" ? "#dce4e7" : gold}
          />
          <path d="M21 63h78l-12 14H35Z" fill="#8398ad" />
          {value === "on" && (
            <path d="m38 77 5 13 9-13 8 13 9-13 9 13 7-13" fill={gold} />
          )}
        </>
      );
      break;
    case "map":
      art = (
        <>
          <path d="m14 24 29-9 32 9 29-9v61l-29 9-32-9-29 9Z" fill="#ece0b4" />
          <path d="M43 15v61m32-52v61" fill="none" />
          {value !== "blank" && (
            <>
              <path
                d="M24 62 55 40l22 18 19-23"
                fill="none"
                stroke={green}
                strokeDasharray="4 4"
                strokeWidth="4"
              />
              <circle cx="95" cy="35" r="6" fill={gold} />
            </>
          )}
        </>
      );
      break;
    case "gear":
      art = (
        <>
          <g
            transform={
              value === "small" ? "translate(15 12) scale(.75)" : undefined
            }
          >
            <circle cx="60" cy="46" r="30" fill="#e9d398" strokeWidth="4" />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <path
                key={a}
                d="M55 8h10v12H55Z"
                fill={gold}
                transform={`rotate(${a} 60 46)`}
              />
            ))}
            <circle cx="60" cy="46" r="12" fill="#fff8e5" />
            <path
              d="M60 46V22"
              stroke={ink}
              strokeWidth="4"
              transform={`rotate(${Number(value || 0) * 120 || 0} 60 46)`}
            />
          </g>
          {["forward", "reverse"].includes(value) && (
            <path
              d={
                value === "forward"
                  ? "M18 83h84m-10-7 10 7-10 7"
                  : "M102 83H18m10-7-10 7 10 7"
              }
              fill="none"
              stroke={green}
              strokeWidth="4"
            />
          )}
        </>
      );
      break;
    case "battery":
    case "reserve":
      art = (
        <>
          <rect x="34" y="18" width="52" height="65" rx="7" fill="#e3edda" />
          <path d="M48 18V9h24v9" fill={ink} />
          <path d="M43 70h34V38H43Z" fill={green} />
          <path d="m63 29-13 21h12l-6 18 17-24H61Z" fill={gold} stroke="none" />
        </>
      );
      break;
    case "solar":
      art = (
        <>
          <circle cx="23" cy="19" r="10" fill={gold} />
          <path d="M23 2v4m0 26v4M6 19h4m26 0h4" stroke={gold} />
          <path d="m38 34 65-8-4 43-66 7Z" fill="#8eacd5" />
          <path
            d="m59 31-5 42m27-45-5 42M36 55l64-8M67 72v14H47h40"
            fill="none"
            stroke="#f6fbff"
          />
        </>
      );
      break;
    case "hatch":
      art = (
        <>
          <path d="M27 85V16h66v69Z" fill="#bdd0e0" />
          <path
            d="M40 75V28h40v47Z"
            fill={value === "open" ? "#43546a" : "#e5edf2"}
          />
          <circle cx="66" cy="51" r="8" fill={gold} />
          <path d="M58 51h16m-8-8v16" fill="none" />
        </>
      );
      break;
    case "cargo":
      art = (
        <>
          <path d="M24 32h72v48H24Z" fill="#d5b27a" />
          <path d="m24 32 14-17h43l15 17" fill="#ecd19b" />
          <path
            d="M47 18v62m25-62v62M24 51h72"
            stroke={value === "loose" ? "#bbaaaa" : green}
            strokeWidth="6"
          />
        </>
      );
      break;
    case "cable":
      art = (
        <>
          <path
            d="M14 68h25V45h15m52-25H84v25H69"
            fill="none"
            stroke={gold}
            strokeWidth="7"
          />
          <path d="M45 34h14v22H45Zm19 0h14v22H64Z" fill={blue} />
          {value === "joined" && (
            <path d="M58 45h7" stroke={green} strokeWidth="4" />
          )}
        </>
      );
      break;
    case "crater":
    case "rails":
      art = (
        <>
          <ellipse cx="60" cy="56" rx="49" ry="25" fill="#b5bed1" />
          <ellipse cx="60" cy="57" rx="33" ry="14" fill="#7f8ba3" />
          <path
            d={
              value === "ramp"
                ? "M12 74 57 57 107 72"
                : "M12 72 27 30 78 24 109 65"
            }
            fill="none"
            stroke={gold}
            strokeWidth="7"
          />
          {kind === "rails" && (
            <path
              d="M13 64 25 23 79 16 110 57m-85-32v17m28-25v17m27-18v17"
              fill="none"
              stroke={ink}
            />
          )}
        </>
      );
      break;
    case "earth":
      art = (
        <>
          <circle cx="60" cy="45" r="35" fill={blue} />
          <path
            d="m37 20 22-6 13 18-16 11 5 15-12 17-13-28 9-11Zm40 30 13-4 5 14-17 13-9-12Z"
            fill={green}
            stroke="none"
          />
        </>
      );
      break;
    case "heart":
      art = (
        <path
          d="M60 78 25 44C3 11 46-3 60 23 74-3 117 11 95 44Z"
          fill={value === "0" ? blue : value === "2" ? "#b5a1db" : gold}
        />
      );
      break;
    case "flower":
      art = (
        <>
          <path
            d="M60 47v38m0-15q-25-17-30-4 15 16 30 11m0-11q25-17 30-4-15 16-30 11"
            fill={green}
          />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="60"
              cy="27"
              rx="13"
              ry="20"
              fill={gold}
              transform={`rotate(${a} 60 42)`}
            />
          ))}
          <circle cx="60" cy="42" r="12" fill="#fff0b7" />
        </>
      );
      break;
    case "platform":
      art = (
        <>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path
                d={`M${14 + i * 34} ${65 - i * 18}h27l-5 12h-17Z`}
                fill="#d9be7c"
              />
              <path
                d={`M${27 + i * 34} ${61 - i * 18}v-16m-4 5 4-5 4 5`}
                fill="none"
                stroke={green}
              />
            </g>
          ))}
        </>
      );
      break;
    case "gate":
      art = (
        <>
          <path
            d="M22 86V40a38 38 0 0 1 76 0v46H82V40a22 22 0 0 0-44 0v46Z"
            fill="#d9ccac"
          />
          {value === "diamond" ? (
            <path d="m60 20 14 16-14 16-14-16Z" fill={signColor} />
          ) : (
            <circle cx="60" cy="36" r="14" fill={gold} />
          )}
        </>
      );
      break;
    case "sequence":
      art = (
        <>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect
                x={9 + i * 38}
                y="29"
                width="28"
                height="33"
                rx="5"
                fill={[blue, gold, green][i]}
              />
              <text
                x={23 + i * 38}
                y="51"
                fill={ink}
                stroke="none"
                fontSize="19"
                textAnchor="middle"
              >
                {i + 1}
              </text>
            </g>
          ))}
        </>
      );
      break;
    case "grip":
    case "tow":
    case "repair":
    case "rover":
      return (
        <span className={`expert-rover-icon expert-${kind}`}>
          <ExpeditionIcon name="rover" simple />
          {kind !== "rover" && (
            <span aria-hidden="true">
              {kind === "grip" ? "▰ ▰" : kind === "tow" ? "←" : "⚒"}
            </span>
          )}
        </span>
      );
    default:
      return (
        <ExpeditionIcon
          name={
            (
              {
                scanner: "sonar",
                radio: "signal",
                rails: "bridge",
                lamp: "light",
                marker: "flag",
                tracks: "tracks",
                beacon: "beacon",
                engine: "engine",
              } as Record<string, string>
            )[kind] || kind
          }
          simple
        />
      );
  }
  return (
    <svg
      className="expert-picture"
      viewBox="0 0 120 96"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g
        stroke={ink}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {art}
      </g>
    </svg>
  );
}
export function expertPictureKind(text: string): PictureKind {
  const t = text.toLowerCase();
  const rules: [RegExp, PictureKind][] = [
    [/light lock/, "colors"],
    [/shape wheel|circle.*triangle/, "shape"],
    [/color wheel|color step/, "colors"],
    [/lens/, "lens"],
    [/receiver/, "lamp"],
    [/mirror/, "mirror"],
    [/flower/, "flower"],
    [/frame|exit/, "gate"],
    [/triangle/, "shape"],
    [/pointer/, "gear"],
    [/gear|coupling/, "gear"],
    [/heart/, "heart"],
    [/straps|cargo/, "cargo"],
    [/hatch/, "hatch"],
    [/beacon/, "beacon"],
    [/reserve/, "reserve"],
    [/cable/, "cable"],
    [/panel|solar|sun/, "solar"],
    [/battery|stored/, "battery"],
    [/rails|rim/, "rails"],
    [/ramp|crossing/, "crater"],
    [/marker/, "marker"],
    [/map|surveyed/, "map"],
    [/tracks/, "tracks"],
    [/scanner|scan/, "scanner"],
    [/tow/, "tow"],
    [/repair/, "repair"],
    [/grip/, "grip"],
    [/engine/, "engine"],
    [/earth|antenna/, "earth"],
    [/request|confirm|communication/, "sequence"],
    [/pair|radio/, "radio"],
    [/platform|height|lift|anchor|counterweight|link/, "platform"],
    [/light|lamp/, "lamp"],
  ];
  return rules.find(([re]) => re.test(t))?.[1] || "rover";
}
export function ExpertPicture({
  text,
  field,
  value,
}: {
  text: string;
  field?: string;
  value?: string;
}) {
  const fields: Record<string, PictureKind> = {
    source:
      value === "stored" ? "battery" : value === "relay" ? "solar" : "shape",
    color: "colors",
    shapeTurn: "shape",
    colorTurn: "colors",
    lens: "lens",
    seal: "gate",
    a: "mirror",
    b: "mirror",
    c: "mirror",
    d: "mirror",
    filter: "colors",
    gate: "gate",
    left: "platform",
    middle: "platform",
    right: "platform",
    link: value === "paired" || value === "silent" ? "radio" : "platform",
    weight: "cargo",
    anchor: "reserve",
    drive: "gear",
    gear: "gear",
    direction: "gear",
    offset: "gear",
    coupling: "gear",
    lock: "colors",
    transform: "heart",
    mirror: "mirror",
    mobility: value === "grip" ? "grip" : "scanner",
    supply: value === "battery" ? "battery" : "solar",
    hatch: "hatch",
    beacon: "beacon",
    map: "map",
    cargo: "cargo",
    route: "crater",
    support: value === "rails" ? "rails" : "grip",
    pace: "rover",
    lamp: "lamp",
    marker: "marker",
    balance: "cargo",
    panel: "solar",
    cable: "cable",
    mode: value === "store" ? "battery" : "scanner",
    engine: "engine",
    reserve: "reserve",
    mount: "solar",
    search: value === "tracks" ? "tracks" : "shape",
    method: value === "tracks" ? "tracks" : "scanner",
    recovery: value === "tow" ? "tow" : "repair",
    stabilizer: "rover",
    returnRoute: "map",
    power: value === "stored" ? "battery" : "solar",
    antenna: value === "ridge" ? "crater" : "earth",
    exchange: "sequence",
    rover: "rover",
  };
  const kind = field
    ? fields[field] || expertPictureKind(text)
    : expertPictureKind(text);
  const numeric = text.match(/pointer must show (\d)/i)?.[1];
  const v = field
    ? value
    : /gold triangle/i.test(text)
      ? "triangle"
      : /diamond frame/i.test(text)
        ? "diamond"
        : numeric ||
          (kind === "colors" && !/wheel|step/i.test(text)
            ? text.match(/blue|gold|violet/i)?.[0].toLowerCase()
            : undefined);
  const turns =
    field &&
    [
      "shapeTurn",
      "colorTurn",
      "drive",
      "offset",
      "transform",
      "left",
      "middle",
      "right",
    ].includes(field);
  return (
    <span className="expert-picture-wrap">
      <ExpertGlyph kind={kind} value={v} />
      {turns && (
        <span className="expert-turn-count" aria-hidden="true">
          {value} {["left", "middle", "right"].includes(field!) ? "↕" : "↻"}
        </span>
      )}
      {!field &&
        /Receiver sits (\d+) steps right and (\d+) steps up/i.test(text) && (
          <span className="expert-picture-key" aria-hidden="true">
            → {text.match(/Receiver sits (\d+)/i)?.[1]} · ↑{" "}
            {text.match(/and (\d+) steps up/i)?.[1]}
          </span>
        )}
      {!field && /Mirror \d and Mirror \d/i.test(text) && (
        <span className="expert-picture-key" aria-hidden="true">
          {text.match(/Mirror (\d)/i)?.[1]} ↔{" "}
          {text.match(/and Mirror (\d)/i)?.[1]}
        </span>
      )}
      {!field && /shape wheel/i.test(text) && (
        <span className="expert-picture-key" aria-hidden="true">
          ● → ▲ → ◆
        </span>
      )}
    </span>
  );
}
export const expertLabel = (v?: string) =>
  v ? v.replaceAll("-", " ") : "Not set";
