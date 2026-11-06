export type TinyIconName =
  | "sound"
  | "muted"
  | "ready"
  | "look"
  | "star"
  | "hint"
  | "map"
  | "clock"
  | "wait"
  | "heart"
  | "replay"
  | "heat"
  | "assist";
// Original expedition icons: warm ink, forest greens and golden highlights.
export function TinyIcon({ name }: { name: TinyIconName }) {
  return (
    <svg
      className={`tiny-icon tiny-icon-${name}`}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="#4d4935"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {name === "assist" ? (
          <>
            <path d="m5 25 9-12 10 5 10-5 9 12-13 14H19Z" fill="#d4ae79" />
            <path
              d="m14 13 9 8 7-4 10 9M12 30l9 8m-5-13 13 13m-9-17 16 11"
              fill="none"
              stroke="#6d624c"
            />
            <path d="m5 24 6-9 5 5-6 9m33-5-6-9-5 5 6 9" fill="#79a1b2" />
          </>
        ) : name === "heat" ? (
          <>
            <rect x="10" y="12" width="28" height="31" rx="8" fill="#e9aa6a" />
            <path
              d="M17 8q-4-4 0-7m8 7q-4-4 0-7m8 7q-4-4 0-7"
              fill="none"
              stroke="#ae6d42"
            />
            <path
              d="m20 23 4 5 5-8"
              fill="none"
              stroke="#fff3cd"
              strokeWidth="3"
            />
          </>
        ) : name === "sound" || name === "muted" ? (
          <>
            <path
              d="M8 18h9L29 9v30l-12-9H8a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Z"
              fill="#edc16b"
            />
            <path d="M10 22v4" stroke="#fff2bd" strokeWidth="3" />
            {name === "sound" ? (
              <path
                d="M34 17q7 7 0 14M39 12q11 12 0 24"
                fill="none"
                stroke="#507b60"
              />
            ) : (
              <path d="m34 19 9 10m0-10-9 10" fill="none" stroke="#94604b" />
            )}
          </>
        ) : name === "ready" ? (
          <>
            <rect x="6" y="6" width="36" height="36" rx="12" fill="#77a883" />
            <path
              d="m13 24 8 8 14-17"
              fill="none"
              stroke="#fff8db"
              strokeWidth="5"
            />
          </>
        ) : name === "star" ? (
          <>
            <path
              d="m24 4 6 13 14 2-10 10 2 14-12-7-12 7 2-14L4 19l14-2Z"
              fill="#efc466"
            />
            <path
              d="m14 21 7-1 3-7"
              fill="none"
              stroke="#fff4c8"
              strokeWidth="3"
            />
          </>
        ) : name === "look" ? (
          <>
            <ellipse cx="15" cy="25" rx="9" ry="14" fill="#fff8df" />
            <ellipse cx="34" cy="25" rx="9" ry="14" fill="#fff8df" />
            <ellipse
              cx="18"
              cy="26"
              rx="4"
              ry="7"
              fill="#465e48"
              stroke="none"
            />
            <ellipse
              cx="36"
              cy="26"
              rx="4"
              ry="7"
              fill="#465e48"
              stroke="none"
            />
            <path d="m8 7 10-2m10 1 11 2" fill="none" />
          </>
        ) : name === "hint" ? (
          <>
            <path d="M15 33V17q9-10 18 0v16Z" fill="#f5d880" />
            <path d="M18 10V7q6-5 12 0v3M11 35h26v7H11Z" fill="#71a58b" />
            <path
              d="M24 18v9m-4-4 4 4 4-4"
              fill="none"
              stroke="#fff8dc"
              strokeWidth="3"
            />
            <path d="M6 15 2 13m38 2 5-2" fill="none" stroke="#d2a34c" />
          </>
        ) : name === "map" ? (
          <>
            <path d="m5 10 12-4 14 5 12-4v31l-12 4-14-5-12 4Z" fill="#f6e7b8" />
            <path d="M17 6v31m14-26v31" fill="none" stroke="#bda26c" />
            <path
              d="m10 29 11-10 10 6 6-7"
              fill="none"
              stroke="#77996b"
              strokeDasharray="3 4"
            />
            <circle cx="36" cy="17" r="4" fill="#dd9360" />
          </>
        ) : name === "clock" ? (
          <>
            <path d="M19 4h10m-5 0v6" fill="none" strokeWidth="4" />
            <circle cx="24" cy="27" r="17" fill="#f6e4b4" />
            <path
              d="M24 15v12l8 5"
              fill="none"
              stroke="#537a61"
              strokeWidth="3"
            />
            <path d="m36 12 4-4" fill="none" />
          </>
        ) : name === "wait" ? (
          <>
            <path
              d="M12 6h24m-24 36h24M15 6v9l9 9-9 9v9m18-36v9l-9 9 9 9v9"
              fill="#eff2dc"
            />
            <path
              d="m18 12 6 7 6-7m-12 25 6-8 6 8Z"
              fill="#deb65d"
              stroke="none"
            />
          </>
        ) : name === "heart" ? (
          <path
            d="M24 40 6 23C-2 9 16 1 24 14 32 1 50 9 42 23Z"
            fill="#dba17b"
          />
        ) : (
          <>
            <path
              d="M37 17a16 16 0 1 0 1 17M37 7v11H26"
              fill="none"
              stroke="#65906d"
              strokeWidth="5"
            />
          </>
        )}
      </g>
    </svg>
  );
}
