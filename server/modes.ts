import {
  signalSectors,
  signalBrief,
  resolveSignal,
  defaultSignalPuzzle,
  type SignalPuzzle,
} from "./signal-puzzles.js";
import { mechanicFor } from "./adventure-mechanics.js";
import {
  forestRescue,
  getAdventure,
  tinyTools,
  defaultAdventureId,
} from "../shared/tiny-adventures.js";
import { solutionFor } from "./tiny-adventures.js";
export type Mode = "tiny" | "signal";
export type Action = Record<string, string>;
export interface Task {
  key: string;
  title: string;
  hint: string;
  options: { value: string; label: string }[];
}
export interface Brief {
  role: string;
  message: string;
  tasks: Task[];
  visuals?: string[];
  observations?: { text: string; icon: string }[];
}
export interface MissionRound {
  title: string;
  story: string;
  icon: string;
  target: string;
  hazard: string;
  power: string;
  frequency: string;
}
export const rounds: Record<Mode, MissionRound[]> = {
  tiny: forestRescue.rescues.map((r, i) => ({
    title: r.title,
    story: r.story,
    icon: r.icon,
    target: r.scene,
    hazard: r.scene,
    power: solutionFor(forestRescue.id, i).tool,
    frequency: "",
  })),
  signal: signalSectors.map((s) => ({
    ...s,
    target: "",
    hazard: "",
    power: "",
    frequency: "",
  })),
};
const opts = (pairs: string[][]) =>
  pairs.map(([value, label]) => ({ value, label }));
export function missionRound(
  mode: Mode,
  index: number,
  adventureId = defaultAdventureId,
): MissionRound {
  if (mode === "signal") return rounds.signal[index];
  const r = getAdventure(adventureId).rescues[index];
  return {
    title: r.title,
    story: r.story,
    icon: r.icon,
    target: r.scene,
    hazard: r.scene,
    power: solutionFor(adventureId, index).tool,
    frequency: "",
  };
}
export function brief(
  mode: Mode,
  index: number,
  slot: number,
  count: number,
  bonus: number,
  adventureId = defaultAdventureId,
  signal?: SignalPuzzle,
): Brief {
  const r = missionRound(mode, index, adventureId);
  if (mode === "tiny") {
    const pack = getAdventure(adventureId),
      resource = pack.mechanics?.resource;
    const custom = mechanicFor(pack.id);
    if (custom) return custom.brief(index, slot, count, bonus);
    if (slot === 0)
      return {
        role: "Team Captain",
        message: `Your rescue map: ${r.story} Helpers have clues about the right tool. You have ${bonus} kindness stars left. One star can cover one helper’s wrong or missing tool. Save some for later!`,
        tasks: [
          {
            key: "support",
            title: "Choose your team plan",
            hint: "Ask your helpers what they need, then decide.",
            options: opts([
              ["save", "⭐ Save our stars"],
              ...(bonus > 0 ? [["boost", "💛 Spend 1 star to help"]] : []),
            ]),
          },
        ],
      };
    const rescue = getAdventure(adventureId).rescues[index],
      clue =
        count > 2 && rescue.privateClues?.length
          ? rescue.privateClues[(slot - 1) % rescue.privateClues.length]
          : rescue.clue;
    return {
      role: "Little Hero",
      message: `Your secret clue: ${clue} Tell your captain.`,
      tasks: [
        {
          key: "tool",
          title: "What should you bring?",
          hint: "Pick a tool, then tap Ready!",
          options: rescue.tools.map((id) => ({
            value: id,
            label: `${tinyTools[id].icon} ${tinyTools[id].label}`,
          })),
        },
      ],
    };
  }
  return signalBrief(signal || defaultSignalPuzzle(index), slot, count);
}
export function resolve(
  mode: Mode,
  index: number,
  actions: Action[],
  bonus: number,
  adventureId = defaultAdventureId,
  signal?: SignalPuzzle,
) {
  const r = missionRound(mode, index, adventureId);
  if (mode === "tiny") {
    const resource = getAdventure(adventureId).mechanics?.resource;
    const custom = mechanicFor(adventureId);
    if (custom) return custom.resolve(index, actions, bonus);
    const spend = actions[0]?.support === "boost" && bonus > 0;
    const misses = actions.slice(1).filter((a) => a.tool !== r.power).length;
    const success = misses <= (spend ? 1 : 0);
    return {
      success,
      bonus: bonus - (spend ? 1 : 0),
      details: `The right tool was ${r.power}. ${actions.slice(1).filter((a) => a.tool === r.power).length}/${actions.length - 1} helpers brought it.${spend ? " A kindness star covered one missing tool." : ""}`,
      message: success
        ? "You did it! Rescue complete!"
        : "Oops! That didn't work. Let's try something else!",
    };
  }
  return resolveSignal(signal || defaultSignalPuzzle(index), actions, bonus);
}
