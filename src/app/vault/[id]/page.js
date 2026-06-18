"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

// ── CLIENT REGISTRY ─────────────────────────────────────────────
const CLIENTS = {
  "OJAS-2026-ENG-0001": {
    names: "Sandeep & Neelima",
    firstName: "Sandeep",
    secondName: "Neelima",
    date: "17 · 06 · 2026",
    weddingDate: "19 · 08 · 2026",
    type: "Engagement",
    photos: 15,
    message: "A promise made in love. A story just beginning.",
  },
};

// ── TIMING ──────────────────────────────────────────────────────
const DURATIONS = [5000,3500,3500,3500,3500,3500,3500,3500,3500,3500,3500,3500,3500,4000,7000];
const FADE_DURATION = 1200;
const GOLD   = "#D4AF37";
const SILVER = "#C8C8C8";
const WHITE  = "#F5F5F0";

// ── PARTICLE SYSTEM ─────────────────────────────────────────────
function ParticleCanvas({ active }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const particles = useRef([]);

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

    // Spawn particles
    particles.current = Array.from({ length: 90 }, () => ({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      r:      Math.random() * 1.4 + 0.3,
      vx:     (Math.random() - 0.5) * 0.18,
      vy:     -Math.random() * 0.22 - 0.08,
      alpha:  Math.random() * 0.7 + 0.15,
      flicker: Math.random() * Math.PI * 2,
      flickerSpeed: Math.random() * 0.018 + 0.006,
      gold:   Math.random() > 0.38,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.flicker += p.flickerSpeed;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.flicker));
        if (p.y < -10) p.y = canvas.height + 5;
        if (p.x < -10) p.x = canvas.width + 5;
        if (p.x > canvas.width + 10) p.x = -5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(212,175,55,${a})`
          : `rgba(255,252,245,${a * 0.7})`;
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

// ── MAIN REEL ───────────────────────────────────────────────────
export default function VaultReel() {
  const params  = useParams();
  const router  = useRouter();
  const id      = (params?.id || "").toUpperCase();
  const client  = CLIENTS[id];

  const [phase,       setPhase]       = useState("black");
  // phases: black → titlecard → reel → endcard
  const [frameIdx,    setFrameIdx]    = useState(0);
  const [opacity,     setOpacity]     = useState(0);
  const [nextOpacity, setNextOpacity] = useState(0);
  const [nextIdx,     setNextIdx]     = useState(1);
  const [titleStep,   setTitleStep]   = useState(0);
  // titleStep: 0=hidden 1=particles+line 2=names 3=date 4=message 5=fadeout
  const [endStep,     setEndStep]     = useState(0);
  const [particles,   setParticles]   = useState(false);

  const timerRef = useRef(null);
  const clear    = () => { if (timerRef.current) clearTimeout(timerRef.current); };
  const after    = (ms, fn) => { clear(); timerRef.current = setTimeout(fn, ms); };

  // ── Replay function ─────────────────────────────────────────
  const handleReplay = () => {
    clear();
    setPhase("black");
    setFrameIdx(0);
    setNextIdx(1);
    setOpacity(0);
    setNextOpacity(0);
    setTitleStep(0);
    setEndStep(0);
    setParticles(false);
    // Small delay then restart opening sequence
    setTimeout(() => {
      setParticles(true);
      setPhase("titlecard");
      setTimeout(() => setTitleStep(1), 600);
      setTimeout(() => setTitleStep(2), 1400);
      setTimeout(() => setTitleStep(3), 2600);
      setTimeout(() => setTitleStep(4), 3800);
      setTimeout(() => setTitleStep(5), 5800);
      setTimeout(() => {
        setPhase("reel");
        setFrameIdx(0);
        setNextIdx(1);
        setOpacity(0);
        setTimeout(() => setOpacity(1), 80);
      }, 7200);
    }, 300);
  };

  // ── Preload images ──────────────────────────────────────────
  useEffect(() => {
    if (!client) return;
    for (let i = 1; i <= client.photos; i++) {
      const img = new Image();
      img.src = `/vault/${id}/${String(i).padStart(2,"0")}.jpg`;
    }
  }, [client, id]);

  // ── Opening sequence ────────────────────────────────────────
  useEffect(() => {
    if (!client) return;
    // 800ms pure black → particles appear → title sequence
    after(800, () => {
      setParticles(true);
      setPhase("titlecard");
      after(600,  () => setTitleStep(1)); // line appears
      after(1400, () => setTitleStep(2)); // names
      after(2600, () => setTitleStep(3)); // date
      after(3800, () => setTitleStep(4)); // message
      after(5800, () => setTitleStep(5)); // fadeout
      after(7200, () => {
        setPhase("reel");
        setFrameIdx(0);
        setNextIdx(1);
        setOpacity(0);
        after(80, () => setOpacity(1));
      });
    });
    return clear;
  }, [client]);

  // ── Reel advance ────────────────────────────────────────────
  const advanceFrame = useCallback(() => {
    if (!client) return;
    const total = client.photos;
    const next  = (frameIdx + 1) % total;

    // Preload next-next
    const nn = new Image();
    nn.src = `/vault/${id}/${String((next + 1) % total + 1).padStart(2,"0")}.jpg`;

    setNextIdx(next);
    setNextOpacity(0);

    // Cross-dissolve
    after(DURATIONS[frameIdx] - FADE_DURATION, () => {
      setNextOpacity(1);
      after(FADE_DURATION, () => {
        if (next === 0) {
          // Looped back — go to endcard instead
          setPhase("endcard");
          setOpacity(0);
          after(600,  () => setEndStep(1));
          after(1400, () => setEndStep(2));
          after(2400, () => setEndStep(3));
          after(3600, () => setEndStep(4));
          after(4800, () => setEndStep(5));
        } else {
          setFrameIdx(next);
          setNextIdx((next + 1) % total);
          setOpacity(1);
          setNextOpacity(0);
        }
      });
    });
  }, [frameIdx, client, id]);

  useEffect(() => {
    if (phase !== "reel") return;
    const t = setTimeout(advanceFrame, DURATIONS[frameIdx]);
    return () => clearTimeout(t);
  }, [phase, frameIdx, advanceFrame]);

  // ── Not found ───────────────────────────────────────────────
  if (!client) {
    return (
      <div style={{ background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase", marginBottom: 20 }}>NS OJAS Client Vault</div>
        <div style={{ fontSize: 22, color: WHITE, marginBottom: 12 }}>Vault Not Found</div>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 40 }}>This vault doesn't exist or hasn't been activated yet.</div>
        <button onClick={() => router.push("/#vault-login")}
          style={{ padding: "14px 32px", background: GOLD, color: "#000", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, border: "none", borderRadius: 2, cursor: "pointer", fontFamily: "inherit" }}>
          Return to NS OJAS
        </button>
      </div>
    );
  }

  const photoSrc = (i) => `/vault/${id}/${String(i + 1).padStart(2,"0")}.webp`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", overflow: "hidden", fontFamily: "Georgia, serif" }}>

      {/* ── CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes breathe {
          0%,100% { transform: scale(1.0); }
          50%      { transform: scale(1.03); }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes goldPulse {
          0%,100% { text-shadow: 0 0 0px rgba(212,175,55,0); }
          50%      { text-shadow: 0 0 30px rgba(212,175,55,0.4); }
        }
        @keyframes heartbeat {
          0%,100% { transform: scale(1);    opacity: 0.7; }
          14%      { transform: scale(1.18); opacity: 1;   }
          28%      { transform: scale(1);    opacity: 0.7; }
          42%      { transform: scale(1.10); opacity: 1;   }
        }
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to   { transform: translateY(500%);  }
        }
        .photo-breathe { animation: breathe 12s ease-in-out infinite; }
        .line-grow     { animation: lineGrow 1.2s cubic-bezier(0.16,1,0.3,1) forwards; }
        .slide-up      { animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-in-el    { animation: fadeIn 1.4s ease forwards; }
        .gold-pulse    { animation: goldPulse 3s ease-in-out infinite; }
        .heartbeat     { animation: heartbeat 2.2s ease-in-out infinite; }
        .scanline      { animation: scanline 8s linear infinite; }

        /* ── MOBILE FIRST ── */
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; background: #000; }
        * { -webkit-tap-highlight-color: transparent; }

        /* Touch-friendly buttons on mobile */
        @media (max-width: 480px) {
          .end-buttons { flex-direction: column !important; align-items: center !important; }
          .end-buttons a, .end-buttons button {
            width: 100% !important;
            justify-content: center !important;
            max-width: 280px;
          }
        }

        /* Prevent any accidental scroll on mobile */
        @media (max-width: 768px) {
          body { position: fixed; width: 100%; }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .photo-breathe { animation: none !important; }
          .scanline      { animation: none !important; }
          .heartbeat     { animation: none !important; }
        }
      `}</style>

      {/* ── PARTICLE LAYER ── */}
      <ParticleCanvas active={particles && phase !== "reel"} />

      {/* ── TITLE CARD ── */}
      {phase === "titlecard" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          opacity: titleStep >= 5 ? 0 : 1,
          transition: titleStep >= 5 ? "opacity 1.4s ease" : "none",
        }}>
          {/* Outer rings */}
          {titleStep >= 1 && (
            <>
              <div className="fade-in-el" style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", border: "0.5px solid rgba(212,175,55,0.2)", pointerEvents: "none" }} />
              <div className="fade-in-el" style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", border: "0.5px solid rgba(212,175,55,0.3)", pointerEvents: "none" }} />
            </>
          )}

          {/* Gold horizontal line */}
          {titleStep >= 1 && (
            <div className="line-grow" style={{ width: 120, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, marginBottom: 36, transformOrigin: "center" }} />
          )}

          {/* Names */}
          {titleStep >= 2 && (
            <div className="slide-up gold-pulse" style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(36px, 7vw, 72px)",
              fontWeight: 300,
              color: WHITE,
              letterSpacing: "0.08em",
              textAlign: "center",
              lineHeight: 1.1,
              marginBottom: 18,
            }}>
              {client.firstName}
              <span style={{ color: GOLD, fontStyle: "italic", fontWeight: 300 }}> & </span>
              {client.secondName}
            </div>
          )}

          {/* Dot divider */}
          {titleStep >= 2 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ width: 32, height: 0.5, background: "rgba(212,175,55,0.5)" }} />
              <div className="heartbeat" style={{ fontSize: 14, color: GOLD }}>♡</div>
              <div style={{ width: 32, height: 0.5, background: "rgba(212,175,55,0.5)" }} />
            </div>
          )}

          {/* Date */}
          {titleStep >= 3 && (
            <div className="slide-up" style={{
              fontFamily: "'Montserrat', system-ui, sans-serif",
              fontSize: "clamp(10px, 1.8vw, 13px)",
              fontWeight: 300,
              letterSpacing: "0.45em",
              color: "rgba(212,175,55,0.8)",
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
              color: "rgba(200,200,200,0.7)",
              letterSpacing: "0.08em",
              textAlign: "center",
              maxWidth: 380,
            }}>
              {client.message}
            </div>
          )}

          {/* Bottom gold line */}
          {titleStep >= 1 && (
            <div className="line-grow" style={{ width: 120, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, marginTop: 36, transformOrigin: "center" }} />
          )}

          {/* NS OJAS watermark */}
          {titleStep >= 1 && (
            <div className="fade-in-el" style={{
              position: "absolute", bottom: 32, right: 32,
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 9, letterSpacing: "0.3em",
              color: "rgba(212,175,55,0.35)",
              textTransform: "uppercase",
            }}>
              NS OJAS · {new Date().getFullYear()}
            </div>
          )}
        </div>
      )}

      {/* ── PHOTO REEL ── */}
      {(phase === "reel" || phase === "endcard") && (
        <div style={{ position: "fixed", inset: 0, zIndex: 5 }}>

          {/* Current photo */}
          <div style={{
            position: "absolute", inset: 0,
            opacity: phase === "endcard" ? 0 : opacity,
            transition: `opacity ${FADE_DURATION}ms cubic-bezier(0.4,0,0.2,1)`,
          }}>
            <img
              src={photoSrc(frameIdx)}
              alt=""
              className="photo-breathe"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>

          {/* Next photo crossfade */}
          <div style={{
            position: "absolute", inset: 0,
            opacity: nextOpacity,
            transition: `opacity ${FADE_DURATION}ms cubic-bezier(0.4,0,0.2,1)`,
            zIndex: 1,
          }}>
            <img
              src={photoSrc(nextIdx)}
              alt=""
              className="photo-breathe"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>

          {/* Cinematic dark vignette */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }} />
          {/* Bottom gradient for HUD */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 160, zIndex: 2,
            background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
            pointerEvents: "none",
          }} />
          {/* Top gradient */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 100, zIndex: 2,
            background: "linear-gradient(rgba(0,0,0,0.4), transparent)",
            pointerEvents: "none",
          }} />

          {/* Subtle scanline — barely visible film feel */}
          <div className="scanline" style={{
            position: "absolute", left: 0, right: 0, height: "30%", zIndex: 2,
            background: "linear-gradient(transparent, rgba(255,255,255,0.012), transparent)",
            pointerEvents: "none",
          }} />

          {/* HUD: top-left corner bracket */}
          <div style={{ position: "absolute", top: 20, left: 20, zIndex: 3, pointerEvents: "none" }}>
            <div style={{ width: 18, height: 18, borderTop: "1px solid rgba(212,175,55,0.45)", borderLeft: "1px solid rgba(212,175,55,0.45)" }} />
          </div>
          <div style={{ position: "absolute", top: 20, right: 20, zIndex: 3, pointerEvents: "none" }}>
            <div style={{ width: 18, height: 18, borderTop: "1px solid rgba(212,175,55,0.45)", borderRight: "1px solid rgba(212,175,55,0.45)" }} />
          </div>

          {/* Frame counter — top right */}
          {phase === "reel" && (
            <div style={{
              position: "absolute", top: 24, right: 48, zIndex: 3,
              fontFamily: "'Montserrat', monospace",
              fontSize: 9, letterSpacing: "0.25em",
              color: "rgba(212,175,55,0.5)",
              textTransform: "uppercase",
            }}>
              {String(frameIdx + 1).padStart(2,"0")} · {String(client.photos).padStart(2,"0")}
            </div>
          )}

          {/* Special overlays per frame */}
          {phase === "reel" && frameIdx === 0 && (
            <div style={{
              position: "absolute", bottom: 48, left: 40, zIndex: 3,
              opacity: opacity,
              transition: "opacity 1.5s ease 0.5s",
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(22px, 4vw, 42px)",
                fontWeight: 300,
                color: WHITE,
                letterSpacing: "0.06em",
                textShadow: "0 2px 20px rgba(0,0,0,0.8)",
              }}>
                {client.firstName}
                <span style={{ color: GOLD, fontStyle: "italic" }}> & </span>
                {client.secondName}
              </div>
              <div style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 10, letterSpacing: "0.35em",
                color: "rgba(212,175,55,0.7)",
                textTransform: "uppercase",
                marginTop: 8,
              }}>
                {client.type} · {client.date}
              </div>
            </div>
          )}

          {/* Last frame: wedding date teaser */}
          {phase === "reel" && frameIdx === client.photos - 1 && (
            <div style={{
              position: "absolute", bottom: 48, right: 40, zIndex: 3,
              textAlign: "right",
              opacity: opacity,
              transition: "opacity 1.5s ease 1s",
            }}>
              <div style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 9, letterSpacing: "0.3em",
                color: "rgba(212,175,55,0.6)",
                textTransform: "uppercase",
                marginBottom: 6,
              }}>
                Save the Date
              </div>
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(16px, 2.5vw, 24px)",
                fontWeight: 300, fontStyle: "italic",
                color: WHITE,
                letterSpacing: "0.05em",
              }}>
                Wedding · {client.weddingDate}
              </div>
            </div>
          )}

          {/* NS OJAS watermark — always */}
          <div style={{
            position: "absolute", bottom: 20, right: 20, zIndex: 3,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 8, letterSpacing: "0.3em",
            color: "rgba(212,175,55,0.3)",
            textTransform: "uppercase",
          }}>
            NS OJAS · {new Date().getFullYear()}
          </div>

          {/* Progress bar — ultra thin gold line at very bottom */}
          {phase === "reel" && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, zIndex: 4, background: "rgba(255,255,255,0.06)" }}>
              <div style={{
                height: "100%",
                background: `linear-gradient(90deg, ${GOLD}, rgba(212,175,55,0.5))`,
                width: `${((frameIdx + 1) / client.photos) * 100}%`,
                transition: `width ${DURATIONS[frameIdx]}ms linear`,
              }} />
            </div>
          )}
        </div>
      )}

      {/* ── END CARD ── */}
      {phase === "endcard" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 20,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#000",
          opacity: endStep >= 1 ? 1 : 0,
          transition: "opacity 1.2s ease",
        }}>
          <ParticleCanvas active={endStep >= 1} />

          <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 32px" }}>

            {endStep >= 1 && (
              <div className="line-grow" style={{ width: 80, height: 0.5, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: "0 auto 40px", transformOrigin: "center" }} />
            )}

            {endStep >= 2 && (
              <div className="slide-up" style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(28px, 6vw, 58px)",
                fontWeight: 300,
                color: WHITE,
                letterSpacing: "0.06em",
                lineHeight: 1.1,
                marginBottom: 12,
              }}>
                {client.firstName}
                <span style={{ color: GOLD, fontStyle: "italic" }}> & </span>
                {client.secondName}
              </div>
            )}

            {endStep >= 2 && (
              <div className="heartbeat" style={{ fontSize: 20, color: GOLD, margin: "16px 0" }}>♡</div>
            )}

            {endStep >= 3 && (
              <div className="slide-up" style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "clamp(9px, 1.6vw, 11px)",
                letterSpacing: "0.4em",
                color: "rgba(212,175,55,0.6)",
                textTransform: "uppercase",
                marginBottom: 40,
              }}>
                {client.type} · {client.date}
              </div>
            )}

            {endStep >= 3 && (
              <div className="line-grow" style={{ width: 80, height: 0.5, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: "0 auto 40px", transformOrigin: "center" }} />
            )}

            {endStep >= 4 && (
              <div className="slide-up" style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(13px, 2vw, 16px)",
                fontStyle: "italic",
                fontWeight: 300,
                color: "rgba(200,200,200,0.65)",
                letterSpacing: "0.06em",
                maxWidth: 420,
                margin: "0 auto 48px",
                lineHeight: 1.8,
              }}>
                Your complete gallery is being prepared<br />
                with the care your love deserves.
              </div>
            )}

            {/* Wedding date save-the-date card */}
            {endStep >= 4 && client.weddingDate && (
              <div className="slide-up" style={{
                margin: "0 auto 32px",
                padding: "20px 36px",
                border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: 2,
                background: "rgba(212,175,55,0.04)",
                display: "inline-block",
              }}>
                <div style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "clamp(8px, 1.4vw, 10px)",
                  letterSpacing: "0.45em",
                  color: "rgba(212,175,55,0.55)",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}>
                  Save the Date
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(18px, 3vw, 28px)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: WHITE,
                  letterSpacing: "0.06em",
                }}>
                  Wedding · {client.weddingDate}
                </div>
              </div>
            )}

            {/* Action buttons */}
            {endStep >= 5 && (
              <div className="slide-up" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
                <a
                  href={`https://wa.me/?text=Our%20NS%20OJAS%20engagement%20memory%20is%20live%20%F0%9F%8C%9F%20View%20our%20story%3A%20${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "14px 24px",
                    background: "#25D366",
                    color: "#fff",
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                    fontWeight: 600, textDecoration: "none", borderRadius: 2,
                    boxShadow: "0 0 24px rgba(37,211,102,0.3)",
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2C6.472 2 2 6.472 2 11.99c0 1.751.459 3.41 1.265 4.861L2 22l5.278-1.24A9.965 9.965 0 0 0 11.99 22C17.508 22 22 17.528 22 12.01 22 6.472 17.508 2 11.99 2z"/></svg>
                  Share Our Story
                </a>
                <a
                  href="https://wa.me/919704551102"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "14px 24px",
                    background: "transparent",
                    color: GOLD,
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                    fontWeight: 600, textDecoration: "none", borderRadius: 2,
                    border: "1px solid rgba(212,175,55,0.35)",
                  }}>
                  Contact Simha
                </a>
              </div>
            )}

            {/* Replay button */}
            {endStep >= 5 && (
              <div className="slide-up" style={{ marginTop: 8 }}>
                <button
                  onClick={handleReplay}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 9,
                    letterSpacing: "0.3em",
                    color: "rgba(212,175,55,0.45)",
                    textTransform: "uppercase",
                    padding: "10px 16px",
                    transition: "color 0.3s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = GOLD}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(212,175,55,0.45)"}
                >
                  {/* Replay icon */}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                  </svg>
                  Watch Again
                </button>
              </div>
            )}
          </div>

          {/* NS OJAS signature bottom */}
          {endStep >= 3 && (
            <div className="fade-in-el" style={{
              position: "absolute", bottom: 32,
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 9, letterSpacing: "0.35em",
              color: "rgba(212,175,55,0.3)",
              textTransform: "uppercase",
            }}>
              NS OJAS MEDIA LABS · SRIKALAHASTI · {new Date().getFullYear()}
            </div>
          )}
        </div>
      )}

      {/* ── AUDIO ── */}
      {phase === "reel" && (
        <audio
          src={`/vault/${id}/music.mp3`}
          autoPlay loop
          style={{ display: "none" }}
        />
      )}
    </div>
  );
}