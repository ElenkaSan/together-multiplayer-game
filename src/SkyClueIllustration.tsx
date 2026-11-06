import { useId } from "react";
export const skyCluePictures = [
  "sky-routes",
  "sky-height",
  "sky-sail",
  "sky-cargo",
  "sky-tether",
  "sky-signal",
  "sky-wind",
  "sky-blades",
  "sky-crossing",
  "sky-brake",
  "sky-plan",
  "sky-rain",
  "sky-fog",
  "sky-shutters",
  "sky-beacon",
];
/** Small, literal depictions of the observation, never additional solution information. */
export function SkyClueIllustration({ name }: { name: string }) {
  const id = useId().replace(/:/g, ""),
    fill = (part: string) => `url(#${id}-${part})`;
  const cloud = (x: number, y: number, s = 1) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M-29 8q-12-11 0-18 7-17 21-9 15-15 29 0 18-1 18 14 11 12-5 17h-58Z"
        fill="#f8fcf4"
        stroke="#c4d9d7"
        strokeWidth="1.5"
      />
      <path d="M-20 10h47" stroke="#deebe2" strokeWidth="2" />
    </g>
  );
  const ship = (x: number, y: number, s = 1) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M-33 3q33 15 66 0l-10 18h-46Z"
        fill={fill("wood")}
        stroke="#816647"
        strokeWidth="2"
      />
      <path d="M-2 6v-43" stroke="#836b4a" strokeWidth="3" />
      <path
        d="m2-38 29 29H2Z"
        fill={fill("sail")}
        stroke="#b5a172"
        strokeWidth="1.5"
      />
      <path
        d="m-6-32-22 25h22Z"
        fill="#aed5cf"
        stroke="#729c97"
        strokeWidth="1.5"
      />
      <path d="M-23 12h43" stroke="#efd3a2" strokeWidth="2" />
    </g>
  );
  const crate = (x: number, y: number, s = 1) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="m0 3 17-5 12 8-18 6Z"
        fill="#e6c68c"
        stroke="#9e8159"
        strokeWidth="1.5"
      />
      <path
        d="M0 3v23l11 8 18-7V6l-18 6Z"
        fill={fill("wood")}
        stroke="#8d714e"
        strokeWidth="1.5"
      />
      <path d="M11 12v22M3 10l5 16m7-8 10-4" stroke="#edd5a2" strokeWidth="2" />
    </g>
  );
  const beacon = (
    <>
      <path
        d="m64 106 5-34h24l5 34Z"
        fill={fill("metal")}
        stroke="#718f87"
        strokeWidth="2"
      />
      <path
        d="M69 73V42h24v31Z"
        fill={fill("sail")}
        stroke="#93794e"
        strokeWidth="2"
      />
      <path
        d="m63 42 18-16 18 16Z"
        fill="#6d998e"
        stroke="#547c70"
        strokeWidth="2"
      />
      <path d="M74 48v19m14-19v19" stroke="#fff6ce" strokeWidth="2" />
      <path
        d="M80 18V9M52 43l-10-6m67 6 10-6"
        stroke="#dcbb74"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );
  let art;
  if (name === "sky-height")
    art = (
      <>
        {cloud(36, 101, 0.8)}
        {cloud(120, 47, 0.8)}
        {ship(41, 80, 0.6)}
        {ship(116, 25, 0.6)}
        <path
          d="M78 22v72m-6-64 6-8 6 8m-12 56 6 8 6-8"
          fill="none"
          stroke="#719e9c"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M18 100h42m39-54h44"
          stroke="#b8d0bf"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </>
    );
  else if (name === "sky-cargo")
    art = (
      <>
        <ellipse cx="80" cy="108" rx="60" ry="6" fill="#e0e8cf" />
        <path
          d="M80 96V35m-47 13h94m-87 0-9 29m89-29 9 29"
          stroke="#7b8e79"
          strokeWidth="4"
          fill="none"
        />
        <path
          d="m64 106 16-15 16 15Z"
          fill={fill("metal")}
          stroke="#718f87"
          strokeWidth="2"
        />
        {crate(19, 52, 0.85)}
        {crate(105, 52, 0.85)}
        <path
          d="M17 82h40m47 0h39"
          stroke="#9b8056"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle
          cx="80"
          cy="48"
          r="5"
          fill="#e5c27d"
          stroke="#9b8056"
          strokeWidth="2"
        />
      </>
    );
  else if (name === "sky-sail")
    art = (
      <>
        {cloud(45, 107, 0.8)}
        {ship(84, 74, 1.05)}
        <path
          d="m58 18 6 8 6-8m30 13 6 8 6-8"
          stroke="#7eaaa4"
          strokeWidth="2"
          fill="none"
        />
      </>
    );
  else if (name === "sky-tether")
    art = (
      <>
        {cloud(38, 107, 0.9)}
        {ship(109, 46, 0.7)}
        <path
          d="M108 61q-2 34-53 27t-24 13"
          fill="none"
          stroke="#9b7b50"
          strokeWidth="6"
        />
        <path
          d="M108 61q-2 34-53 27t-24 13"
          fill="none"
          stroke="#ead0a2"
          strokeWidth="2"
          strokeDasharray="3 4"
        />
        <path
          d="M24 91h26m-21-5v13m17-13v13"
          stroke="#7d9690"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </>
    );
  else if (name === "sky-signal" || name === "sky-beacon")
    art = (
      <>
        {cloud(81, 107, 1.4)}
        {beacon}
        {name === "sky-signal" && (
          <>
            <path
              d="M14 84h30v17H14Z"
              fill={fill("metal")}
              stroke="#72938b"
              strokeWidth="2"
            />
            <path d="m22 95 14-14" stroke="#907249" strokeWidth="4" />
            <circle cx="36" cy="81" r="4" fill="#e4c17a" />
          </>
        )}
      </>
    );
  else if (name === "sky-wind")
    art = (
      <>
        {cloud(35, 90, 0.8)}
        {cloud(125, 105, 0.8)}
        <path
          d="M18 39h91q27 0 19-17-9-11-19 1M14 57h112q23 0 18 15-6 13-19 4M29 77h59"
          fill="none"
          stroke="#77a9ad"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="m89 31 10 8-10 8m14 2 10 8-10 8"
          fill="none"
          stroke="#9abeb3"
          strokeWidth="3"
        />
      </>
    );
  else if (name === "sky-rain")
    art = (
      <>
        {cloud(80, 42, 1.6)}
        {[40, 66, 93, 120].map((x, i) => (
          <path
            key={x}
            d={`m${x} ${72 + (i % 2) * 9}-6 14`}
            stroke="#79aebb"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
        {cloud(40, 110, 0.6)}
        {cloud(129, 113, 0.6)}
      </>
    );
  else if (name === "sky-fog")
    art = (
      <>
        <path d="m46 106 6-51 27-19 29 19 7 51" fill="#a9c2bb" opacity=".65" />
        <path
          d="M17 59q35-11 67-1t61 0M7 78q35-11 67-1t76 0M18 97q35-11 67-1t60 0"
          fill="none"
          stroke="#dce7df"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M23 58h25m40 19h34m-90 20h31"
          stroke="#f9faf0"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </>
    );
  else if (name === "sky-shutters")
    art = (
      <>
        {cloud(81, 110, 1.2)}
        <path
          d="M55 103V36q27-35 50 0v67Z"
          fill="#dae1c8"
          stroke="#8b9e88"
          strokeWidth="2"
        />
        <path
          d="M66 97V39q15-20 27 0v58Z"
          fill="#adcdd0"
          stroke="#70999b"
          strokeWidth="2"
        />
        <path d="M80 29v68M66 56h27" stroke="#eaf1dc" strokeWidth="3" />
        <path
          d="m40 33 19 6v58l-19-6Zm62 6 19-6v58l-19 6Z"
          fill={fill("wood")}
          stroke="#91764e"
          strokeWidth="2"
        />
        {[48, 62, 76].map((y) => (
          <path
            key={y}
            d={`M44 ${y}l11 3M106 ${y - 1}l11-3`}
            stroke="#ead5a4"
            strokeWidth="2"
          />
        ))}
      </>
    );
  else if (name === "sky-brake")
    art = (
      <>
        {cloud(79, 111, 1.25)}
        <path
          d="M37 101h91l-8-17H46Z"
          fill={fill("metal")}
          stroke="#738f84"
          strokeWidth="2"
        />
        <circle
          cx="67"
          cy="84"
          r="12"
          fill="#b6bf9e"
          stroke="#7b8e78"
          strokeWidth="2"
        />
        <path d="m66 81 28-40" stroke="#9c7d51" strokeWidth="8" />
        <path
          d="m86 39 20-4 4 12-20 4Z"
          fill="#c48e6b"
          stroke="#947053"
          strokeWidth="2"
        />
        <circle cx="67" cy="84" r="4" fill="#e8d29b" />
        <path
          d="M26 63h17m-7-7 7 7-7 7"
          fill="none"
          stroke="#719e98"
          strokeWidth="3"
        />
      </>
    );
  else if (name === "sky-blades")
    art = (
      <>
        {cloud(80, 110, 1.5)}
        <path
          d="m57 107 7-60h31l8 60Z"
          fill="#d8d6b8"
          stroke="#8e9c7d"
          strokeWidth="2"
        />
        <path
          d="m59 47 21-27 21 27Z"
          fill="#86ad9b"
          stroke="#648a78"
          strokeWidth="2"
        />
        {[0, 90, 180, 270].map((angle) => (
          <path
            key={angle}
            transform={`rotate(${angle} 80 51)`}
            d="m80 48 2-36 12-5 2 36Z"
            fill={fill("sail")}
            stroke="#a78c61"
            strokeWidth="1.5"
          />
        ))}
        <circle
          cx="80"
          cy="51"
          r="7"
          fill="#a6bbb0"
          stroke="#6f8d80"
          strokeWidth="2"
        />
        <path d="M74 106V84h13v22" fill="#80a1a1" />
      </>
    );
  else if (name === "sky-crossing")
    art = (
      <>
        {cloud(26, 98, 0.9)}
        {cloud(134, 98, 0.9)}
        <path
          d="m8 77 36-8 5 18-40 8m104-24 37 7-1 17-41-9"
          fill="#adbea0"
          stroke="#8fa38a"
          strokeWidth="1.5"
        />
        <path
          d="M33 80q47 13 95 0M33 62q47 13 95 0M33 60v28m95-28v28"
          stroke="#a48a5d"
          strokeWidth="3"
          fill="none"
        />
        {[48, 64, 80, 96, 112].map((x) => (
          <path key={x} d={`M${x} 66v18`} stroke="#c4ac7a" strokeWidth="2" />
        ))}
        <path
          d="M47 55q32-19 65 0"
          fill="none"
          stroke="#b5d3cd"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </>
    );
  else
    art = (
      <>
        {cloud(29, 93, 0.75)}
        {cloud(130, 37, 0.75)}
        {cloud(132, 104, 0.75)}
        <path
          d="M29 90Q52 42 126 35M29 90q57-15 97 11"
          fill="none"
          stroke="#d4b777"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M30 90Q53 43 126 35M30 90q57-15 96 11"
          fill="none"
          stroke="#fff1bc"
          strokeWidth="2"
          strokeDasharray="3 5"
        />
        <path
          d="m115 29 11 6-7 9m-4 48 11 9-13 4"
          fill="none"
          stroke="#779c8c"
          strokeWidth="3"
        />
        {name === "sky-plan" && (
          <path
            d="M15 26h35v24H15Z"
            fill="#edf0d7"
            stroke="#a3b298"
            strokeWidth="2"
          />
        )}
      </>
    );
  return (
    <svg
      className="expedition-icon expedition-illustration sky-clue-illustration"
      viewBox="0 0 160 120"
      aria-hidden="true"
      data-picture={name}
    >
      <defs>
        <linearGradient id={`${id}-wood`} x2="0" y2="1">
          <stop stopColor="#e0c38c" />
          <stop offset="1" stopColor="#b08b57" />
        </linearGradient>
        <linearGradient id={`${id}-sail`} x2="0" y2="1">
          <stop stopColor="#fff0c4" />
          <stop offset="1" stopColor="#dcc58a" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x2=".8" y2="1">
          <stop stopColor="#d6e4d7" />
          <stop offset="1" stopColor="#8faea5" />
        </linearGradient>
      </defs>
      {art}
    </svg>
  );
}
