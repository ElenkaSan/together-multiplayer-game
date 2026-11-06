import { MagicMechanismArt as MechanismArt } from "./MagicMechanismArt";
import { ExpertPicture } from "./ExpertPicture";
import { ShareClues } from "./ShareClues";
import { MoonMechanismArt } from "./ExpertArt";
import type { Engine } from "../server/engine";
import {
  expertStages,
  type MechanismPreview,
  type MoonBoard,
} from "../shared/expert-adventures";
import { ReadToMe } from "./TinyHeroExperience";
import { TinyProgression } from "./TinyProgression";
import { ExpeditionMap, ExpeditionProgress } from "./TeamExpedition";
import { ExpeditionIcon } from "./ExpeditionArt";
import { TinyIcon } from "./TinyIcon";
import { Animal, Celebration, useTinySound } from "./TinyWorld";
type View = ReturnType<Engine["view"]>;
export function ExpertRules({ id }: { id: string }) {
  const magic = id === "magic-kingdom";
  return (
    <>
      <ol className="hero-guide">
        {[
          "See your clue",
          magic ? "Try your magic" : "Plan ahead",
          "Ready",
          "Launch together",
        ].map((text, i) => (
          <li key={text}>
            <span className="guide-tile">
              <TinyIcon name={["look", "map", "ready", "star"][i] as any} />
              <strong>{text}</strong>
            </span>
          </li>
        ))}
      </ol>
      <details className="hero-full-rules">
        <summary>Read the mission rules</summary>
        <p>
          {magic
            ? "Change your mechanisms. Watch what happens on every screen."
            : "The Mission Control Board remembers your equipment and completed plans."}
        </p>
        <ol>
          <li>Share your private picture clue.</li>
          <li>Every player controls part of the expedition.</li>
          <li>
            Adjustments are free. Only the final team launch uses an attempt.
          </li>
          <li>
            Tap Ready when you agree. Changes ask everyone to confirm again.
          </li>
          <li>Captain launches after everyone is Ready.</li>
          <li>
            Two misses bring Team Assist. Finish without a badge, then replay if
            you wish.
          </li>
        </ol>
      </details>
    </>
  );
}
export function expertNarration(view: View) {
  const a = view.adventure!,
    magic = a.id === "magic-kingdom";
  if (view.phase === "lobby")
    return `Welcome to ${a.title}. ${a.intro}. Everyone controls part of our world. See your clue. ${magic ? "Try your magic. Changes are free." : "Plan ahead. Our Board remembers equipment and plans."} Tap Ready. Captain launches when everyone is ready.`;
  if (view.phase === "finished")
    return `${magic ? "The Kingdom Shines Again!" : "Mission Complete! Connection Restored!"} ${view.score} Adventure Badges. Choose another adventure or play again.`;
  if (view.phase === "result")
    return `${view.result?.assisted ? "Team Assist completed this stage without a badge." : view.result?.message} ${view.result?.details} ${view.result?.hint?.text || ""}`;
  return `${view.mission.story} ${view.brief?.message || ""} ${magic ? "Watch what your controls change." : `Our equipment: ${view.expert?.board.mobility || "not packed"}. Power kit: ${view.expert?.board.supply || "not packed"}. Return crossing: ${view.expert?.board.crossing || "not surveyed"}. Relay: ${view.expert?.board.relay || "not restored"}.`} Set your controls. Share your clue. Tap Ready.`;
}
export { MagicMechanismArt as MechanismArt } from "./MagicMechanismArt";
export function MissionBoard({
  board: b,
  preview: p,
}: {
  board: MoonBoard;
  preview: MechanismPreview;
}) {
  const labels = [
    ["Equipment", b.mobility || "Not packed", "rover"],
    ["Power kit", b.supply || "Not packed", "power"],
    ["Return crossing", b.crossing || "Not surveyed", "map"],
    ["Solar relay", b.relay || "Not restored", "sun"],
    ["Research rover", b.rover || "Not located", "rover"],
    ["Earth link", b.connection || "Not restored", "signal"],
  ];
  return (
    <div className="panel mission-control-board">
      <h3>Mission Control Board</h3>
      <ol>
        {labels.map(([title, value, icon]) => (
          <li key={title}>
            <ExpeditionIcon name={icon} />
            <strong>{title}</strong>
            <span>{value}</span>
          </li>
        ))}
      </ol>
      <p>
        {b.mobility === "grip"
          ? "Grip opens the ramp. Track search is always available."
          : b.mobility === "scanner"
            ? "Scanner opens remote search. The rim has a safe rail crossing."
            : "Your equipment choices will travel with you."}
      </p>
      <p>
        {b.supply === "battery"
          ? "Battery can power recovery and the Earth antenna."
          : b.supply === "solar"
            ? "Solar uses the restored relay for recovery and Earth signal."
            : "Choose a power kit together."}
      </p>
      {b.relay && (
        <p>
          Available working power: <strong>{p.capacity}</strong>.{" "}
          {b.relay === "store"
            ? "Stored reserve prepared."
            : "Scanning relay prepared."}
        </p>
      )}
      {b.assisted.length > 0 && (
        <small>{b.assisted.length} objective completed with Team Assist.</small>
      )}
    </div>
  );
}
export function ExpertAdventure({
  view,
  connected,
  pending,
  remaining,
  command,
}: {
  view: View;
  connected: boolean;
  pending: boolean;
  remaining: number;
  command: (d: Record<string, unknown>) => Promise<unknown>;
}) {
  const { play } = useTinySound(),
    a = view.adventure!,
    magic = a.id === "magic-kingdom",
    stage = expertStages(a.id)[view.round],
    state = view.expert,
    me = view.players.find((p) => p.id === view.me)!,
    captain = view.players[0]?.id === view.me,
    host = view.host === view.me,
    editable = view.phase === "action" && connected && !pending;
  const scope = {
    round: view.round,
    attempt: a.attempt,
    adventureId: a.id,
    run: view.progression?.run,
    version: state?.version,
  };
  const allReady = state?.explorers.every((p) => p.ready && p.connected);
  return (
    <section
      className={`play-area team-expedition expert-expedition ${magic ? "magic-expedition" : "moon-expedition"}`}
    >
      <ShareClues
        view={view}
        connected={connected}
        pending={pending}
        command={command}
      />
      <ReadToMe
        text={expertNarration(view)}
        context={`${view.code}:${a.id}:${view.progression?.run}:${view.round}:${a.attempt}:${view.phase}:${view.submitted}`}
      />
      {!magic && !view.progression?.mapOpen && (
        <details
          className="rescue-map-toggle"
          open={
            view.phase === "lobby" ||
            view.phase === "result" ||
            view.phase === "finished"
          }
        >
          <summary>
            <TinyIcon name="map" />
            {a.title} map <span>{a.completed.length} / 5 complete</span>
          </summary>
          <ExpeditionMap view={view} connected={connected} />
        </details>
      )}
      {view.phase === "finished" ? (
        <TinyProgression
          view={view}
          connected={connected}
          pending={pending}
          command={command}
          showMap={magic}
        />
      ) : (
        <>
          {magic && (
            <details
              className="rescue-map-toggle"
              open={view.phase === "lobby" || view.phase === "result"}
            >
              <summary>
                <TinyIcon name="map" />
                {a.title} map <span>{a.completed.length} / 5 complete</span>
              </summary>
              <ExpeditionMap view={view} connected={connected} />
            </details>
          )}
          {view.phase === "lobby" ? (
            <div className="panel hero-lobby">
              <h1>{a.world}</h1>
              <p>{a.intro}</p>
              <ExpertRules id={a.id} />
              <button
                className="primary hero-ready"
                disabled={!connected || pending}
                onClick={() => command({ type: "ready" })}
              >
                {me.ready ? "Ready!" : "Tap Ready"}
              </button>
              {host && (
                <button
                  className="secondary hero-ready"
                  disabled={
                    !connected ||
                    pending ||
                    view.players.length < 2 ||
                    !view.players.every((p) => p.ready && p.connected)
                  }
                  onClick={() => command({ type: "start" })}
                >
                  Start expedition
                </button>
              )}
            </div>
          ) : view.phase === "paused" ? (
            <div className="panel">
              <h2>Wait for your team.</h2>
            </div>
          ) : (
            <>
              <div className="round-header">
                <h2>
                  {stage.location} · {view.round + 1}/5
                </h2>
                <span className="timer">
                  {view.phase === "action"
                    ? `${remaining}s`
                    : view.phase === "briefing"
                      ? "Look"
                      : view.phase === "locked"
                        ? "Launching"
                        : "Result"}
                </span>
              </div>
              <div className="expert-scene">
                <img
                  src={a.environment.mapAsset}
                  alt=""
                  style={{
                    objectPosition: `${stage.position[0]}% ${stage.position[1]}%`,
                  }}
                />
                <Animal
                  kind={view.round}
                  expression={
                    view.phase === "result"
                      ? view.result?.success
                        ? "celebrate"
                        : view.result?.assisted
                          ? "happy"
                          : "oops"
                      : view.phase === "action"
                        ? "thinking"
                        : "idle"
                  }
                />
                <p>{stage.story}</p>
              </div>
              {state &&
                (magic ? (
                  <MechanismArt
                    preview={state.preview}
                    settings={state.settings}
                    round={view.round}
                  />
                ) : (
                  <>
                    <MoonMechanismArt
                      round={view.round}
                      settings={state.settings}
                      board={state.board}
                      preview={state.preview}
                    />
                    <MissionBoard board={state.board} preview={state.preview} />
                    <div className="panel mission-live" aria-live="polite">
                      <strong>
                        Current plan ·{" "}
                        {view.round >= 3
                          ? `${state.preview.power} / ${state.preview.capacity} power`
                          : "Preparing expedition"}
                      </strong>
                      <p>
                        {view.round === 1
                          ? `${state.settings.route || "Choose crossing"} · ${state.settings.support || "Choose support"}`
                          : view.round === 3
                            ? `${state.settings.method || "Choose search method"} → ${state.settings.recovery || "Choose recovery"}`
                            : view.round === 4
                              ? `${state.settings.returnRoute || "Choose return"} → ${state.settings.antenna || "Aim antenna"}`
                              : "Our choices update together."}
                      </p>
                    </div>
                  </>
                ))}
              {view.phase === "result" ? (
                <div
                  className={`panel result ${view.result?.success ? "success" : "gentle-feedback"}`}
                  role="status"
                >
                  {view.result?.success && <Celebration />}
                  <h2>
                    {view.result?.assisted
                      ? "Team Assist — objective complete"
                      : view.result?.message}
                  </h2>
                  <p>
                    {view.result?.assisted
                      ? "Our expedition crew helped. No Adventure Badge this time."
                      : view.result?.details}
                  </p>
                  {view.result?.retry && (
                    <p className="rescue-hint">{view.result.hint?.text}</p>
                  )}
                  <ExpeditionProgress view={view} />
                  <small>
                    {view.result?.retry ? "Try again" : "Next stop"} in{" "}
                    {remaining}s
                  </small>
                </div>
              ) : (
                <>
                  <div className="panel private-panel">
                    <h3>Your clue · your controls</h3>
                    <div className="expedition-observations">
                      {view.brief?.observations?.map((o, i) => (
                        <div key={i}>
                          <ExpertPicture text={o.text} />
                          <p>{o.text}</p>
                        </div>
                      ))}
                    </div>
                    <p>
                      {magic
                        ? "Try it. Watch what changes."
                        : "Use our equipment. Think ahead."}
                    </p>
                    {stage.fields
                      .filter((f) => state?.ownKeys.includes(f.key))
                      .map((f) => (
                        <fieldset disabled={!editable} key={f.key}>
                          <legend>{f.title}</legend>
                          <div className="choices expedition-choices">
                            {f.options.map((o) => (
                              <button
                                type="button"
                                key={o.value}
                                aria-pressed={
                                  state?.settings[f.key] === o.value
                                }
                                className={
                                  state?.settings[f.key] === o.value
                                    ? "selected"
                                    : ""
                                }
                                onClick={() => {
                                  play("select");
                                  void command({
                                    type: "mechanism",
                                    ...scope,
                                    key: f.key,
                                    value: o.value,
                                  });
                                }}
                              >
                                <ExpertPicture
                                  text={o.label}
                                  field={f.key}
                                  value={o.value}
                                />
                                <span>{o.label}</span>
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      ))}
                    <button
                      className="primary hero-ready"
                      disabled={
                        !editable ||
                        !state ||
                        state.ready ||
                        !state.ownKeys.every((k) => state.settings[k])
                      }
                      onClick={() => {
                        play("ready");
                        void command({
                          type: "mechanism",
                          ...scope,
                          ready: true,
                        });
                      }}
                    >
                      <TinyIcon name="ready" />
                      {state?.ready ? "Ready!" : "Ready — I agree"}
                    </button>
                    <small>
                      Changes are free. Only our final launch uses an attempt.
                    </small>
                  </div>
                  <div className="panel expert-team">
                    <h3>Our shared plan</h3>
                    <ol>
                      {stage.fields.map((f) => {
                        const owner = state?.explorers.find((p) =>
                          p.keys.includes(f.key),
                        );
                        return (
                          <li key={f.key}>
                            <strong>{f.title}</strong>
                            <span>
                              {f.options.find(
                                (o) => o.value === state?.settings[f.key],
                              )?.label || "Choose"}
                            </span>
                            <small>
                              {owner?.name} ·{" "}
                              {owner?.ready
                                ? "Ready"
                                : owner?.connected
                                  ? "Exploring"
                                  : "Reconnecting"}
                            </small>
                          </li>
                        );
                      })}
                    </ol>
                    {captain ? (
                      <button
                        className="primary hero-ready"
                        disabled={!editable || !allReady}
                        onClick={() => {
                          play("ready");
                          void command({
                            type: "submit",
                            round: view.round,
                            attempt: a.attempt,
                            adventureId: a.id,
                            run: view.progression?.run,
                            stationVersion: state?.version,
                            action: { launch: "launch" },
                          });
                        }}
                      >
                        Launch team plan
                      </button>
                    ) : (
                      <p>Captain launches when everyone is Ready.</p>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
