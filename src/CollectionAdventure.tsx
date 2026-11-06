import {
  MeadowClueArt,
  MeadowChoiceArt,
  MeadowStageArt,
  MeadowTaskArt,
  MeadowMissionScene,
} from "./MeadowArt";
import {
  CloudShip,
  CloudMissionScene,
  CloudChoiceArt,
  CloudClueArt,
} from "./CloudArt";
import { ShareClues } from "./ShareClues";
import { useEffect, useRef, useState } from "react";
import type { Engine } from "../server/engine";
import {
  collectionStages,
  collectionOwnKeys,
  weatherRounds,
  weatherDescription,
  type CollectionBoard,
} from "../shared/collection-adventures";
import { ReadToMe } from "./TinyHeroExperience";
import { TinyProgression } from "./TinyProgression";
import { ExpeditionProgress } from "./TeamExpedition";
import { Animal, Celebration, useTinySound } from "./TinyWorld";
import { ExpeditionIcon } from "./ExpeditionArt";
import { TinyIcon } from "./TinyIcon";
type View = ReturnType<Engine["view"]>;
export function useCollectionMotion(connected = true) {
  const { enabled } = useTinySound();
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)"),
      update = () => setReduced(q.matches);
    q.addEventListener("change", update);
    return () => q.removeEventListener("change", update);
  }, []);
  return enabled && !reduced && connected;
}
export function SkyShip({
  sail,
  cargo,
}: { sail?: string; cargo?: string } = {}) {
  return <CloudShip sail={sail} cargo={cargo} />;
}
export function CollectionMap({
  view,
  adventureId,
  connected = true,
}: {
  view?: View;
  adventureId?: string;
  connected?: boolean;
}) {
  const id = view?.adventure?.id || adventureId || "cloud-adventure",
    cloud = id === "cloud-adventure",
    stages = collectionStages(id),
    count = view?.adventure?.completed.length || 0,
    motion = useCollectionMotion(connected),
    identity = `${id}:${view?.progression?.run || 0}`;
  const previous = useRef({ identity, count }),
    [travel, setTravel] = useState<{ from: number; to: number } | null>(null),
    [sequence, setSequence] = useState(-1);
  useEffect(() => {
    const old = previous.current;
    if (old.identity === identity && count === old.count + 1 && motion) {
      if (!cloud && count === 5) setSequence(0);
      else if (count < 5) setTravel({ from: count - 1, to: count });
    } else if (!motion || old.identity !== identity) {
      setTravel(null);
      setSequence(-1);
    }
    previous.current = { identity, count };
  }, [identity, count, motion, cloud]);
  useEffect(() => {
    if (!travel) return;
    const timer = setTimeout(() => setTravel(null), 3500);
    return () => clearTimeout(timer);
  }, [travel]);
  useEffect(() => {
    if (sequence < 0) return;
    const timer = setTimeout(
      () => setSequence(sequence >= 3 ? -1 : sequence + 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [sequence]);
  const current = Math.min(count, 4),
    from = cloud
      ? stages[travel?.from ?? current].position
      : [
          [44, 84],
          [61, 66],
          [48, 51],
          [42, 31],
          [61, 20],
        ][travel?.from ?? current],
    to = cloud
      ? stages[travel?.to ?? current].position
      : [
          [44, 84],
          [61, 66],
          [48, 51],
          [42, 31],
          [61, 20],
        ][travel?.to ?? current],
    weather = view?.expert?.board.weather,
    storm = cloud && view?.round === 2,
    checked = !!weather?.checked;
  const heroPositions = [
    [47, 20],
    [54, 21],
    [61, 20],
    [68, 21],
    [75, 20],
  ];
  return (
    <div
      className={`collection-map world-${cloud ? "cloud" : "meadow"} ${motion ? "collection-motion" : ""} ${storm ? "storm-active" : ""}`}
      data-progress={count}
      data-weather={checked ? "updated" : "initial"}
    >
      <div className="collection-landscape">
        <img
          src={`/art/tiny/${cloud ? "cloud" : "meadow"}-map.webp`}
          alt={stages.map((s) => s.location).join(", ")}
          width="1024"
          height="1536"
          style={
            !cloud
              ? {
                  filter: `saturate(${0.65 + count * 0.07}) brightness(${0.94 + count * 0.012})`,
                }
              : undefined
          }
        />
        <svg
          className="collection-path"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {stages.slice(0, -1).map((s, i) => (
            <path
              key={s.id}
              className={i < count ? "traveled" : i === current ? "next" : ""}
              d={`M${s.position.join(" ")} Q${s.position[0]} ${stages[i + 1].position[1]} ${stages[i + 1].position.join(" ")}`}
            />
          ))}
        </svg>
        {cloud ? (
          <>
            <div className="sky-cloud-drift" aria-hidden="true" />
            <div
              className={`storm-weather ${storm ? "visible" : ""} ${checked ? "crosswind" : ""}`}
              aria-label={
                storm
                  ? checked
                    ? "Storm Passage crosswind"
                    : "Storm Passage calm clouds"
                  : undefined
              }
            >
              {storm && (
                <>
                  <ExpeditionIcon name="wind" />
                  <span className="wind-streak" />
                  <span className="wind-streak" />
                  <span className="wind-streak" />
                </>
              )}
            </div>
          </>
        ) : (
          <MeadowLayers count={count} sequence={sequence} />
        )}
        <ol
          className="collection-markers"
          aria-label={`${cloud ? "Cloud Adventure" : "Meadow Rescue"} locations`}
        >
          {stages.map((s, i) => (
            <li
              key={s.id}
              className={`${i < count ? "done" : ""} ${i === current && count < 5 ? "active" : ""} ${cloud && i === 2 ? "storm-marker" : ""}`}
              style={{
                left: `${s.position[0]}%`,
                top: `${s.position[1] - 7}%`,
              }}
            >
              <span>{i < count ? <TinyIcon name="ready" /> : i + 1}</span>
              <strong>{s.location}</strong>
              {cloud && i === 2 && <ExpeditionIcon name="wind" />}
            </li>
          ))}
        </ol>
        {!cloud && count === 5 ? (
          <div
            className={`reunion-friends ${sequence >= 0 ? "gathering" : ""}`}
            aria-label="All five original Tiny Heroes at Great Friendship Tree"
          >
            {heroPositions.map(([x, y], i) => (
              <div
                key={i}
                style={
                  {
                    left: `${x}%`,
                    top: `${y}%`,
                    "--hero-delay": `${i * 0.12}s`,
                  } as React.CSSProperties
                }
              >
                <Animal kind={i} expression="celebrate" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`collection-traveler ${travel ? "traveling" : ""}`}
            style={
              {
                left: `${to[0]}%`,
                top: `${to[1]}%`,
                "--start-x": `${from[0]}%`,
                "--start-y": `${from[1]}%`,
                "--end-x": `${to[0]}%`,
                "--end-y": `${to[1]}%`,
              } as React.CSSProperties
            }
          >
            {cloud ? (
              <SkyShip />
            ) : (
              <Animal
                kind={current}
                expression={
                  view?.phase === "result" && view.result?.retry
                    ? "oops"
                    : travel
                      ? "happy"
                      : "idle"
                }
              />
            )}
          </div>
        )}
      </div>
      {(travel || sequence >= 0) && motion && (
        <div className="collection-transition" role="status">
          <span>
            {sequence >= 0
              ? [
                  "Water flows again.",
                  "Deliveries reach the tree.",
                  "Celebration lights shine.",
                  "Everyone comes together!",
                ][sequence]
              : `On to ${stages[travel!.to].location}!`}
          </span>
          <button
            className="secondary"
            onClick={() => {
              setTravel(null);
              setSequence(-1);
            }}
          >
            Skip →
          </button>
        </div>
      )}
      <div className="map-caption">
        <span>
          {cloud
            ? "Cloud Adventure · Level 9"
            : "Meadow Rescue · Level 10 · Master Challenge"}
        </span>
        <span>
          {count} / 5 {cloud ? "skyway steps" : "meadow systems"} restored
        </span>
      </div>
    </div>
  );
}
function MeadowLayers({
  count,
  sequence,
}: {
  count: number;
  sequence: number;
}) {
  return (
    <div
      className="meadow-restoration"
      aria-label={`${count} meadow systems restored`}
    >
      {count >= 2 && (
        <div
          className={`meadow-delivery restored-layer ${sequence === 1 ? "highlighted" : ""}`}
          aria-label="Orchard deliveries restored"
        >
          <MeadowTaskArt task="delivery" />
        </div>
      )}
      {count >= 3 && (
        <svg
          className={`meadow-water restored-layer ${sequence === 0 ? "highlighted" : ""}`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label="Water flows to orchard and flower gardens"
        >
          <path d="M43 48Q50 55 74 68M43 48Q39 39 28 30" />
          <circle cx="74" cy="68" r="2" />
          <circle cx="28" cy="30" r="2" />
        </svg>
      )}
      {count >= 3 && (
        <div
          className="meadow-blooms restored-layer"
          aria-label="Flowers blooming"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              style={{ left: `${20 + i * 6}%`, top: `${29 + (i % 2) * 3}%` }}
            >
              <MeadowChoiceArt field="flowers" value="upright" />
            </span>
          ))}
        </div>
      )}
      {count >= 4 && (
        <svg
          className={`meadow-lights restored-layer ${sequence === 2 ? "highlighted" : ""}`}
          viewBox="0 0 100 100"
          role="img"
          aria-label="Welcome and celebration lights are on"
        >
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={i} cx={38 + i * 6} cy={18 + (i % 2) * 2} r=".7" />
          ))}
        </svg>
      )}
      {count === 4 && (
        <div
          className="meadow-returning restored-layer"
          aria-label="Friends returning on dry land"
        >
          {[0, 1, 2].map((i) => (
            <Animal key={i} kind={i} expression="happy" />
          ))}
        </div>
      )}
    </div>
  );
}
export function CollectionMechanism({ view }: { view: View }) {
  const cloud = view.adventure!.id === "cloud-adventure",
    s = view.expert!.settings,
    b = view.expert!.board,
    round = view.round;
  if (cloud) return <CloudMissionScene round={round} settings={s} board={b} />;
  return (
    <MeadowMissionScene
      round={round}
      settings={s}
      completed={view.adventure!.completed.length}
    />
  );
}
export function CollectionRules({ id }: { id: string }) {
  const cloud = id === "cloud-adventure";
  return (
    <>
      <ol className="hero-guide">
        {[
          "See your clue",
          cloud ? "Adapt our plan" : "Connect our goals",
          "Ready",
          "Launch together",
        ].map((t, i) => (
          <li key={t}>
            <span className="guide-tile">
              <TinyIcon name={["look", "map", "ready", "star"][i] as any} />
              <strong>{t}</strong>
            </span>
          </li>
        ))}
      </ol>
      <details className="hero-full-rules">
        <summary>Read the mission rules</summary>
        <ol>
          <li>
            Everyone owns part of the plan. Share your private picture clues.
          </li>
          <li>Changes are free. Only the final launch uses an attempt.</li>
          <li>
            {cloud
              ? "Check Conditions changes weather once. In Storm Passage, first confirm two different routes. Those routes stay fixed, even on retry."
              : "Keep every meadow goal working. Different compatible plans earn the same Badge."}
          </li>
          <li>Every change asks the team to confirm Ready again.</li>
          <li>
            Captain launches after everyone is Ready. No fast taps needed.
          </li>
          <li>
            After two misses, Team Assist completes the stage without a Badge.
          </li>
        </ol>
      </details>
    </>
  );
}
export function collectionNarration(view: View) {
  const cloud = view.adventure!.id === "cloud-adventure",
    weather = view.expert?.board.weather;
  if (view.phase === "finished")
    return cloud
      ? "The Skyways Are Open Again! Choose another adventure or play again."
      : "Together, We Did It! The Great Meadow is alive again! Every player helped our team. Choose another adventure or play again.";
  if (view.phase === "lobby")
    return `${view.adventure!.intro} See your clue. ${cloud ? "Adapt our plan." : "Connect our goals."} Tap Ready. Launch together.`;
  if (view.phase === "result")
    return `${view.result?.assisted ? "Team Assist completed this stage without a Badge." : view.result?.message} ${view.result?.details} ${view.result?.hint?.text || ""}`;
  return `${view.mission.story} ${view.brief?.message || ""} ${cloud && weatherRounds.includes(view.round) ? weatherDescription(view.round, view.expert!.board) : ""} ${cloud && view.round === 2 ? (weather?.checked ? "The original routes are fixed. Choose one and adjust flight settings." : "Agree on primary and backup routes before checking conditions.") : ""} Set your controls. Share your clue. Tap Ready.`;
}
export function CollectionAdventure({
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
  command: (data: Record<string, unknown>) => Promise<unknown>;
}) {
  const { play } = useTinySound(),
    a = view.adventure!,
    cloud = a.id === "cloud-adventure",
    state = view.expert,
    stage = collectionStages(a.id)[view.round],
    captain = view.players[0]?.id === view.me,
    host = view.host === view.me,
    editable = connected && !pending && view.phase === "action",
    prep = cloud && view.round === 2 && !state?.board.weather?.checked,
    scope = {
      round: view.round,
      attempt: a.attempt,
      adventureId: a.id,
      run: view.progression?.run,
      version: state?.version,
    },
    keys = collectionOwnKeys(
      a.id,
      view.round,
      state?.ownKeys || [],
      state?.board || {},
    ),
    allReady = state?.explorers.every((x) => x.ready && x.connected),
    needsCheck =
      cloud &&
      weatherRounds.includes(view.round) &&
      !state?.board.weather?.checked;
  const send = (data: Record<string, unknown>) => {
    play(data.ready ? "ready" : "select");
    void command({ type: "mechanism", ...scope, ...data });
  };
  return (
    <section
      className={`play-area collection-expedition ${cloud ? "cloud-expedition" : "meadow-expedition"}`}
    >
      <ShareClues
        view={view}
        connected={connected}
        pending={pending}
        command={command}
      />
      <ReadToMe
        text={collectionNarration(view)}
        context={`${view.code}:${a.id}:${view.round}:${a.attempt}:${view.phase}:${state?.board.weather?.checked}`}
      />
      {!view.progression?.mapOpen && (
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
            {a.title} map <span>{a.completed.length} / 5 restored</span>
          </summary>
          <CollectionMap view={view} connected={connected} />
        </details>
      )}
      {view.phase === "finished" ? (
        <>
          <TinyProgression
            view={view}
            connected={connected}
            pending={pending}
            command={command}
            showMap={false}
          />
          {!cloud && !view.progression?.mapOpen && (
            <div className="panel master-team">
              <div
                className="master-emblem"
                role="img"
                aria-label="TOGETHER! Master Adventure"
              >
                <TinyIcon name="star" />
                <strong>TOGETHER!</strong>
                <span>Master Adventure</span>
              </div>
              <h2>Everyone made a difference.</h2>
              <ul>
                {view.players.map((p, i) => (
                  <li key={p.id}>
                    <TinyIcon name="ready" />
                    <strong>{p.name}</strong>
                    <span>
                      {collectionStages(a.id)[4]
                        .fields.filter((_, j) => j % view.players.length === i)
                        .map((f) => f.title)
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : view.phase === "lobby" ? (
        <div className="panel hero-lobby">
          <h1>{a.world}</h1>
          <p>{a.intro}</p>
          <CollectionRules id={a.id} />
          <button
            className="primary hero-ready"
            disabled={!connected || pending}
            onClick={() => command({ type: "ready" })}
          >
            {view.players.find((p) => p.id === view.me)?.ready
              ? "Ready!"
              : "Tap Ready"}
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
          <div className="collection-task">
            {cloud ? (
              <CloudShip label="Sky expedition" />
            ) : (
              <MeadowStageArt round={view.round} />
            )}
            <h3>{stage.story}</h3>
            <Animal
              kind={view.round}
              expression={
                view.phase === "result"
                  ? view.result?.retry
                    ? "oops"
                    : view.result?.success
                      ? "celebrate"
                      : "happy"
                  : "thinking"
              }
            />
          </div>
          {state && <CollectionMechanism view={view} />}
          {view.phase === "result" ? (
            <div
              className={`panel result ${view.result?.success ? "success" : "gentle-feedback"}`}
              role="status"
            >
              {view.result?.success && <Celebration />}
              <h2>
                {view.result?.assisted
                  ? "Team Assist — stage complete"
                  : view.result?.message}
              </h2>
              <p>
                {view.result?.assisted
                  ? "Our team helped. No Adventure Badge this time."
                  : view.result?.details}
              </p>
              {view.result?.retry && (
                <p className="rescue-hint">{view.result.hint?.text}</p>
              )}
              <ExpeditionProgress view={view} />
              <small>
                {view.result?.retry ? "Try again" : "Next stop"} in {remaining}s
              </small>
            </div>
          ) : (
            <>
              <div className="panel private-panel">
                <h3>Your clue · your controls</h3>
                <div className="expedition-observations">
                  {view.brief?.observations?.map((o, i) => (
                    <div key={i}>
                      {cloud ? (
                        <CloudClueArt icon={o.icon} text={o.text} />
                      ) : (
                        <MeadowClueArt icon={o.icon} text={o.text} />
                      )}
                      <p>{o.text}</p>
                    </div>
                  ))}
                </div>
                {prep && <p>Agree on our two routes first.</p>}
                {stage.fields
                  .filter((f) => keys.includes(f.key))
                  .map((f) => {
                    const fixed =
                      cloud &&
                      view.round === 2 &&
                      state?.board.weather?.checked &&
                      ["primary", "backup"].includes(f.key);
                    return (
                      <fieldset key={f.key} disabled={!editable || !!fixed}>
                        <legend>
                          {f.title}
                          {fixed ? " · Fixed" : ""}
                        </legend>
                        <div className="choices expedition-choices">
                          {f.options.map((o) => (
                            <button
                              type="button"
                              key={o.value}
                              aria-pressed={state?.settings[f.key] === o.value}
                              className={
                                state?.settings[f.key] === o.value
                                  ? "selected"
                                  : ""
                              }
                              onClick={() =>
                                send({ key: f.key, value: o.value })
                              }
                            >
                              {cloud ? (
                                <CloudChoiceArt field={f.key} value={o.value} />
                              ) : (
                                <MeadowChoiceArt
                                  field={
                                    view.round === 1 && f.key === "gate"
                                      ? "bridgeGate"
                                      : f.key
                                  }
                                  value={o.value}
                                />
                              )}
                              <span>{o.label}</span>
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    );
                  })}
                {prep && !keys.length && (
                  <p>Share your clue. Confirm the team’s route plan.</p>
                )}
                <button
                  className="primary hero-ready"
                  disabled={
                    !editable ||
                    !state ||
                    state.ready ||
                    !keys.every((k) => state.settings[k])
                  }
                  onClick={() => send({ ready: true })}
                >
                  <TinyIcon name="ready" />
                  {state?.ready
                    ? "Ready!"
                    : prep
                      ? "Confirm prepared routes"
                      : "Ready — I agree"}
                </button>
                <small>
                  Changes are free. Only final launch uses an attempt.
                </small>
              </div>
              <div className="panel expert-team">
                <h3>{prep ? "Our prepared routes" : "Our shared plan"}</h3>
                <ol>
                  {stage.fields
                    .filter(
                      (f) => !prep || ["primary", "backup"].includes(f.key),
                    )
                    .map((f) => {
                      const owner = state?.explorers.find((x) =>
                        x.keys.includes(f.key),
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
                {captain && needsCheck && (
                  <button
                    className="primary hero-ready"
                    disabled={!editable || (prep && !allReady)}
                    onClick={() => send({ operation: "check" })}
                  >
                    Check Conditions
                  </button>
                )}
                {captain ? (
                  <button
                    className="primary hero-ready"
                    disabled={!editable || !allReady || needsCheck}
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
    </section>
  );
}
