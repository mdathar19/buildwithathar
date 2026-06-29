"use client";

import { useEffect, useRef, useState } from "react";
import { trackInsight } from "./track";

export type SwarmNode = {
  key: string;
  label: string;
  short: string;
  def: string;
  color: string; // hex, e.g. "#5cf2a6"
};

type Props = {
  id: string;
  caption?: string;
  /** the orchestrator that splits the task and dispatches */
  orchestrator: SwarmNode;
  /** the parallel sub-agents (4–7 read best) */
  workers: SwarmNode[];
  /** the synthesis node that merges the survivors into one answer */
  synthesis: SwarmNode;
};

/**
 * AgentSwarm — what "ultracode" does, made physical.
 *
 * A left→right dataflow graph: an orchestrator fans a task out to N parallel
 * workers, who stream their results into a synthesis node. Toggle SOLO and
 * everything collapses to a single lane — one agent, one path, in series.
 * Toggle ULTRACODE and the whole swarm lights up, packets streaming down every
 * lane at once. The interaction IS the thesis: one prompt, a whole org chart.
 *
 * Deliberately a NEW idiom vs the other 3D pieces: ConceptNest orbits, Reasoning-
 * Loop pulses a ring, PlatformStack assembles/fragments — this one is animated
 * dataflow (packets traveling edges) + a serial-vs-parallel readout.
 *
 * SEO/a11y: every node label + definition + the readout render as real DOM
 * (client component → ships in SSR HTML). The canvas is pure enhancement; kill
 * JS or reduce motion and the labelled buttons, toggle, defs, and compare table
 * all still work.
 */
export default function AgentSwarm({ id, caption, orchestrator, workers, synthesis }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  // order: orchestrator (0) → workers (1..N) → synthesis (N+1)
  const all: SwarmNode[] = [orchestrator, ...workers, synthesis];
  const orchIdx = 0;
  const synthIdx = workers.length + 1;
  const [active, setActive] = useState<number>(0);
  const [ultra, setUltra] = useState(true);
  const [ready, setReady] = useState(false);

  const activeRef = useRef(active);
  activeRef.current = active;
  const ultraRef = useRef(ultra);
  ultraRef.current = ultra;

  const setActiveRef = useRef<(i: number, fromCanvas?: boolean) => void>(() => {});
  setActiveRef.current = (i: number, fromCanvas = false) => {
    setActive(i);
    trackInsight("agentswarm_select", { id, node: all[i]?.key, via: fromCanvas ? "canvas" : "legend" });
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || workers.length === 0) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import("three");
      if (disposed || !mountRef.current) return;
      const host = mountRef.current;

      const w = host.clientWidth || 480;
      const h = host.clientHeight || 380;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
      camera.position.set(0, 0.5, 8.6);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      host.appendChild(renderer.domElement);

      const group = new THREE.Group();
      group.rotation.x = -0.12;
      scene.add(group);

      const N = workers.length;
      const soloIdx = Math.floor(N / 2); // the single lane that stays lit in SOLO

      type Node = {
        mesh: any;
        glow: any;
        pos: any;
        base: number; // base radius
        role: "orch" | "worker" | "synth";
        workerPos: number; // index within workers (for solo test), -1 otherwise
        index: number; // index into `all`
        target: number;
        scale: number;
      };
      const nodes: Node[] = [];

      const mkNode = (n: SwarmNode, index: number, pos: any, radius: number, role: Node["role"], workerPos: number) => {
        const color = new THREE.Color(n.color);
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(radius, 28, 28),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })
        );
        mesh.position.copy(pos);
        mesh.userData.index = index;
        group.add(mesh);

        const glow = new THREE.Mesh(
          new THREE.SphereGeometry(radius * 1.7, 20, 20),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.14, depthWrite: false })
        );
        glow.position.copy(pos);
        group.add(glow);

        nodes.push({ mesh, glow, pos: pos.clone(), base: radius, role, workerPos, index, target: 1, scale: 1 });
      };

      // ---- layout: orchestrator (left) → workers (vertical fan) → synthesis (right)
      const ORCH_X = -2.8;
      const WORK_X = 0.1;
      const SYNTH_X = 2.95;
      const span = 2.5; // vertical half-spread of the worker fan
      mkNode(orchestrator, orchIdx, new THREE.Vector3(ORCH_X, 0, 0), 0.34, "orch", -1);
      workers.forEach((wk, i) => {
        const y = N === 1 ? 0 : (i / (N - 1) - 0.5) * 2 * span;
        // gentle depth stagger so the fan reads in 3D, not flat
        const z = Math.sin(i * 1.7) * 0.5;
        mkNode(wk, i + 1, new THREE.Vector3(WORK_X, y, z), 0.24, "worker", i);
      });
      mkNode(synthesis, synthIdx, new THREE.Vector3(SYNTH_X, 0, 0), 0.34, "synth", -1);

      // ---- edges: orch → worker (dispatch) and worker → synth (return) ----
      type Edge = { line: any; from: any; to: any; workerPos: number; dir: 1 | 2; baseOp: number };
      const edges: Edge[] = [];
      const addEdge = (fromNode: Node, toNode: Node, workerPos: number, dir: 1 | 2, baseOp: number) => {
        const geo = new THREE.BufferGeometry().setFromPoints([fromNode.pos.clone(), toNode.pos.clone()]);
        const line = new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({ color: 0x5cf2a6, transparent: true, opacity: 0 })
        );
        group.add(line);
        edges.push({ line, from: fromNode.pos.clone(), to: toNode.pos.clone(), workerPos, dir, baseOp });
      };
      const orchNode = nodes[orchIdx];
      const synthNode = nodes[synthIdx];
      nodes
        .filter((n) => n.role === "worker")
        .forEach((wn) => {
          addEdge(orchNode, wn, wn.workerPos, 1, 0.42); // dispatch
          addEdge(wn, synthNode, wn.workerPos, 2, 0.42); // return
        });

      // ---- packets: little spheres streaming along active edges ----
      type Packet = { mesh: any; edge: Edge; t: number; speed: number };
      const packets: Packet[] = [];
      const PACKET_GEO = new THREE.SphereGeometry(0.075, 12, 12);
      edges.forEach((edge) => {
        // two staggered packets per edge for a continuous-stream feel
        for (let k = 0; k < 2; k++) {
          const mesh = new THREE.Mesh(
            PACKET_GEO,
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
          );
          group.add(mesh);
          // dispatch packets lead, return packets trail — reads as a pipeline
          const phase = (edge.dir === 1 ? 0 : 0.5) + k * 0.5;
          packets.push({ mesh, edge, t: (phase + edge.workerPos * 0.12) % 1, speed: 0.012 + (edge.workerPos % 3) * 0.001 });
        }
      });

      // ---- interaction: drag orbit (both axes) + tap to select ----
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const pickable = nodes.map((n) => n.mesh);
      let dragging = false;
      let moved = 0;
      let lastX = 0;
      let lastY = 0;
      let velYaw = 0;
      let velPitch = 0;
      const PITCH_MIN = -1.1;
      const PITCH_MAX = 1.1;
      const clampPitch = (v: number) => Math.max(PITCH_MIN, Math.min(PITCH_MAX, v));

      const onDown = (e: PointerEvent) => {
        dragging = true;
        moved = 0;
        lastX = e.clientX;
        lastY = e.clientY;
        renderer.domElement.setPointerCapture?.(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        if (!dragging) {
          raycaster.setFromCamera(pointer, camera);
          renderer.domElement.style.cursor = raycaster.intersectObjects(pickable, false).length
            ? "pointer"
            : "grab";
          return;
        }
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        moved += Math.abs(dx) + Math.abs(dy);
        group.rotation.y += dx * 0.008;
        group.rotation.x = clampPitch(group.rotation.x + dy * 0.008);
        velYaw = dx * 0.0008;
        velPitch = dy * 0.0008;
        lastX = e.clientX;
        lastY = e.clientY;
      };
      const onUp = (e: PointerEvent) => {
        renderer.domElement.releasePointerCapture?.(e.pointerId);
        if (dragging && moved < 6) {
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(pickable, false);
          if (hit.length) {
            const idx = hit[0].object.userData.index as number;
            if (typeof idx === "number") setActiveRef.current(idx, true);
          }
        }
        dragging = false;
      };

      const el = renderer.domElement;
      el.style.cursor = "grab";
      el.style.touchAction = "pan-y";
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointerleave", onUp);

      const ro = new ResizeObserver(() => {
        const nw = host.clientWidth || w;
        const nh = host.clientHeight || h;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      });
      ro.observe(host);

      // ---- animation ----
      let lastActive = activeRef.current;
      const tmpA = new THREE.Vector3();
      const tmpB = new THREE.Vector3();

      // a worker lane is "live" in ultracode (all), or only the solo lane in solo
      const laneLive = (workerPos: number, ultraOn: boolean) => ultraOn || workerPos === soloIdx;

      const applyActive = (idx: number) => {
        nodes.forEach((n) => {
          n.target = n.index === idx ? 1.32 : 1;
        });
      };
      applyActive(lastActive);

      const tick = () => {
        if (disposed) return;
        const ultraOn = ultraRef.current;

        if (activeRef.current !== lastActive) {
          lastActive = activeRef.current;
          applyActive(lastActive);
        }

        // node presence: orchestrator + synthesis always full; workers depend on lane
        nodes.forEach((n) => {
          let present = 1;
          if (n.role === "worker") present = laneLive(n.workerPos, ultraOn) ? 1 : 0.12;
          const sel = n.index === lastActive;
          (n.mesh.material as any).opacity += ((sel ? 1 : present * 0.9) - (n.mesh.material as any).opacity) * 0.12;
          (n.glow.material as any).opacity += ((sel ? 0.34 : present * 0.16) - (n.glow.material as any).opacity) * 0.12;
          n.scale += (n.target - n.scale) * 0.14;
          n.mesh.scale.setScalar(n.scale);
          // worker "working" shimmer — subtle breathing while live
          if (n.role === "worker" && laneLive(n.workerPos, ultraOn) && !reduced) {
            const b = 1 + Math.sin(raf * 0.06 + n.workerPos) * 0.05;
            n.glow.scale.setScalar(b);
          }
        });

        // edges fade in only for live lanes
        edges.forEach((edge) => {
          const live = laneLive(edge.workerPos, ultraOn);
          const tgt = live ? edge.baseOp : 0.05;
          const m = edge.line.material as any;
          m.opacity += (tgt - m.opacity) * 0.12;
        });

        // packets stream along their edges (only visible on live lanes)
        packets.forEach((p) => {
          const live = laneLive(p.edge.workerPos, ultraOn);
          const m = p.mesh.material as any;
          if (!live) {
            m.opacity += (0 - m.opacity) * 0.15;
            return;
          }
          if (!reduced) {
            p.t += p.speed;
            if (p.t > 1) p.t -= 1;
          }
          tmpA.copy(p.edge.from);
          tmpB.copy(p.edge.to);
          p.mesh.position.lerpVectors(tmpA, tmpB, p.t);
          // tiny arc so packets bow off the straight line — feels alive
          p.mesh.position.y += Math.sin(Math.PI * p.t) * 0.12;
          // fade in/out at the endpoints so they don't pop
          const edgeFade = Math.sin(Math.PI * p.t);
          m.opacity += (0.2 + edgeFade * 0.8 - m.opacity) * 0.2;
        });

        // gentle idle yaw + drag inertia on both axes
        if (!dragging) {
          if (!reduced) group.rotation.y += 0.0012;
          group.rotation.y += velYaw;
          group.rotation.x = clampPitch(group.rotation.x + velPitch);
          velYaw *= 0.94;
          velPitch *= 0.92;
        }

        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointerleave", onUp);
        scene.traverse((o: any) => {
          if (o.geometry) o.geometry.dispose?.();
          if (o.material) {
            if (Array.isArray(o.material)) o.material.forEach((mm: any) => mm.dispose?.());
            else o.material.dispose?.();
          }
        });
        renderer.dispose();
        renderer.forceContextLoss?.();
        if (el.parentNode === host) host.removeChild(el);
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (cleanup) cleanup();
    };
    // build once; active + ultra are read live via refs inside the loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const current = all[active] ?? all[0];

  return (
    <figure className="insight-swarm" aria-label={caption || "Multi-agent fan-out diagram"}>
      <div className="insight-swarm-grid">
        <div className="insight-swarm-stagewrap">
          <div className="insight-swarm-stage" ref={mountRef} data-ready={ready} />
          <div className="insight-swarm-controls">
            <button
              type="button"
              className="insight-swarm-toggle"
              data-on={ultra}
              aria-pressed={ultra}
              onClick={() => {
                const next = !ultra;
                setUltra(next);
                trackInsight("agentswarm_toggle", { id, state: next ? "ultracode" : "solo" });
              }}
            >
              <span className="insight-swarm-toggle-dot" aria-hidden />
              {ultra ? "ultracode · swarm" : "solo · one agent"}
            </button>
            <span className="insight-swarm-hint" aria-hidden>
              {ready ? "toggle · drag to rotate · tap a node" : "loading 3D…"}
            </span>
          </div>
          <div className="insight-swarm-readout" aria-hidden>
            <div className="insight-swarm-readout-row">
              <span className="insight-swarm-readout-k">agents</span>
              <span className="insight-swarm-readout-v">{ultra ? `1 + ${workers.length} in parallel` : "1, working alone"}</span>
            </div>
            <div className="insight-swarm-readout-row">
              <span className="insight-swarm-readout-k">wall-clock</span>
              <span className="insight-swarm-readout-v">{ultra ? "fast · lanes run at once" : "slow · one thing at a time"}</span>
            </div>
            <div className="insight-swarm-readout-row">
              <span className="insight-swarm-readout-k">token bill</span>
              <span className="insight-swarm-readout-v" data-warn={ultra ? "true" : undefined}>
                {ultra ? "~15× a normal chat" : "1× (baseline)"}
              </span>
            </div>
          </div>
        </div>

        <div className="insight-swarm-side">
          <div className="insight-swarm-eyebrow">
            // {ultra ? "one prompt, a whole org chart" : "one prompt, one brain, in series"}
          </div>
          <ol className="insight-swarm-legend" role="listbox" aria-label="Swarm nodes">
            {all.map((n, i) => (
              <li key={n.key}>
                <button
                  type="button"
                  className="insight-swarm-item"
                  data-active={i === active}
                  data-role={i === orchIdx ? "orch" : i === synthIdx ? "synth" : "worker"}
                  role="option"
                  aria-selected={i === active}
                  onClick={() => setActiveRef.current(i, false)}
                >
                  <span className="insight-swarm-swatch" style={{ background: n.color }} aria-hidden />
                  <span className="insight-swarm-item-label">{n.label}</span>
                  <span className="insight-swarm-item-short">{n.short}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="insight-swarm-def" data-key={current?.key}>
            <div className="insight-swarm-def-head" style={{ color: current?.color }}>
              {current?.label}
            </div>
            <p>{current?.def}</p>
          </div>
        </div>
      </div>
      {caption && <figcaption className="insight-swarm-cap">{caption}</figcaption>}
    </figure>
  );
}
