"use client";

import { useMemo, useState } from "react";
import { trackInsight } from "./track";

type Props = {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  initial?: number;
  unit?: string;
  formula?: string;
  template?: string;
  hint?: string;
};

function makeFormula(expr: string): (v: number) => number {
  try {
    return new Function("v", `with(Math){return (${expr})}`) as (v: number) => number;
  } catch {
    return (v) => v;
  }
}

function interp(tpl: string, v: number, result: number): string {
  return tpl
    .replace(/\{v\}/g, String(v))
    .replace(/\{result\}/g, String(Math.round(result * 100) / 100));
}

export default function ParamTinker({
  id,
  label,
  min,
  max,
  step = 1,
  initial,
  unit = "",
  formula = "v",
  template = "{result}",
  hint,
}: Props) {
  const [value, setValue] = useState<number>(initial ?? Math.round((min + max) / 2));
  const fn = useMemo(() => makeFormula(formula), [formula]);
  const result = fn(value);

  return (
    <div className="insight-tinker">
      <div className="insight-tinker-head">
        <span className="insight-tinker-eyebrow">// tinker</span>
        <h4>{label}</h4>
      </div>
      <div className="insight-tinker-body">
        <div className="insight-tinker-row">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            onMouseUp={() => trackInsight("tinker_change", { id, value })}
            onTouchEnd={() => trackInsight("tinker_change", { id, value })}
            className="insight-tinker-slider"
            aria-label={label}
          />
          <div className="insight-tinker-value">
            {value}
            {unit && <span className="insight-tinker-unit">{unit}</span>}
          </div>
        </div>
        <div className="insight-tinker-output">
          {interp(template, value, result)}
        </div>
        {hint && <div className="insight-tinker-hint">{hint}</div>}
      </div>
    </div>
  );
}
