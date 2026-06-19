"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

// ── CLIENT REGISTRY ─────────────────────────────────────────────
const CLIENTS = {
  "OJAS-2026-ENG-0001_B": {
    names:       "Sandeep & Neelima",
    firstName:   "Sandeep",
    secondName:  "Neelima",
    date:        "17 · 06 · 2026",
    weddingDate: "19 · 08 · 2026",
    type:        "Engagement",
    photos:      15,
    message:     "A promise made in love. A story just beginning.",
    // Per-photo hand-written captions — the storyteller's voice
    captions: [
      "The moment it all began…",
      "Two families, one beautiful story.",
      "She smiled and the room forgot to breathe.",
       "A moment suspended in time.",
      "Joy that fills every corner.",
      "Love, witnessed by everyone.",
      "My girls showed up and the party truly began!",
      "She laughed and the world joined in.",
      "Sealed with love, always.",
      "My oldest secret keeper.",
      "Laughter that echoes forever.",
      "The quiet promise between two souls.",
      "The world stood still for them.",
      "Written in the stars, sealed with a ring.",
      "And so the story begins…",
    ],
  },
};

// ── TIMING ──────────────────────────────────────────────────────
// Slow, breathing, unhurried — like a Sunday afternoon
const DURATIONS    = [7000,6500,6500,6500,6500,6500,6500,6500,6500,6500,6500,6500,6500,7000,9000];
const PLACE_DURATION = 900;   // photo "placement" settle time
const CAPTION_DELAY  = 1800;  // caption appears after photo settles

// ── PALETTE — warm, vintage, human ──────────────────────────────
const PARCHMENT  = "#F7F0E6";  // warm paper
const INK        = "#2C1810";  // deep brown ink
const SEPIA      = "#8B5E3C";  // warm sepia
const SEPIA_DIM  = "#C4A882";  // faded sepia
const RUST       = "#A0522D";  // rust accent
const CREAM      = "#FDF8F0";  // lightest cream
const SHADOW     = "rgba(44,24,16,0.18)"; // warm drop shadow

// ── PHOTO ROTATIONS — human, imperfect ──────────────────────────
const ROTATIONS = [-2.8, 1.9, -1.4, 2.5, -0.8, 3.1, -2.2, 1.5, -3.0, 0.9, -1.7, 2.8, -0.6, 2.1, -1.9];

// ── PAPER TEXTURE CANVAS ────────────────────────────────────────
function PaperTexture() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const W = canvas.width, H = canvas.height;

      // Base warm cream
      ctx.fillStyle = PARCHMENT;
      ctx.fillRect(0, 0, W, H);

      // Paper fibres — fine horizontal lines
      for (let y = 0; y < H; y += 2) {
        const alpha = Math.random() * 0.03;
        ctx.fillStyle = `rgba(139,94,60,${alpha})`;
        ctx.fillRect(0, y, W, 1);
      }

      // Subtle noise grain
      const imgData = ctx.getImageData(0, 0, W, H);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 12;
        d[i]   = Math.min(255, Math.max(0, d[i]   + n));
        d[i+1] = Math.min(255, Math.max(0, d[i+1] + n * 0.9));
        d[i+2] = Math.min(255, Math.max(0, d[i+2] + n * 0.7));
      }
      ctx.putImageData(imgData, 0, 0);

      // Vignette — warm darkening at edges
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.85);
      vig.addColorStop(0,   "rgba(44,24,16,0)");
      vig.addColorStop(0.6, "rgba(44,24,16,0.04)");
      vig.addColorStop(1,   "rgba(44,24,16,0.28)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // Subtle coffee ring stain — top right
      const ring = ctx.createRadialGradient(W*0.82, H*0.14, 28, W*0.82, H*0.14, 52);
      ring.addColorStop(0,    "rgba(139,94,60,0)");
      ring.addColorStop(0.75, "rgba(139,94,60,0.06)");
      ring.addColorStop(0.85, "rgba(139,94,60,0.09)");
      ring.addColorStop(1,    "rgba(139,94,60,0)");
      ctx.fillStyle = ring;
      ctx.fillRect(0, 0, W, H);

      // Second faint coffee ring — bottom left
      const ring2 = ctx.createRadialGradient(W*0.12, H*0.82, 18, W*0.12, H*0.82, 36);
      ring2.addColorStop(0,    "rgba(139,94,60,0)");
      ring2.addColorStop(0.75, "rgba(139,94,60,0.05)");
      ring2.addColorStop(0.85, "rgba(139,94,60,0.07)");
      ring2.addColorStop(1,    "rgba(139,94,60,0)");
      ctx.fillStyle = ring2;
      ctx.fillRect(0, 0, W, H);
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0,
      zIndex: 0, pointerEvents: "none",
    }} />
  );
}

// ── INK DRAW SVG — animated handwriting line ────────────────────
function InkLine({ trigger, width = 120, delay = 0 }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!trigger) return;
    const t = setTimeout(() => setGo(true), delay);
    return () => clearTimeout(t);
  }, [trigger, delay]);

  return (
    <svg width={width} height="12" viewBox={`0 0 ${width} 12`} style={{ overflow:"visible", display:"block" }}>
      <path
        d={`M 4 8 Q ${width*0.25} 4 ${width*0.5} 7 Q ${width*0.75} 10 ${width-4} 6`}
        stroke={SEPIA} strokeWidth="1.2" fill="none"
        strokeLinecap="round"
        style={{
          strokeDasharray: width * 1.1,
          strokeDashoffset: go ? 0 : width * 1.1,
          transition: go ? `stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)` : "none",
        }}
      />
    </svg>
  );
}

// ── INK CIRCLE — draws itself around content ─────────────────────
function InkCircle({ trigger, size = 220 }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!trigger) { setGo(false); return; }
    const t = setTimeout(() => setGo(true), 200);
    return () => clearTimeout(t);
  }, [trigger]);

  const r  = size / 2 - 8;
  const c  = size / 2;
  const circ = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none", zIndex:0 }}>
      <circle
        cx={c} cy={c} r={r}
        stroke={SEPIA_DIM} strokeWidth="1" fill="none"
        strokeLinecap="round"
        style={{
          strokeDasharray: `${circ * 0.92} ${circ * 0.08}`,
          strokeDashoffset: go ? 0 : circ,
          transition: go ? "stroke-dashoffset 2.4s cubic-bezier(0.4,0,0.2,1)" : "none",
          transformOrigin: "center",
          transform: "rotate(-90deg)",
        }}
      />
      {/* Second imperfect arc — slightly offset */}
      <circle
        cx={c + 2} cy={c + 1} r={r + 3}
        stroke={SEPIA_DIM} strokeWidth="0.4" fill="none"
        strokeLinecap="round"
        style={{
          strokeDasharray: `${circ * 0.4} ${circ * 0.6}`,
          strokeDashoffset: go ? -circ * 0.3 : circ,
          transition: go ? "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1) 0.4s" : "none",
        }}
      />
    </svg>
  );
}

// ── HANDWRITTEN CAPTION ─────────────────────────────────────────
function Caption({ text, visible }) {
  return (
    <div style={{
      fontFamily: "'Caveat', cursive",
      fontSize: "clamp(15px, 3vw, 22px)",
      color: SEPIA,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) rotate(-0.8deg)" : "translateY(10px)",
      transition: "opacity 1.2s ease, transform 1.2s ease",
      textAlign: "center",
      letterSpacing: "0.02em",
      lineHeight: 1.4,
      pointerEvents: "none",
      textShadow: `0 1px 0 rgba(255,255,255,0.6)`,
    }}>
      {text}
    </div>
  );
}

// ── POLAROID PHOTO ───────────────────────────────────────────────
function Polaroid({ src, rotation, placed, caption, showCaption, isMobile }) {
  const borderW  = isMobile ? 8  : 14;
  const borderB  = isMobile ? 32 : 52;

  return (
    <div style={{
      position: "relative",
      display: "inline-block",
      background: CREAM,
      padding: `${borderW}px ${borderW}px ${borderB}px ${borderW}px`,
      boxShadow: placed
        ? `0 12px 48px ${SHADOW}, 0 3px 12px rgba(44,24,16,0.12), 0 1px 3px rgba(44,24,16,0.08)`
        : `0 4px 16px ${SHADOW}`,
      transform: placed
        ? `rotate(${rotation}deg) translateY(0px)`
        : `rotate(${rotation * 0.4}deg) translateY(-28px)`,
      opacity: placed ? 1 : 0,
      transition: `
        transform ${PLACE_DURATION}ms cubic-bezier(0.34,1.56,0.64,1),
        opacity   ${PLACE_DURATION * 0.7}ms ease,
        box-shadow ${PLACE_DURATION}ms ease
      `,
      maxWidth: isMobile ? "82vw" : "min(54vh, 56vw)",
      maxHeight: isMobile ? "55vw" : "min(40vh, 42vw)",
    }}>
      {/* Photo */}
      <img
        src={src}
        alt=""
        style={{
          display: "block",
          width: "100%",
          height: isMobile ? "48vw" : "min(35vh, 36vw)",
          objectFit: "cover",
          objectPosition: "top center",
        }}
      />
      {/* Caption area — the handwritten annotation */}
      <div style={{
        position: "absolute",
        bottom: isMobile ? 6 : 10,
        left: borderW, right: borderW,
        textAlign: "center",
      }}>
        <Caption text={caption} visible={showCaption} />
      </div>
    </div>
  );
}

// ── WASHI TAPE DECORATION ────────────────────────────────────────
function WashiTape({ angle = -35, color = "rgba(160,82,45,0.18)", top, left, right, bottom, width = 52, height = 18 }) {
  return (
    <div style={{
      position: "absolute",
      top, left, right, bottom,
      width, height,
      background: color,
      transform: `rotate(${angle}deg)`,
      borderRadius: 2,
      pointerEvents: "none",
      zIndex: 10,
    }} />
  );
}

// ── MAIN ────────────────────────────────────────────────────────
export default function VaultStoryteller() {
  const params = useParams();
  const router = useRouter();
  const id     = (params?.id || "OJAS-2026-ENG-0001_B").toUpperCase();
  const client = CLIENTS[id];

  // phases: black → cover → reel → spread → endcard
  const [phase,       setPhase]       = useState("black");
  const [frameIdx,    setFrameIdx]    = useState(0);
  const [placed,      setPlaced]      = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [leaving,     setLeaving]     = useState(false);
  const [coverStep,   setCoverStep]   = useState(0);
  const [endStep,     setEndStep]     = useState(0);
  const [isMobile,    setIsMobile]    = useState(false);

  const timers = useRef([]);
  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const after    = (ms, fn) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; };

  const photoSrc = (i) => `/vault/${id}/${String(i + 1).padStart(2,"0")}.webp`;

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Preload
  useEffect(() => {
    if (!client) return;
    for (let i = 1; i <= client.photos; i++) {
      const img = new Image();
      img.src = `/vault/${id}/${String(i).padStart(2,"0")}.webp`;
    }
  }, [client, id]);

  // ── Opening sequence ───────────────────────────────────────
  const startSequence = useCallback(() => {
    setPhase("cover");
    after(400,  () => setCoverStep(1)); // ink circle draws
    after(1800, () => setCoverStep(2)); // names write in
    after(3200, () => setCoverStep(3)); // date
    after(4600, () => setCoverStep(4)); // message
    after(4900, () => setCoverStep(5)); // ink underline
    after(7200, () => setCoverStep(6)); // fade to reel
    after(8800, () => {
      setPhase("reel");
      setFrameIdx(0);
      after(120, () => setPlaced(true));
      after(120 + PLACE_DURATION + CAPTION_DELAY, () => setShowCaption(true));
    });
  }, []);

  useEffect(() => {
    if (!client) return;
    const firstImg = new Image();
    firstImg.src = `/vault/${id}/01.webp`;
    const kick = () => after(900, startSequence);

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

  // ── Advance photo ──────────────────────────────────────────
  const advance = useCallback(() => {
    if (!client) return;
    const next = frameIdx + 1;

    // Preload next
    if (next < client.photos) {
      const img = new Image();
      img.src = photoSrc(next);
    }

    // Photo lifts away
    after(DURATIONS[frameIdx], () => {
      setShowCaption(false);
      after(600, () => {
        setLeaving(true);
        after(500, () => {
          setPlaced(false);
          after(300, () => {
            setLeaving(false);
            if (next >= client.photos) {
              // End of reel
              setPhase("endcard");
              after(500,  () => setEndStep(1));
              after(1400, () => setEndStep(2));
              after(2600, () => setEndStep(3));
              after(3800, () => setEndStep(4));
              after(5200, () => setEndStep(5));
            } else {
              setFrameIdx(next);
              after(80,  () => setPlaced(true));
              after(80 + PLACE_DURATION + CAPTION_DELAY, () => setShowCaption(true));
            }
          });
        });
      });
    });
  }, [frameIdx, client, id]);

  useEffect(() => {
    if (phase !== "reel") return;
    advance();
  }, [phase, frameIdx]);

  // ── Replay ─────────────────────────────────────────────────
  const handleReplay = () => {
    clearAll();
    setPhase("black");
    setFrameIdx(0); setPlaced(false); setShowCaption(false);
    setLeaving(false); setCoverStep(0); setEndStep(0);
    after(300, startSequence);
  };

  // ── Not found ──────────────────────────────────────────────
  if (!client) {
    return (
      <div style={{ background: PARCHMENT, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"Georgia, serif" }}>
        <div style={{ fontSize:11, letterSpacing:"0.35em", color:SEPIA, textTransform:"uppercase", marginBottom:20 }}>NS OJAS Client Vault</div>
        <div style={{ fontSize:22, color:INK, marginBottom:12 }}>Vault Not Found</div>
        <div style={{ fontSize:13, color:SEPIA_DIM, marginBottom:40 }}>This vault doesn't exist or hasn't been activated yet.</div>
        <button onClick={() => router.push("/#vault-login")}
          style={{ padding:"14px 32px", background:RUST, color:CREAM, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:700, border:"none", borderRadius:2, cursor:"pointer" }}>
          Return to NS OJAS
        </button>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden", fontFamily:"Georgia, serif" }}>

      {/* ── CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Caveat:wght@400;500;600&family=Montserrat:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { overflow:hidden; height:100%; }
        * { -webkit-tap-highlight-color:transparent; }
        @media (max-width:768px) { body { position:fixed; width:100%; } }

        @keyframes fadeIn       { from{opacity:0} to{opacity:1} }
        @keyframes fadeSlideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes inkWrite     { from{opacity:0;letter-spacing:0.25em} to{opacity:1;letter-spacing:0.08em} }
        @keyframes gentleSway   { 0%,100%{transform:rotate(var(--rot)) translateY(0)} 50%{transform:rotate(calc(var(--rot) + 0.4deg)) translateY(-2px)} }
        @keyframes pageFlipOut  { from{opacity:1;transform:rotate(var(--rot)) translateY(0)} to{opacity:0;transform:rotate(calc(var(--rot) - 6deg)) translateY(-40px) scale(0.96)} }
        @keyframes coverFadeOut { from{opacity:1} to{opacity:0} }

        .fade-in     { animation: fadeIn 1.6s ease forwards; }
        .slide-up    { animation: fadeSlideUp 1.2s cubic-bezier(0.16,1,0.3,1) forwards; }
        .ink-write   { animation: inkWrite 1.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .sway        { animation: gentleSway 6s ease-in-out infinite; }
        .flip-out    { animation: pageFlipOut 0.5s ease-in forwards; }
        .cover-out   { animation: coverFadeOut 1.4s ease forwards; }

        @media (prefers-reduced-motion:reduce) {
          .sway { animation:none !important; }
        }
      `}</style>

      {/* ── PAPER TEXTURE BACKGROUND ── */}
      <PaperTexture />

      {/* ══════════════════════════════════════════════════════
          COVER PAGE — like opening an album
      ══════════════════════════════════════════════════════ */}
      {phase === "cover" && (
        <div className={coverStep >= 6 ? "cover-out" : "fade-in"} style={{
          position:"fixed", inset:0, zIndex:10,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
        }}>
          {/* Ink circle draws itself */}
          <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 40px" }}>
            <InkCircle trigger={coverStep >= 1} size={isMobile ? 260 : 340} />

            {/* Decorative top line */}
            {coverStep >= 1 && (
              <div style={{ marginBottom:28, zIndex:1 }}>
                <InkLine trigger={coverStep >= 1} width={isMobile ? 80 : 110} />
              </div>
            )}

            {/* Names — hand-drawn feel */}
            {coverStep >= 2 && (
              <div className="ink-write" style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(32px, 7vw, 68px)",
                fontWeight: 300,
                color: INK,
                letterSpacing: "0.08em",
                textAlign: "center",
                lineHeight: 1.1,
                marginBottom: 16,
                zIndex: 1,
              }}>
                {client.firstName}
                <span style={{ color:RUST, fontStyle:"italic" }}> & </span>
                {client.secondName}
              </div>
            )}

            {/* Heartbeat divider */}
            {coverStep >= 2 && (
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, zIndex:1 }}>
                <div style={{ width:24, height:0.8, background:SEPIA_DIM }} />
                <span style={{ fontSize:12, color:RUST }}>♡</span>
                <div style={{ width:24, height:0.8, background:SEPIA_DIM }} />
              </div>
            )}

            {/* Date */}
            {coverStep >= 3 && (
              <div className="slide-up" style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "clamp(14px, 2.5vw, 20px)",
                color: SEPIA,
                letterSpacing: "0.12em",
                marginBottom: 20,
                zIndex: 1,
              }}>
                {client.date}
              </div>
            )}

            {/* Message */}
            {coverStep >= 4 && (
              <div className="slide-up" style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(13px, 2vw, 17px)",
                fontStyle: "italic",
                fontWeight: 300,
                color: SEPIA,
                letterSpacing: "0.06em",
                textAlign: "center",
                maxWidth: 320,
                lineHeight: 1.7,
                zIndex: 1,
              }}>
                {client.message}
              </div>
            )}

            {/* Ink underline */}
            {coverStep >= 5 && (
              <div style={{ marginTop:24, zIndex:1 }}>
                <InkLine trigger={coverStep >= 5} width={isMobile ? 80 : 110} delay={0} />
              </div>
            )}
          </div>

          {/* NS OJAS signature — bottom right, handwritten */}
          {coverStep >= 2 && (
            <div className="fade-in" style={{
              position:"absolute", bottom:28, right:28,
              fontFamily: "'Caveat', cursive",
              fontSize: 14, color: SEPIA_DIM,
              letterSpacing: "0.06em",
              transform: "rotate(-1deg)",
            }}>
              NS OJAS · {new Date().getFullYear()}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PHOTO REEL — polaroids placed on paper
      ══════════════════════════════════════════════════════ */}
      {(phase === "reel") && (
        <div style={{
          position:"fixed", inset:0, zIndex:5,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
        }}>
          {/* Washi tape corners — decorative */}
          <WashiTape top={-6}  left={-8}  angle={-38} color="rgba(160,82,45,0.16)" width={56} height={16} />
          <WashiTape top={-6}  right={-8} angle={38}  color="rgba(160,82,45,0.13)" width={48} height={16} />

          {/* Photo number — handwritten style */}
          <div style={{
            position:"absolute", top: isMobile ? 18 : 28, left: 0, right: 0,
            textAlign:"center", zIndex:6, pointerEvents:"none",
          }}>
            <span style={{
              fontFamily:"'Caveat', cursive",
              fontSize: isMobile ? 13 : 16,
              color: SEPIA_DIM,
              letterSpacing:"0.06em",
            }}>
              {frameIdx + 1} of {client.photos}
            </span>
          </div>

          {/* The polaroid */}
          <div
            className={leaving ? "flip-out" : (placed ? "sway" : "")}
            style={{ "--rot": `${ROTATIONS[frameIdx]}deg`, zIndex:5 }}
          >
            <Polaroid
              src={photoSrc(frameIdx)}
              rotation={ROTATIONS[frameIdx]}
              placed={placed}
              caption={client.captions[frameIdx]}
              showCaption={showCaption}
              isMobile={isMobile}
            />
          </div>

          {/* NS OJAS watermark */}
          <div style={{
            position:"absolute", bottom:20, right:22, zIndex:3,
            fontFamily:"'Caveat', cursive",
            fontSize:12, color:SEPIA_DIM,
            transform:"rotate(-1deg)",
          }}>
            NS OJAS · {new Date().getFullYear()}
          </div>

          {/* Progress — ink dots at bottom */}
          <div style={{
            position:"absolute", bottom:16, left:0, right:0,
            display:"flex", justifyContent:"center",
            gap:6, zIndex:4,
          }}>
            {Array.from({ length: client.photos }).map((_, i) => (
              <div key={i} style={{
                width: i === frameIdx ? 16 : 5,
                height: 5,
                borderRadius: 3,
                background: i === frameIdx ? RUST : SEPIA_DIM,
                opacity: i <= frameIdx ? 1 : 0.3,
                transition: "width 0.4s ease, background 0.4s ease",
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          END CARD — warm, personal, handcrafted
      ══════════════════════════════════════════════════════ */}
      {phase === "endcard" && (
        <div style={{
          position:"fixed", inset:0, zIndex:20,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          opacity: endStep >= 1 ? 1 : 0,
          transition: "opacity 1.4s ease",
        }}>
          <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"0 40px" }}>

            {/* Ink underline top */}
            {endStep >= 1 && (
              <div style={{ display:"flex", justifyContent:"center", marginBottom:32 }}>
                <InkLine trigger={endStep >= 1} width={100} />
              </div>
            )}

            {/* Names */}
            {endStep >= 2 && (
              <div className="slide-up" style={{
                fontFamily:"'Cormorant Garamond', Georgia, serif",
                fontSize:"clamp(28px,6vw,58px)",
                fontWeight:300, color:INK,
                letterSpacing:"0.06em", lineHeight:1.1, marginBottom:12,
              }}>
                {client.firstName}
                <span style={{ color:RUST, fontStyle:"italic" }}> & </span>
                {client.secondName}
              </div>
            )}

            {endStep >= 2 && (
              <div style={{ fontSize:18, color:RUST, margin:"14px 0" }}>♡</div>
            )}

            {endStep >= 3 && (
              <div className="slide-up" style={{
                fontFamily:"'Caveat', cursive",
                fontSize:"clamp(12px,2vw,16px)",
                color:SEPIA, letterSpacing:"0.1em",
                marginBottom:32,
              }}>
                {client.type} · {client.date}
              </div>
            )}

            {endStep >= 3 && (
              <div style={{ display:"flex", justifyContent:"center", marginBottom:32 }}>
                <InkLine trigger={endStep >= 3} width={100} delay={200} />
              </div>
            )}

            {endStep >= 4 && (
              <div className="slide-up" style={{
                fontFamily:"'Cormorant Garamond', Georgia, serif",
                fontSize:"clamp(13px,2vw,16px)",
                fontStyle:"italic", fontWeight:300,
                color:SEPIA, letterSpacing:"0.05em",
                maxWidth:400, margin:"0 auto 40px", lineHeight:1.9,
              }}>
                Your complete gallery is being prepared<br/>
                with the care your love deserves.
              </div>
            )}

            {endStep >= 4 && client.weddingDate && (
              <div className="slide-up" style={{
                margin:"0 auto 32px", padding:"18px 32px",
                border:`1px solid ${SEPIA_DIM}`,
                borderRadius:2, background:"rgba(139,94,60,0.05)",
                display:"inline-block",
              }}>
                <div style={{
                  fontFamily:"'Caveat', cursive",
                  fontSize:"clamp(11px,1.8vw,14px)",
                  color:SEPIA_DIM, marginBottom:8, letterSpacing:"0.08em",
                }}>
                  Save the Date
                </div>
                <div style={{
                  fontFamily:"'Cormorant Garamond', Georgia, serif",
                  fontSize:"clamp(18px,3vw,26px)",
                  fontWeight:300, fontStyle:"italic",
                  color:INK, letterSpacing:"0.05em",
                }}>
                  Wedding · {client.weddingDate}
                </div>
              </div>
            )}

            {endStep >= 5 && (
              <div className="slide-up" style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:20 }}>
                <a
                  href={`https://wa.me/?text=Our%20NS%20OJAS%20engagement%20memory%20is%20live%20%F0%9F%8C%9F%20View%20our%20story%3A%20${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"14px 24px", background:"#25D366", color:"#fff",
                    fontFamily:"'Montserrat', sans-serif",
                    fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase",
                    fontWeight:600, textDecoration:"none", borderRadius:2,
                    boxShadow:"0 4px 20px rgba(37,211,102,0.25)",
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2C6.472 2 2 6.472 2 11.99c0 1.751.459 3.41 1.265 4.861L2 22l5.278-1.24A9.965 9.965 0 0 0 11.99 22C17.508 22 22 17.528 22 12.01 22 6.472 17.508 2 11.99 2z"/></svg>
                  Share Our Story
                </a>
                <a
                  href="https://wa.me/919704551102"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"14px 24px", background:"transparent", color:RUST,
                    fontFamily:"'Montserrat', sans-serif",
                    fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase",
                    fontWeight:600, textDecoration:"none", borderRadius:2,
                    border:`1px solid ${SEPIA_DIM}`,
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
                    fontFamily:"'Caveat', cursive",
                    fontSize:16, color:SEPIA_DIM,
                    padding:"10px 16px", transition:"color 0.3s",
                    letterSpacing:"0.04em",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = RUST}
                  onMouseLeave={e => e.currentTarget.style.color = SEPIA_DIM}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                  </svg>
                  Relive the story
                </button>
              </div>
            )}
          </div>

          {endStep >= 3 && (
            <div className="fade-in" style={{
              position:"absolute", bottom:24,
              fontFamily:"'Caveat', cursive",
              fontSize:13, color:SEPIA_DIM,
              transform:"rotate(-0.5deg)",
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