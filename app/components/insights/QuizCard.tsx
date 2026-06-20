"use client";

import { useState } from "react";
import { trackInsight } from "./track";

type Option = {
  key: string;
  label: string;
  correct?: boolean;
};

type Props = {
  id: string;
  question: string;
  options: Option[];
  explain: string;
};

export default function QuizCard({ id, question, options, explain }: Props) {
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (key: string) => {
    if (picked) return;
    setPicked(key);
    const correct = options.find((o) => o.key === key)?.correct === true;
    trackInsight("quiz_answer", { quizId: id, optionKey: key, correct });
  };

  const correctKey = options.find((o) => o.correct)?.key;

  return (
    <div className="insight-quiz" data-answered={!!picked}>
      <div className="insight-quiz-head">
        <span className="insight-quiz-eyebrow">// quiz · guess first</span>
        <h4>{question}</h4>
      </div>
      <div className="insight-quiz-options">
        {options.map((opt) => {
          const isPicked = picked === opt.key;
          const isCorrect = opt.correct === true;
          const state = !picked
            ? "idle"
            : isPicked && isCorrect
            ? "right"
            : isPicked && !isCorrect
            ? "wrong"
            : isCorrect
            ? "show-correct"
            : "dim";
          return (
            <button
              key={opt.key}
              type="button"
              className="insight-quiz-opt"
              data-state={state}
              disabled={!!picked}
              onClick={() => choose(opt.key)}
            >
              <span className="insight-quiz-marker" aria-hidden>{opt.key.toUpperCase()}</span>
              <span className="insight-quiz-label">{opt.label}</span>
              {picked && isCorrect && <span className="insight-quiz-icon">✓</span>}
              {picked && isPicked && !isCorrect && <span className="insight-quiz-icon">✕</span>}
            </button>
          );
        })}
      </div>
      <div className="insight-quiz-explain" data-revealed={!!picked} aria-hidden={!picked}>
        <span className="insight-quiz-explain-tag">// why</span>
        <p>{explain}</p>
        {picked && correctKey && picked !== correctKey && (
          <p className="insight-quiz-explain-meta">correct answer: <strong>{correctKey.toUpperCase()}</strong></p>
        )}
      </div>
    </div>
  );
}
