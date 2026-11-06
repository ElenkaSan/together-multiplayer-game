export function readInviteCode(search: string) {
  const code = (new URLSearchParams(search).get("room") || "")
    .trim()
    .toUpperCase();
  return /^[A-Z0-9]{6}$/.test(code) ? code : "";
}
export function shouldRestoreSeat(
  seat: { code?: string } | null,
  inviteCode: string,
) {
  return !!seat && (!inviteCode || seat.code === inviteCode);
}

export type InviteInfo = { code: string; mode: "tiny" | "signal" };
export function inviteModeFor(code: string, info: InviteInfo | null) {
  return info?.code === code && (info.mode === "tiny" || info.mode === "signal")
    ? info.mode
    : null;
}

export function readInviteGame(search: string) {
  const game = new URLSearchParams(search).get("game");
  return game === "tiny" || game === "signal" ? game : null;
}
export function makeInviteLink(
  origin: string,
  code: string,
  mode: "tiny" | "signal",
) {
  const url = new URL("/", origin);
  url.searchParams.set("room", code);
  url.searchParams.set("game", mode);
  return url.toString();
}
