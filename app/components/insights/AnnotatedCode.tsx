"use client";

import { useState } from "react";
import { trackInsight } from "./track";

type Note = { line: number; note: string };

type Props = {
  language?: string;
  code: string;
  notes?: Note[];
};

export default function AnnotatedCode({ language = "txt", code, notes = [] }: Props) {
  const lines = code.replace(/\n$/, "").split("\n");
  const noteMap = new Map<number, string>();
  for (const n of notes) noteMap.set(n.line, n.note);
  const [active, setActive] = useState<number | null>(null);

  const toggle = (line: number) => {
    if (!noteMap.has(line)) return;
    const next = active === line ? null : line;
    setActive(next);
    if (next !== null) trackInsight("annotated_code_open", { line, language });
  };

  return (
    <div className="insight-code" data-lang={language}>
      <div className="insight-code-head">
        <span className="insight-code-lang">{language}</span>
        <span className="insight-code-notes">{notes.length} note{notes.length === 1 ? "" : "s"}</span>
      </div>
      <div className="insight-code-grid">
        <pre className="insight-code-pre">
          {lines.map((src, i) => {
            const ln = i + 1;
            const has = noteMap.has(ln);
            const isActive = active === ln;
            return (
              <span
                key={ln}
                className="insight-code-line"
                data-has-note={has}
                data-active={isActive}
                onClick={() => toggle(ln)}
              >
                <span className="insight-code-ln">{ln}</span>
                <span className="insight-code-src">{src || " "}</span>
                {has && <span className="insight-code-marker" aria-hidden>●</span>}
              </span>
            );
          })}
        </pre>
        <aside className="insight-code-gutter">
          {active !== null && noteMap.has(active) ? (
            <div className="insight-code-note">
              <div className="insight-code-note-head">line {active}</div>
              <p>{noteMap.get(active)}</p>
            </div>
          ) : (
            <div className="insight-code-hint">
              {notes.length === 0 ? "no notes" : "tap a marked line ●"}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
