"use client";

import { useEffect, useRef, useState } from "react";
import { trackInsight } from "./track";

export type LoopNode = {
  key: string;
  label: string;
  def: string;
  color: string; // hex
};

type Props = {
  id: string;
  caption?: string;
  /** the 4 ring stages, in clockwise order (e.g. Observe, Interpret, Reason, Act) */
  stages: LoopNode[];
  /** center node — the model/brain */
  model: LoopNode;
  /** external node the loop acts through — the tools */
  tools: LoopNode;
  /** per-step reliability for the live readout (0..1). default 0.95 */
  stepReliability?: number;
};

/**
 * ReasoningLoop — the agent's observe→reason→act loop as a living 3D orbit.
 * A pulse laps the ring; every completed lap bumps a step counter and the live
 * reliability readout (stepReliability ^ steps) ticks down — the post's
 * compounding-error point, made physical.
 *
 * SEO/a11y: every node label + definition renders as real DOM (client component,
 * so it's in the SSR HTML). The canvas is progressive enhancement; reduced motion
 * freezes the orbit and the labelled buttons + readouts still work.
 */
export default function ReasoningLoop({
  id,
  caption,
  stages,
  model,
  tools,
  stepReliability = 0.95,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const all: LoopNode[] = [...stages, model, tools];
  const [active, setActive] = useState<number>(0); // index into `all`
  const [steps, setSteps] = useState(0);
  const [ready, setReady] = useState(false);

  const activeRef = useRef(active);
  activeRef.current = active;
  const setActiveRef = useRef<(i: number, fromCanvas?: boolean) => void>(() => {});
  setActiveRef.current = (i: number, fromCanvas = false) => {
    setActive(i);
    trackInsight("reasoningloop_select", { id, node: all[i]?.key, via: fromCanvas ? "canvas" : "legend" });
  };
  const bumpRef = useRef<() => void>(() => {});
  bumpRef.current = () => setSteps((s) => s + 1);
  const resetRef = useRef<{ do: boolean }>({ do: false });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

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
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      camera.position.set(0, 0.2, 8.4);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      host.appendChild(renderer.domElement);

      const group = new THREE.Group();
      group.rotation.x = -0.35; // slight tilt so it reads as 3D
      scene.add(group);

      const R = 2.15;
      const startA = Math.PI / 2; // first stage at top
      const seg = (Math.PI * 2) / stages.length;
      const stageAngle = (i: number) => startA - i * seg; // clockwise
      const onRing = (a: number) => new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0);

      // ---- ring ----
      const ringPts: any[] = [];
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
      const ringLine = new THREE.LineLoop(
        ringGeo,
        new THREE.LineBasicMaterial({ color: 0x4f4f58, transparent: true, opacity: 0.6 })
      );
      group.add(ringLine);

      type NodeViz = {
        mesh: any;
        halo: any;
        pos: any;
        base: number;
        scale: number;
        target: number;
        index: number; // index into `all`
      };
      const nodes: NodeViz[] = [];

      const toolsPos = new THREE.Vector3(R + 1.7, 0, 0);
      const modelPos = new THREE.Vector3(0, 0, 0);

      const addNode = (node: LoopNode, pos: any, index: number, radius: number) => {
        const color = new THREE.Color(node.color);
        const geo = new THREE.SphereGeometry(radius, 28, 28);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.userData.index = index;
        group.add(mesh);
        // halo
        const haloGeo = new THREE.SphereGeometry(radius * 1.7, 20, 20);
        const haloMat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.12,
          depthWrite: false,
          side: THREE.BackSide,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.copy(pos);
        group.add(halo);
        nodes.push({ mesh, halo, pos, base: radius, scale: 1, target: 1, index });
      };

      // stages (index 0..stages.length-1)
      stages.forEach((s, i) => addNode(s, onRing(stageAngle(i)), i, 0.26));
      // model (center) — index stages.length
      addNode(model, modelPos, stages.length, 0.42);
      // tools — index stages.length + 1
      addNode(tools, toolsPos, stages.length + 1, 0.28);

      // spokes: model -> each stage (the brain drives every step)
      stages.forEach((_, i) => {
        const g = new THREE.BufferGeometry().setFromPoints([modelPos.clone(), onRing(stageAngle(i))]);
        group.add(
          new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x2a2a35, transparent: true, opacity: 0.7 }))
        );
      });
      // act -> tools connector
      const actPos = onRing(stageAngle(stages.length - 1));
      const actToolsGeo = new THREE.BufferGeometry().setFromPoints([actPos.clone(), toolsPos.clone()]);
      const actToolsLine = new THREE.Line(
        actToolsGeo,
        new THREE.LineBasicMaterial({ color: new THREE.Color(tools.color), transparent: true, opacity: 0.25 })
      );
      group.add(actToolsLine);

      // ---- pulse ----
      const pulseColor = new THREE.Color(model.color);
      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 18, 18),
        new THREE.MeshBasicMaterial({ color: pulseColor })
      );
      const pulseHalo = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 16, 16),
        new THREE.MeshBasicMaterial({ color: pulseColor, transparent: true, opacity: 0.3, depthWrite: false })
      );
      group.add(pulse);
      group.add(pulseHalo);

      const applyActive = (idx: number) => {
        nodes.forEach((nd) => {
          const on = nd.index === idx;
          nd.target = on ? 1.5 : 1;
          (nd.halo.material as any).opacity = on ? 0.3 : 0.12;
          (nd.mesh.material as any).opacity = on ? 1 : 0.85;
        });
      };
      applyActive(activeRef.current);

      // ---- interaction ----
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let dragging = false;
      let moved = 0;
      let lastX = 0;
      let velY = 0;
      const pickable = nodes.map((n) => n.mesh);

      const onDown = (e: PointerEvent) => {
        dragging = true;
        moved = 0;
        lastX = e.clientX;
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
        moved += Math.abs(dx);
        group.rotation.y += dx * 0.008;
        velY = dx * 0.0008;
        lastX = e.clientX;
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

      // ---- loop state ----
      let theta = startA; // pulse angle, decreasing (clockwise)
      let lastStageIdx = 0;
      let lastActive = activeRef.current;
      const speed = reduced ? 0 : 0.012; // rad/frame
      const TWO_PI = Math.PI * 2;
      const nearestStage = (a: number) => {
        // which stage angle is the pulse closest to
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < stages.length; i++) {
          let d = Math.abs(((a - stageAngle(i) + Math.PI) % TWO_PI) - Math.PI);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        return best;
      };

      const tick = () => {
        if (disposed) return;

        if (resetRef.current.do) {
          resetRef.current.do = false;
          theta = startA;
          lastStageIdx = 0;
        }

        if (activeRef.current !== lastActive) {
          lastActive = activeRef.current;
          applyActive(lastActive);
        }

        // advance pulse
        if (speed > 0) {
          theta -= speed;
          const p = onRing(theta);
          pulse.position.copy(p);
          pulseHalo.position.copy(p);

          const sIdx = nearestStage(theta);
          if (sIdx !== lastStageIdx) {
            // entered a new stage node -> ping it
            const node = nodes[sIdx];
            if (node) node.scale = 1.9;
            // completing the ring (Act -> Observe wrap) = one full step
            if (sIdx === 0 && lastStageIdx === stages.length - 1) {
              bumpRef.current();
            }
            lastStageIdx = sIdx;
          }
          // glow the act->tools line when pulse is on Act
          (actToolsLine.material as any).opacity =
            lastStageIdx === stages.length - 1 ? 0.7 : 0.18;
        } else {
          const p = onRing(startA);
          pulse.position.copy(p);
          pulseHalo.position.copy(p);
        }

        // settle rotation
        if (!dragging) {
          group.rotation.y += velY;
          velY *= 0.94;
        }

        // ease node scales
        nodes.forEach((nd) => {
          nd.scale += (nd.target - nd.scale) * 0.12;
          // a pinged stage decays back toward its active/idle target
          if (nd.scale > nd.target) nd.scale += (nd.target - nd.scale) * 0.06;
          nd.mesh.scale.setScalar(nd.scale);
          nd.halo.scale.setScalar(nd.scale);
        });
        const ph = 1 + Math.sin(theta * 6) * 0.12;
        pulseHalo.scale.setScalar(ph);

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
            if (Array.isArray(o.material)) o.material.forEach((m: any) => m.dispose?.());
            else o.material.dispose?.();
          }
        });
        renderer.dispose();
        if (el.parentNode === host) host.removeChild(el);
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const current = all[active] ?? all[0];
  const reliability = steps > 0 ? Math.pow(stepReliability, steps) * 100 : 100;

  return (
    <figure className="insight-loop" aria-label={caption || "Agent reasoning loop diagram"}>
      <div className="insight-loop-grid">
        <div className="insight-loop-stagewrap">
          <div className="insight-loop-stage" ref={mountRef} data-ready={ready} />
          <div className="insight-loop-readout" aria-live="polite">
            <div className="insight-loop-readout-row">
              <span className="insight-loop-readout-k">steps</span>
              <span className="insight-loop-readout-v">{steps}</span>
            </div>
            <div className="insight-loop-readout-row">
              <span className="insight-loop-readout-k">reliability</span>
              <span
                className="insight-loop-readout-v"
                data-warn={reliability < 60}
                data-danger={reliability < 35}
              >
                {reliability.toFixed(1)}%
              </span>
            </div>
            <button
              type="button"
              className="insight-loop-reset"
              onClick={() => {
                resetRef.current.do = true;
                setSteps(0);
                trackInsight("reasoningloop_reset", { id });
              }}
            >
              reset loop
            </button>
          </div>
          <div className="insight-loop-hint" aria-hidden>
            {ready ? "drag to rotate · tap a node" : "loading 3D…"}
          </div>
        </div>

        <div className="insight-loop-side">
          <div className="insight-loop-eyebrow">// while (!done) &#123; observe → reason → act &#125;</div>
          <ol className="insight-loop-legend" role="listbox" aria-label="Loop nodes">
            {all.map((nd, i) => (
              <li key={nd.key}>
                <button
                  type="button"
                  className="insight-loop-item"
                  data-active={i === active}
                  role="option"
                  aria-selected={i === active}
                  onClick={() => setActiveRef.current(i, false)}
                >
                  <span className="insight-loop-swatch" style={{ background: nd.color }} aria-hidden />
                  <span className="insight-loop-item-label">{nd.label}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="insight-loop-def">
            <div className="insight-loop-def-head" style={{ color: current?.color }}>
              {current?.label}
            </div>
            <p>{current?.def}</p>
          </div>
        </div>
      </div>
      {caption && <figcaption className="insight-loop-cap">{caption}</figcaption>}
    </figure>
  );
}
