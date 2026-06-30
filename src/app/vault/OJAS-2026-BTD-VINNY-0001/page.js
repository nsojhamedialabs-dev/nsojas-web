"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── CLIENT REGISTRY ─────────────────────────────────────────────
const CLIENT = {
  id:          "OJAS-2026-BTD-VINNY-0001",
  childName:   "Vinny",
  albumTitle:  "Vinny's 5th Birthday Celebration",
  subtitle:    "Our Little Princess is Five",
  date:        "2026",
  totalPages:  11,          // page_002.webp .. page_012.webp
  startFile:   2,
  music:       true,
};

// ── PALETTE — Candy / Sugarplum Kingdom ──────────────────────────
const ROSE      = "#C98A93";   // rose-gold text colour from the designs
const ROSE_SOFT = "#D9A6AE";
const MINT      = "#BFE3D6";
const BLUSH     = "#F6D9DE";
const CREAM     = "#FBF6F1";
const DEEP      = "#241A1C";   // near-black warm tone for chrome/UI

const PAGE_DURATION  = 6500;   // ms per page auto-play
const TRANS_DURATION = 1100;

// ── PER-PAGE DIRECTION ────────────────────────────────────────────
// transition: sweep | fadezoom | curtain | bubbleRise | constellation
// particles : sparkle | confetti | bubbles | petals | dust
// interactive: none | tilt | bubbleFloat | shimmerTap
const PAGES = [
  { n: 2,  transition: "sweep",        particles: "sparkle",  interactive: "tilt"        }, // cover
  { n: 3,  transition: "fadezoom",     particles: "petals",   interactive: "none"        }, // family kiss
  { n: 4,  transition: "curtain",      particles: "confetti", interactive: "none"        }, // 5th bday grid
  { n: 5,  transition: "fadezoom",     particles: "dust",     interactive: "none"        }, // family roots
  { n: 6,  transition: "bubbleRise",   particles: "bubbles",  interactive: "bubbleFloat"  }, // dad bubbles
  { n: 7,  transition: "constellation",particles: "sparkle",  interactive: "shimmerTap"  }, // unicorn hex
  { n: 8,  transition: "sweep",        particles: "sparkle",  interactive: "tilt"        }, // diamonds
  { n: 9,  transition: "fadezoom",     particles: "confetti", interactive: "none"        }, // decor collage
  { n: 10, transition: "curtain",      particles: "petals",   interactive: "none"        }, // castle family
  { n: 11, transition: "constellation",particles: "sparkle",  interactive: "shimmerTap"  }, // constellation kids
  { n: 12, transition: "fadezoom",     particles: "dust",     interactive: "none"        }, // finale
];

const fileFor = (n) => `/vault/${CLIENT.id}/page_${String(n).padStart(3, "0")}.webp`;

// ── SPARKLE / CONFETTI / BUBBLE / PETAL / DUST CANVAS ────────────
function ParticleCanvas({ type, active, paused }) {
  const ref = useRef(null);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  const raf = useRef(null);
  const items = useRef([]);

  const spawn = useCallback((W, H) => {
    switch (type) {
      case "balloons":
        return {
          x: Math.random() * W, y: H + 40 + Math.random() * 200,
          vx: (Math.random() - 0.5) * 0.4, vy: -(0.35 + Math.random() * 0.55),
          size: 22 + Math.random() * 20,
          sway: Math.random() * Math.PI * 2, swaySpeed: 0.012 + Math.random() * 0.015,
          color: [ROSE_SOFT, MINT, BLUSH, "#F4C9A0", "#E6C2D8"][Math.floor(Math.random() * 5)],
          opacity: 0.75 + Math.random() * 0.25,
        };
      case "confetti":
        return {
          x: Math.random() * W, y: -20 - Math.random() * 60,
          vx: (Math.random() - 0.5) * 1.6, vy: 1 + Math.random() * 1.8,
          rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.12,
          size: 5 + Math.random() * 7,
          color: [ROSE_SOFT, MINT, BLUSH, "#F4C9A0"][Math.floor(Math.random() * 4)],
          opacity: 0.8 + Math.random() * 0.2,
        };
      case "bubbles":
        return {
          x: Math.random() * W, y: H + 20 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 0.5, vy: -(0.4 + Math.random() * 0.9),
          size: 6 + Math.random() * 16,
          sway: Math.random() * Math.PI * 2, swaySpeed: 0.015 + Math.random() * 0.02,
          opacity: 0.25 + Math.random() * 0.3,
        };
      case "petals":
        return {
          x: Math.random() * W, y: -20 - Math.random() * 60,
          vx: (Math.random() - 0.5) * 1.1, vy: 0.6 + Math.random() * 1.2,
          rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.04,
          size: 6 + Math.random() * 6,
          opacity: 0.55 + Math.random() * 0.35,
        };
      case "dust":
        return {
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25, vy: -(0.1 + Math.random() * 0.3),
          size: 1 + Math.random() * 2.2,
          twinkle: Math.random() * Math.PI * 2, twinkleSpeed: 0.03 + Math.random() * 0.05,
          opacity: 0.3 + Math.random() * 0.5,
        };
      default: // sparkle
        return {
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.3, vy: -(0.2 + Math.random() * 0.5),
          size: 2 + Math.random() * 3,
          twinkle: Math.random() * Math.PI * 2, twinkleSpeed: 0.04 + Math.random() * 0.06,
          opacity: 0.4 + Math.random() * 0.6,
        };
    }
  }, [type]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = canvas.offsetWidth);
    let H = (canvas.height = canvas.offsetHeight);
    const count = type === "dust" || type === "sparkle" ? 50 : type === "bubbles" ? 16 : type === "balloons" ? 14 : 36;
    items.current = Array.from({ length: count }, () => spawn(W, H));

    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", onResize);

    const drawPetal = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.opacity;
      ctx.fillStyle = BLUSH;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    const drawConfetti = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    };
    const drawBubble = (p) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fill();
      ctx.restore();
    };
    const drawBalloon = (p) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size * 0.62, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(p.x - 4, p.y + p.size);
      ctx.lineTo(p.x, p.y + p.size + 8);
      ctx.lineTo(p.x + 4, p.y + p.size);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + p.size + 8);
      ctx.lineTo(p.x, p.y + p.size + 34);
      ctx.stroke();
      ctx.restore();
    };
    const drawSpark = (p) => {
      const tw = 0.5 + 0.5 * Math.sin(p.twinkle);
      ctx.save();
      ctx.globalAlpha = p.opacity * tw;
      ctx.fillStyle = "#FFF6E8";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };

    const tick = () => {
      if (!pausedRef.current) {
        ctx.clearRect(0, 0, W, H);
        items.current.forEach((p) => {
        if (type === "balloons") {
          p.sway += p.swaySpeed; p.x += Math.sin(p.sway) * 0.5; p.y += p.vy;
          if (p.y < -60) Object.assign(p, spawn(W, H), { y: H + 60 });
          drawBalloon(p);
        } else if (type === "confetti") {
          p.x += p.vx; p.y += p.vy; p.rot += p.rotSpeed;
          if (p.y > H + 20) Object.assign(p, spawn(W, H), { y: -20 });
          drawConfetti(p);
        } else if (type === "bubbles") {
          p.sway += p.swaySpeed; p.x += Math.sin(p.sway) * 0.4; p.y += p.vy;
          if (p.y < -20) Object.assign(p, spawn(W, H), { y: H + 20 });
          drawBubble(p);
        } else if (type === "petals") {
          p.x += p.vx; p.y += p.vy; p.rot += p.rotSpeed;
          if (p.y > H + 20) Object.assign(p, spawn(W, H), { y: -20 });
          drawPetal(p);
        } else {
          p.twinkle += p.twinkleSpeed; p.x += p.vx; p.y += p.vy;
          if (p.y < -10) p.y = H + 10;
          drawSpark(p);
        }
      });
      }
      raf.current = requestAnimationFrame(tick);
    };
    if (active) tick();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", onResize); };
  }, [type, active, spawn]);

  return (
    <canvas ref={ref} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 5,
    }} />
  );
}

// ── BABY UNICORN — flies across on a random path every so often ──
function BabyUnicorn({ size = 70 }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 120 96" fill="none">
      {/* tail */}
      <path d="M14 52 C2 46, 2 64, 16 66 C8 70, 10 80, 22 76 C16 82, 26 88, 32 80"
        fill="none" stroke="#F3C9D6" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
      {/* body */}
      <ellipse cx="58" cy="58" rx="34" ry="22" fill="#FBF1F4" stroke="#F0C3D2" strokeWidth="2" />
      {/* legs */}
      {[[40,76],[52,78],[68,78],[80,76]].map(([x,y],i)=>(
        <rect key={i} x={x-3} y={y-14} width="6" height="16" rx="3" fill="#FBF1F4" stroke="#F0C3D2" strokeWidth="1.5" />
      ))}
      {/* neck + head */}
      <path d="M82 46 C92 36, 96 24, 90 14 C100 18, 104 30, 96 42 C100 44, 104 50, 100 56 C92 50, 84 50, 82 46 Z"
        fill="#FBF1F4" stroke="#F0C3D2" strokeWidth="2" />
      {/* horn */}
      <path d="M91 16 L96 0 L100 17 Z" fill="#F4D27A" stroke="#E0B85E" strokeWidth="1" />
      {/* mane — rainbow-soft */}
      <path d="M84 18 C90 14, 94 20, 90 26 C96 24, 98 32, 92 36" stroke="#F3A8C4" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85"/>
      <path d="M88 24 C94 22, 96 30, 90 34 C96 34, 96 42, 88 44" stroke="#BFE3D6" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85"/>
      <path d="M84 32 C90 32, 90 40, 82 42" stroke="#D9C2F0" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85"/>
      {/* ear */}
      <path d="M88 16 L92 6 L94 17 Z" fill="#F3C9D6" />
      {/* eye */}
      <circle cx="93" cy="32" r="2.6" fill="#3A2A2E" />
      <circle cx="92.2" cy="31" r="0.8" fill="#fff" />
      {/* cheek blush */}
      <circle cx="86" cy="36" r="3.5" fill="#F6BFCB" opacity="0.6" />
      {/* sparkle trail */}
      <circle cx="20" cy="40" r="1.6" fill="#FFF6E8" opacity="0.8" />
      <circle cx="28" cy="30" r="1.2" fill="#FFF6E8" opacity="0.6" />
      <circle cx="10" cy="58" r="1.3" fill="#FFF6E8" opacity="0.7" />
    </svg>
  );
}

function UnicornFlyby({ enabled }) {
  const [flight, setFlight] = useState(null); // {fromX,fromY,toX,toY,duration,flip}
  const timeoutRef = useRef(null);

  const randomEdgePoint = (w, h) => {
    const edge = Math.floor(Math.random() * 4);
    const pad = 80;
    if (edge === 0) return { x: -pad, y: Math.random() * h * 0.7 + h * 0.05 };
    if (edge === 1) return { x: w + pad, y: Math.random() * h * 0.7 + h * 0.05 };
    if (edge === 2) return { x: Math.random() * w, y: -pad };
    return { x: Math.random() * w, y: h + pad };
  };

  const scheduleNext = useCallback(() => {
    const delay = 18000 + Math.random() * 14000; // 18–32s between flights
    timeoutRef.current = setTimeout(() => {
      if (!enabled) { scheduleNext(); return; }
      const w = window.innerWidth, h = window.innerHeight;
      const from = randomEdgePoint(w, h);
      const to = randomEdgePoint(w, h);
      const duration = 7000 + Math.random() * 3000;
      setFlight({ from, to, duration, flip: to.x < from.x });
      setTimeout(() => setFlight(null), duration + 200);
      scheduleNext();
    }, delay);
  }, [enabled]);

  useEffect(() => {
    scheduleNext();
    return () => clearTimeout(timeoutRef.current);
  }, [scheduleNext]);

  if (!flight) return null;
  return (
    <div style={{
      position: "absolute", left: 0, top: 0, zIndex: 6, pointerEvents: "none",
      transform: `translate(${flight.from.x}px, ${flight.from.y}px)`,
      animation: `unicornFly-${flight.flip ? "rev" : "fwd"} ${flight.duration}ms ease-in-out forwards`,
      "--ux": `${flight.to.x}px`, "--uy": `${flight.to.y}px`,
      "--fx": `${flight.from.x}px`, "--fy": `${flight.from.y}px`,
    }}>
      <style jsx>{`
        @keyframes unicornFly-fwd {
          0% { transform: translate(var(--fx), var(--fy)) scaleX(1) translateY(0); }
          50% { transform: translate(calc((var(--fx) + var(--ux)) / 2), calc((var(--fy) + var(--uy)) / 2 - 40px)) scaleX(1) translateY(-6px); }
          100% { transform: translate(var(--ux), var(--uy)) scaleX(1) translateY(0); }
        }
        @keyframes unicornFly-rev {
          0% { transform: translate(var(--fx), var(--fy)) scaleX(-1) translateY(0); }
          50% { transform: translate(calc((var(--fx) + var(--ux)) / 2), calc((var(--fy) + var(--uy)) / 2 - 40px)) scaleX(-1) translateY(-6px); }
          100% { transform: translate(var(--ux), var(--uy)) scaleX(-1) translateY(0); }
        }
      `}</style>
      <BabyUnicorn size={64} />
    </div>
  );
}

// ── SPARKLE STAR LOGO (lightweight signature mark) ───────────────
function StarMark({ size = 60, glow = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="46" stroke={ROSE_SOFT} strokeWidth="1.2"
        opacity="0.55" style={{ filter: glow ? `drop-shadow(0 0 10px ${ROSE_SOFT})` : "none" }} />
      <path d="M50 22 L56 44 L78 50 L56 56 L50 78 L44 56 L22 50 L44 44 Z"
        fill={ROSE_SOFT} opacity="0.9" />
    </svg>
  );
}

export default function VinnyAlbum() {
  const router = useRouter();
  const [phase, setPhase] = useState("cover");      // cover | album | closing
  const [pageIdx, setPageIdx] = useState(0);
  const [transStep, setTransStep] = useState(0);
  const [endStep, setEndStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shimmer, setShimmer] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [assetsReady, setAssetsReady] = useState(false);
  const [minTimeDone, setMinTimeDone] = useState(false);
  const touchStartX = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // ── preload every page image + music in the background ──
  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    const total = PAGES.length;
    PAGES.forEach((p) => {
      const img = new window.Image();
      img.onload = img.onerror = () => {
        if (cancelled) return;
        loaded += 1;
        setLoadProgress(Math.round((loaded / total) * 100));
        if (loaded === total) setAssetsReady(true);
      };
      img.src = fileFor(p.n);
    });
    // keep the loading scene on screen for at least this long so it never feels rushed
    const minTimer = setTimeout(() => setMinTimeDone(true), 2600);
    return () => { cancelled = true; clearTimeout(minTimer); };
  }, []);

  const readyToEnter = assetsReady && minTimeDone;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 820);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── autoplay loop ──
  useEffect(() => {
    if (phase !== "album" || paused) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => goNext(), PAGE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [phase, pageIdx, paused]);

  const goNext = useCallback(() => {
    setPageIdx((i) => {
      if (i >= CLIENT.totalPages - 1) {
        setPhase("closing");
        return i;
      }
      return i + 1;
    });
  }, []);
  const goPrev = useCallback(() => {
    setPageIdx((i) => Math.max(0, i - 1));
  }, []);

  // ── closing sequence reveal ──
  useEffect(() => {
    if (phase !== "closing") return;
    setEndStep(0);
    const steps = [400, 1100, 1900, 2700, 3500];
    const ids = steps.map((d, i) => setTimeout(() => setEndStep(i + 1), d));
    return () => ids.forEach(clearTimeout);
  }, [phase]);

  // ── touch swipe ──
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  // ── tilt interaction (cover / diamond pages) ──
  const onMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -8;
    setTilt({ x, y });
  };

  const current = PAGES[pageIdx];

  return (
    <div style={{
      position: "fixed", inset: 0, background: DEEP, overflow: "hidden",
      fontFamily: "'Montserrat',sans-serif",
    }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0; transform:translateY(18px)} to{opacity:1; transform:translateY(0)} }
        @keyframes lineGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes pulseGlow { 0%,100%{opacity:0.85} 50%{opacity:1} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes curtainOpen { from{clip-path:inset(0 0 0 0)} to{clip-path:inset(0 0 0 100%)} }
        .fade-in{animation:fadeIn 1s ease both}
        .slide-up{animation:slideUp 0.9s cubic-bezier(.2,.8,.2,1) both}
        .line-grow{animation:lineGrow 1s ease both}
        .pulse-glow{animation:pulseGlow 2.4s ease-in-out infinite}
        .float-y{animation:floatY 4s ease-in-out infinite}
        .paused-scene *{animation-play-state:paused !important;}
      `}</style>

      {/* ════════ COVER / LOADING ════════ */}
      {phase === "cover" && (
        <div className="fade-in" style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center",
          background: `radial-gradient(ellipse at center, #2c2024 0%, ${DEEP} 100%)`,
          padding: 24, overflow: "hidden",
        }}>
          <ParticleCanvas type="balloons" active={true} />
          <ParticleCanvas type="sparkle" active={true} />

          <div className="float-y" style={{ marginBottom: 24, position: "relative", zIndex: 2 }}>
            <StarMark size={isMobile ? 50 : 64} glow />
          </div>
          <div style={{
            position: "relative", zIndex: 2,
            fontSize: 10, letterSpacing: "0.4em",
            color: "rgba(217,166,174,0.6)", textTransform: "uppercase", marginBottom: 16,
          }}>NS OJAS Media Labs · Srikalahasti</div>

          <div className="slide-up" style={{
            position: "relative", zIndex: 2,
            fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontWeight: 500,
            fontSize: "clamp(40px,9vw,84px)", color: ROSE_SOFT, lineHeight: 1.05,
          }}>{CLIENT.childName}</div>

          <div className="slide-up" style={{
            position: "relative", zIndex: 2,
            fontFamily: "'Cormorant Garamond',serif", fontWeight: 300,
            fontSize: "clamp(18px,3.4vw,30px)", color: CREAM, marginTop: 6, letterSpacing: "0.04em",
          }}>{CLIENT.subtitle}</div>

          <div className="slide-up" style={{
            position: "relative", zIndex: 2,
            fontSize: 9, letterSpacing: "0.35em", color: "rgba(191,227,214,0.6)",
            textTransform: "uppercase", marginTop: 14,
          }}>5th Birthday Celebrations</div>

          {/* loading progress / enter button */}
          <div style={{ position: "relative", zIndex: 2, marginTop: 46, minHeight: 70 }}>
            {!readyToEnter ? (
              <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 160, height: 2, background: "rgba(217,166,174,0.2)",
                  borderRadius: 2, overflow: "hidden",
                }}>
                  <div style={{
                    width: `${loadProgress}%`, height: "100%", background: ROSE_SOFT,
                    transition: "width 0.3s ease",
                  }} />
                </div>
                <div style={{
                  fontSize: 9, letterSpacing: "0.3em", color: "rgba(217,166,174,0.5)",
                  textTransform: "uppercase",
                }}>Gathering the Magic · {loadProgress}%</div>
              </div>
            ) : (
              <button
                className="fade-in"
                onClick={() => setPhase("album")}
                style={{
                  background: "transparent", border: `1px solid ${ROSE_SOFT}`,
                  color: ROSE_SOFT, padding: "14px 36px", fontSize: 11, letterSpacing: "0.3em",
                  textTransform: "uppercase", borderRadius: 2, cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = ROSE_SOFT; e.currentTarget.style.color = DEEP; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = ROSE_SOFT; }}
              >Open the Album</button>
            )}
          </div>
        </div>
      )}

      {/* ════════ ALBUM PAGES ════════ */}
      {phase === "album" && (
        <div
          className={paused ? "paused-scene" : ""}
          style={{ position: "absolute", inset: 0 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseMove={current.interactive === "tilt" ? onMouseMove : undefined}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          onClick={() => {
            if (current.interactive === "shimmerTap" || current.interactive === "bubbleFloat") {
              setShimmer(true); setTimeout(() => setShimmer(false), 900);
            }
          }}
        >
          {/* page image with per-transition entrance */}
          <div key={pageIdx} className={
            current.transition === "curtain" ? "fade-in" : "fade-in"
          } style={{
            position: "absolute", inset: 0,
            transform: current.interactive === "tilt"
              ? `scale(1.03) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
              : "none",
            transition: "transform 0.25s ease-out",
            transformStyle: "preserve-3d",
          }}>
            <img
              src={fileFor(current.n)}
              alt={`${CLIENT.albumTitle} page ${pageIdx + 1}`}
              style={{
                width: "100%", height: "100%", objectFit: "contain",
                filter: shimmer ? "brightness(1.08) saturate(1.1)" : "none",
                transition: "filter 0.5s ease",
              }}
            />
          </div>

          <ParticleCanvas type={current.particles} active={true} paused={paused} />
          <UnicornFlyby enabled={!paused} />

          {/* nav arrows (desktop) */}
          {!isMobile && (
            <>
              <button onClick={goPrev} style={navBtnStyle("left")}>‹</button>
              <button onClick={goNext} style={navBtnStyle("right")}>›</button>
            </>
          )}

          {/* progress dots */}
          <div style={{
            position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 7, zIndex: 10,
          }}>
            {PAGES.map((_, i) => (
              <div key={i} onClick={() => setPageIdx(i)} style={{
                width: i === pageIdx ? 18 : 6, height: 6, borderRadius: 3,
                background: i === pageIdx ? ROSE_SOFT : "rgba(255,255,255,0.35)",
                cursor: "pointer", transition: "all 0.3s",
              }} />
            ))}
          </div>

          {/* pause/play */}
          <button onClick={() => {
            setPaused((p) => {
              const next = !p;
              if (audioRef.current) { next ? audioRef.current.pause() : audioRef.current.play().catch(() => {}); }
              return next;
            });
          }} style={{
            position: "absolute", top: 16, right: 16, zIndex: 10,
            background: "rgba(0,0,0,0.3)", border: "none", color: "#fff",
            width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 14,
          }}>{paused ? "▶" : "❚❚"}</button>

          {/* page counter */}
          <div style={{
            position: "absolute", top: 18, left: 18, zIndex: 10,
            fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.55)",
          }}>{String(pageIdx + 1).padStart(2, "0")} / {String(CLIENT.totalPages).padStart(2, "0")}</div>
        </div>
      )}

      {/* ════════ CLOSING CARD ════════ */}
      {phase === "closing" && (
        <div className="fade-in" style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center",
          background: `radial-gradient(ellipse at center, #2c2024 0%, ${DEEP} 100%)`,
          padding: "0 24px",
        }}>
          <ParticleCanvas type="confetti" active={endStep >= 1} />
          {endStep >= 1 && <div className="line-grow" style={lineStyle} />}
          {endStep >= 2 && (
            <div className="slide-up pulse-glow" style={{
              fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontWeight: 500,
              fontSize: "clamp(34px,7vw,60px)", color: ROSE_SOFT, marginBottom: 10,
            }}>{CLIENT.childName} turns Five</div>
          )}
          {endStep >= 2 && <div style={{ fontSize: 18, color: ROSE_SOFT, margin: "10px 0" }}>✦</div>}
          {endStep >= 3 && (
            <div className="slide-up" style={{
              fontSize: 10, letterSpacing: "0.4em", color: "rgba(217,166,174,0.55)",
              textTransform: "uppercase", marginBottom: 36,
            }}>{CLIENT.albumTitle} · {CLIENT.date}</div>
          )}
          {endStep >= 3 && <div className="line-grow" style={lineStyle} />}
          {endStep >= 4 && (
            <div className="slide-up" style={{ margin: "28px 0 14px" }}>
              <StarMark size={isMobile ? 64 : 88} glow />
            </div>
          )}
          {endStep >= 4 && (
            <div className="slide-up" style={{
              fontSize: 9, letterSpacing: "0.35em", color: "rgba(217,166,174,0.5)",
              textTransform: "uppercase", marginBottom: 6,
            }}>NS OJAS Media Labs</div>
          )}
          {endStep >= 4 && (
            <div className="fade-in" style={{
              fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic",
              fontSize: 13, color: "rgba(217,166,174,0.35)", marginBottom: 38,
            }}>Srikalahasti</div>
          )}
          {endStep >= 5 && (
            <div className="slide-up" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${CLIENT.childName}'s 5th Birthday album is now live ✨ Crafted by NS OJAS Media Labs. View here: ` + (typeof window !== "undefined" ? window.location.href : ""))}`}
                target="_blank" rel="noopener noreferrer" style={waBtn}
              >Share This Memory</a>
              <a href="https://wa.me/919704551102" target="_blank" rel="noopener noreferrer" style={outlineBtn}>Contact NS OJAS</a>
            </div>
          )}
          {endStep >= 5 && (
            <button onClick={() => { setPhase("cover"); setPageIdx(0); setEndStep(0); }} style={replayBtn}>
              ↺ Relive the Memories
            </button>
          )}
        </div>
      )}

      {(phase === "album" || phase === "closing") && CLIENT.music && (
        <audio ref={audioRef} src={`/vault/${CLIENT.id}/music.mp3`} autoPlay loop style={{ display: "none" }} />
      )}
    </div>
  );
}

const lineStyle = {
  width: "clamp(60px,12vw,120px)", height: 0.5,
  background: `linear-gradient(90deg,transparent,${ROSE_SOFT},transparent)`,
  margin: "0 auto 32px", transformOrigin: "center",
};
const navBtnStyle = (side) => ({
  position: "absolute", top: "50%", [side]: 14, transform: "translateY(-50%)",
  zIndex: 10, background: "rgba(0,0,0,0.25)", border: "none", color: "#fff",
  width: 44, height: 44, borderRadius: "50%", fontSize: 22, cursor: "pointer",
});
const waBtn = {
  display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px",
  background: "#25D366", color: "#fff", fontSize: 10, letterSpacing: "0.18em",
  textTransform: "uppercase", fontWeight: 600, textDecoration: "none", borderRadius: 2,
};
const outlineBtn = {
  display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px",
  background: "transparent", color: "#D9A6AE", fontSize: 10, letterSpacing: "0.18em",
  textTransform: "uppercase", fontWeight: 600, textDecoration: "none", borderRadius: 2,
  border: "1px solid rgba(217,166,174,0.4)",
};
const replayBtn = {
  marginTop: 22, background: "none", border: "none", cursor: "pointer",
  fontSize: 9, letterSpacing: "0.3em", color: "rgba(217,166,174,0.45)",
  textTransform: "uppercase", padding: "10px 16px",
};