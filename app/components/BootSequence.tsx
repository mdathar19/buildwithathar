"use client";
import { useEffect, useState } from "react";

export default function BootSequence() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="boot">
      <div className="boot-body">
        <div className="boot-title">// initializing operator profile</div>
        <div className="row"><span className="k">&gt; locating signal</span><span className="v ok">ACQUIRED</span></div>
        <div className="row"><span className="k">&gt; operator_id</span><span className="v">athar_alam_0001</span></div>
        <div className="row"><span className="k">&gt; clearance</span><span className="v ok">SENIOR / PLATFORM</span></div>
        <div className="row"><span className="k">&gt; uptime</span><span className="v">5 yr · 1820 d</span></div>
        <div className="row"><span className="k">&gt; nodes online</span><span className="v ok">9 / 9</span></div>
        <div className="row"><span className="k">&gt; rendering interface</span><span className="v ok">OK</span></div>
        <div className="row"><span className="k">&gt; status</span><span className="v ok">● ONLINE</span></div>
      </div>
    </div>
  );
}
