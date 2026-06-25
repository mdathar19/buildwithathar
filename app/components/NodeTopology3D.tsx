"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { nodes } from "@/lib/content";

/**
 * NodeTopology3D — the hero "NODE_TOPOLOGY" panel, rebuilt as a live WebGL graph.
 *
 * ATHAR hub at the center; the 10 platforms distributed on a Fibonacci sphere as
 * glowing nodes; thin spoke edges; faint equatorial rings (echo of the old
 * crosshair grid); data packets streaming along a few edges to read as "live
 * traffic". Gentle auto-orbit + mouse parallax (no OrbitControls, so vertical
 * page scroll is never trapped on mobile). Hover highlights a node + tooltip.
 *
 * three.js is dynamically imported inside the effect, so it's code-split out of
 * the critical path and never runs on the server. The panel chrome (header,
 * footer, labels) is plain DOM; the canvas is decorative (aria-hidden) — all
 * SEO-critical copy lives in the hero text, not here.
 */
export default function NodeTopology3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelLayerRef = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [fps, setFps] = useState(60);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    const mount = mountRef.current;
    const labelLayer = labelLayerRef.current;
    if (!mount || !labelLayer) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ACCENT = 0x5cf2a6;
    const STEEL = 0x8aa0b8;
    const EDGE_DIM = 0x24405a;

    let raf = 0;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import("three");
      if (disposed || !mountRef.current) return;
      const host = mountRef.current;

      const w = host.clientWidth || 380;
      const h = host.clientHeight || 340;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(46, w / h, 0.1, 100);
      camera.position.set(0, 0.3, 6.4);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      renderer.domElement.style.touchAction = "pan-y";
      host.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      // ---- soft radial sprite texture (for node halos + packets) ----
      const halo = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 64;
        const g = c.getContext("2d")!;
        const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grd.addColorStop(0, "rgba(255,255,255,1)");
        grd.addColorStop(0.25, "rgba(255,255,255,0.65)");
        grd.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grd;
        g.fillRect(0, 0, 64, 64);
        const tex = new THREE.CanvasTexture(c);
        return tex;
      })();

      // ---- node layout: hub at origin + 10 satellites on a fibonacci sphere ----
      const R = 2.15;
      const N = nodes.length;
      const golden = Math.PI * (3 - Math.sqrt(5));
      type NodeViz = {
        mesh: any;
        glow: any;
        pos: any;
        color: any;
        base: number;
        scale: number;
        target: number;
        haloBase: number;
        haloOp: number;
        label: HTMLDivElement;
        short: string;
        full: string;
        flagship: boolean;
        slug?: string;
      };
      const all: NodeViz[] = [];

      const mkLabel = (text: string, flagship: boolean) => {
        const el = document.createElement("div");
        el.className = "ng3d-label";
        el.dataset.flag = String(flagship);
        el.textContent = text;
        labelLayer.appendChild(el);
        return el;
      };

      const addNode = (
        pos: any,
        radius: number,
        colorHex: number,
        short: string,
        full: string,
        flagship: boolean,
        haloBase: number,
        haloOp: number,
        slug?: string
      ) => {
        const color = new THREE.Color(colorHex);
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(radius, 24, 24),
          new THREE.MeshBasicMaterial({ color })
        );
        mesh.position.copy(pos);
        mesh.userData.idx = all.length;
        group.add(mesh);

        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: halo,
            color,
            transparent: true,
            opacity: haloOp,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        glow.scale.set(haloBase, haloBase, 1);
        glow.position.copy(pos);
        group.add(glow);

        all.push({
          mesh,
          glow,
          pos: pos.clone(),
          color,
          base: radius,
          scale: 1,
          target: 1,
          haloBase,
          haloOp,
          label: mkLabel(short, flagship),
          short,
          full,
          flagship,
          slug,
        });
      };

      // hub
      addNode(new THREE.Vector3(0, 0, 0), 0.3, ACCENT, "ATHAR", "OPERATOR · ATHAR_0001", true, 1.25, 0.42);

      // satellites
      const satPositions: any[] = [];
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2; // 1 -> -1
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = golden * i;
        const pos = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(R);
        satPositions.push(pos);
        const n = nodes[i];
        addNode(
          pos,
          n.flagship ? 0.15 : 0.11,
          n.flagship ? ACCENT : STEEL,
          n.short,
          n.label,
          !!n.flagship,
          n.flagship ? 0.7 : 0.5,
          n.flagship ? 0.36 : 0.24,
          n.slug
        );
      }
      const hub = all[0];

      // ---- edges: hub -> each satellite (thin lines, color-coded) ----
      const edgeVerts: number[] = [];
      const edgeColors: number[] = [];
      const cDim = new THREE.Color(EDGE_DIM);
      const cLive = new THREE.Color(ACCENT);
      const edges: { a: any; b: any; flagship: boolean }[] = [];
      for (let i = 0; i < N; i++) {
        const p = satPositions[i];
        const live = !!nodes[i].flagship;
        edgeVerts.push(0, 0, 0, p.x, p.y, p.z);
        const c = live ? cLive : cDim;
        edgeColors.push(c.r, c.g, c.b, c.r, c.g, c.b);
        edges.push({ a: hub.pos, b: p, flagship: live });
      }
      const edgeGeo = new THREE.BufferGeometry();
      edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgeVerts, 3));
      edgeGeo.setAttribute("color", new THREE.Float32BufferAttribute(edgeColors, 3));
      const edgeLines = new THREE.LineSegments(
        edgeGeo,
        new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5 })
      );
      group.add(edgeLines);

      // ---- faint equatorial rings (echo of the old concentric grid) ----
      [R * 0.62, R].forEach((rr, i) => {
        const pts: any[] = [];
        for (let k = 0; k <= 80; k++) {
          const a = (k / 80) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * rr, 0, Math.sin(a) * rr));
        }
        const ring = new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({
            color: 0x33414f,
            transparent: true,
            opacity: i === 0 ? 0.35 : 0.22,
          })
        );
        ring.rotation.x = 0.0;
        group.add(ring);
      });

      // ---- data packets streaming along a few edges (live traffic) ----
      const PACKETS = reduced ? 0 : 5;
      const packets: { sprite: any; edge: number; t: number; speed: number }[] = [];
      const pickEdge = () => Math.floor(Math.random() * edges.length);
      for (let i = 0; i < PACKETS; i++) {
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: halo,
            color: new THREE.Color(ACCENT),
            transparent: true,
            opacity: 0.95,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        sprite.scale.set(0.22, 0.22, 1);
        group.add(sprite);
        packets.push({ sprite, edge: pickEdge(), t: i / PACKETS, speed: 0.004 + Math.random() * 0.006 });
      }

      // ---- interaction: mouse parallax + hover pick (no orbit -> scroll safe) ----
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const pointer = { x: 0, y: 0, has: false };
      let hoverIdx = -1;
      const nodeMeshes = all.map((n) => n.mesh);

      const onMove = (e: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        pointer.has = true;
        ndc.set(pointer.x, pointer.y);
      };
      const onLeave = () => {
        pointer.has = false;
        hoverIdx = -1;
        renderer.domElement.style.cursor = "default";
      };
      let downX = 0;
      let downY = 0;
      const onDown = (e: PointerEvent) => {
        downX = e.clientX;
        downY = e.clientY;
      };
      const onUp = (e: PointerEvent) => {
        const moved = Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY);
        if (moved < 6 && hoverIdx >= 0) {
          const slug = all[hoverIdx]?.slug;
          if (slug) routerRef.current.push(`/projects/${slug}`);
        }
      };
      const el = renderer.domElement;
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointerup", onUp);

      const ro = new ResizeObserver(() => {
        const nw = host.clientWidth || w;
        const nh = host.clientHeight || h;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      });
      ro.observe(host);

      // ---- label projection ----
      const tmp = new THREE.Vector3();
      const updateLabels = () => {
        const rect = renderer.domElement;
        const cw = rect.clientWidth;
        const ch = rect.clientHeight;
        for (let i = 0; i < all.length; i++) {
          const n = all[i];
          tmp.copy(n.pos).applyMatrix4(group.matrixWorld).project(camera);
          const behind = tmp.z > 1;
          if (behind) {
            n.label.style.opacity = "0";
            continue;
          }
          const x = (tmp.x * 0.5 + 0.5) * cw;
          const y = (-tmp.y * 0.5 + 0.5) * ch;
          // depth fade: nearer (smaller z) = brighter
          const depth = 1 - Math.min(1, Math.max(0, (tmp.z + 0.2) / 1.1));
          const op = i === 0 ? 1 : n.flagship ? 0.55 + depth * 0.45 : 0.25 + depth * 0.55;
          n.label.style.opacity = String(i === hoverIdx ? 1 : op);
          n.label.style.transform = `translate(-50%,-50%) translate(${x}px, ${y + (i === 0 ? 26 : 14)}px)`;
        }
      };

      // ---- render loop ----
      let frames = 0;
      let acc = 0;
      let last = performance.now();
      let baseSpin = reduced ? 0 : 0.0022;
      let spin = baseSpin;
      group.rotation.x = -0.18;

      const tick = () => {
        if (disposed) return;
        const now = performance.now();
        const dt = now - last;
        last = now;

        // fps (rolling, updated ~2x/sec)
        frames++;
        acc += dt;
        if (acc >= 500) {
          setFps(Math.round((frames * 1000) / acc));
          frames = 0;
          acc = 0;
        }

        // auto-orbit (eases to a stop while a node is hovered) + mouse parallax
        spin += ((hoverIdx >= 0 ? 0 : baseSpin) - spin) * 0.12;
        group.rotation.y += spin;
        if (pointer.has && !reduced) {
          group.rotation.x += (-0.18 + pointer.y * 0.25 - group.rotation.x) * 0.05;
          // subtle yaw lean toward pointer on top of the spin
          camera.position.x += (pointer.x * 0.5 - camera.position.x) * 0.04;
        } else {
          camera.position.x += (0 - camera.position.x) * 0.04;
        }
        camera.lookAt(0, 0, 0);
        group.updateMatrixWorld();

        // hover pick (once per frame)
        if (pointer.has) {
          raycaster.setFromCamera(ndc, camera);
          const hit = raycaster.intersectObjects(nodeMeshes, false);
          hoverIdx = hit.length ? (hit[0].object.userData.idx as number) : -1;
          el.style.cursor = hoverIdx >= 0 && all[hoverIdx]?.slug ? "pointer" : "default";
        }

        // node hover scale / glow
        for (let i = 0; i < all.length; i++) {
          const n = all[i];
          n.target = i === hoverIdx ? 1.45 : 1;
          n.scale += (n.target - n.scale) * 0.18;
          n.mesh.scale.setScalar(n.scale);
          const hv = (n.scale - 1) / 0.45; // 0..1 hover amount
          const gs = n.haloBase * (1 + hv * 0.35);
          n.glow.scale.set(gs, gs, 1);
          (n.glow.material as any).opacity = n.haloOp * (1 + hv * 0.5);
        }

        // packets
        for (const pk of packets) {
          pk.t += pk.speed;
          if (pk.t >= 1) {
            pk.t = 0;
            pk.edge = pickEdge();
          }
          const e = edges[pk.edge];
          pk.sprite.position.lerpVectors(e.a, e.b, pk.t);
          const fade = Math.sin(pk.t * Math.PI); // fade in/out at ends
          (pk.sprite.material as any).opacity = 0.9 * fade;
          (pk.sprite.material as any).color.set(e.flagship ? ACCENT : STEEL);
        }

        updateLabels();

        // tooltip
        const tip = tipRef.current;
        if (tip) {
          if (hoverIdx >= 0) {
            const n = all[hoverIdx];
            tmp.copy(n.pos).applyMatrix4(group.matrixWorld).project(camera);
            const cw = el.clientWidth;
            const ch = el.clientHeight;
            const x = (tmp.x * 0.5 + 0.5) * cw;
            const y = (-tmp.y * 0.5 + 0.5) * ch;
            tip.style.opacity = "1";
            tip.style.transform = `translate(-50%,-100%) translate(${x}px, ${y - 16}px)`;
            tip.textContent = n.slug ? `${n.full}  ↗ case study` : n.full;
          } else {
            tip.style.opacity = "0";
          }
        }

        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointerup", onUp);
        labelLayer.innerHTML = "";
        halo.dispose();
        scene.traverse((o: any) => {
          if (o.geometry) o.geometry.dispose?.();
          if (o.material) {
            if (Array.isArray(o.material)) o.material.forEach((m: any) => m.dispose?.());
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="node-graph node-graph-3d brk" aria-hidden="true">
      <span className="br-tl" />
      <span className="br-tr" />
      <span className="br-bl" />
      <span className="br-br" />
      <div className="hdr">
        <span>// NODE_TOPOLOGY</span>
        <span className="ok">
          {nodes.length}/{nodes.length} ONLINE
        </span>
      </div>
      <div className="ng3d-stage" ref={mountRef} data-ready={ready}>
        <div className="ng3d-labels" ref={labelLayerRef} />
        <div className="ng3d-tip" ref={tipRef} />
        {!ready && <div className="ng3d-poster">// initializing webgl topology…</div>}
      </div>
      <div className="ftr">
        <span>fps: {fps}</span>
        <span className="ok">render: webgl ✓</span>
        <span>nodes: {nodes.length + 1}</span>
      </div>
    </div>
  );
}
