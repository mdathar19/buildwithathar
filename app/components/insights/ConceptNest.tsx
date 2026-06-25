"use client";

import { useEffect, useRef, useState } from "react";
import { trackInsight } from "./track";

export type NestLayer = {
  key: string;
  label: string;
  short: string;
  def: string;
  color: string; // hex, e.g. "#ffd54f"
};

type Props = {
  id: string;
  caption?: string;
  layers: NestLayer[]; // ordered OUTER -> INNER
};

/**
 * ConceptNest — nested translucent shells you can orbit and tap.
 * The "Russian dolls" metaphor, literal. Outer shell = broadest concept,
 * glowing core = the most specific one.
 *
 * SEO/a11y: the legend list + every definition render as real DOM (this is a
 * client component, so its markup is in the SSR HTML). The 3D canvas is pure
 * progressive enhancement — kill JS or reduce motion and the labelled list,
 * definitions, and active state still work via plain buttons.
 */
export default function ConceptNest({ id, caption, layers }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<number>(Math.max(0, layers.length - 1));
  const [ready, setReady] = useState(false);
  // keep the latest active index available to the imperative three.js loop
  const activeRef = useRef(active);
  activeRef.current = active;
  const setActiveRef = useRef<(i: number, fromCanvas?: boolean) => void>(() => {});

  setActiveRef.current = (i: number, fromCanvas = false) => {
    setActive(i);
    trackInsight("conceptnest_select", { id, layer: layers[i]?.key, via: fromCanvas ? "canvas" : "legend" });
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || layers.length === 0) return;

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
      const h = host.clientHeight || 360;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
      camera.position.set(0, 0.4, 7.2);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      host.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const outer = 2.5;
      const inner = 0.85;
      const n = layers.length;

      type Shell = {
        wire: any;
        glow: any;
        baseColor: any;
        targetScale: number;
        scale: number;
        targetOpacity: number;
        opacity: number;
      };
      const shells: Shell[] = [];

      layers.forEach((layer, i) => {
        const t = n === 1 ? 0 : i / (n - 1); // 0 outer -> 1 inner
        const radius = outer - (outer - inner) * t;
        const color = new THREE.Color(layer.color);
        const isCore = i === n - 1;

        const geo = new THREE.IcosahedronGeometry(radius, isCore ? 3 : 1);
        const wireMat = new THREE.MeshBasicMaterial({
          color,
          wireframe: true,
          transparent: true,
          opacity: 0.32,
          depthWrite: false,
        });
        const wire = new THREE.Mesh(geo, wireMat);
        wire.userData.index = i;
        // slight per-shell tilt so the nested wireframes read as depth, not moiré
        wire.rotation.set(i * 0.5, i * 0.8, i * 0.3);
        group.add(wire);

        // soft inner fill — strongest on the core, faint on the shells
        const fillMat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: isCore ? 0.22 : 0.05,
          depthWrite: false,
          side: THREE.BackSide,
        });
        const glow = new THREE.Mesh(geo.clone(), fillMat);
        glow.userData.index = i;
        glow.rotation.copy(wire.rotation);
        group.add(glow);

        shells.push({
          wire,
          glow,
          baseColor: color,
          targetScale: 1,
          scale: 1,
          targetOpacity: 0.32,
          opacity: 0.32,
        });
      });

      const applyActive = (idx: number) => {
        shells.forEach((s, i) => {
          const on = i === idx;
          s.targetScale = on ? 1.06 : 1;
          s.targetOpacity = on ? 0.95 : 0.14;
          (s.glow.material as any).opacity = i === n - 1 ? (on ? 0.34 : 0.16) : on ? 0.12 : 0.04;
        });
      };
      applyActive(activeRef.current);

      // ---- interaction: drag to rotate, tap a shell to select ----
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let dragging = false;
      let moved = 0;
      let lastX = 0;
      let lastY = 0;
      let velX = reduced ? 0 : 0.0016;
      let velY = 0;

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
          // hover -> pointer cursor when over a shell
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(group.children, false);
          renderer.domElement.style.cursor = hit.length ? "pointer" : "grab";
          return;
        }
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        moved += Math.abs(dx) + Math.abs(dy);
        group.rotation.y += dx * 0.008;
        group.rotation.x += dy * 0.008;
        group.rotation.x = Math.max(-0.9, Math.min(0.9, group.rotation.x));
        velX = dx * 0.0009;
        velY = dy * 0.0009;
        lastX = e.clientX;
        lastY = e.clientY;
      };
      const onUp = (e: PointerEvent) => {
        renderer.domElement.releasePointerCapture?.(e.pointerId);
        if (dragging && moved < 6) {
          // treat as a tap: pick the shell under the pointer
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(group.children, false);
          if (hit.length) {
            const idx = hit[0].object.userData.index as number;
            if (typeof idx === "number") setActiveRef.current(idx, true);
          }
        }
        dragging = false;
        if (reduced) velX = 0;
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

      let lastActive = activeRef.current;
      const tick = () => {
        if (disposed) return;
        if (activeRef.current !== lastActive) {
          lastActive = activeRef.current;
          applyActive(lastActive);
        }
        if (!dragging) {
          group.rotation.y += velX;
          group.rotation.x += velY;
          group.rotation.x *= 0.98; // settle toward level
          if (!reduced) velX += (0.0016 - velX) * 0.02; // ease back to idle spin
          else velX *= 0.9;
          velY *= 0.9;
        }
        shells.forEach((s) => {
          s.scale += (s.targetScale - s.scale) * 0.12;
          s.opacity += (s.targetOpacity - s.opacity) * 0.12;
          s.wire.scale.setScalar(s.scale);
          s.glow.scale.setScalar(s.scale);
          (s.wire.material as any).opacity = s.opacity;
        });
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
        shells.forEach((s) => {
          s.wire.geometry.dispose();
          (s.wire.material as any).dispose();
          s.glow.geometry.dispose();
          (s.glow.material as any).dispose();
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
    // build once; active changes are read live via activeRef inside the loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const current = layers[active] ?? layers[0];

  return (
    <figure className="insight-nest" aria-label={caption || "Nested concept diagram"}>
      <div className="insight-nest-grid">
        <div className="insight-nest-stagewrap">
          <div className="insight-nest-stage" ref={mountRef} data-ready={ready} />
          <div className="insight-nest-badge" aria-hidden>
            <span className="insight-nest-badge-key" style={{ color: current?.color }}>
              {current?.short}
            </span>
            <span className="insight-nest-badge-hint">
              {ready ? "drag to rotate · tap a shell" : "loading 3D…"}
            </span>
          </div>
        </div>

        <div className="insight-nest-side">
          <div className="insight-nest-eyebrow">// outer = broadest · core = most specific</div>
          <ol className="insight-nest-legend" role="listbox" aria-label="Concept layers">
            {layers.map((l, i) => (
              <li key={l.key}>
                <button
                  type="button"
                  className="insight-nest-item"
                  data-active={i === active}
                  role="option"
                  aria-selected={i === active}
                  onClick={() => setActiveRef.current(i, false)}
                >
                  <span className="insight-nest-swatch" style={{ background: l.color }} aria-hidden />
                  <span className="insight-nest-item-label">{l.label}</span>
                  <span className="insight-nest-item-short">{l.short}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="insight-nest-def" data-key={current?.key}>
            <div className="insight-nest-def-head" style={{ color: current?.color }}>
              {current?.label}
            </div>
            <p>{current?.def}</p>
          </div>
        </div>
      </div>
      {caption && <figcaption className="insight-nest-cap">{caption}</figcaption>}
    </figure>
  );
}
