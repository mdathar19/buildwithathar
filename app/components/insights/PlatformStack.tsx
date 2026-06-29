"use client";

import { useEffect, useRef, useState } from "react";
import { trackInsight } from "./track";

export type StackTile = {
  key: string;
  label: string;
  short: string;
  def: string;
  color: string; // hex, e.g. "#ffd54f"
};

type Props = {
  id: string;
  caption?: string;
  /** the surrounding lifecycle surfaces — rendered around the platform (max 8 read best) */
  tiles: StackTile[];
  /** the center, elevated tile — the model layer (Model Garden / Gemini) */
  center: StackTile;
};

/**
 * PlatformStack — the "unified platform" argument, made physical.
 *
 * Toggle between FRAGMENTED (every MLOps surface a disconnected tool you'd
 * otherwise stitch together yourself) and UNIFIED (the same surfaces snapped
 * onto one platform with a live mesh + the model layer at the core). The morph
 * IS the thesis: a platform isn't a model, it's the assembly line around it.
 *
 * Distinct on purpose from ConceptNest (orbit shells) and ReasoningLoop (ring +
 * pulse): the interaction here is assemble/fragment, not orbit-and-tap.
 *
 * SEO/a11y: every tile label + definition renders as real DOM (client component,
 * so it ships in the SSR HTML). The canvas is progressive enhancement — kill JS
 * or reduce motion and the labelled buttons, the toggle, and the definitions all
 * still work.
 */
export default function PlatformStack({ id, caption, tiles, center }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const all: StackTile[] = [...tiles, center]; // center is last index
  const centerIdx = tiles.length;
  const [active, setActive] = useState<number>(centerIdx);
  const [unified, setUnified] = useState(true);
  const [ready, setReady] = useState(false);

  const activeRef = useRef(active);
  activeRef.current = active;
  const unifiedRef = useRef(unified);
  unifiedRef.current = unified;

  const setActiveRef = useRef<(i: number, fromCanvas?: boolean) => void>(() => {});
  setActiveRef.current = (i: number, fromCanvas = false) => {
    setActive(i);
    trackInsight("platformstack_select", { id, tile: all[i]?.key, via: fromCanvas ? "canvas" : "legend" });
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || tiles.length === 0) return;

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
      camera.position.set(0, 2.4, 8.2);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      host.appendChild(renderer.domElement);

      const group = new THREE.Group();
      group.rotation.x = -0.5; // look down onto the platform
      scene.add(group);

      // ---- layout: 8 perimeter cells of a 3x3 grid (center reserved) ----
      const S = 1.5; // grid spacing
      const cells: [number, number][] = [
        [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0],
      ];

      type Tile = {
        slab: any;
        edges: any;
        halo: any;
        unifiedPos: any;
        scatterPos: any;
        baseY: number;
        scale: number;
        target: number;
        index: number;
      };
      const built: Tile[] = [];

      const mkTile = (t: StackTile, index: number, unifiedPos: any, scatterPos: any, size: number, baseY: number) => {
        const color = new THREE.Color(t.color);
        const geo = new THREE.BoxGeometry(size, 0.16, size);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
        const slab = new THREE.Mesh(geo, mat);
        slab.userData.index = index;
        group.add(slab);

        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
        );
        group.add(edges);

        const halo = new THREE.Mesh(
          new THREE.BoxGeometry(size * 1.5, 0.04, size * 1.5),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, depthWrite: false })
        );
        group.add(halo);

        built.push({
          slab, edges, halo,
          unifiedPos, scatterPos, baseY,
          scale: 1, target: 1, index,
        });
      };

      // perimeter tiles
      tiles.forEach((t, i) => {
        const [gx, gz] = cells[i % cells.length];
        const uPos = new THREE.Vector3(gx * S, 0, gz * S);
        // deterministic "chaotic" scatter — pushed out + tumbled in depth
        const sPos = new THREE.Vector3(
          gx * S * 2.5 + Math.cos(i * 2.3) * 0.9,
          Math.sin(i * 1.9) * 1.7,
          gz * S * 2.5 + Math.sin(i * 1.3) * 0.9
        );
        mkTile(t, i, uPos, sPos, 0.74, 0);
      });

      // center / model layer — elevated, larger, brighter
      const cUnified = new THREE.Vector3(0, 0.55, 0);
      const cScatter = new THREE.Vector3(0, 3.0, 0);
      mkTile(center, centerIdx, cUnified, cScatter, 1.0, 0.55);

      // ---- platform base grid (fades in when unified) ----
      const baseGrid = new THREE.GridHelper(5.2, 8, 0x2f7d6a, 0x224b44);
      (baseGrid.material as any).transparent = true;
      (baseGrid.material as any).opacity = 0;
      (baseGrid.material as any).depthWrite = false;
      baseGrid.position.y = -0.55;
      group.add(baseGrid);

      const baseRing = new THREE.Mesh(
        new THREE.RingGeometry(3.0, 3.08, 64),
        new THREE.MeshBasicMaterial({ color: 0x5cf2a6, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
      );
      baseRing.rotation.x = -Math.PI / 2;
      baseRing.position.y = -0.54;
      group.add(baseRing);

      // ---- connective mesh: spokes (center -> each tile) + perimeter ring ----
      type Link = { line: any; a: number; b: number }; // indices into built
      const links: Link[] = [];
      const addLink = (a: number, b: number, baseOp: number) => {
        const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        const line = new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({ color: 0x5cf2a6, transparent: true, opacity: 0 })
        );
        line.userData.baseOp = baseOp;
        group.add(line);
        links.push({ line, a, b });
      };
      // perimeter ring (pipeline order)
      for (let i = 0; i < tiles.length; i++) addLink(i, (i + 1) % tiles.length, 0.32);
      // spokes from the model core to every surface
      for (let i = 0; i < tiles.length; i++) addLink(centerIdx, i, 0.5);

      // ---- interaction: drag orbit + tap to select ----
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const pickable = built.map((b) => b.slab);
      let dragging = false;
      let moved = 0;
      let lastX = 0;
      let velY = 0;

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

      // ---- animation state ----
      let morph = unifiedRef.current ? 1 : 0; // 0 = fragmented, 1 = unified
      let lastActive = activeRef.current;
      const tmpA = new THREE.Vector3();
      const tmpB = new THREE.Vector3();

      const applyActive = (idx: number) => {
        built.forEach((b) => {
          const on = b.index === idx;
          b.target = on ? 1.28 : 1;
          (b.slab.material as any).opacity = on ? 1 : b.index === centerIdx ? 0.95 : 0.85;
          (b.halo.material as any).opacity = on ? 0.4 : b.index === centerIdx ? 0.22 : 0.14;
        });
      };
      applyActive(lastActive);

      const tick = () => {
        if (disposed) return;

        if (activeRef.current !== lastActive) {
          lastActive = activeRef.current;
          applyActive(lastActive);
        }

        // ease morph toward the toggle target
        const targetMorph = unifiedRef.current ? 1 : 0;
        morph += (targetMorph - morph) * 0.08;
        const m = morph;
        const em = m * m * (3 - 2 * m); // smoothstep for snappier settle

        // place each tile between scatter (0) and unified (1)
        built.forEach((b) => {
          tmpA.copy(b.scatterPos);
          tmpB.copy(b.unifiedPos);
          b.slab.position.lerpVectors(tmpA, tmpB, em);
          b.edges.position.copy(b.slab.position);
          b.halo.position.copy(b.slab.position);
          b.halo.position.y -= 0.12;
          // tiles tumble while fragmented, lie flat when unified
          const tumble = (1 - em) * (b.index + 1) * 0.6;
          b.slab.rotation.set(tumble * 0.7, tumble, tumble * 0.4);
          b.edges.rotation.copy(b.slab.rotation);
          // ease scale
          b.scale += (b.target - b.scale) * 0.14;
          b.slab.scale.setScalar(b.scale);
          b.edges.scale.setScalar(b.scale);
        });

        // links + base only present when assembled
        links.forEach((lk) => {
          const A = built[lk.a].slab.position;
          const B = built[lk.b].slab.position;
          const pos = lk.line.geometry.attributes.position;
          pos.setXYZ(0, A.x, A.y, A.z);
          pos.setXYZ(1, B.x, B.y, B.z);
          pos.needsUpdate = true;
          (lk.line.material as any).opacity = em * (lk.line.userData.baseOp as number);
        });
        (baseGrid.material as any).opacity = em * 0.5;
        (baseRing.material as any).opacity = em * 0.45;

        // gentle auto-spin when assembled & idle
        if (!dragging) {
          if (!reduced && unifiedRef.current) group.rotation.y += 0.0014;
          group.rotation.y += velY;
          velY *= 0.94;
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
    // build once; active + unified are read live via refs inside the loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const current = all[active] ?? all[0];

  return (
    <figure className="insight-stack" aria-label={caption || "Unified ML platform diagram"}>
      <div className="insight-stack-grid">
        <div className="insight-stack-stagewrap">
          <div className="insight-stack-stage" ref={mountRef} data-ready={ready} />
          <div className="insight-stack-controls">
            <button
              type="button"
              className="insight-stack-toggle"
              data-on={unified}
              aria-pressed={unified}
              onClick={() => {
                const next = !unified;
                setUnified(next);
                trackInsight("platformstack_toggle", { id, state: next ? "unified" : "fragmented" });
              }}
            >
              <span className="insight-stack-toggle-dot" aria-hidden />
              {unified ? "Unified · Vertex AI" : "Fragmented stack"}
            </button>
            <span className="insight-stack-hint" aria-hidden>
              {ready ? "toggle · drag to rotate · tap a tile" : "loading 3D…"}
            </span>
          </div>
        </div>

        <div className="insight-stack-side">
          <div className="insight-stack-eyebrow">
            // {unified ? "one platform, one lifecycle" : "eight tools you wire yourself"}
          </div>
          <ol className="insight-stack-legend" role="listbox" aria-label="Platform surfaces">
            {all.map((t, i) => (
              <li key={t.key}>
                <button
                  type="button"
                  className="insight-stack-item"
                  data-active={i === active}
                  data-core={i === centerIdx}
                  role="option"
                  aria-selected={i === active}
                  onClick={() => setActiveRef.current(i, false)}
                >
                  <span className="insight-stack-swatch" style={{ background: t.color }} aria-hidden />
                  <span className="insight-stack-item-label">{t.label}</span>
                  <span className="insight-stack-item-short">{t.short}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="insight-stack-def" data-key={current?.key}>
            <div className="insight-stack-def-head" style={{ color: current?.color }}>
              {current?.label}
            </div>
            <p>{current?.def}</p>
          </div>
        </div>
      </div>
      {caption && <figcaption className="insight-stack-cap">{caption}</figcaption>}
    </figure>
  );
}
