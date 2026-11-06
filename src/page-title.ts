export function pageTitle({
  mode,
  adventure,
  screen,
  round,
}: {
  mode?: "tiny" | "signal" | null;
  adventure?: string;
  screen?: string;
  round?: number;
}) {
  if (!mode)
    return screen === "invite"
      ? "TOGETHER! — Join your team"
      : "TOGETHER! · Cooperative adventures";
  const game = mode === "tiny" ? "Tiny Heroes" : "Signal Lost";
  const detail =
    screen === "invite"
      ? "Join your team"
      : screen === "finished"
        ? "Mission complete"
        : adventure || "";
  const stage =
    round !== undefined &&
    ["briefing", "action", "locked", "result", "paused"].includes(screen || "")
      ? ` · ${mode === "tiny" ? "Stage" : "Sector"} ${round + 1}/5`
      : "";
  return `TOGETHER! — ${game}${detail ? " · " + detail : ""}${stage}`;
}
