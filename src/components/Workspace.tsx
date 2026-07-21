"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Check,
  Download,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Undo2,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";
import { useWorkspace } from "@/store/workspace";
import { deterministicProposal } from "@/lib/copilot";
import type { CaptionState } from "@/lib/captions";
import { ShareTile } from "./ShareTile";

function useSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1200, height: 700 });
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, size };
}

export function Workspace({ guided = true }: { guided?: boolean }) {
  const { ref, size } = useSize();
  const {
    tiles,
    scenario,
    mode,
    proposal,
    history,
    isHost,
    focusSnapshot,
    publishedVersion,
    setScenario,
    setMode,
    setProposal,
    applyProposal,
    publishSharedLayout,
    applyHostLayout,
    restoreFocus,
    resetLayout,
    undo,
  } = useWorkspace();
  const [panel, setPanel] = useState(true);
  const [instruction, setInstruction] = useState(
    "Compare actual revenue with the Q4 forecast and keep the review deck visible.",
  );
  const [busy, setBusy] = useState(false);
  const [intro, setIntro] = useState(0);
  const [caption, setCaption] = useState("");
  const [captionState, setCaptionState] = useState<CaptionState>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  async function propose(text = instruction) {
    setBusy(true);
    setCaptionState((state) => state === "capturing" ? "processing" : state);
    try {
      const response = await fetch("/api/arrange", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ instruction: text, scenario, tiles, mode, permissions: { isHost } }),
      });
      if (!response.ok) throw new Error("Proposal request failed");
      setProposal(await response.json());
    } catch {
      setProposal(deterministicProposal(text, scenario, tiles));
    } finally {
      setBusy(false);
      setCaptionState((state) => state === "processing" ? "proposed" : state);
    }
  }

  function simulateCaption() {
    const line = "Hey Mosaic, compare the forecast against revenue and keep the deck visible.";
    setCaption(line);
    setCaptionState("capturing");
    timers.current.push(setTimeout(() => propose(line.replace(/^Hey Mosaic,?\s*/i, "")), 700));
  }

  function playIntro() {
    timers.current.forEach(clearTimeout);
    setIntro(1);
    [2, 3, 4, 0].forEach((value, index) => {
      timers.current.push(setTimeout(() => setIntro(value), (index + 1) * 1200));
    });
  }

  function accept(target: "personal" | "shared") {
    if (!proposal) return;
    applyProposal(proposal, target);
    setCaptionState("applied");
  }

  function dismiss() {
    setProposal(undefined);
    setCaptionState("dismissed");
  }

  const visible = intro === 1 ? [tiles[2]] : intro === 2 ? [tiles[1]] : intro === 3 ? [tiles[0]] : tiles;
  const sourceName = (id: string) => tiles.find((tile) => tile.id === id)?.applicationLabel ?? id;

  return (
    <main className="workspace">
      <nav className="topbar">
        <Link className="brand" href="/"><i>M</i><b>Mosaic</b></Link>
        <span className="crumb">Q3 Business Review</span>
        <span className={`status ${guided ? "guided" : "live"}`}>
          {guided ? "Guided demo · sample sources" : "Live workspace preview"}
        </span>
        <div className="spacer" />
        <select aria-label="Scenario" value={scenario} onChange={(event) => setScenario(event.target.value as "business" | "engineering")}>
          <option value="business">Business review</option>
          <option value="engineering">Engineering debug</option>
        </select>
        <button className="mode" onClick={() => setMode(mode === "personal" ? "shared" : "personal")}>
          <Users size={15} />{mode === "personal" ? "Personal canvas" : "Shared canvas"}
        </button>
        <button onClick={resetLayout}><RotateCcw size={15} />Reset layout</button>
        <button className="primary" onClick={() => setPanel(true)}><Sparkles size={15} />Ask Mosaic</button>
      </nav>

      <section className="stage">
        <div className="canvas" ref={ref}>
          {visible.map((tile) => <ShareTile key={tile.id} tile={tile} bounds={size} />)}
          {intro > 0 && (
            <div className="intro-copy">
              <span>{intro < 4 ? "One screen at a time" : "What if every workspace stayed visible?"}</span>
              <b>{intro === 4 ? "Mosaic keeps context alive." : "Every switch hides the previous context."}</b>
            </div>
          )}
          <button className="intro-trigger" onClick={playIntro}><Play size={14} />Play problem intro</button>
          <div className="participants">
            <span>AJ</span><span>MK</span><span>JR</span>
            <div><button aria-label="Microphone"><Mic size={16} /></button><button aria-label="Camera"><Video size={16} /></button><button className="leave">Leave</button></div>
          </div>
          {caption && <div className="caption"><b>Guided caption · Jordan</b> {caption}</div>}
        </div>

        {panel && (
          <aside className="copilot">
            <header>
              <div><span><Bot size={17} /></span><div><b>Mosaic Copilot</b><small>Turn intent into reviewable actions</small></div></div>
              <button aria-label="Close Copilot" onClick={() => setPanel(false)}><X size={17} /></button>
            </header>
            <div className="privacy"><span />Only your explicit instruction and source metadata are sent—not pixels, audio, or a transcript.</div>
            <label htmlFor="copilot-instruction">What matters right now?</label>
            <textarea id="copilot-instruction" value={instruction} onChange={(event) => setInstruction(event.target.value)} />
            <div className="chips">
              <button onClick={() => setInstruction("Compare actual revenue with the Q4 forecast")}>Compare actuals</button>
              <button onClick={() => setInstruction("Make the forecast the main view")}>Focus forecast</button>
              <button onClick={() => setInstruction("Keep all three visible")}>Show all</button>
              <button onClick={() => setInstruction("Switch to engineering debug")}>Engineering</button>
            </div>
            <button className="arrange" disabled={busy} onClick={() => propose()}><Sparkles size={16} />{busy ? "Thinking…" : "Propose workspace"}</button>
            <button className="voice" onClick={simulateCaption}><Mic size={15} />Run guided “Hey Mosaic” caption</button>
            {captionState !== "idle" && <div className="caption-state">Caption state: {captionState}</div>}

            {proposal && (
              <section className="proposal">
                <div className="proposal-label"><Sparkles size={13} />SUGGESTED SETUP</div>
                <h3>{proposal.layoutTitle}</h3>
                <p>{proposal.summary}</p>
                <div className="proposal-map">{proposal.tiles.filter((tile) => !tile.minimized).map((tile) => <i key={tile.id} style={{ left: `${tile.x * 100}%`, top: `${tile.y * 100}%`, width: `${tile.width * 100}%`, height: `${tile.height * 100}%` }} />)}</div>
                <small>{proposal.rationale}</small>
                <div className="proposal-detail"><b>Affected</b><span>{proposal.affectedSources.length ? proposal.affectedSources.map(sourceName).join(" · ") : "Canvas history"}</span></div>
                <div className="proposal-detail"><b>Actions</b>{proposal.actions.map((action) => <span key={`${action.type}-${action.tileId ?? "canvas"}`}>{action.description}</span>)}</div>
                {proposal.focusOrder.length > 0 && <div className="proposal-detail"><b>Focus order</b><span>{proposal.focusOrder.map(sourceName).join(" → ")}</span></div>}
                {proposal.decisionPrompts.length > 0 && <div className="proposal-detail"><b>Decision prompts</b>{proposal.decisionPrompts.map((prompt) => <span key={prompt}>{prompt}</span>)}</div>}
                <div className="proposal-actions">
                  <button className="apply" onClick={() => accept("personal")}><Check size={15} />Apply Personal</button>
                  {isHost && <button className="apply-shared" onClick={() => accept("shared")}><Upload size={15} />Apply Shared</button>}
                  <button onClick={dismiss}><X size={15} />Dismiss</button>
                </div>
                <span className="source">{proposal.source === "gpt" ? "Generated by GPT · validation passed" : "Deterministic · works without credentials"}</span>
              </section>
            )}

            <div className="canvas-actions">
              {focusSnapshot && <button onClick={restoreFocus}><RotateCcw size={15} />Restore focus</button>}
              {history.length > 0 && <button onClick={undo}><Undo2 size={15} />Undo last action</button>}
              {mode === "shared" && isHost && <button onClick={publishSharedLayout}><Upload size={15} />Publish Shared Layout</button>}
              {mode === "personal" && <button onClick={applyHostLayout}><Download size={15} />Apply Host Layout v{publishedVersion}</button>}
            </div>
            <section className="current">
              <label>CURRENT FOCUS</label>
              <b>{scenario === "business" ? "Revenue variance & Q4 planning" : "Authentication callback diagnosis"}</b>
              <p>{tiles.length} sources · {mode} canvas · {isHost ? "host controls" : "participant"}</p>
            </section>
          </aside>
        )}
      </section>
    </main>
  );
}
