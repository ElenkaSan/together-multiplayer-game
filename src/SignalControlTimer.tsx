/** Display-only: the App derives remaining time from the existing server deadline/offset. */
export function SignalControlTimer({
  remaining,
  phase,
  connected,
}: {
  remaining: number;
  phase: string;
  connected: boolean;
}) {
  const seconds = Math.max(
    0,
    Math.ceil(Number.isFinite(remaining) ? remaining : 0),
  );
  const label =
    phase === "action"
      ? `${seconds}s remaining`
      : phase === "briefing"
        ? "Briefing"
        : phase === "locked"
          ? "Orders locked"
          : "Sector result";
  return (
    <div
      className="signal-control-timer"
      role="timer"
      aria-live="off"
      aria-label={`Sector timer: ${label}`}
    >
      <span>SECTOR TIME</span>
      <strong>{label}</strong>
      {!connected && <small>Reconnecting · timer continues</small>}
    </div>
  );
}
