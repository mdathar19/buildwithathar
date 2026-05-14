"use client";
import { useEffect, useRef } from "react";
import { nodes } from "@/lib/content";

export default function NodeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = "";

    const W = 400;
    const H = 360;
    const cx = W / 2;
    const cy = H / 2 - 6;
    const R = 130;
    const ns = "http://www.w3.org/2000/svg";

    const built = nodes.map((n) => {
      const rad = (n.angle * Math.PI) / 180;
      return { ...n, x: cx + Math.cos(rad) * R, y: cy + Math.sin(rad) * R, rad };
    });

    // Frame
    const frame = document.createElementNS(ns, "rect");
    frame.setAttribute("x", "1");
    frame.setAttribute("y", "1");
    frame.setAttribute("width", String(W - 2));
    frame.setAttribute("height", String(H - 2));
    frame.setAttribute("fill", "none");
    frame.setAttribute("stroke", "var(--line)");
    frame.setAttribute("stroke-dasharray", "4 6");
    svg.appendChild(frame);

    // Cross-hairs
    const hairs: [number, number, number, number][] = [
      [cx, 14, cx, 30],
      [cx, H - 30, cx, H - 14],
      [14, cy, 30, cy],
      [W - 30, cy, W - 14, cy],
    ];
    hairs.forEach(([x1, y1, x2, y2]) => {
      const l = document.createElementNS(ns, "line");
      l.setAttribute("x1", String(x1));
      l.setAttribute("y1", String(y1));
      l.setAttribute("x2", String(x2));
      l.setAttribute("y2", String(y2));
      l.setAttribute("stroke", "var(--accent)");
      l.setAttribute("stroke-width", "1");
      svg.appendChild(l);
    });

    // Concentric circles
    [R * 0.5, R, R * 1.2].forEach((r, i) => {
      const c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", String(cx));
      c.setAttribute("cy", String(cy));
      c.setAttribute("r", String(r));
      c.setAttribute("fill", "none");
      c.setAttribute("stroke", "var(--line)");
      c.setAttribute("stroke-dasharray", i === 1 ? "1 3" : "1 6");
      c.setAttribute("opacity", "0.7");
      svg.appendChild(c);
    });

    // Links center → nodes
    built.forEach((n) => {
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", String(cx));
      line.setAttribute("y1", String(cy));
      line.setAttribute("x2", String(n.x));
      line.setAttribute("y2", String(n.y));
      line.setAttribute("class", "link" + (n.flagship ? " live" : ""));
      svg.appendChild(line);
    });

    // Outer ring linking neighbors
    built.forEach((n, i) => {
      const next = built[(i + 1) % built.length];
      const arc = document.createElementNS(ns, "line");
      arc.setAttribute("x1", String(n.x));
      arc.setAttribute("y1", String(n.y));
      arc.setAttribute("x2", String(next.x));
      arc.setAttribute("y2", String(next.y));
      arc.setAttribute("class", "link");
      arc.setAttribute("opacity", "0.4");
      svg.appendChild(arc);
    });

    // Center node
    const center = document.createElementNS(ns, "circle");
    center.setAttribute("cx", String(cx));
    center.setAttribute("cy", String(cy));
    center.setAttribute("r", "22");
    center.setAttribute("class", "node center");
    svg.appendChild(center);
    const ctext = document.createElementNS(ns, "text");
    ctext.setAttribute("x", String(cx));
    ctext.setAttribute("y", String(cy + 3));
    ctext.setAttribute("text-anchor", "middle");
    ctext.setAttribute("class", "cn");
    ctext.textContent = "ATHAR";
    svg.appendChild(ctext);

    // Peripheral nodes
    built.forEach((n) => {
      const c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", String(n.x));
      c.setAttribute("cy", String(n.y));
      c.setAttribute("r", n.flagship ? "11" : "8");
      c.setAttribute("class", "node" + (n.flagship ? " flagship" : ""));
      svg.appendChild(c);

      if (n.flagship) {
        const d = document.createElementNS(ns, "circle");
        d.setAttribute("cx", String(n.x));
        d.setAttribute("cy", String(n.y));
        d.setAttribute("class", "ndot");
        d.setAttribute("r", "5");
        svg.appendChild(d);
      }

      const lx = n.x + Math.cos(n.rad) * 24;
      const ly = n.y + Math.sin(n.rad) * 24 + 3;
      const t = document.createElementNS(ns, "text");
      t.setAttribute("x", String(lx));
      t.setAttribute("y", String(ly));
      const cos = Math.cos(n.rad);
      t.setAttribute(
        "text-anchor",
        cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle"
      );
      t.setAttribute("class", "lbl");
      t.textContent = n.short;
      svg.appendChild(t);
    });

    // Corner labels
    const corners: [number, number, string, string?][] = [
      [10, 18, "[A0]"],
      [W - 10, 18, "[A1]", "end"],
      [10, H - 8, "[B0]"],
      [W - 10, H - 8, "[B1]", "end"],
    ];
    corners.forEach(([x, y, txt, anchor]) => {
      const t = document.createElementNS(ns, "text");
      t.setAttribute("x", String(x));
      t.setAttribute("y", String(y));
      if (anchor) t.setAttribute("text-anchor", anchor);
      t.textContent = txt;
      svg.appendChild(t);
    });
  }, []);

  return (
    <div className="node-graph brk">
      <span className="br-tl" />
      <span className="br-tr" />
      <span className="br-bl" />
      <span className="br-br" />
      <div className="hdr">
        <span>// NODE_TOPOLOGY.svg</span>
        <span className="ok">9/9 ONLINE</span>
      </div>
      <svg ref={svgRef} viewBox="0 0 400 360" />
      <div className="ftr">
        <span>fps: 60</span>
        <span>render: webgl_off</span>
        <span>lat: 8ms</span>
      </div>
    </div>
  );
}
