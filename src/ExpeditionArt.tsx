import { useId } from "react";
import {
  ExpeditionIllustration,
  hasExpeditionDrawing,
} from "./ExpeditionIllustrations";
// Original pictograms: same warm ink, soft fill and simple silhouettes as Tiny Heroes.
export function ExpeditionIcon({
  name,
  label,
  simple = false,
}: {
  name: string;
  label?: string;
  simple?: boolean;
}) {
  const moonId = useId().replace(/:/g, "");
  if (!simple && hasExpeditionDrawing(name, label))
    return <ExpeditionIllustration name={name} label={label} />;
  let art;
  if (
    [
      "circle",
      "triangle",
      "diamond",
      "violet",
      "mirror",
      "gear",
      "rover",
      "map",
    ].includes(name)
  ) {
    art =
      name === "circle" ? (
        <circle cx="48" cy="44" r="25" fill="#91c6df" />
      ) : name === "triangle" ? (
        <path d="m48 15 30 55H18Z" fill="#e6c66c" />
      ) : name === "diamond" || name === "violet" ? (
        <path d="m48 10 30 34-30 34-30-34Z" fill="#b29ed4" />
      ) : name === "mirror" ? (
        <>
          <ellipse cx="48" cy="38" rx="23" ry="28" fill="#b8dce6" />
          <path d="m33 48 30-25M48 66v12H30h36" fill="none" />
        </>
      ) : name === "gear" ? (
        <>
          <path
            d="m40 10 16 0 3 10 12-2 8 14-8 8 8 10-8 14-12-2-3 10H40l-3-10-12 2-8-14 8-10-8-8 8-14 12 2Z"
            fill="#d6b768"
          />
          <circle cx="48" cy="44" r="12" fill="#fff4dd" />
        </>
      ) : name === "rover" ? (
        <>
          <rect x="15" y="35" width="65" height="30" rx="9" fill="#abc3e1" />
          <path d="m30 35 8-15h20l10 15" fill="#dceaf0" />
          <circle cx="29" cy="67" r="10" fill="#596175" />
          <circle cx="68" cy="67" r="10" fill="#596175" />
        </>
      ) : (
        <>
          <path
            d="m12 24 24-10 25 10 23-10v54l-23 10-25-10-24 10Z"
            fill="#e4d8a3"
          />
          <path d="M36 14v54m25-44v54" fill="none" />
        </>
      );
  } else if (
    name === "symbols" ||
    ["leaf-sun-river", "sun-river-leaf", "river-leaf-sun"].includes(name)
  )
    return (
      <span className="expedition-symbol-strip">
        {(name.includes("-")
          ? name.split("-")
          : label &&
              label.split(" · ").length === 3 &&
              label
                .split(" · ")
                .every((x) =>
                  ["Leaf", "Sun", "River", "Moon", "Star"].includes(x),
                )
            ? label.toLowerCase().split(" · ")
            : ["leaf", "sun", "river"]
        ).map((x, i) => (
          <ExpeditionIcon name={x} key={i} simple={simple} />
        ))}
      </span>
    );
  else if (["north", "east", "west"].includes(name))
    art = (
      <>
        <circle cx="48" cy="44" r="30" fill="#dbeee8" />
        <path
          d={
            name === "east"
              ? "M22 44h50m-18-15 18 15-18 15"
              : name === "west"
                ? "M74 44H24m18-15L24 44l18 15"
                : "M48 69V19m-16 17 16-17 16 17"
          }
          fill="none"
          strokeWidth="6"
        />
      </>
    );
  else if (name === "compass")
    art = (
      <>
        <circle cx="48" cy="44" r="30" fill="#f4d887" />
        <circle cx="48" cy="44" r="22" fill="#fff8de" />
        <path d="m48 20 9 24-9 23-9-23Z" fill="#dc9275" />
        <path d="m48 20 9 24h-9Z" fill="#518a83" />
      </>
    );
  else if (name === "leaf")
    art = (
      <>
        <path d="M24 66Q10 23 75 18Q81 73 24 66Z" fill="#78ad79" />
        <path d="M20 73 63 32M36 57V36M47 46h21" fill="none" />
      </>
    );
  else if (name === "sun" || name === "star")
    art =
      name === "sun" ? (
        <>
          <circle cx="48" cy="44" r="19" fill="#f3c55c" />
          <path
            d="M48 11v9m0 48v9M15 44h9m48 0h9M24 20l7 7m34 34 7 7M24 68l7-7m34-34 7-7"
            stroke="#cc9846"
            strokeWidth="4"
          />
        </>
      ) : (
        <path
          d="m48 12 10 21 24 3-18 17 5 23-21-12-21 12 5-23-18-17 24-3Z"
          fill="#f1c45b"
        />
      );
  else if (name === "moon")
    art = (
      <>
        <defs>
          <linearGradient id={`moon-${moonId}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff8d5" />
            <stop offset=".48" stopColor="#e5e4c4" />
            <stop offset="1" stopColor="#a8b9ce" />
          </linearGradient>
        </defs>
        <path
          data-moon="crescent"
          d="M63 10C32 5 13 29 17 53C21 79 51 91 74 72C43 80 27 38 63 10Z"
          fill={`url(#moon-${moonId})`}
          stroke="#788b98"
          strokeWidth="1.7"
        />
        <path
          d="M50 15C26 19 17 40 24 58"
          fill="none"
          stroke="#fffbe6"
          strokeWidth="2.8"
        />
        <ellipse
          cx="27"
          cy="47"
          rx="4.5"
          ry="6"
          fill="#b1bac1"
          opacity=".55"
          stroke="none"
        />
        <ellipse
          cx="37"
          cy="67"
          rx="5.5"
          ry="3.5"
          fill="#a6b3c0"
          opacity=".5"
          stroke="none"
        />
        <circle cx="34" cy="29" r="2.7" fill="#c2c9be" stroke="none" />
        <circle
          cx="53"
          cy="75"
          r="2.5"
          fill="#a6b5c6"
          opacity=".65"
          stroke="none"
        />
      </>
    );
  else if (name === "parrot")
    art = (
      <>
        <ellipse cx="44" cy="47" rx="20" ry="26" fill="#75b792" />
        <circle cx="51" cy="25" r="16" fill="#e6c665" />
        <path d="m65 23 13 9-16 6M34 67l-5 14 16-10" fill="#d58c69" />
        <circle cx="55" cy="22" r="3" fill="#473f36" />
        <path d="M32 42q26-8 22 19" fill="#77b7c8" />
      </>
    );
  else if (name === "ship")
    art = (
      <>
        <path d="m13 58 69-3-13 22H29Z" fill="#c79f73" />
        <path d="M46 16v44M27 25v33" fill="none" />
        <path d="m49 20 26 26H49Zm-19 7v21H15Z" fill="#fff1ca" />
      </>
    );
  else if (name === "shell")
    art = (
      <>
        <path
          d="M17 58Q10 23 29 27Q40 10 48 22Q60 10 67 27Q88 23 79 58L57 70H40Z"
          fill="#edb998"
        />
        <path
          d="m29 33 13 29m6-34v34m19-29L55 62M24 51l16 13m32-13-16 13"
          fill="none"
          stroke="#b8866c"
        />
      </>
    );
  else if (name === "gate")
    art = (
      <>
        <path d="M20 76V18h56v58" fill="#c6c4a7" />
        <path d="M32 76V34h32v42" fill="#8aa795" />
        <circle cx="57" cy="54" r="3" fill="#f4cf76" />
      </>
    );
  else if (name === "vine" || name === "bridge")
    art = (
      <>
        <path
          d="M13 55q35 25 70 0M13 30q35 25 70 0M13 27v43m70-43v43"
          fill="none"
          stroke="#6f9270"
          strokeWidth="5"
        />
        {[20, 34, 48, 62, 76].map((x) => (
          <path key={x} d={`M${x} 35v25`} stroke="#a78659" strokeWidth="3" />
        ))}
      </>
    );
  else if (name === "cave" || name === "arch")
    art = (
      <>
        <path d="M12 75Q11 13 49 13T84 75Z" fill="#a4b7af" />
        <path d="M31 75Q30 35 49 35T67 75Z" fill="#415a56" />
        <path d="M34 76h28" stroke="#e8c882" strokeWidth="5" />
      </>
    );
  else if (name === "river" || name === "marsh")
    art = (
      <>
        <path
          d="M8 25q20-10 40 0t40 0M8 44q20-10 40 0t40 0M8 63q20-10 40 0t40 0"
          fill="none"
          stroke="#6aafb9"
          strokeWidth="7"
        />
        {name === "marsh" && (
          <path
            d="M26 69V18m-6 0v23m12-23v23"
            stroke="#6b9973"
            strokeWidth="4"
          />
        )}
      </>
    );
  else if (name === "cliff")
    art = (
      <>
        <path d="m10 76 24-52 22 18 15-25 16 59Z" fill="#b8b1a2" />
        <path d="m49 42-8 14 12 10-7 9" fill="none" />
      </>
    );
  else if (name === "flower")
    art = (
      <>
        <path d="M47 72V41" stroke="#6d9973" strokeWidth="5" />
        <path
          d="M47 27q-24-22-25 3-22 15 6 22 8 27 22 2 26 8 21-15 9-23-16-16Z"
          fill="#fff7df"
        />
        <circle cx="46" cy="39" r="8" fill="#e8bf5a" />
      </>
    );
  else if (name === "tracks" || name === "scout")
    art = (
      <>
        <ellipse cx="33" cy="56" rx="12" ry="15" fill="#b2c99d" />
        <ellipse cx="63" cy="34" rx="12" ry="15" fill="#b2c99d" />
        <path
          d="m25 34 2-8m12 8 1-8m15-8 2-8m12 8 1-8"
          stroke="#8d9f78"
          strokeWidth="7"
        />
      </>
    );
  else if (name === "water" || name === "depth" || name === "current")
    art = (
      <>
        <path d="M48 12Q12 49 26 68t43 0Q84 49 48 12Z" fill="#78c9d8" />
        <path
          d="M33 55q12-9 26 0"
          fill="none"
          stroke="#daf3f1"
          strokeWidth="5"
        />
      </>
    );
  else if (["power", "power-off", "engine"].includes(name))
    art = (
      <>
        <rect x="18" y="25" width="60" height="43" rx="10" fill="#e9c879" />
        <path d="M38 25v-9h20v9" fill="#b1c8c7" />
        <path d="m51 32-16 22h14l-3 11 18-23H50Z" fill="#fff5d4" />
        {name === "power-off" && (
          <path d="m18 17 63 60" stroke="#a96b5e" strokeWidth="6" />
        )}
      </>
    );
  else if (name === "shield")
    art = (
      <>
        <path d="m48 13 29 12v25Q70 70 48 78 26 70 19 50V25Z" fill="#8bbac0" />
        <path
          d="m33 44 11 12 21-27"
          fill="none"
          stroke="#fff2cc"
          strokeWidth="6"
        />
      </>
    );
  else if (name === "sonar")
    art = (
      <>
        <circle cx="48" cy="44" r="30" fill="#9acacc" />
        <circle cx="48" cy="44" r="20" fill="none" />
        <path d="M48 14v30l22 16" fill="none" />
        <circle cx="34" cy="32" r="4" fill="#f5da89" />
      </>
    );
  else if (name === "light" || name === "beacon")
    art = (
      <>
        <path d="M38 66h20l-4 11H42Z" fill="#95b7b4" />
        <circle cx="48" cy="41" r="23" fill="#f4d278" />
        <path
          d="M48 8V2M14 39H6m76 0h8M23 17l-7-6m57 6 7-6"
          stroke="#d5b465"
          strokeWidth="4"
        />
        <path d="M40 54V38h16v16" fill="none" />
      </>
    );
  else if (
    name === "blue" ||
    name === "green" ||
    name === "amber" ||
    name === "signal"
  )
    art = (
      <>
        <circle
          cx="48"
          cy="44"
          r="24"
          fill={
            name === "green"
              ? "#8fbea4"
              : name === "amber"
                ? "#e9c271"
                : "#80b8d2"
          }
        />
        <path
          d="M16 28q-12 16 0 32m64-32q12 16 0 32M26 35q-6 9 0 18m44-18q6 9 0 18"
          fill="none"
          stroke="#6e9295"
          strokeWidth="4"
        />
      </>
    );
  else if (name === "supplies")
    art = (
      <>
        <rect x="16" y="31" width="64" height="45" rx="9" fill="#cba579" />
        <path d="M34 31V18h29v13M17 43h62M48 44v30" fill="none" />
        <rect x="42" y="44" width="13" height="15" rx="3" fill="#f2d583" />
      </>
    );
  else if (name === "shelter")
    art = (
      <>
        <path d="m9 72 38-56 40 56Z" fill="#dfbc7a" />
        <path d="m31 72 16-29 19 29" fill="#88a7a4" />
        <path d="M47 16v56" fill="none" />
      </>
    );
  else if (name === "builder")
    art = (
      <>
        <path d="m23 76 38-49 10 8-36 47Z" fill="#c59c70" />
        <path d="m39 25 14-15 30 22-15 19Z" fill="#a4b4ac" />
      </>
    );
  else if (name === "wind")
    art = (
      <>
        <path
          d="M10 32h52q20 0 15-17t-19 0M10 47h63q18 0 10 16t-16 0M10 63h30"
          fill="none"
          stroke="#92b7bd"
          strokeWidth="5"
        />
      </>
    );
  else if (name === "coral")
    art = (
      <>
        <path
          d="M48 76V25m0 32-22-9V30m22 16 22-12V20M26 43l-13-6V25m57 7 13-8V14"
          stroke="#dc9f8b"
          strokeWidth="9"
          fill="none"
        />
      </>
    );
  else if (name === "submarine")
    art = (
      <>
        <path d="M19 33h49q35 24 0 45H19Z" fill="#ecc675" />
        <circle cx="65" cy="55" r="14" fill="#8dcbd3" />
        <path d="M32 33V19h18v14" fill="#e7bf6c" />
      </>
    );
  else if (name === "look")
    art = (
      <>
        <path d="M8 44Q48 9 88 44 48 79 8 44Z" fill="#ffedc8" />
        <circle cx="48" cy="44" r="15" fill="#86b9b2" />
        <circle cx="48" cy="44" r="7" fill="#456264" />
      </>
    );
  else if (name === "snow")
    art = (
      <>
        <circle cx="48" cy="44" r="35" fill="#e8f3f2" stroke="none" />
        <g fill="none" stroke="#6faec3" strokeWidth="3">
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <path
              key={angle}
              transform={`rotate(${angle} 48 44)`}
              d="M48 44V14m-7 7 7 7 7-7m-11-6 4 4 4-4"
            />
          ))}
        </g>
        <path
          d="m48 36 7 4v8l-7 4-7-4v-8Z"
          fill="#c5e5e9"
          stroke="#6faec3"
          strokeWidth="2"
        />
        <circle cx="48" cy="44" r="2.5" fill="#fffaf0" stroke="none" />
      </>
    );
  else if (name === "sound")
    art = (
      <>
        <path d="M20 34h13l17-13v46L33 55H20Z" fill="#7baca5" />
        <path
          d="M61 29q20 15 0 30M69 20q29 24 0 48"
          fill="none"
          stroke="#7baca5"
          strokeWidth="4"
        />
      </>
    );
  else
    art = (
      <>
        <path d="M30 76V15l38 5v26l-38-5" fill="#d7b765" />
        <path d="M30 15v61" fill="none" strokeWidth="4" />
      </>
    );
  return (
    <svg className="expedition-icon" viewBox="0 0 96 88" aria-hidden="true">
      <g
        stroke="#615442"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {art}
      </g>
    </svg>
  );
}
export function FriendshipCompass({ pieces }: { pieces: number }) {
  return (
    <div
      className={`friendship-compass ${pieces === 5 ? "compass-whole" : ""}`}
      role="img"
      aria-label={`${pieces} of 5 Friendship Compass pieces`}
    >
      <svg viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="66" fill="#e5ede4" />
        {Array.from({ length: 5 }, (_, i) => (
          <path
            key={i}
            transform={`rotate(${i * 72} 80 80)`}
            d="M80 80 80 18A62 62 0 0 1 139 61Z"
            fill={i < pieces ? "#e6c16b" : "#cfdbd8"}
            stroke="#fff8df"
            strokeWidth="3"
          />
        ))}
        <circle
          cx="80"
          cy="80"
          r="43"
          fill="#fcf6df"
          opacity={pieces === 5 ? 1 : 0.65}
        />
        <path
          d="m80 40 14 40-14 40-14-40Z"
          fill={pieces === 5 ? "#ce8b70" : "#b5c2ba"}
        />
        <path d="m80 40 14 40H80Z" fill="#407f7d" />
        <circle cx="80" cy="80" r="5" fill="#f8e3a9" />
      </svg>
    </div>
  );
}
