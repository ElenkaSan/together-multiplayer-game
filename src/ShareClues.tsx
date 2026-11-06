import { MeadowClueArt } from "./MeadowArt";
import { CloudClueArt } from "./CloudArt";
import { ExpertPicture } from "./ExpertPicture";
import type { Engine } from "../server/engine";
import { ExpeditionIcon } from "./ExpeditionArt";
import { TinyIcon } from "./TinyIcon";
import { ReadToMe } from "./TinyHeroExperience";
type View = ReturnType<Engine["view"]>;
export function ShareClues({
  view,
  connected,
  pending,
  command,
}: {
  view: View;
  connected: boolean;
  pending: boolean;
  command: (d: Record<string, unknown>) => Promise<unknown>;
}) {
  const expertPictures = ["magic-kingdom", "moon-mission"].includes(
    view.adventure?.id || "",
  );
  const clues = view.clues,
    captain =
      view.players.find((p) => p.id === view.me)?.role === "Team Captain";
  if (!clues || !["briefing", "action"].includes(view.phase)) return null;
  const bulk = !captain && view.players.length <= 4,
    allSent = clues.own.every((c) => c.shared);
  const scope = {
    round: view.round,
    attempt: view.adventure!.attempt,
    adventureId: view.adventure!.id,
    run: view.progression!.run,
  };
  const share = (index: number) =>
    command({ type: "share-clue", clue: index, ...scope });
  const instruction = captain
    ? "Share selected clues with your team. Combine them with the Team Clues below."
    : bulk
      ? "These are all your clues, not answer choices. Send them all to your captain."
      : "These are your clues, not answer choices. Share every clue with your captain.";
  return (
    <section className="panel share-clues" aria-label="Clue sharing">
      <h3>Your Private Clues</h3>
      <p>{instruction}</p>
      <div className="clue-sharing-list">
        {clues.own.map((c) => (
          <article key={c.index}>
            {view.adventure?.id === "meadow-rescue" ? (
              <MeadowClueArt icon={c.icon} text={c.text} />
            ) : view.adventure?.id === "cloud-adventure" ? (
              <CloudClueArt icon={c.icon} text={c.text} />
            ) : expertPictures ? (
              <ExpertPicture text={c.text} />
            ) : (
              <ExpeditionIcon
                name={c.icon}
                label={c.text}
                simple={(view.adventure?.level || 1) < 3}
              />
            )}
            <div>
              <p>{c.text}</p>
              {captain ? (
                <button
                  className="secondary"
                  disabled={c.shared || !connected || pending}
                  onClick={() => void share(c.index)}
                >
                  <TinyIcon name={c.shared ? "ready" : "map"} />
                  {c.shared ? "Shared with Team!" : "Share with Team"}
                </button>
              ) : bulk ? (
                c.shared && (
                  <span>
                    <TinyIcon name="ready" /> Shared!
                  </span>
                )
              ) : (
                <button
                  className="secondary"
                  disabled={c.shared || !connected || pending}
                  onClick={() => void share(c.index)}
                >
                  <TinyIcon name={c.shared ? "ready" : "map"} />
                  {c.shared ? "Shared!" : "Share with Captain"}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {bulk && (
        <div className="bulk-clue-share">
          <button
            className="primary"
            disabled={allSent || !connected || pending}
            onClick={() => void command({ type: "share-all-clues", ...scope })}
          >
            <TinyIcon name={allSent ? "ready" : "map"} />
            {allSent ? "All clues shared!" : "Share all clues"}
          </button>
          <p role="status">
            {clues.own.filter((c) => c.shared).length} / {clues.own.length}{" "}
            clues shared with Captain
          </p>
        </div>
      )}
      <ReadToMe
        context={`${view.code}:${view.round}:${view.adventure?.attempt}:shared-clues:${clues.received.length}:${clues.own.filter((c) => c.shared).length}`}
        text={`${captain ? "Your clues. Tap Share with Team to send selected information." : instruction} ${clues.own.map((c) => c.text).join(" ")} ${clues.received.length ? `Team clues. ${clues.received.map((c) => `${c.name}: ${c.text}`).join(" ")}` : bulk ? (allSent ? "All clues shared!" : "Tap Share all clues.") : ""}`}
      />
      {captain || clues.received.length > 0 ? (
        <div className="team-clues">
          <h3>Team Clues</h3>
          <p>
            {captain
              ? clues.allShared
                ? "All hero clues received. Make your team plan."
                : "Waiting for your heroes to share their clues."
              : "Information your captain explicitly shared with the team."}
          </p>
          <div className="clue-sharing-list" aria-live="polite">
            {clues.received.map((c) => (
              <article key={`${c.playerId}:${c.index}`}>
                {view.adventure?.id === "meadow-rescue" ? (
                  <MeadowClueArt icon={c.icon} text={c.text} />
                ) : view.adventure?.id === "cloud-adventure" ? (
                  <CloudClueArt icon={c.icon} text={c.text} />
                ) : expertPictures ? (
                  <ExpertPicture text={c.text} />
                ) : (
                  <ExpeditionIcon
                    name={c.icon}
                    label={c.text}
                    simple={(view.adventure?.level || 1) < 3}
                  />
                )}
                <div>
                  <strong>{c.name}</strong>
                  <p>{c.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <p role="status">
          {allSent
            ? view.teamPlan
              ? "Captain’s plan is ready. Review it below, then tap I agree — Ready or Let’s rethink."
              : view.adventure?.mechanics?.primary === "expedition"
                ? "Clues shared! Waiting for Captain’s Plan."
                : "Clues shared! Choose your actions below."
            : bulk
              ? "Tap Share all clues to help your team."
              : "Share every clue to help your team."}
        </p>
      )}
    </section>
  );
}
