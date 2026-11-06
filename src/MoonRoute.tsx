import { useId } from "react";
// Map coordinates only: never part of mission validation or server timing.
export const moonAnchors: [number, number][] = [
  [37, 86],
  [45, 47],
  [36, 25],
  [83, 34],
  [91, 70],
  [37, 86],
];
export const moonBends: [number, number][][] = [
  [
    [28, 67],
    [32, 57],
  ],
  [
    [20, 41],
    [22, 32],
  ],
  [
    [50, 18],
    [65, 27],
  ],
  [
    [86, 45],
    [87, 58],
  ],
  [
    [70, 86],
    [48, 92],
  ],
];
export const moonRouteNames = [
  "Moon Base",
  "Crater Crossing",
  "Solar Ridge",
  "Lost Rover Valley",
  "Earth Signal",
  "Moon Base",
];
export function moonTravel(
  previous: number | null,
  count: number,
  motion: boolean,
) {
  return motion && previous !== null && count === previous + 1 && count <= 5
    ? { from: count - 1, to: count }
    : null;
}
export function moonRouteState(segment: number, completed: number) {
  return segment < completed
    ? "traveled"
    : segment === completed
      ? "next"
      : "future";
}
export function MoonProgressPath({ completed }: { completed: number }) {
  const arrow = useId().replaceAll(":", "");
  return (
    <svg
      className="moon-progression-path"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      role="img"
      aria-label={`Expedition route: ${moonRouteNames.join(" → ")}. ${completed} of 5 objectives complete.`}
    >
      <defs>
        <marker
          id={arrow}
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
        >
          <path d="M1 1 9 5 1 9Z" fill="#f9df91" />
        </marker>
      </defs>
      {moonBends.map((bends, i) => {
        const start = moonAnchors[i],
          end = moonAnchors[i + 1],
          points = [
            [start[0] - 8, start[1] + 2],
            ...bends,
            [end[0] - 8, end[1] + 2],
          ];
        return (
          <path
            key={i}
            className={`moon-route-segment route-${moonRouteState(i, completed)}`}
            data-leg={`${moonRouteNames[i]} → ${moonRouteNames[i + 1]}`}
            d={points.map(([x, y], n) => `${n ? "L" : "M"}${x} ${y}`).join(" ")}
            markerEnd={`url(#${arrow})`}
          />
        );
      })}
    </svg>
  );
}
