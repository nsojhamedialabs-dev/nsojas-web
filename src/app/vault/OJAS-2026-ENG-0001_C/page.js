"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

// ── CLIENT REGISTRY ─────────────────────────────────────────────
const CLIENTS = {
  "OJAS-2026-ENG-0001_C": {
    names:       "Sandeep & Neelima",
    firstName:   "Sandeep",
    secondName:  "Neelima",
    date:        "17 · 06 · 2026",
    weddingDate: "19 · 08 · 2026",
    type:        "Engagement",
    photos:      15,
    message:     "A promise made in love. A story just beginning.",
  },
};

// ── TIMING — slow, breathing, elevated ──────────────────────────
const DURATIONS     = [8000,7000,7000,7000,7000,7000,7000,7000,7000,7000,7000,7000,7000,8000,10000];
const INK_DURATION  = 2200; // ink wash phase
const SHARD_DURATION= 1800; // glass shatter phase
const TOTAL_TRANSITION = INK_DURATION + SHARD_DURATION;

// ── PALETTE ─────────────────────────────────────────────────────
const GOLD    = "#D4AF37";
const WHITE   = "#F5F5F0";
const BLACK   = "#000000";
const INK_COL = "#0A0A12"; // deep blue-black ink

// ── UTILITY ─────────────────────────────────────────────────────
function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
function easeOut(t)   { return 1 - Math.pow(1-t, 3); }
function lerp(a, b, t){ return a + (b-a)*t; }

// ── PARTICLE SYSTEM ─────────────────────────────────────────────
function ParticleCanvas({ active }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.1 + 0.2,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -Math.random() * 0.18 - 0.05,
      alpha: Math.random() * 0.5 + 0.1,
      flicker: Math.random() * Math.PI * 2,
      flickerSpeed: Math.random() * 0.014 + 0.004,
      gold: Math.random() > 0.45,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.flicker += p.flickerSpeed;
        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.flicker));
        if (p.y < -10) p.y = canvas.height + 5;
        if (p.x < -10) p.x = canvas.width + 5;
        if (p.x > canvas.width + 10) p.x = -5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(212,175,55,${a})`
          : `rgba(240,235,220,${a * 0.5})`;
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [active]);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", inset:0, zIndex:1,
      pointerEvents:"none",
      opacity: active ? 1 : 0,
      transition: "opacity 2s ease",
    }} />
  );
}

// ── SHATTERED INK CANVAS ─────────────────────────────────────────
// Phase 1: Ink drops fall and bloom across current photo
// Phase 2: Glass shatters outward, each shard carries ink, new photo revealed
function ShatteredInkCanvas({ transitioning, currentSrc, nextSrc, onComplete, isMobile }) {
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const stateRef   = useRef({ phase:"idle", startTime:null, shards:[], inkDrops:[], currentImg:null, nextImg:null });

  // Build shards — irregular Voronoi-like polygons
  const buildShards = useCallback((W, H) => {
    const count  = isMobile ? 18 : 28;
    const points = [];

    // Seed points — denser near center for dramatic effect
    for (let i = 0; i < count; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.6) * Math.min(W, H) * 0.62;
      points.push({
        x: W/2 + Math.cos(angle) * radius * (0.7 + Math.random()*0.6),
        y: H/2 + Math.sin(angle) * radius * (0.7 + Math.random()*0.6),
      });
    }
    // Add corner & edge points to fill screen
    points.push(
      {x:0,y:0},{x:W,y:0},{x:0,y:H},{x:W,y:H},
      {x:W/2,y:0},{x:W/2,y:H},{x:0,y:H/2},{x:W,y:H/2},
      {x:W*0.25,y:0},{x:W*0.75,y:0},
      {x:W*0.25,y:H},{x:W*0.75,y:H},
    );

    // Build Voronoi-approximated cells using clipping
    const shards = points.slice(0, count).map((p, idx) => {
      // Direction from center — determines fly-out trajectory
      const dx   = p.x - W/2;
      const dy   = p.y - H/2;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const speed = (0.6 + Math.random() * 0.8) * (isMobile ? 0.7 : 1);

      // Build polygon path approximating a cell
      const size  = 60 + Math.random() * 140;
      const sides = 4 + Math.floor(Math.random() * 3);
      const verts = [];
      for (let s = 0; s < sides; s++) {
        const a   = (s / sides) * Math.PI * 2 + Math.random() * 0.6;
        const r   = size * (0.5 + Math.random() * 0.7);
        verts.push({ x: p.x + Math.cos(a)*r, y: p.y + Math.sin(a)*r });
      }

      return {
        cx: p.x, cy: p.y,
        verts,
        // Fly direction — outward from center
        vx: (dx/dist) * speed * (W * 0.006),
        vy: (dy/dist) * speed * (H * 0.006),
        // Random rotation during flight
        rot: 0,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        // Ink stain on this shard
        inkAlpha: 0.3 + Math.random() * 0.5,
        delay: Math.random() * 0.25, // staggered shatter
      };
    });
    return shards;
  }, [isMobile]);

  // Build ink drops — organic blooms
  const buildInkDrops = useCallback((W, H) => {
    const count = isMobile ? 6 : 9;
    return Array.from({ length: count }, (_, i) => {
      // Scattered but weighted toward center
      const angle  = (i / count) * Math.PI * 2 + Math.random() * 0.8;
      const radius = (0.1 + Math.random() * 0.35) * Math.min(W, H);
      return {
        x:     W/2 + Math.cos(angle) * radius,
        y:     H/2 + Math.sin(angle) * radius,
        maxR:  (0.18 + Math.random() * 0.24) * Math.min(W, H),
        delay: i * 0.08 + Math.random() * 0.06,
        // Organic tentacles — ink bleeding
        tentacles: Array.from({ length: 6 + Math.floor(Math.random()*4) }, () => ({
          angle:  Math.random() * Math.PI * 2,
          length: 0.4 + Math.random() * 0.6,
          width:  0.08 + Math.random() * 0.12,
        })),
      };
    });
  }, [isMobile]);

  useEffect(() => {
    if (!transitioning) {
      stateRef.current.phase = "idle";
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;

    // Load both images
    const currImg = new Image(); currImg.crossOrigin = "anonymous"; currImg.src = currentSrc;
    const nextImg = new Image(); nextImg.crossOrigin = "anonymous"; nextImg.src = nextSrc;

    const state     = stateRef.current;
    state.shards    = buildShards(W, H);
    state.inkDrops  = buildInkDrops(W, H);
    state.phase     = "ink";
    state.startTime = null;
    let doneRef     = false;

    // Draw image fit to canvas (cover, top-anchored)
    const drawImg = (img, alpha = 1) => {
      if (!img.complete || !img.naturalWidth) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const sw    = img.naturalWidth  * scale;
      const sh    = img.naturalHeight * scale;
      const sx    = (W - sw) / 2;
      const sy    = 0; // top-anchored — heads never cut
      ctx.drawImage(img, sx, sy, sw, sh);
      ctx.restore();
    };

    const animate = (ts) => {
      if (!state.startTime) state.startTime = ts;
      const elapsed = ts - state.startTime;
      ctx.clearRect(0, 0, W, H);

      // ── PHASE 1: INK WASH (0 → INK_DURATION) ──────────────
      if (elapsed < INK_DURATION) {
        const t = elapsed / INK_DURATION; // 0→1

        // Draw current photo
        drawImg(currImg, 1);

        // Draw ink drops blooming over photo
        state.inkDrops.forEach(drop => {
          const dt = Math.max(0, (t - drop.delay) / (1 - drop.delay));
          if (dt <= 0) return;
          const r = easeOut(dt) * drop.maxR;

          // Core ink blob
          const grad = ctx.createRadialGradient(drop.x, drop.y, 0, drop.x, drop.y, r);
          grad.addColorStop(0,    `rgba(8,8,18,${0.92 * easeInOut(dt)})`);
          grad.addColorStop(0.55, `rgba(8,8,18,${0.88 * easeInOut(dt)})`);
          grad.addColorStop(0.82, `rgba(8,8,18,${0.6  * easeInOut(dt)})`);
          grad.addColorStop(1,    `rgba(8,8,18,0)`);
          ctx.beginPath();
          ctx.arc(drop.x, drop.y, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Ink tentacles — bleeding organically
          drop.tentacles.forEach(ten => {
            const tLen = r * ten.length;
            const tx   = drop.x + Math.cos(ten.angle) * tLen;
            const ty   = drop.y + Math.sin(ten.angle) * tLen;
            const tGrad= ctx.createRadialGradient(tx, ty, 0, tx, ty, r * ten.width);
            tGrad.addColorStop(0,   `rgba(8,8,18,${0.7 * easeInOut(dt)})`);
            tGrad.addColorStop(0.6, `rgba(8,8,18,${0.3 * easeInOut(dt)})`);
            tGrad.addColorStop(1,   `rgba(8,8,18,0)`);
            ctx.beginPath();
            ctx.arc(tx, ty, r * ten.width, 0, Math.PI * 2);
            ctx.fillStyle = tGrad;
            ctx.fill();
          });
        });

        // Subtle gold shimmer at ink edges — like gold dust in ink
        if (t > 0.3) {
          const shimmerAlpha = (t - 0.3) / 0.7 * 0.15;
          ctx.fillStyle = `rgba(212,175,55,${shimmerAlpha})`;
          state.inkDrops.forEach(drop => {
            const dt = Math.max(0, (t - drop.delay) / (1 - drop.delay));
            if (dt <= 0) return;
            const r = easeOut(dt) * drop.maxR * 1.05;
            ctx.beginPath();
            ctx.arc(drop.x + (Math.random()-0.5)*4, drop.y + (Math.random()-0.5)*4, r * 0.08, 0, Math.PI*2);
            ctx.fill();
          });
        }

      // ── PHASE 2: GLASS SHATTER (INK_DURATION → TOTAL) ──────
      } else {
        const t = (elapsed - INK_DURATION) / SHARD_DURATION; // 0→1
        const te = easeOut(t);

        // Draw next photo as base — revealed behind shards
        drawImg(nextImg, Math.min(1, t * 2.5));

        // Draw flying ink-stained shards
        state.shards.forEach(shard => {
          const st = Math.max(0, (t - shard.delay) / (1 - shard.delay));
          if (st <= 0) return;
          const se = easeOut(st);

          ctx.save();

          // Translate to shard center, apply movement + rotation
          const mx = shard.vx * se * 80;
          const my = shard.vy * se * 80;
          shard.rot += shard.rotSpeed * se;

          ctx.translate(shard.cx + mx, shard.cy + my);
          ctx.rotate(shard.rot);
          ctx.translate(-shard.cx, -shard.cy);

          // Clip to shard polygon
          ctx.beginPath();
          ctx.moveTo(shard.verts[0].x, shard.verts[0].y);
          shard.verts.forEach(v => ctx.lineTo(v.x, v.y));
          ctx.closePath();
          ctx.clip();

          // Draw ink fill on shard — carries the ink with it
          const inkA = shard.inkAlpha * (1 - se * 0.6);
          ctx.fillStyle = `rgba(8,8,18,${inkA})`;
          ctx.fill();

          // Gold edge on shard — light catching broken glass
          ctx.strokeStyle = `rgba(212,175,55,${0.4 * (1 - se)})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();

          // Fade shard as it flies away
          ctx.globalAlpha = Math.max(0, 1 - se * 1.2);
          ctx.fillStyle   = `rgba(8,8,18,${0.3 * (1-se)})`;
          ctx.fill();

          ctx.restore();
        });

        // Black overlay fades away revealing next photo
        const blackAlpha = Math.max(0, 0.7 * (1 - te));
        if (blackAlpha > 0) {
          ctx.fillStyle = `rgba(0,0,0,${blackAlpha})`;
          ctx.fillRect(0, 0, W, H);
        }
      }

      // ── COMPLETE ───────────────────────────────────────────
      if (elapsed >= TOTAL_TRANSITION + 200) {
        ctx.clearRect(0, 0, W, H);
        if (!doneRef) { doneRef = true; onComplete && onComplete(); }
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    // Wait for images then start
    const start = () => { rafRef.current = requestAnimationFrame(animate); };
    let loaded = 0;
    const onLoad = () => { loaded++; if (loaded >= 1) start(); };
    currImg.onload = onLoad; nextImg.onload = onLoad;
    if (currImg.complete) onLoad();
    if (nextImg.complete) onLoad();

    return () => { cancelAnimationFrame(rafRef.current); };
  }, [transitioning, currentSrc, nextSrc]);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", inset:0, zIndex:8,
      pointerEvents:"none",
      display: transitioning ? "block" : "none",
    }} />
  );
}

// ── MAIN ────────────────────────────────────────────────────────
export default function VaultShatteredInk() {
  const params = useParams();
  const router = useRouter();
  const id     = (params?.id || "OJAS-2026-ENG-0001_C").toUpperCase();
  const client = CLIENTS[id];

  const [phase,        setPhase]        = useState("black");
  const [frameIdx,     setFrameIdx]     = useState(0);
  const [nextIdx,      setNextIdx]      = useState(1);
  const [transitioning,setTransitioning]= useState(false);
  const [titleStep,    setTitleStep]    = useState(0);
  const [titleOut,     setTitleOut]     = useState(false);
  const [endStep,      setEndStep]      = useState(0);
  const [particles,    setParticles]    = useState(false);
  const [isMobile,     setIsMobile]     = useState(false);
  const [photoVisible, setPhotoVisible] = useState(false);

  const timers  = useRef([]);
  const clearAll= () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const after   = (ms, fn) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; };

  const photoSrc = (i) => `/vault/${id}/${String(i+1).padStart(2,"0")}.webp`;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Preload all
  useEffect(() => {
    if (!client) return;
    for (let i = 1; i <= client.photos; i++) {
      const img = new Image(); img.src = `/vault/${id}/${String(i).padStart(2,"0")}.webp`;
    }
  }, [client, id]);

  // ── Opening sequence ───────────────────────────────────────
  const startSequence = useCallback(() => {
    setParticles(true);
    setPhase("titlecard");
    after(500,  () => setTitleStep(1));
    after(1400, () => setTitleStep(2));
    after(2700, () => setTitleStep(3));
    after(3900, () => setTitleStep(4));
    after(5000, () => setTitleStep(5));
    after(6000, () => setTitleOut(true));
    after(7600, () => {
      setPhase("reel");
      setFrameIdx(0);
      setNextIdx(1);
      after(120, () => setPhotoVisible(true));
    });
  }, []);

  useEffect(() => {
    if (!client) return;
    const firstImg = new Image();
    firstImg.src = `/vault/${id}/01.webp`;
    const kick = () => after(800, startSequence);
    if (document.fonts && document.fonts.ready) {
      Promise.all([
        document.fonts.ready,
        new Promise(res => { if (firstImg.complete) res(); else { firstImg.onload = res; firstImg.onerror = res; } }),
      ]).then(kick);
    } else { firstImg.onload = kick; firstImg.onerror = kick; if (firstImg.complete) kick(); }
    return clearAll;
  }, [client]);

  // ── Replay ─────────────────────────────────────────────────
  const handleReplay = () => {
    clearAll();
    setTransitioning(false); setPhase("black");
    setFrameIdx(0); setNextIdx(1);
    setTitleStep(0); setTitleOut(false);
    setEndStep(0); setParticles(false); setPhotoVisible(false);
    after(300, startSequence);
  };

  // ── Advance with Shattered Ink ─────────────────────────────
  const advance = useCallback(() => {
    if (!client) return;
    const next = frameIdx + 1;
    if (next < client.photos) {
      const img = new Image(); img.src = photoSrc(next + 1);
    }

    after(DURATIONS[frameIdx], () => {
      // Fade out frame overlay, start transition
      setPhotoVisible(false);
      after(300, () => {
        setNextIdx(next >= client.photos ? 0 : next);
        setTransitioning(true);
      });
    });
  }, [frameIdx, client, id]);

  // Transition complete
  const onTransitionComplete = useCallback(() => {
    setTransitioning(false);
    const next = frameIdx + 1;
    if (next >= client.photos) {
      setPhase("endcard");
      after(400,  () => setEndStep(1));
      after(1200, () => setEndStep(2));
      after(2400, () => setEndStep(3));
      after(3600, () => setEndStep(4));
      after(5000, () => setEndStep(5));
    } else {
      setFrameIdx(next);
      setNextIdx(next + 1 < client.photos ? next + 1 : 0);
      after(80, () => setPhotoVisible(true));
    }
  }, [frameIdx, client]);

  useEffect(() => {
    if (phase !== "reel" || transitioning) return;
    advance();
  }, [phase, frameIdx, transitioning]);

  // ── Not found ──────────────────────────────────────────────
  if (!client) {
    return (
      <div style={{ background:"#000", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif" }}>
        <div style={{ fontSize:11, letterSpacing:"0.35em", color:GOLD, textTransform:"uppercase", marginBottom:20 }}>NS OJAS Client Vault</div>
        <div style={{ fontSize:22, color:WHITE, marginBottom:12 }}>Vault Not Found</div>
        <div style={{ fontSize:13, color:"#555", marginBottom:40 }}>This vault doesn't exist or hasn't been activated yet.</div>
        <button onClick={() => router.push("/#vault-login")}
          style={{ padding:"14px 32px", background:GOLD, color:"#000", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:700, border:"none", borderRadius:2, cursor:"pointer" }}>
          Return to NS OJAS
        </button>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, background:BLACK, overflow:"hidden", fontFamily:"Georgia,serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { overflow:hidden; height:100%; background:#000; }
        * { -webkit-tap-highlight-color:transparent; }
        @media (max-width:768px) { body { position:fixed; width:100%; } }

        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineGrow    { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
        @keyframes heartbeat   { 0%,100%{transform:scale(1);opacity:.6} 14%{transform:scale(1.2);opacity:1} 28%{transform:scale(1);opacity:.6} 42%{transform:scale(1.1);opacity:1} }
        @keyframes goldPulse   { 0%,100%{text-shadow:0 0 0 rgba(212,175,55,0)} 50%{text-shadow:0 0 50px rgba(212,175,55,0.55)} }
        @keyframes inkReveal   { from{opacity:0;filter:blur(8px)} to{opacity:1;filter:blur(0)} }
        @keyframes gentleDrift { 0%,100%{transform:scale(1.0) translate(0,0)} 33%{transform:scale(1.022) translate(-0.3%,-0.2%)} 66%{transform:scale(1.018) translate(0.2%,0.15%)} }
        @keyframes coverFade   { from{opacity:1} to{opacity:0;pointer-events:none} }

        .fade-in    { animation:fadeIn 1.4s ease forwards; }
        .slide-up   { animation:fadeSlideUp 1.1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .line-grow  { animation:lineGrow 1.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        .heartbeat  { animation:heartbeat 2.4s ease-in-out infinite; }
        .gold-pulse { animation:goldPulse 3.2s ease-in-out infinite; }
        .ink-reveal { animation:inkReveal 1.6s ease forwards; }
        .drift      { animation:gentleDrift 20s ease-in-out infinite; }
        .title-out  { animation:coverFade 1.4s ease forwards; }

        .reel-photo {
          width:100%; height:100%;
          object-fit:cover; object-position:top center;
          display:block;
        }
        @media (max-width:768px) {
          .reel-photo {
            object-fit:contain !important;
            object-position:center center !important;
            background:#000;
          }
        }
        @media (prefers-reduced-motion:reduce) {
          .drift,.heartbeat { animation:none !important; }
        }
      `}</style>

      {/* ── PARTICLES ── */}
      <ParticleCanvas active={particles} />

      {/* ── SHATTERED INK TRANSITION CANVAS ── */}
      <ShatteredInkCanvas
        transitioning={transitioning}
        currentSrc={photoSrc(frameIdx)}
        nextSrc={photoSrc(nextIdx)}
        onComplete={onTransitionComplete}
        isMobile={isMobile}
      />

      {/* ══════════════════════════════════════════════════════
          TITLE CARD
      ══════════════════════════════════════════════════════ */}
      {phase === "titlecard" && (
        <div className={titleOut ? "title-out" : "fade-in"} style={{
          position:"fixed", inset:0, zIndex:10,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
        }}>
          {/* Top ink splash decoration */}
          {titleStep >= 1 && (
            <div className="fade-in" style={{
              position:"absolute", top:"calc(10% + 20px)",
              width:"100%", textAlign:"center", pointerEvents:"none",
            }}>
              <svg width="200" height="24" viewBox="0 0 200 24" style={{ opacity:0.18 }}>
                <path d="M10 12 Q50 4 100 12 Q150 20 190 12" stroke={GOLD} strokeWidth="0.8" fill="none"/>
                <circle cx="10"  cy="12" r="2.5" fill={GOLD}/>
                <circle cx="100" cy="12" r="1.5" fill={GOLD}/>
                <circle cx="190" cy="12" r="2.5" fill={GOLD}/>
              </svg>
            </div>
          )}

          {titleStep >= 1 && (
            <div className="line-grow" style={{
              width:"clamp(60px,14vw,130px)", height:1,
              background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,
              marginBottom:44, transformOrigin:"center",
            }} />
          )}

          {titleStep >= 2 && (
            <div className="gold-pulse ink-reveal" style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(36px,7.5vw,80px)",
              fontWeight:300, color:WHITE,
              letterSpacing:"0.09em", textAlign:"center",
              lineHeight:1.05, marginBottom:22,
            }}>
              {client.firstName}
              <span style={{ color:GOLD, fontStyle:"italic" }}> & </span>
              {client.secondName}
            </div>
          )}

          {titleStep >= 2 && (
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:22 }}>
              <div style={{ width:32, height:0.5, background:`rgba(212,175,55,0.4)` }} />
              <span className="heartbeat" style={{ fontSize:14, color:GOLD }}>♡</span>
              <div style={{ width:32, height:0.5, background:`rgba(212,175,55,0.4)` }} />
            </div>
          )}

          {titleStep >= 3 && (
            <div className="slide-up" style={{
              fontFamily:"'Montserrat',sans-serif",
              fontSize:"clamp(8px,1.6vw,11px)",
              fontWeight:300, letterSpacing:"0.52em",
              color:"rgba(212,175,55,0.65)",
              textTransform:"uppercase", marginBottom:28,
            }}>
              {client.date}
            </div>
          )}

          {titleStep >= 4 && (
            <div className="slide-up" style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(13px,2.1vw,17px)",
              fontStyle:"italic", fontWeight:300,
              color:"rgba(210,210,210,0.55)",
              letterSpacing:"0.07em", textAlign:"center",
              maxWidth:400, padding:"0 28px", lineHeight:1.8,
            }}>
              {client.message}
            </div>
          )}

          {titleStep >= 5 && (
            <div className="line-grow" style={{
              width:"clamp(60px,14vw,130px)", height:1,
              background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,
              marginTop:44, transformOrigin:"center",
            }} />
          )}

          {/* Corner brackets */}
          {titleStep >= 1 && (<>
            {[["top","left","borderTop","borderLeft"],["top","right","borderTop","borderRight"],
              ["bottom","left","borderBottom","borderLeft"],["bottom","right","borderBottom","borderRight"]
            ].map(([v,h,bt,bh],i) => (
              <div key={i} className="fade-in" style={{
                position:"absolute", [v]:28, [h]:28,
                width:22, height:22,
                [bt]:`1px solid rgba(212,175,55,0.35)`,
                [bh]:`1px solid rgba(212,175,55,0.35)`,
              }} />
            ))}
          </>)}

          <div className="fade-in" style={{
            position:"absolute", bottom:20, right:28,
            fontFamily:"'Montserrat',sans-serif",
            fontSize:8, letterSpacing:"0.3em",
            color:"rgba(212,175,55,0.25)", textTransform:"uppercase",
          }}>
            NS OJAS · {new Date().getFullYear()}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PHOTO REEL
      ══════════════════════════════════════════════════════ */}
      {(phase === "reel" || phase === "endcard") && (
        <div style={{
          position:"fixed", inset:0, zIndex:5,
          opacity: photoVisible ? 1 : 0,
          transition:"opacity 1.2s ease",
        }}>
          {/* Current photo */}
          <img
            src={photoSrc(frameIdx)}
            alt=""
            className="drift reel-photo"
            style={{ position:"absolute", inset:0 }}
          />

          {/* Vignette */}
          <div style={{
            position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
            background:"radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%)",
          }} />

          {/* Bottom gradient */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:160, zIndex:2, pointerEvents:"none",
            background:"linear-gradient(transparent, rgba(0,0,0,0.85))",
          }} />

          {/* Top gradient */}
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:90, zIndex:2, pointerEvents:"none",
            background:"linear-gradient(rgba(0,0,0,0.5), transparent)",
          }} />

          {/* Corner brackets */}
          {[["top","left","borderTop","borderLeft"],["top","right","borderTop","borderRight"]].map(([v,h,bt,bh],i) => (
            <div key={i} style={{
              position:"absolute", [v]:18, [h]:18, zIndex:3, pointerEvents:"none",
              width:18, height:18,
              [bt]:`1px solid rgba(212,175,55,0.35)`,
              [bh]:`1px solid rgba(212,175,55,0.35)`,
            }} />
          ))}

          {/* Frame counter */}
          {phase === "reel" && (
            <div style={{
              position:"absolute", top:22, right:46, zIndex:3,
              fontFamily:"'Montserrat',monospace",
              fontSize:8, letterSpacing:"0.28em",
              color:"rgba(212,175,55,0.45)", textTransform:"uppercase",
            }}>
              {String(frameIdx+1).padStart(2,"0")} · {String(client.photos).padStart(2,"0")}
            </div>
          )}

          {/* Names overlay — first frame */}
          {phase === "reel" && frameIdx === 0 && photoVisible && (
            <div className="slide-up" style={{
              position:"absolute", bottom:44, left:32, zIndex:3,
            }}>
              <div style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"clamp(20px,3.5vw,42px)",
                fontWeight:300, color:WHITE,
                letterSpacing:"0.06em",
                textShadow:"0 2px 28px rgba(0,0,0,0.95)",
              }}>
                {client.firstName}
                <span style={{ color:GOLD, fontStyle:"italic" }}> & </span>
                {client.secondName}
              </div>
              <div style={{
                fontFamily:"'Montserrat',sans-serif",
                fontSize:9, letterSpacing:"0.38em",
                color:"rgba(212,175,55,0.65)",
                textTransform:"uppercase", marginTop:10,
              }}>
                {client.type} · {client.date}
              </div>
            </div>
          )}

          {/* Wedding date — last frame */}
          {phase === "reel" && frameIdx === client.photos-1 && photoVisible && (
            <div className="slide-up" style={{
              position:"absolute", bottom:44, right:32, zIndex:3, textAlign:"right",
            }}>
              <div style={{
                fontFamily:"'Montserrat',sans-serif",
                fontSize:8, letterSpacing:"0.32em",
                color:"rgba(212,175,55,0.55)",
                textTransform:"uppercase", marginBottom:8,
              }}>Save the Date</div>
              <div style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"clamp(14px,2.2vw,22px)",
                fontWeight:300, fontStyle:"italic",
                color:WHITE, letterSpacing:"0.05em",
              }}>
                Wedding · {client.weddingDate}
              </div>
            </div>
          )}

          {/* NS OJAS watermark */}
          <div style={{
            position:"absolute", bottom:16, right:20, zIndex:3,
            fontFamily:"'Montserrat',sans-serif",
            fontSize:7, letterSpacing:"0.28em",
            color:"rgba(212,175,55,0.25)", textTransform:"uppercase",
          }}>
            NS OJAS · {new Date().getFullYear()}
          </div>

          {/* Progress bar */}
          {phase === "reel" && (
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, zIndex:4, background:"rgba(255,255,255,0.04)" }}>
              <div style={{
                height:"100%",
                background:`linear-gradient(90deg,${GOLD},rgba(212,175,55,0.35))`,
                width:`${((frameIdx+1)/client.photos)*100}%`,
                transition:`width ${DURATIONS[frameIdx]}ms linear`,
              }} />
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          END CARD
      ══════════════════════════════════════════════════════ */}
      {phase === "endcard" && (
        <div style={{
          position:"fixed", inset:0, zIndex:20,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          background:"rgba(0,0,0,0.92)",
          opacity: endStep >= 1 ? 1 : 0,
          transition:"opacity 1.4s ease",
        }}>
          <ParticleCanvas active={endStep >= 1} />

          <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"0 36px" }}>

            {endStep >= 1 && (
              <div className="line-grow" style={{
                width:90, height:0.5,
                background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,
                margin:"0 auto 44px", transformOrigin:"center",
              }} />
            )}

            {endStep >= 2 && (
              <div className="slide-up gold-pulse" style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"clamp(30px,6.5vw,62px)",
                fontWeight:300, color:WHITE,
                letterSpacing:"0.07em", lineHeight:1.1, marginBottom:14,
              }}>
                {client.firstName}
                <span style={{ color:GOLD, fontStyle:"italic" }}> & </span>
                {client.secondName}
              </div>
            )}

            {endStep >= 2 && (
              <div className="heartbeat" style={{ fontSize:22, color:GOLD, margin:"18px 0" }}>♡</div>
            )}

            {endStep >= 3 && (
              <div className="slide-up" style={{
                fontFamily:"'Montserrat',sans-serif",
                fontSize:"clamp(8px,1.4vw,10px)",
                letterSpacing:"0.44em", color:"rgba(212,175,55,0.5)",
                textTransform:"uppercase", marginBottom:44,
              }}>
                {client.type} · {client.date}
              </div>
            )}

            {endStep >= 3 && (
              <div className="line-grow" style={{
                width:90, height:0.5,
                background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,
                margin:"0 auto 44px", transformOrigin:"center",
              }} />
            )}

            {endStep >= 4 && (
              <div className="slide-up" style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"clamp(13px,2vw,17px)",
                fontStyle:"italic", fontWeight:300,
                color:"rgba(210,210,210,0.55)",
                letterSpacing:"0.06em", maxWidth:420,
                margin:"0 auto 48px", lineHeight:1.9,
              }}>
                Your complete gallery is being prepared<br/>
                with the care your love deserves.
              </div>
            )}

            {endStep >= 4 && client.weddingDate && (
              <div className="slide-up" style={{
                margin:"0 auto 36px", padding:"22px 38px",
                border:`1px solid rgba(212,175,55,0.2)`,
                borderRadius:2, background:"rgba(212,175,55,0.03)",
                display:"inline-block",
              }}>
                <div style={{
                  fontFamily:"'Montserrat',sans-serif",
                  fontSize:"clamp(7px,1.2vw,9px)",
                  letterSpacing:"0.46em", color:"rgba(212,175,55,0.45)",
                  textTransform:"uppercase", marginBottom:12,
                }}>Save the Date</div>
                <div style={{
                  fontFamily:"'Cormorant Garamond',Georgia,serif",
                  fontSize:"clamp(20px,3.2vw,30px)",
                  fontWeight:300, fontStyle:"italic",
                  color:WHITE, letterSpacing:"0.06em",
                }}>
                  Wedding · {client.weddingDate}
                </div>
              </div>
            )}

            {endStep >= 5 && (
              <div className="slide-up" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", marginBottom:24 }}>
                <a
                  href={`https://wa.me/?text=Our%20NS%20OJAS%20engagement%20memory%20is%20live%20%F0%9F%8C%9F%20View%20our%20story%3A%20${encodeURIComponent(typeof window!=="undefined"?window.location.href:"")}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"14px 26px", background:"#25D366", color:"#fff",
                    fontFamily:"'Montserrat',sans-serif",
                    fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase",
                    fontWeight:600, textDecoration:"none", borderRadius:2,
                    boxShadow:"0 0 28px rgba(37,211,102,0.3)",
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2C6.472 2 2 6.472 2 11.99c0 1.751.459 3.41 1.265 4.861L2 22l5.278-1.24A9.965 9.965 0 0 0 11.99 22C17.508 22 22 17.528 22 12.01 22 6.472 17.508 2 11.99 2z"/></svg>
                  Share Our Story
                </a>
                <a href="https://wa.me/919704551102" target="_blank" rel="noopener noreferrer"
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"14px 26px", background:"transparent", color:GOLD,
                    fontFamily:"'Montserrat',sans-serif",
                    fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase",
                    fontWeight:600, textDecoration:"none", borderRadius:2,
                    border:`1px solid rgba(212,175,55,0.3)`,
                  }}>
                  Contact Simha
                </a>
              </div>
            )}

            {endStep >= 5 && (
              <div className="slide-up" style={{ marginTop:10 }}>
                <button onClick={handleReplay} style={{
                  background:"none", border:"none", cursor:"pointer",
                  display:"inline-flex", alignItems:"center", gap:8,
                  fontFamily:"'Montserrat',sans-serif",
                  fontSize:9, letterSpacing:"0.3em",
                  color:"rgba(212,175,55,0.38)", textTransform:"uppercase",
                  padding:"10px 16px", transition:"color 0.3s",
                }}
                  onMouseEnter={e=>e.currentTarget.style.color=GOLD}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(212,175,55,0.38)"}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                  </svg>
                  Watch Again
                </button>
              </div>
            )}
          </div>

          {endStep >= 3 && (
            <div className="fade-in" style={{
              position:"absolute", bottom:28,
              fontFamily:"'Montserrat',sans-serif",
              fontSize:8, letterSpacing:"0.35em",
              color:"rgba(212,175,55,0.22)", textTransform:"uppercase",
            }}>
              NS OJAS MEDIA LABS · SRIKALAHASTI · {new Date().getFullYear()}
            </div>
          )}
        </div>
      )}

      {/* ── AUDIO ── */}
      {phase === "reel" && (
        <audio src={`/vault/${id}/music.mp3`} autoPlay loop style={{ display:"none" }} />
      )}
    </div>
  );
}