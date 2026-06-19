"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

// ── CLIENT REGISTRY ─────────────────────────────────────────────
const CLIENTS = {
  "OJAS-2026-ENG-0001_A": {
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

// ── TIMING ──────────────────────────────────────────────────────
// Each photo display duration in ms (before burn starts)
const DURATIONS = [5000,3500,3500,3500,3500,3500,3500,3500,3500,3500,3500,3500,3500,4000,7000];
const BURN_DURATION = 1800; // film burn transition duration

// ── PALETTE ─────────────────────────────────────────────────────
const GOLD   = "#D4AF37";
const WHITE  = "#F5F5F0";
const EMBER  = "#FF6B1A"; // film burn orange/ember

// ── FILM GRAIN CANVAS ───────────────────────────────────────────
function FilmGrain({ opacity = 0.04 }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawGrain = () => {
      const w = canvas.width;
      const h = canvas.height;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() > 0.5 ? 255 : 0;
        data[i] = data[i+1] = data[i+2] = v;
        data[i+3] = Math.random() * 18;
      }
      ctx.putImageData(imageData, 0, 0);
      rafRef.current = requestAnimationFrame(drawGrain);
    };

    rafRef.current = requestAnimationFrame(drawGrain);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0,
      zIndex: 50,
      pointerEvents: "none",
      opacity,
      mixBlendMode: "overlay",
    }} />
  );
}

// ── PARTICLE SYSTEM ─────────────────────────────────────────────
function ParticleCanvas({ active }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 70 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.2 + 0.2,
      vx:    (Math.random() - 0.5) * 0.15,
      vy:    -Math.random() * 0.2 - 0.06,
      alpha: Math.random() * 0.6 + 0.1,
      flicker:      Math.random() * Math.PI * 2,
      flickerSpeed: Math.random() * 0.016 + 0.005,
      gold: Math.random() > 0.4,
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
          : `rgba(255,252,245,${a * 0.6})`;
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, zIndex: 1,
      pointerEvents: "none",
      opacity: active ? 1 : 0,
      transition: "opacity 2s ease",
    }} />
  );
}

// ── FILM BURN CANVAS ─────────────────────────────────────────────
// Draws a cinematic film burn sweeping across the screen
function FilmBurnCanvas({ burning, onComplete }) {
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const startRef   = useRef(null);
  const doneRef    = useRef(false);

  useEffect(() => {
    if (!burning) {
      doneRef.current = false;
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    startRef.current = null;
    doneRef.current  = false;

    const W = canvas.width;
    const H = canvas.height;

    const draw = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / BURN_DURATION, 1); // 0 → 1

      ctx.clearRect(0, 0, W, H);

      // Phase 1 (0→0.5): burn sweeps right — white → orange → black
      // Phase 2 (0.5→1): burn clears left revealing next photo
      if (t < 0.5) {
        const p = t / 0.5; // 0→1 within phase 1
        const burnX = p * W * 1.2; // leading edge of burn

        // Trail: deep burn scar (black + embers) behind leading edge
        const trailGrad = ctx.createLinearGradient(0, 0, burnX, 0);
        trailGrad.addColorStop(0,    "rgba(0,0,0,0.95)");
        trailGrad.addColorStop(0.7,  "rgba(15,5,0,0.98)");
        trailGrad.addColorStop(0.88, `rgba(120,30,0,0.9)`);
        trailGrad.addColorStop(0.95, `rgba(${255},${Math.floor(107*(1-p))},0,0.95)`);
        trailGrad.addColorStop(1,    "rgba(255,255,220,1)");
        ctx.fillStyle = trailGrad;
        ctx.fillRect(0, 0, Math.min(burnX + 60, W), H);

        // Hot leading edge glow — irregular, organic
        for (let y = 0; y < H; y += 3) {
          const jitter  = (Math.random() - 0.5) * 28;
          const ex      = burnX + jitter;
          const glowW   = 40 + Math.random() * 30;
          const gGrad   = ctx.createLinearGradient(ex - 10, 0, ex + glowW, 0);
          gGrad.addColorStop(0,   "rgba(255,255,200,0.9)");
          gGrad.addColorStop(0.2, `rgba(255,140,0,0.85)`);
          gGrad.addColorStop(0.6, `rgba(180,40,0,0.4)`);
          gGrad.addColorStop(1,   "rgba(0,0,0,0)");
          ctx.fillStyle = gGrad;
          ctx.fillRect(ex - 10, y, glowW + 10, 3);
        }

      } else {
        // Phase 2: black fills right side, burn clears from left
        const p     = (t - 0.5) / 0.5;
        const clearX = p * W * 1.15;

        // Right: full black
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, W, H);

        // Clear left section — transparent (next photo shows through)
        ctx.clearRect(0, 0, clearX, H);

        // Thin ember edge on clear boundary
        for (let y = 0; y < H; y += 3) {
          const jitter = (Math.random() - 0.5) * 14;
          const ex     = clearX + jitter;
          const eGrad  = ctx.createLinearGradient(ex - 5, 0, ex + 24, 0);
          eGrad.addColorStop(0,   "rgba(0,0,0,0)");
          eGrad.addColorStop(0.3, `rgba(${Math.floor(255*(1-p))},${Math.floor(80*(1-p))},0,${0.7*(1-p)})`);
          eGrad.addColorStop(1,   "rgba(0,0,0,0)");
          ctx.fillStyle = eGrad;
          ctx.fillRect(ex - 5, y, 30, 3);
        }
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, W, H);
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete && onComplete();
        }
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [burning]);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0,
      zIndex: 8,
      pointerEvents: "none",
      display: burning ? "block" : "none",
    }} />
  );
}

// ── MAIN ────────────────────────────────────────────────────────
export default function VaultReelCinema() {
  const params = useParams();
  const router = useRouter();
  const id     = (params?.id || "").toUpperCase();
  const client = CLIENTS[id];

  // phases: black → titlecard → reel → endcard
  const [phase,      setPhase]      = useState("black");
  const [frameIdx,   setFrameIdx]   = useState(0);
  const [nextIdx,    setNextIdx]    = useState(1);
  const [showCurrent,setShowCurrent]= useState(true);  // which photo is "on top"
  const [burning,    setBurning]    = useState(false);  // film burn active
  const [titleStep,  setTitleStep]  = useState(0);
  const [endStep,    setEndStep]    = useState(0);
  const [particles,  setParticles]  = useState(false);
  const [titleOut,   setTitleOut]   = useState(false);

  const timerRefs = useRef([]);
  const clearAll  = () => { timerRefs.current.forEach(clearTimeout); timerRefs.current = []; };
  const after     = (ms, fn) => { const t = setTimeout(fn, ms); timerRefs.current.push(t); return t; };

  const photoSrc  = (i) => `/vault/${id}/${String(i + 1).padStart(2,"0")}.webp`;

  // ── Preload ────────────────────────────────────────────────
  useEffect(() => {
    if (!client) return;
    for (let i = 1; i <= client.photos; i++) {
      const img = new Image();
      img.src = `/vault/${id}/${String(i).padStart(2,"0")}.webp`;
    }
  }, [client, id]);

  // ── Opening sequence ───────────────────────────────────────
  const startSequence = useCallback(() => {
    setParticles(true);
    setPhase("titlecard");
    after(500,  () => setTitleStep(1));
    after(1300, () => setTitleStep(2));
    after(2500, () => setTitleStep(3));
    after(3700, () => setTitleStep(4));
    after(5600, () => setTitleOut(true));
    after(7200, () => {
      setPhase("reel");
      setFrameIdx(0);
      setNextIdx(1);
      setShowCurrent(true);
      setParticles(false);
    });
  }, []);

  useEffect(() => {
    if (!client) return;
    const firstImg = new Image();
    firstImg.src = `/vault/${id}/01.webp`;

    const kick = () => after(700, startSequence);

    if (document.fonts && document.fonts.ready) {
      Promise.all([
        document.fonts.ready,
        new Promise(res => {
          if (firstImg.complete) res();
          else { firstImg.onload = res; firstImg.onerror = res; }
        }),
      ]).then(kick);
    } else {
      firstImg.onload  = kick;
      firstImg.onerror = kick;
      if (firstImg.complete) kick();
    }
    return clearAll;
  }, [client]);

  // ── Replay ─────────────────────────────────────────────────
  const handleReplay = () => {
    clearAll();
    setBurning(false);
    setPhase("black");
    setFrameIdx(0); setNextIdx(1);
    setShowCurrent(true);
    setTitleStep(0); setTitleOut(false);
    setEndStep(0); setParticles(false);
    after(300, startSequence);
  };

  // ── Advance frame with film burn ───────────────────────────
  const advanceFrame = useCallback(() => {
    if (!client) return;
    const total = client.photos;
    const next  = (frameIdx + 1) % total;

    // Preload next-next
    const nn = new Image();
    nn.src = photoSrc((next + 1) % total);

    // Start burn after current photo duration
    after(DURATIONS[frameIdx] - BURN_DURATION, () => {
      // At burn midpoint — swap the underlying photo
      setNextIdx(next);
      setBurning(true);
    });

  }, [frameIdx, client, id]);

  // Burn complete callback
  const onBurnComplete = useCallback(() => {
    setBurning(false);
    const next  = (frameIdx + 1) % client.photos;

    if (next === 0) {
      // End of reel → endcard
      setPhase("endcard");
      after(400,  () => setEndStep(1));
      after(1200, () => setEndStep(2));
      after(2200, () => setEndStep(3));
      after(3400, () => setEndStep(4));
      after(4600, () => setEndStep(5));
    } else {
      setFrameIdx(next);
      setNextIdx((next + 1) % client.photos);
    }
  }, [frameIdx, client]);

  useEffect(() => {
    if (phase !== "reel") return;
    advanceFrame();
  }, [phase, frameIdx]);

  // ── Not found ──────────────────────────────────────────────
  if (!client) {
    return (
      <div style={{ background:"#000", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"Georgia, serif" }}>
        <div style={{ fontSize:11, letterSpacing:"0.35em", color:GOLD, textTransform:"uppercase", marginBottom:20 }}>NS OJAS Client Vault</div>
        <div style={{ fontSize:22, color:WHITE, marginBottom:12 }}>Vault Not Found</div>
        <div style={{ fontSize:13, color:"#666", marginBottom:40 }}>This vault doesn't exist or hasn't been activated yet.</div>
        <button onClick={() => router.push("/#vault-login")}
          style={{ padding:"14px 32px", background:GOLD, color:"#000", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:700, border:"none", borderRadius:2, cursor:"pointer" }}>
          Return to NS OJAS
        </button>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"#000", overflow:"hidden", fontFamily:"Georgia, serif" }}>

      {/* ── CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { overflow:hidden; height:100%; background:#000; }
        * { -webkit-tap-highlight-color: transparent; }
        @media (max-width:768px) { body { position:fixed; width:100%; } }

        /* ── Letterbox bars — cinematic 2.35:1 ── */
        .letterbox-top, .letterbox-bottom {
          position: fixed;
          left: 0; right: 0;
          z-index: 30;
          pointer-events: none;
        }
        .letterbox-top    { top: 0;    height: var(--bar-h); background: #000; }
        .letterbox-bottom { bottom: 0; height: var(--bar-h); background: #000; }

        /* ── Animations ── */
        @keyframes fadeIn       { from{opacity:0}       to{opacity:1} }
        @keyframes fadeSlideUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineGrow     { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
        @keyframes heartbeat    { 0%,100%{transform:scale(1);opacity:.7} 14%{transform:scale(1.18);opacity:1} 28%{transform:scale(1);opacity:.7} 42%{transform:scale(1.1);opacity:1} }
        @keyframes goldPulse    { 0%,100%{text-shadow:0 0 0 rgba(212,175,55,0)} 50%{text-shadow:0 0 40px rgba(212,175,55,0.5)} }
        @keyframes subtleDrift  { 0%,100%{transform:scale(1.0) translate(0,0)} 33%{transform:scale(1.025) translate(-0.4%,-0.3%)} 66%{transform:scale(1.02) translate(0.3%,0.2%)} }
        @keyframes emberFlicker { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes slideInLeft  { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }

        .fade-in     { animation: fadeIn 1.2s ease forwards; }
        .slide-up    { animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .line-grow   { animation: lineGrow 1.2s cubic-bezier(0.16,1,0.3,1) forwards; }
        .heartbeat   { animation: heartbeat 2.2s ease-in-out infinite; }
        .gold-pulse  { animation: goldPulse 3s ease-in-out infinite; }
        .photo-drift { animation: subtleDrift 18s ease-in-out infinite; }
        .ember       { animation: emberFlicker 1.4s ease-in-out infinite; }
        .slide-left  { animation: slideInLeft 1s cubic-bezier(0.16,1,0.3,1) forwards; }

        /* Title card fade out */
        .title-out { opacity:0 !important; transition: opacity 1.4s ease !important; }

        /* Mobile: full photo visible */
        .reel-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
        }
        @media (max-width:768px) {
          .reel-photo {
            object-fit: contain !important;
            object-position: center center !important;
            background: #000;
          }
        }

        /* End card buttons mobile */
        @media (max-width:480px) {
          .end-buttons { flex-direction:column !important; align-items:center !important; }
          .end-buttons a { width:100% !important; max-width:280px; justify-content:center !important; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion:reduce) {
          .photo-drift, .heartbeat, .ember { animation:none !important; }
        }
      `}</style>

      {/* ── CSS VARIABLE for bar height ── */}
      <style>{`
        :root {
          --bar-h: clamp(32px, 8vh, 80px);
        }
      `}</style>

      {/* ── LETTERBOX BARS ── */}
      <div className="letterbox-top"  />
      <div className="letterbox-bottom" />

      {/* ── FILM GRAIN ── */}
      <FilmGrain opacity={0.045} />

      {/* ── PARTICLES ── */}
      <ParticleCanvas active={particles} />

      {/* ── FILM BURN LAYER ── */}
      <FilmBurnCanvas burning={burning} onComplete={onBurnComplete} />

      {/* ══════════════════════════════════════════════════════
          TITLE CARD
      ══════════════════════════════════════════════════════ */}
      {phase === "titlecard" && (
        <div className={titleOut ? "title-out" : ""} style={{
          position:"fixed", inset:0, zIndex:10,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          opacity:1,
        }}>

          {/* Thin horizontal rule — top */}
          {titleStep >= 1 && (
            <div className="line-grow" style={{
              width: "clamp(60px,15vw,140px)",
              height: 1,
              background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
              marginBottom: 40,
              transformOrigin: "center",
            }} />
          )}

          {/* Names */}
          {titleStep >= 2 && (
            <div className="slide-up gold-pulse" style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(34px, 7vw, 76px)",
              fontWeight: 300,
              color: WHITE,
              letterSpacing: "0.1em",
              textAlign: "center",
              lineHeight: 1.05,
              marginBottom: 20,
            }}>
              {client.firstName}
              <span style={{ color:GOLD, fontStyle:"italic" }}> & </span>
              {client.secondName}
            </div>
          )}

          {/* Heartbeat divider */}
          {titleStep >= 2 && (
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
              <div style={{ width:28, height:0.5, background:`rgba(212,175,55,0.45)` }} />
              <span className="heartbeat" style={{ fontSize:13, color:GOLD }}>♡</span>
              <div style={{ width:28, height:0.5, background:`rgba(212,175,55,0.45)` }} />
            </div>
          )}

          {/* Date */}
          {titleStep >= 3 && (
            <div className="slide-up" style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "clamp(9px, 1.8vw, 12px)",
              fontWeight: 300,
              letterSpacing: "0.5em",
              color: "rgba(212,175,55,0.75)",
              textTransform: "uppercase",
              marginBottom: 28,
            }}>
              {client.date}
            </div>
          )}

          {/* Message */}
          {titleStep >= 4 && (
            <div className="slide-up" style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(13px, 2.2vw, 17px)",
              fontStyle: "italic",
              fontWeight: 300,
              color: "rgba(200,200,200,0.65)",
              letterSpacing: "0.07em",
              textAlign: "center",
              maxWidth: 380,
              padding: "0 24px",
            }}>
              {client.message}
            </div>
          )}

          {/* Bottom rule */}
          {titleStep >= 1 && (
            <div className="line-grow" style={{
              width: "clamp(60px,15vw,140px)",
              height: 1,
              background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
              marginTop: 40,
              transformOrigin: "center",
            }} />
          )}

          {/* Corner brackets */}
          {titleStep >= 1 && (<>
            <div className="fade-in" style={{ position:"absolute", top:"calc(var(--bar-h) + 20px)", left:24, width:20, height:20, borderTop:`1px solid rgba(212,175,55,0.4)`, borderLeft:`1px solid rgba(212,175,55,0.4)` }} />
            <div className="fade-in" style={{ position:"absolute", top:"calc(var(--bar-h) + 20px)", right:24, width:20, height:20, borderTop:`1px solid rgba(212,175,55,0.4)`, borderRight:`1px solid rgba(212,175,55,0.4)` }} />
            <div className="fade-in" style={{ position:"absolute", bottom:"calc(var(--bar-h) + 20px)", left:24, width:20, height:20, borderBottom:`1px solid rgba(212,175,55,0.4)`, borderLeft:`1px solid rgba(212,175,55,0.4)` }} />
            <div className="fade-in" style={{ position:"absolute", bottom:"calc(var(--bar-h) + 20px)", right:24, width:20, height:20, borderBottom:`1px solid rgba(212,175,55,0.4)`, borderRight:`1px solid rgba(212,175,55,0.4)` }} />
          </>)}

          {/* Watermark */}
          {titleStep >= 1 && (
            <div className="fade-in" style={{
              position:"absolute", bottom:"calc(var(--bar-h) + 14px)", right:28,
              fontFamily:"'Montserrat', sans-serif",
              fontSize:8, letterSpacing:"0.3em",
              color:"rgba(212,175,55,0.3)",
              textTransform:"uppercase",
            }}>
              NS OJAS · {new Date().getFullYear()}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PHOTO REEL
      ══════════════════════════════════════════════════════ */}
      {(phase === "reel" || phase === "endcard") && (
        <div style={{
          position:"fixed",
          top:"var(--bar-h)", bottom:"var(--bar-h)",
          left:0, right:0,
          zIndex:5,
          overflow:"hidden",
        }}>
          {/* Current photo */}
          <div style={{
            position:"absolute", inset:0,
            opacity: phase === "endcard" ? 0 : 1,
            transition: "opacity 1s ease",
          }}>
            <img
              src={photoSrc(frameIdx)}
              alt=""
              className="photo-drift reel-photo"
            />
          </div>

          {/* Next photo (sits beneath burn) */}
          <div style={{ position:"absolute", inset:0, opacity: burning ? 1 : 0 }}>
            <img
              src={photoSrc(nextIdx)}
              alt=""
              className="photo-drift reel-photo"
            />
          </div>

          {/* Cinematic vignette */}
          <div style={{
            position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
            background:"radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.6) 100%)",
          }} />

          {/* Bottom gradient */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:140, zIndex:2,
            background:"linear-gradient(transparent, rgba(0,0,0,0.8))",
            pointerEvents:"none",
          }} />

          {/* Top gradient */}
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:80, zIndex:2,
            background:"linear-gradient(rgba(0,0,0,0.45), transparent)",
            pointerEvents:"none",
          }} />

          {/* Corner brackets */}
          <div style={{ position:"absolute", top:16, left:16, zIndex:3, pointerEvents:"none" }}>
            <div style={{ width:16, height:16, borderTop:`1px solid rgba(212,175,55,0.4)`, borderLeft:`1px solid rgba(212,175,55,0.4)` }} />
          </div>
          <div style={{ position:"absolute", top:16, right:16, zIndex:3, pointerEvents:"none" }}>
            <div style={{ width:16, height:16, borderTop:`1px solid rgba(212,175,55,0.4)`, borderRight:`1px solid rgba(212,175,55,0.4)` }} />
          </div>

          {/* Frame counter */}
          {phase === "reel" && (
            <div style={{
              position:"absolute", top:20, right:44, zIndex:3,
              fontFamily:"'Montserrat', monospace",
              fontSize:8, letterSpacing:"0.28em",
              color:"rgba(212,175,55,0.5)",
              textTransform:"uppercase",
            }}>
              {String(frameIdx + 1).padStart(2,"0")} · {String(client.photos).padStart(2,"0")}
            </div>
          )}

          {/* First frame overlay — names */}
          {phase === "reel" && frameIdx === 0 && !burning && (
            <div className="slide-left" style={{
              position:"absolute", bottom:36, left:32, zIndex:3,
            }}>
              <div style={{
                fontFamily:"'Cormorant Garamond', Georgia, serif",
                fontSize:"clamp(20px,3.5vw,40px)",
                fontWeight:300, color:WHITE,
                letterSpacing:"0.06em",
                textShadow:"0 2px 24px rgba(0,0,0,0.9)",
              }}>
                {client.firstName}
                <span style={{ color:GOLD, fontStyle:"italic" }}> & </span>
                {client.secondName}
              </div>
              <div style={{
                fontFamily:"'Montserrat', sans-serif",
                fontSize:9, letterSpacing:"0.38em",
                color:"rgba(212,175,55,0.7)",
                textTransform:"uppercase", marginTop:8,
              }}>
                {client.type} · {client.date}
              </div>
            </div>
          )}

          {/* Last frame — wedding date */}
          {phase === "reel" && frameIdx === client.photos - 1 && !burning && (
            <div className="slide-up" style={{
              position:"absolute", bottom:36, right:32, zIndex:3,
              textAlign:"right",
            }}>
              <div style={{
                fontFamily:"'Montserrat', sans-serif",
                fontSize:8, letterSpacing:"0.32em",
                color:"rgba(212,175,55,0.6)",
                textTransform:"uppercase", marginBottom:6,
              }}>
                Save the Date
              </div>
              <div style={{
                fontFamily:"'Cormorant Garamond', Georgia, serif",
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
            position:"absolute", bottom:14, right:18, zIndex:3,
            fontFamily:"'Montserrat', sans-serif",
            fontSize:7, letterSpacing:"0.28em",
            color:"rgba(212,175,55,0.28)",
            textTransform:"uppercase",
          }}>
            NS OJAS · {new Date().getFullYear()}
          </div>

          {/* Progress bar */}
          {phase === "reel" && (
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, zIndex:4, background:"rgba(255,255,255,0.05)" }}>
              <div style={{
                height:"100%",
                background:`linear-gradient(90deg, ${GOLD}, rgba(212,175,55,0.4))`,
                width:`${((frameIdx + 1) / client.photos) * 100}%`,
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
          background:"#000",
          opacity: endStep >= 1 ? 1 : 0,
          transition:"opacity 1.2s ease",
        }}>
          <ParticleCanvas active={endStep >= 1} />

          <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"0 32px" }}>

            {endStep >= 1 && (
              <div className="line-grow" style={{
                width:80, height:0.5,
                background:`linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                margin:"0 auto 40px", transformOrigin:"center",
              }} />
            )}

            {endStep >= 2 && (
              <div className="slide-up gold-pulse" style={{
                fontFamily:"'Cormorant Garamond', Georgia, serif",
                fontSize:"clamp(28px,6vw,58px)",
                fontWeight:300, color:WHITE,
                letterSpacing:"0.06em", lineHeight:1.1, marginBottom:12,
              }}>
                {client.firstName}
                <span style={{ color:GOLD, fontStyle:"italic" }}> & </span>
                {client.secondName}
              </div>
            )}

            {endStep >= 2 && (
              <div className="heartbeat" style={{ fontSize:20, color:GOLD, margin:"16px 0" }}>♡</div>
            )}

            {endStep >= 3 && (
              <div className="slide-up" style={{
                fontFamily:"'Montserrat', sans-serif",
                fontSize:"clamp(8px,1.5vw,10px)",
                letterSpacing:"0.42em",
                color:"rgba(212,175,55,0.55)",
                textTransform:"uppercase", marginBottom:40,
              }}>
                {client.type} · {client.date}
              </div>
            )}

            {endStep >= 3 && (
              <div className="line-grow" style={{
                width:80, height:0.5,
                background:`linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                margin:"0 auto 40px", transformOrigin:"center",
              }} />
            )}

            {endStep >= 4 && (
              <div className="slide-up" style={{
                fontFamily:"'Cormorant Garamond', Georgia, serif",
                fontSize:"clamp(13px,2vw,16px)",
                fontStyle:"italic", fontWeight:300,
                color:"rgba(200,200,200,0.6)",
                letterSpacing:"0.06em",
                maxWidth:420, margin:"0 auto 48px", lineHeight:1.8,
              }}>
                Your complete gallery is being prepared<br />
                with the care your love deserves.
              </div>
            )}

            {endStep >= 4 && client.weddingDate && (
              <div className="slide-up" style={{
                margin:"0 auto 32px", padding:"20px 36px",
                border:"1px solid rgba(212,175,55,0.18)",
                borderRadius:2, background:"rgba(212,175,55,0.03)",
                display:"inline-block",
              }}>
                <div style={{
                  fontFamily:"'Montserrat', sans-serif",
                  fontSize:"clamp(7px,1.3vw,9px)",
                  letterSpacing:"0.45em",
                  color:"rgba(212,175,55,0.5)",
                  textTransform:"uppercase", marginBottom:10,
                }}>
                  Save the Date
                </div>
                <div style={{
                  fontFamily:"'Cormorant Garamond', Georgia, serif",
                  fontSize:"clamp(18px,3vw,28px)",
                  fontWeight:300, fontStyle:"italic",
                  color:WHITE, letterSpacing:"0.06em",
                }}>
                  Wedding · {client.weddingDate}
                </div>
              </div>
            )}

            {endStep >= 5 && (
              <div className="slide-up end-buttons" style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:20 }}>
                <a
                  href={`https://wa.me/?text=Our%20NS%20OJAS%20engagement%20memory%20is%20live%20%F0%9F%8C%9F%20View%20our%20story%3A%20${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"14px 24px", background:"#25D366", color:"#fff",
                    fontFamily:"'Montserrat', sans-serif",
                    fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase",
                    fontWeight:600, textDecoration:"none", borderRadius:2,
                    boxShadow:"0 0 24px rgba(37,211,102,0.28)",
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2C6.472 2 2 6.472 2 11.99c0 1.751.459 3.41 1.265 4.861L2 22l5.278-1.24A9.965 9.965 0 0 0 11.99 22C17.508 22 22 17.528 22 12.01 22 6.472 17.508 2 11.99 2z"/></svg>
                  Share Our Story
                </a>
                <a
                  href="https://wa.me/919704551102"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"14px 24px", background:"transparent", color:GOLD,
                    fontFamily:"'Montserrat', sans-serif",
                    fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase",
                    fontWeight:600, textDecoration:"none", borderRadius:2,
                    border:"1px solid rgba(212,175,55,0.32)",
                  }}>
                  Contact Simha
                </a>
              </div>
            )}

            {endStep >= 5 && (
              <div className="slide-up" style={{ marginTop:8 }}>
                <button
                  onClick={handleReplay}
                  style={{
                    background:"none", border:"none", cursor:"pointer",
                    display:"inline-flex", alignItems:"center", gap:8,
                    fontFamily:"'Montserrat', sans-serif",
                    fontSize:9, letterSpacing:"0.3em",
                    color:"rgba(212,175,55,0.4)",
                    textTransform:"uppercase", padding:"10px 16px",
                    transition:"color 0.3s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = GOLD}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(212,175,55,0.4)"}
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
              position:"absolute", bottom:32,
              fontFamily:"'Montserrat', sans-serif",
              fontSize:8, letterSpacing:"0.35em",
              color:"rgba(212,175,55,0.28)",
              textTransform:"uppercase",
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