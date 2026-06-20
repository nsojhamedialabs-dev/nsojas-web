"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

// ── CLIENT REGISTRY ─────────────────────────────────────────────
const CLIENTS = {
  "OJAS-2026-ENG-0001_V1": {
    names:      "Sandeep & Neelima",
    firstName:  "Sandeep",
    secondName: "Neelima",
    date:       "17 · 06 · 2026",
    weddingDate:"19 · 08 · 2026",
    type:       "Engagement",
    videos:     5,
    message:    "A promise made in love. A story just beginning.",
    // Per-video captions shown during playback
    captions: [
      "The moment they said yes…",
      "Joy that fills every corner.",
      "Love, witnessed by everyone.",
      "Laughter that echoes forever.",
      "And so the story begins…",
    ],
  },
};

// ── HOLI PALETTE — vibrant, joyful, alive ───────────────────────
const COLORS = {
  magenta:  "#E91E8C",
  orange:   "#FF6B1A",
  yellow:   "#FFD700",
  cyan:     "#00BCD4",
  purple:   "#9C27B0",
  green:    "#4CAF50",
  rose:     "#FF4081",
  gold:     "#D4AF37",
  white:    "#FFFDF8",
  deep:     "#1A0A2E",
};

const HOLI_COLORS = [
  COLORS.magenta, COLORS.orange, COLORS.yellow,
  COLORS.cyan,    COLORS.purple, COLORS.green,
  COLORS.rose,
];

// ── TIMING ──────────────────────────────────────────────────────
const INTRO_DURATION    = 10000; // 10s opening
const VIDEO_DURATION    = 10000; // 10s per video (fallback if video shorter)
const TRANSITION_DURATION = 1800; // color splash between videos
const OUTRO_DURATION    = 10000; // 10s closing

// ── ROSE PETAL CANVAS ───────────────────────────────────────────
function RosePetalCanvas({ active, intensity = 1 }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const petalsRef = useRef([]);

  const createPetal = useCallback((W, H) => ({
    x:        Math.random() * W,
    y:        -20 - Math.random() * 40,
    vx:       (Math.random() - 0.5) * 1.2,
    vy:       0.6 + Math.random() * 1.4,
    rot:      Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.06,
    scale:    0.4 + Math.random() * 0.7,
    opacity:  0.6 + Math.random() * 0.4,
    sway:     Math.random() * Math.PI * 2,
    swaySpeed:0.02 + Math.random() * 0.02,
    color:    Math.random() > 0.4
      ? `rgba(255,${Math.floor(60 + Math.random()*80)},${Math.floor(80 + Math.random()*60)}`
      : `rgba(255,${Math.floor(180 + Math.random()*60)},${Math.floor(180 + Math.random()*60)}`,
  }), []);

  useEffect(() => {
    if (!active) { cancelAnimationFrame(rafRef.current); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.width, H = () => canvas.height;
    const count = Math.floor(28 * intensity);
    petalsRef.current = Array.from({ length: count }, () => {
      const p = createPetal(W(), H());
      p.y = Math.random() * H(); // start scattered
      return p;
    });

    // Draw a rose petal shape
    const drawPetal = (ctx, x, y, scale, rot, color, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(scale, scale);
      ctx.globalAlpha = opacity;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-8, -12, -14, -22, 0, -28);
      ctx.bezierCurveTo(14, -22, 8, -12, 0, 0);
      ctx.fillStyle = color + ",0.9)";
      ctx.fill();

      // Petal highlight
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.bezierCurveTo(-3, -12, -5, -20, 0, -24);
      ctx.bezierCurveTo(5, -20, 3, -12, 0, -4);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, W(), H());
      petalsRef.current.forEach(p => {
        p.sway += p.swaySpeed;
        p.x  += p.vx + Math.sin(p.sway) * 0.5;
        p.y  += p.vy;
        p.rot += p.rotSpeed;

        if (p.y > H() + 30) {
          Object.assign(p, createPetal(W(), H()));
        }

        drawPetal(ctx, p.x, p.y, p.scale, p.rot, p.color, p.opacity);
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [active, intensity]);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", inset:0, zIndex:15,
      pointerEvents:"none",
      opacity: active ? 1 : 0,
      transition:"opacity 1.5s ease",
    }} />
  );
}

// ── HOLI COLOR BURST CANVAS ──────────────────────────────────────
// Explosions of gulal color powder across the screen
function HoliBurstCanvas({ active, phase, onIntroComplete, onTransitionComplete }) {
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const startRef   = useRef(null);
  const doneRef    = useRef(false);

  useEffect(() => {
    if (!active) { doneRef.current = false; return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;
    startRef.current = null;
    doneRef.current  = false;

    // Color bursts — like throwing gulal
    const bursts = Array.from({ length: phase === "transition" ? 5 : 8 }, (_, i) => ({
      x:      Math.random() * W,
      y:      Math.random() * H,
      maxR:   (0.2 + Math.random() * 0.35) * Math.min(W, H),
      color:  HOLI_COLORS[i % HOLI_COLORS.length],
      delay:  i * (phase === "transition" ? 0.06 : 0.09),
      // Powder particles shooting out
      particles: Array.from({ length: 24 }, () => ({
        angle:  Math.random() * Math.PI * 2,
        speed:  0.3 + Math.random() * 0.7,
        size:   2 + Math.random() * 5,
        alpha:  0.6 + Math.random() * 0.4,
        decay:  0.015 + Math.random() * 0.01,
      })),
    }));

    const totalDuration = phase === "transition" ? TRANSITION_DURATION : INTRO_DURATION * 0.7;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t       = Math.min(elapsed / totalDuration, 1);

      ctx.clearRect(0, 0, W, H);

      if (phase === "intro") {
        // Warm cream background blooming to vibrant
        const bgAlpha = Math.min(1, t * 2);
        ctx.fillStyle = `rgba(26,10,46,${bgAlpha * 0.95})`;
        ctx.fillRect(0, 0, W, H);
      }

      bursts.forEach(burst => {
        const bt = Math.max(0, (t - burst.delay) / (1 - burst.delay));
        if (bt <= 0) return;

        const r = Math.min(bt, 0.6) / 0.6 * burst.maxR;

        // Core color cloud
        const grad = ctx.createRadialGradient(burst.x, burst.y, 0, burst.x, burst.y, r);
        const col  = burst.color;
        const fade = t > 0.7 ? Math.max(0, 1 - (t - 0.7) / 0.3) : 1;

        grad.addColorStop(0,    hexToRgba(col, 0.85 * fade));
        grad.addColorStop(0.4,  hexToRgba(col, 0.65 * fade));
        grad.addColorStop(0.75, hexToRgba(col, 0.25 * fade));
        grad.addColorStop(1,    hexToRgba(col, 0));

        ctx.beginPath();
        ctx.arc(burst.x, burst.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Powder particles shooting outward
        burst.particles.forEach(p => {
          const pr = r * p.speed;
          const px = burst.x + Math.cos(p.angle) * pr;
          const py = burst.y + Math.sin(p.angle) * pr;
          const pa = p.alpha * (1 - bt * p.decay * 40) * fade;
          if (pa <= 0) return;

          ctx.beginPath();
          ctx.arc(px, py, p.size * (1 - bt * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(col, Math.max(0, pa));
          ctx.fill();
        });
      });

      // White flash at start — gulal explosion
      if (t < 0.08 && phase === "intro") {
        const flashAlpha = Math.max(0, (0.08 - t) / 0.08 * 0.7);
        ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
        ctx.fillRect(0, 0, W, H);
      }
      if (t < 0.12 && phase === "transition") {
        const flashAlpha = Math.max(0, (0.12 - t) / 0.12 * 0.85);
        ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
        ctx.fillRect(0, 0, W, H);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, W, H);
        if (!doneRef.current) {
          doneRef.current = true;
          if (phase === "intro") onIntroComplete && onIntroComplete();
          if (phase === "transition") onTransitionComplete && onTransitionComplete();
        }
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, phase]);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", inset:0, zIndex:12,
      pointerEvents:"none",
      display: active ? "block" : "none",
    }} />
  );
}

// ── HEX TO RGBA ─────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── FLOATING COLOR PARTICLES ─────────────────────────────────────
function ColorParticles({ active }) {
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

    const particles = Array.from({ length: 80 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 2.5 + 0.5,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:    -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.7 + 0.2,
      color: HOLI_COLORS[Math.floor(Math.random() * HOLI_COLORS.length)],
      flicker:      Math.random() * Math.PI * 2,
      flickerSpeed: Math.random() * 0.02 + 0.006,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.flicker += p.flickerSpeed;
        const a = p.alpha * (0.4 + 0.6 * Math.sin(p.flicker));
        if (p.y < -10) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(p.color, a);
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [active]);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", inset:0, zIndex:2,
      pointerEvents:"none",
      opacity: active ? 1 : 0,
      transition:"opacity 1.5s ease",
    }} />
  );
}

// ── MAIN ────────────────────────────────────────────────────────
export default function VaultVideoHoli() {
  const params = useParams();
  const router = useRouter();
  const id     = (params?.id || "OJAS-2026-ENG-0001_V1").toUpperCase();
  const client = CLIENTS[id];

  // phases: black → intro → videos → outro → endcard
  const [phase,        setPhase]        = useState("black");
  const [videoIdx,     setVideoIdx]     = useState(0);
  const [introStep,    setIntroStep]    = useState(0);
  const [endStep,      setEndStep]      = useState(0);
  const [showPetals,   setShowPetals]   = useState(false);
  const [showParticles,setShowParticles]= useState(false);
  const [holiBurst,    setHoliBurst]    = useState(false);
  const [holiPhase,    setHoliPhase]    = useState("intro");
  const [videoVisible, setVideoVisible] = useState(false);
  const [captionVisible,setCaptionVisible]=useState(false);
  const [isMobile,     setIsMobile]     = useState(false);

  const timers   = useRef([]);
  const videoRef = useRef(null);
  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const after    = (ms, fn) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; };

  const videoSrc = (i) => `/vault/${id}/clip${String(i+1).padStart(2,"0")}.mp4`;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Opening sequence ───────────────────────────────────────
  const startSequence = useCallback(() => {
    // Holi burst intro
    setHoliPhase("intro");
    setHoliBurst(true);
    setShowParticles(true);

    after(400,  () => setIntroStep(1)); // line
    after(1200, () => setIntroStep(2)); // names
    after(2400, () => setIntroStep(3)); // date
    after(3600, () => setIntroStep(4)); // message
    after(5000, () => setShowPetals(true));
    // intro complete handled by HoliBurstCanvas onIntroComplete
  }, []);

  const onIntroComplete = useCallback(() => {
    setHoliBurst(false);
    after(400, () => {
      setPhase("videos");
      setVideoIdx(0);
      after(300, () => {
        setVideoVisible(true);
        after(1200, () => setCaptionVisible(true));
      });
    });
  }, []);

  useEffect(() => {
    if (!client) return;
    const kick = () => after(800, startSequence);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(kick);
    } else { kick(); }
    return clearAll;
  }, [client]);

  // ── Video ended — trigger color transition ──────────────────
  const onVideoEnded = useCallback(() => {
    setCaptionVisible(false);
    after(400, () => {
      setVideoVisible(false);
      const next = videoIdx + 1;
      if (next >= client.videos) {
        // All videos done → outro
        after(300, () => {
          setShowPetals(false);
          setPhase("outro");
          after(500,  () => setEndStep(1));
          after(1400, () => setEndStep(2));
          after(2600, () => setEndStep(3));
          after(3800, () => setEndStep(4));
          after(5200, () => setEndStep(5));
        });
      } else {
        // Color splash transition → next video
        after(200, () => {
          setHoliPhase("transition");
          setHoliBurst(true);
        });
      }
    });
  }, [videoIdx, client]);

  const onTransitionComplete = useCallback(() => {
    setHoliBurst(false);
    const next = videoIdx + 1;
    setVideoIdx(next);
    after(300, () => {
      setVideoVisible(true);
      after(1000, () => setCaptionVisible(true));
    });
  }, [videoIdx]);

  // Fallback timer if video doesn't fire onEnded (short clips)
  useEffect(() => {
    if (phase !== "videos") return;
    const fallback = setTimeout(onVideoEnded, VIDEO_DURATION + 2000);
    return () => clearTimeout(fallback);
  }, [phase, videoIdx]);

  // Replay video when idx changes
  useEffect(() => {
    if (phase !== "videos") return;
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [videoIdx, phase]);

  // ── Replay ─────────────────────────────────────────────────
  const handleReplay = () => {
    clearAll();
    setPhase("black"); setVideoIdx(0);
    setIntroStep(0); setEndStep(0);
    setShowPetals(false); setShowParticles(false);
    setHoliBurst(false); setVideoVisible(false);
    setCaptionVisible(false);
    after(300, startSequence);
  };

  if (!client) {
    return (
      <div style={{ background:COLORS.deep, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif" }}>
        <div style={{ fontSize:11, letterSpacing:"0.35em", color:COLORS.gold, textTransform:"uppercase", marginBottom:20 }}>NS OJAS Client Vault</div>
        <div style={{ fontSize:22, color:COLORS.white, marginBottom:12 }}>Vault Not Found</div>
        <div style={{ fontSize:13, color:"#666", marginBottom:40 }}>This vault doesn't exist or hasn't been activated yet.</div>
        <button onClick={() => router.push("/#vault-login")}
          style={{ padding:"14px 32px", background:COLORS.gold, color:"#000", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:700, border:"none", borderRadius:2, cursor:"pointer" }}>
          Return to NS OJAS
        </button>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, background:COLORS.deep, overflow:"hidden", fontFamily:"Georgia,serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500;600&family=Caveat:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { overflow:hidden; height:100%; }
        * { -webkit-tap-highlight-color:transparent; }
        @media (max-width:768px) { body { position:fixed; width:100%; } }

        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineGrow    { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
        @keyframes heartbeat   { 0%,100%{transform:scale(1)} 14%{transform:scale(1.25)} 28%{transform:scale(1)} 42%{transform:scale(1.15)} }
        @keyframes rainbow     { 0%{color:#E91E8C} 16%{color:#FF6B1A} 33%{color:#FFD700} 50%{color:#00BCD4} 66%{color:#9C27B0} 83%{color:#4CAF50} 100%{color:#E91E8C} }
        @keyframes colorBorder { 0%{border-color:#E91E8C} 25%{border-color:#FFD700} 50%{border-color:#00BCD4} 75%{border-color:#9C27B0} 100%{border-color:#E91E8C} }
        @keyframes petalRain   { from{opacity:0} to{opacity:1} }
        @keyframes captionIn   { from{opacity:0;transform:translateY(12px) rotate(-1deg)} to{opacity:1;transform:translateY(0) rotate(-1deg)} }
        @keyframes pulse       { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.05);opacity:1} }

        .fade-in    { animation:fadeIn 1.2s ease forwards; }
        .slide-up   { animation:fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .line-grow  { animation:lineGrow 1.2s cubic-bezier(0.16,1,0.3,1) forwards; }
        .heartbeat  { animation:heartbeat 1.8s ease-in-out infinite; }
        .rainbow    { animation:rainbow 3s linear infinite; }
        .color-border { animation:colorBorder 2s linear infinite; }
        .caption-in { animation:captionIn 1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .pulse      { animation:pulse 2.5s ease-in-out infinite; }

        video { object-fit:cover; object-position:top center; }
        @media (max-width:768px) {
          video { object-fit:contain !important; object-position:center !important; background:#000; }
        }
        @media (prefers-reduced-motion:reduce) {
          .heartbeat,.rainbow,.color-border,.pulse { animation:none !important; }
        }
      `}</style>

      {/* ── ROSE PETALS ── */}
      <RosePetalCanvas active={showPetals} intensity={phase === "outro" ? 1.8 : 1} />

      {/* ── COLOR PARTICLES ── */}
      <ColorParticles active={showParticles} />

      {/* ── HOLI BURST ── */}
      <HoliBurstCanvas
        active={holiBurst}
        phase={holiPhase}
        onIntroComplete={onIntroComplete}
        onTransitionComplete={onTransitionComplete}
      />

      {/* ══════════════════════════════════════════════════════
          INTRO — Holi opening title card
      ══════════════════════════════════════════════════════ */}
      {(phase === "black" || phase === "intro" || (phase === "videos" && introStep > 0 && !videoVisible)) && (
        <div style={{
          position:"fixed", inset:0, zIndex:10,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          opacity: introStep > 0 ? 1 : 0,
          transition:"opacity 0.8s ease",
          pointerEvents:"none",
        }}>
          {/* Colorful horizontal rule */}
          {introStep >= 1 && (
            <div className="line-grow" style={{
              width:"clamp(80px,18vw,180px)", height:2,
              background:`linear-gradient(90deg,${COLORS.magenta},${COLORS.orange},${COLORS.yellow},${COLORS.cyan},${COLORS.purple})`,
              marginBottom:40, transformOrigin:"center",
              borderRadius:1,
            }} />
          )}

          {/* Names — rainbow animated */}
          {introStep >= 2 && (
            <div className="slide-up" style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(34px,7.5vw,80px)",
              fontWeight:300,
              letterSpacing:"0.08em",
              textAlign:"center", lineHeight:1.05,
              marginBottom:20,
              textShadow:`0 0 40px rgba(255,255,255,0.3)`,
            }}>
              <span style={{ color:COLORS.white }}>{client.firstName}</span>
              <span className="rainbow" style={{ fontStyle:"italic" }}> & </span>
              <span style={{ color:COLORS.white }}>{client.secondName}</span>
            </div>
          )}

          {introStep >= 2 && (
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
              <div style={{ width:32, height:1.5, background:`linear-gradient(90deg,${COLORS.magenta},${COLORS.orange})`, borderRadius:1 }} />
              <span className="heartbeat" style={{ fontSize:18, color:COLORS.rose }}>♡</span>
              <div style={{ width:32, height:1.5, background:`linear-gradient(90deg,${COLORS.cyan},${COLORS.purple})`, borderRadius:1 }} />
            </div>
          )}

          {introStep >= 3 && (
            <div className="slide-up" style={{
              fontFamily:"'Montserrat',sans-serif",
              fontSize:"clamp(8px,1.6vw,11px)",
              fontWeight:300, letterSpacing:"0.5em",
              color:"rgba(255,255,255,0.65)",
              textTransform:"uppercase", marginBottom:24,
            }}>
              {client.date}
            </div>
          )}

          {introStep >= 4 && (
            <div className="slide-up" style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(13px,2vw,17px)",
              fontStyle:"italic", fontWeight:300,
              color:"rgba(255,255,255,0.55)",
              letterSpacing:"0.07em", textAlign:"center",
              maxWidth:400, padding:"0 28px", lineHeight:1.8,
            }}>
              {client.message}
            </div>
          )}

          {introStep >= 1 && (
            <div className="line-grow" style={{
              width:"clamp(80px,18vw,180px)", height:2,
              background:`linear-gradient(90deg,${COLORS.purple},${COLORS.cyan},${COLORS.yellow},${COLORS.orange},${COLORS.magenta})`,
              marginTop:40, transformOrigin:"center", borderRadius:1,
            }} />
          )}

          {/* Watermark */}
          {introStep >= 1 && (
            <div className="fade-in" style={{
              position:"absolute", bottom:20, right:28,
              fontFamily:"'Montserrat',sans-serif",
              fontSize:8, letterSpacing:"0.3em",
              color:"rgba(255,255,255,0.2)", textTransform:"uppercase",
            }}>
              NS OJAS · {new Date().getFullYear()}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          VIDEO PLAYER
      ══════════════════════════════════════════════════════ */}
      {phase === "videos" && (
        <div style={{
          position:"fixed", inset:0, zIndex:5,
          opacity: videoVisible ? 1 : 0,
          transition:"opacity 1s ease",
        }}>
          {/* Colorful animated border frame */}
          <div className="color-border" style={{
            position:"absolute", inset:isMobile ? 8 : 16,
            border:"1.5px solid",
            borderRadius:2,
            zIndex:3, pointerEvents:"none",
          }} />

          {/* Corner accents */}
          {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i) => (
            <div key={i} style={{
              position:"absolute", [v]: isMobile ? 4 : 10, [h]: isMobile ? 4 : 10,
              width:20, height:20, zIndex:4, pointerEvents:"none",
              borderTop:   v==="top"    ? `2px solid ${HOLI_COLORS[i*2 % HOLI_COLORS.length]}` : "none",
              borderBottom:v==="bottom" ? `2px solid ${HOLI_COLORS[i*2 % HOLI_COLORS.length]}` : "none",
              borderLeft:  h==="left"   ? `2px solid ${HOLI_COLORS[i*2 % HOLI_COLORS.length]}` : "none",
              borderRight: h==="right"  ? `2px solid ${HOLI_COLORS[i*2 % HOLI_COLORS.length]}` : "none",
            }} />
          ))}

          {/* Video */}
          <video
            ref={videoRef}
            src={videoSrc(videoIdx)}
            autoPlay
            playsInline
            muted
            onEnded={onVideoEnded}
            style={{
              position:"absolute", inset:0,
              width:"100%", height:"100%",
            }}
          />

          {/* Gradient overlays */}
          <div style={{
            position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
            background:"radial-gradient(ellipse at center, transparent 50%, rgba(26,10,46,0.4) 100%)",
          }} />
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:160, zIndex:2, pointerEvents:"none",
            background:`linear-gradient(transparent, rgba(26,10,46,0.85))`,
          }} />
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:80, zIndex:2, pointerEvents:"none",
            background:`linear-gradient(rgba(26,10,46,0.5), transparent)`,
          }} />

          {/* Caption — handwritten */}
          <div style={{
            position:"absolute", bottom: isMobile ? 36 : 52,
            left:0, right:0, zIndex:6,
            textAlign:"center", pointerEvents:"none",
            opacity: captionVisible ? 1 : 0,
            transition:"opacity 1s ease",
          }}>
            <div style={{
              display:"inline-block",
              fontFamily:"'Caveat',cursive",
              fontSize:"clamp(18px,3.5vw,26px)",
              color:COLORS.white,
              letterSpacing:"0.04em",
              textShadow:`0 2px 20px rgba(0,0,0,0.9), 0 0 40px ${HOLI_COLORS[videoIdx % HOLI_COLORS.length]}44`,
              transform:"rotate(-1deg)",
            }}>
              {client.captions[videoIdx]}
            </div>
          </div>

          {/* Video counter */}
          <div style={{
            position:"absolute", top: isMobile ? 18 : 28,
            left:0, right:0, textAlign:"center", zIndex:4, pointerEvents:"none",
          }}>
            <span style={{
              fontFamily:"'Montserrat',sans-serif",
              fontSize:9, letterSpacing:"0.32em",
              color:"rgba(255,255,255,0.45)", textTransform:"uppercase",
            }}>
              {String(videoIdx+1).padStart(2,"0")} · {String(client.videos).padStart(2,"0")}
            </span>
          </div>

          {/* Progress dots */}
          <div style={{
            position:"absolute", bottom:16, left:0, right:0,
            display:"flex", justifyContent:"center", gap:8, zIndex:4,
          }}>
            {Array.from({ length:client.videos }).map((_,i) => (
              <div key={i} style={{
                width: i===videoIdx ? 20 : 6,
                height:6, borderRadius:3,
                background: i===videoIdx
                  ? HOLI_COLORS[i % HOLI_COLORS.length]
                  : "rgba(255,255,255,0.25)",
                transition:"width 0.4s ease, background 0.4s ease",
              }} />
            ))}
          </div>

          {/* NS OJAS watermark */}
          <div style={{
            position:"absolute", bottom:8, right:18, zIndex:4,
            fontFamily:"'Montserrat',sans-serif",
            fontSize:7, letterSpacing:"0.28em",
            color:"rgba(255,255,255,0.2)", textTransform:"uppercase",
          }}>
            NS OJAS · {new Date().getFullYear()}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          OUTRO / END CARD — colorful celebration
      ══════════════════════════════════════════════════════ */}
      {phase === "outro" && (
        <div style={{
          position:"fixed", inset:0, zIndex:20,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          background:COLORS.deep,
          opacity: endStep >= 1 ? 1 : 0,
          transition:"opacity 1.2s ease",
        }}>
          <ColorParticles active={endStep >= 1} />
          <RosePetalCanvas active={endStep >= 1} intensity={2} />

          <div style={{ position:"relative", zIndex:22, textAlign:"center", padding:"0 36px" }}>

            {endStep >= 1 && (
              <div className="line-grow" style={{
                width:120, height:2,
                background:`linear-gradient(90deg,${COLORS.magenta},${COLORS.orange},${COLORS.yellow},${COLORS.cyan},${COLORS.purple})`,
                margin:"0 auto 44px", transformOrigin:"center", borderRadius:1,
              }} />
            )}

            {endStep >= 2 && (
              <div className="slide-up" style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"clamp(30px,6.5vw,64px)",
                fontWeight:300, letterSpacing:"0.07em",
                lineHeight:1.1, marginBottom:14,
              }}>
                <span style={{ color:COLORS.white }}>{client.firstName}</span>
                <span className="rainbow" style={{ fontStyle:"italic" }}> & </span>
                <span style={{ color:COLORS.white }}>{client.secondName}</span>
              </div>
            )}

            {endStep >= 2 && (
              <div className="heartbeat pulse" style={{ fontSize:28, color:COLORS.rose, margin:"18px 0" }}>♡</div>
            )}

            {endStep >= 3 && (
              <div className="slide-up" style={{
                fontFamily:"'Montserrat',sans-serif",
                fontSize:"clamp(8px,1.4vw,10px)",
                letterSpacing:"0.44em",
                color:"rgba(255,255,255,0.5)",
                textTransform:"uppercase", marginBottom:44,
              }}>
                {client.type} · {client.date}
              </div>
            )}

            {endStep >= 3 && (
              <div className="line-grow" style={{
                width:120, height:2,
                background:`linear-gradient(90deg,${COLORS.purple},${COLORS.cyan},${COLORS.yellow},${COLORS.orange},${COLORS.magenta})`,
                margin:"0 auto 44px", transformOrigin:"center", borderRadius:1,
              }} />
            )}

            {endStep >= 4 && client.weddingDate && (
              <div className="slide-up" style={{
                margin:"0 auto 36px", padding:"22px 38px",
                border:`1px solid rgba(255,255,255,0.15)`,
                borderRadius:2, background:"rgba(255,255,255,0.04)",
                display:"inline-block",
              }}>
                <div style={{
                  fontFamily:"'Caveat',cursive",
                  fontSize:"clamp(13px,2vw,17px)",
                  color:"rgba(255,255,255,0.5)", marginBottom:8,
                }}>
                  Save the Date
                </div>
                <div style={{
                  fontFamily:"'Cormorant Garamond',Georgia,serif",
                  fontSize:"clamp(20px,3.2vw,30px)",
                  fontWeight:300, fontStyle:"italic",
                  color:COLORS.white, letterSpacing:"0.06em",
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
                    padding:"14px 26px", background:"transparent", color:COLORS.gold,
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
                  fontFamily:"'Caveat',cursive",
                  fontSize:17, color:"rgba(255,255,255,0.35)",
                  padding:"10px 16px", transition:"color 0.3s",
                  letterSpacing:"0.04em",
                }}
                  onMouseEnter={e=>e.currentTarget.style.color=COLORS.rose}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.35)"}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                  </svg>
                  Relive the magic
                </button>
              </div>
            )}
          </div>

          {endStep >= 3 && (
            <div className="fade-in" style={{
              position:"absolute", bottom:24,
              fontFamily:"'Montserrat',sans-serif",
              fontSize:8, letterSpacing:"0.35em",
              color:"rgba(255,255,255,0.18)", textTransform:"uppercase",
            }}>
              NS OJAS MEDIA LABS · SRIKALAHASTI · {new Date().getFullYear()}
            </div>
          )}
        </div>
      )}

      {/* ── AUDIO — music plays during videos ── */}
      {phase === "videos" && (
        <audio src={`/vault/${id}/music.mp3`} autoPlay loop style={{ display:"none" }} />
      )}

    </div>
  );
}