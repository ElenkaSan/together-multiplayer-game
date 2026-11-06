import { oceanBrief, resolveOcean } from "./ocean-stations.js";
import { expeditionBrief, resolveExpedition } from "./team-expeditions.js";
import { iceBrief, resolveIce } from "./ice-expedition.js";
import type { Action, Brief } from "./modes.js";
export interface AdventureMechanic {
  brief: (index: number, slot: number, count: number, bonus: number) => Brief;
  resolve: (
    index: number,
    actions: Action[],
    bonus: number,
  ) => { success: boolean; bonus: number; details: string; message: string };
}
// Register each genuinely new world's mechanic here; the room engine stays unchanged.
const mechanics: Record<string, AdventureMechanic> = {
  "ice-rescue": { brief: iceBrief, resolve: resolveIce },
  "ocean-adventure": { brief: oceanBrief, resolve: resolveOcean },
  ...Object.fromEntries(
    ["jungle-adventure", "treasure-island", "desert-rescue"].map((id) => [
      id,
      {
        brief: (i: number, s: number, c: number) =>
          expeditionBrief(id, i, s, c),
        resolve: (i: number, a: Action[], b: number) =>
          resolveExpedition(id, i, a, b),
      },
    ]),
  ),
};
export function mechanicFor(adventureId: string) {
  return mechanics[adventureId];
}
