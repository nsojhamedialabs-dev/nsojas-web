"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

// ── CLIENT REGISTRY ─────────────────────────────────────────────
const CLIENTS = {
  "OJAS-2025-NAL-SNEHA-0001_V1": {
    brideName:   "Sneha",
    groomName:   "Anil",
    albumTitle:  "Nalugu Celebrations",
    date:        "01 · 10 · 2025",
    totalFiles:  22,   // WebP files uploaded
    totalPages:  44,   // code splits each to 2
    showstopper: 19,   // page 19 (1-indexed) — PSD 10 left half
    music:       true,
  },
};

// ── PALETTE ─────────────────────────────────────────────────────
const GOLD      = "#D4AF37";
const GOLD_SOFT = "#C9A227";
const WHITE     = "#F8F5EF";
const BLACK     = "#000000";
const DEEP      = "#0A0806";

// ── PAGE TIMING ─────────────────────────────────────────────────
const PAGE_DURATION  = 6000;  // ms per page auto-play
const TRANS_DURATION = 1200;  // transition duration ms

// ── TRANSITION TYPES (5, cycling emotionally) ───────────────────
// Pages 1-8:   golden light sweep
// Pages 9-16:  fade zoom
// Pages 17-24: vertical curtain
// Pages 25-32: diagonal wipe
// Pages 33-44: dissolve fade
const getTransition = (pageIdx) => {
  if (pageIdx < 8)  return "sweep";
  if (pageIdx < 16) return "fadezoom";
  if (pageIdx < 24) return "curtain";
  if (pageIdx < 32) return "diagonal";
  return "dissolve";
};

// ── PHOTO SRC — splits 7200x2400 WebP into left/right ───────────
// pageIdx 0-based: even = left half, odd = right half
const photoSrc = (id, pageIdx) => {
  const fileNum  = Math.floor(pageIdx / 2) + 1;
  const side     = pageIdx % 2 === 0 ? "left" : "right";
  return { file: `/vault/${id}/${String(fileNum).padStart(2,"0")}.webp`, side };
};

// ── NS OJAS DRONE LOGO SVG ───────────────────────────────────────
function DroneLogoSVG({ size = 220, glowPulse = false, spin = false }) {
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 440 360" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: glowPulse ? "drop-shadow(0 0 18px rgba(212,175,55,0.7))" : "drop-shadow(0 0 8px rgba(212,175,55,0.3))", transition:"filter 1.5s ease" }}>

      {/* ── Drone arms ── */}
      {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy],i) => (
        <g key={i} transform={`translate(220,175) scale(${sx},${sy})`}>
          <path d="M0,0 L95,-85" stroke={GOLD} strokeWidth="6" strokeLinecap="round" opacity="0.9"/>
          <path d="M85,-78 L105,-98" stroke={GOLD} strokeWidth="4" strokeLinecap="round" opacity="0.7"/>
          {/* Circuit traces on arm */}
          <path d="M30,-27 L34,-31 L44,-31" stroke={GOLD} strokeWidth="1.2" opacity="0.45"/>
          <path d="M55,-50 L59,-54 L69,-54" stroke={GOLD} strokeWidth="1.2" opacity="0.35"/>
          <circle cx="34" cy="-31" r="2" fill={GOLD} opacity="0.4"/>
          <circle cx="59" cy="-54" r="2" fill={GOLD} opacity="0.3"/>
          {/* Motor hub */}
          <circle cx="100" cy="-94" r="10" fill="#1a1208" stroke={GOLD} strokeWidth="2" opacity="0.9"/>
          <circle cx="100" cy="-94" r="5"  fill={GOLD} opacity="0.7"/>
        </g>
      ))}

      {/* ── Propellers ── */}
      {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy],i) => {
        const cx = 220 + sx * 95;
        const cy = 175 + sy * (-85);
        return (
          <g key={i} transform={`translate(${cx},${cy})`}
            style={{ transformOrigin:`${cx}px ${cy}px`, animation: spin ? `${i%2===0?"spinCW":"spinCCW"} 1.8s linear infinite` : "none" }}>
            {/* Two blades */}
            <ellipse rx="38" ry="7" fill={GOLD} opacity="0.55" transform="rotate(20)"/>
            <ellipse rx="38" ry="7" fill={GOLD} opacity="0.45" transform="rotate(110)"/>
            {/* Blade highlights */}
            <ellipse rx="36" ry="3" fill="rgba(255,255,255,0.15)" transform="rotate(20)"/>
            <ellipse rx="36" ry="3" fill="rgba(255,255,255,0.12)" transform="rotate(110)"/>
          </g>
        );
      })}

      {/* ── Central body ring ── */}
      <circle cx="220" cy="175" r="88" fill="#0d0a06" stroke={GOLD} strokeWidth="3.5" opacity="0.95"/>
      <circle cx="220" cy="175" r="82" fill="#080604" stroke={GOLD} strokeWidth="1"   opacity="0.5"/>

      {/* ── Lens housing ── */}
      <circle cx="220" cy="175" r="72" fill="url(#lensGrad)" opacity="0.98"/>

      {/* ── Lens aperture blades ── */}
      {Array.from({length:6},(_,i) => {
        const angle = i * 60;
        return (
          <ellipse key={i}
            cx="220" cy="175" rx="28" ry="10"
            fill="#0a0808" opacity="0.75"
            transform={`rotate(${angle} 220 175)`}
          />
        );
      })}

      {/* ── Inner lens glass ── */}
      <circle cx="220" cy="175" r="36" fill="url(#innerLens)" opacity="0.95"/>
      <circle cx="220" cy="175" r="22" fill="url(#deepLens)"  opacity="0.98"/>

      {/* ── Gold light burst from lens center ── */}
      {Array.from({length:8},(_,i) => {
        const angle = i * 45 * Math.PI / 180;
        const len   = 18 + (i%2) * 10;
        return (
          <line key={i}
            x1="220" y1="175"
            x2={220 + Math.cos(angle)*len}
            y2={175 + Math.sin(angle)*len}
            stroke={GOLD} strokeWidth={i%2===0?"2":"1"}
            opacity={i%2===0?"0.9":"0.5"}
            style={{ animation: glowPulse ? `burstPulse ${1.2+i*0.1}s ease-in-out infinite alternate` : "none" }}
          />
        );
      })}

      {/* ── Center lens spark ── */}
      <circle cx="220" cy="175" r="6"  fill={GOLD}    opacity="0.95"/>
      <circle cx="220" cy="175" r="3"  fill="#fff8e8" opacity="1"/>
      <circle cx="218" cy="173" r="1.5" fill="white"  opacity="0.8"/>

      {/* ── Outer ring detail ── */}
      <circle cx="220" cy="175" r="90" fill="none" stroke={GOLD} strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3"/>

      {/* ── Gradients & filters ── */}
      <defs>
        <radialGradient id="lensGrad" cx="45%" cy="40%">
          <stop offset="0%"   stopColor="#2a2018"/>
          <stop offset="60%"  stopColor="#100c08"/>
          <stop offset="100%" stopColor="#060402"/>
        </radialGradient>
        <radialGradient id="innerLens" cx="40%" cy="35%">
          <stop offset="0%"   stopColor="#3a3020"/>
          <stop offset="50%"  stopColor="#1a1410"/>
          <stop offset="100%" stopColor="#080604"/>
        </radialGradient>
        <radialGradient id="deepLens" cx="38%" cy="32%">
          <stop offset="0%"   stopColor="#504030" stopOpacity="0.9"/>
          <stop offset="40%"  stopColor="#1a1208" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#000000"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

// ── ROSE PETAL CANVAS ───────────────────────────────────────────
function RosePetalCanvas({ active, intensity = 1 }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const petalsRef = useRef([]);

  const createPetal = (W, H) => ({
    x:        Math.random() * W,
    y:        -20 - Math.random() * 60,
    vx:       (Math.random() - 0.5) * 1.4,
    vy:       0.7 + Math.random() * 1.6,
    rot:      Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.05,
    scale:    0.5 + Math.random() * 0.8,
    opacity:  0.65 + Math.random() * 0.35,
    sway:     Math.random() * Math.PI * 2,
    swaySpeed:0.018 + Math.random() * 0.022,
    pink:     Math.random() > 0.3,
  });

  useEffect(() => {
    if (!active) { cancelAnimationFrame(rafRef.current); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.floor(35 * intensity);
    petalsRef.current = Array.from({ length: count }, () => {
      const p = createPetal(canvas.width, canvas.height);
      p.y = Math.random() * canvas.height;
      return p;
    });

    const drawPetal = (ctx, x, y, scale, rot, pink, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(scale, scale);
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-9, -13, -15, -24, 0, -30);
      ctx.bezierCurveTo(15, -24, 9, -13, 0, 0);
      ctx.fillStyle = pink
        ? `rgba(255,${100 + Math.floor(Math.random()*80)},${120 + Math.floor(Math.random()*60)},0.88)`
        : `rgba(255,${200 + Math.floor(Math.random()*55)},${200 + Math.floor(Math.random()*55)},0.75)`;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.bezierCurveTo(-4, -14, -6, -22, 0, -26);
      ctx.bezierCurveTo(6, -22, 4, -14, 0, -5);
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petalsRef.current.forEach(p => {
        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.6;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        if (p.y > canvas.height + 30) Object.assign(p, createPetal(canvas.width, canvas.height));
        drawPetal(ctx, p.x, p.y, p.scale, p.rot, p.pink, p.opacity);
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [active, intensity]);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", inset:0, zIndex:18,
      pointerEvents:"none",
      opacity: active ? 1 : 0,
      transition:"opacity 1.8s ease",
    }} />
  );
}

// ── SPLIT IMAGE COMPONENT ────────────────────────────────────────
// Displays left or right half of a 7200x2400 WebP
function SplitImage({ src, side, style }) {
  return (
    <div style={{
      position:"absolute", inset:0,
      overflow:"hidden",
      ...style,
    }}>
      <img
        src={src}
        alt=""
        style={{
          position:"absolute",
          top:0,
          // Left half: show left 50%; Right half: shift image left by 50%
          left:  side === "left" ? "0%" : "-100%",
          width: "200%",
          height:"100%",
          objectFit:"cover",
          objectPosition:"top left",
          display:"block",
        }}
      />
    </div>
  );
}


// ── BRIDE TELEMETRY — auto-generated by detect-bride.js ─────────
const BRIDE_TELEMETRY = {
  "OJAS-2025-NAL-SNEHA-0001_V1": {
    1:  { bridePresent:true,  targets:[{x:32,y:70}], strength:0.018, petalIntensity:1.0, confidence:0.805 },
    2:  { bridePresent:true,  targets:[{x:18,y:41},{x:66,y:18}], strength:0.018, petalIntensity:1.0, confidence:0.961 },
    3:  { bridePresent:true,  targets:[{x:78,y:40}], strength:0.018, petalIntensity:1.0, confidence:0.989 },
    4:  { bridePresent:true,  targets:[{x:52,y:40}], strength:0.018, petalIntensity:1.0, confidence:0.733 },
    5:  { bridePresent:true,  targets:[{x:45,y:29}], strength:0.018, petalIntensity:1.0, confidence:0.432 },
    6:  { bridePresent:true,  targets:[{x:62,y:64},{x:81,y:27}], strength:0.018, petalIntensity:1.0, confidence:0.506 },
    7:  { bridePresent:true,  targets:[{x:25,y:22}], strength:0.018, petalIntensity:1.0, confidence:0.330 },
    8:  { bridePresent:true,  targets:[{x:27,y:52}], strength:0.018, petalIntensity:1.0, confidence:0.317 },
    9:  { bridePresent:true,  targets:[{x:57,y:20}], strength:0.018, petalIntensity:1.0, confidence:0.639 },
    10: { bridePresent:true,  targets:[{x:40,y:25}], strength:0.018, petalIntensity:1.0, confidence:0.949 },
    11: { bridePresent:true,  targets:[{x:75,y:40}], strength:0.018, petalIntensity:1.0, confidence:0.594 },
    12: { bridePresent:true,  targets:[{x:75,y:40}], strength:0.018, petalIntensity:1.0, confidence:0.509 },
    13: { bridePresent:false, targets:[], strength:0, petalIntensity:1.0, confidence:1.0 },
    14: { bridePresent:true,  targets:[{x:64,y:34}], strength:0.018, petalIntensity:1.0, confidence:0.997 },
    15: { bridePresent:false, targets:[], strength:0, petalIntensity:1.0, confidence:1.0 },
    16: { bridePresent:true,  targets:[{x:34,y:36}], strength:0.018, petalIntensity:1.0, confidence:0.469 },
    17: { bridePresent:true,  targets:[{x:35,y:30}], strength:0.018, petalIntensity:1.0, confidence:0.417 },
    18: { bridePresent:false, targets:[], strength:0, petalIntensity:1.0, confidence:1.0 },
    19: { bridePresent:true,  targets:[{x:73,y:33}], strength:0.032, petalIntensity:1.4, confidence:0.995 },
    20: { bridePresent:true,  targets:[{x:75,y:37},{x:39,y:77},{x:78,y:74}], strength:0.032, petalIntensity:1.4, confidence:0.558 },
    21: { bridePresent:true,  targets:[{x:20,y:23},{x:33,y:23},{x:29,y:79},{x:81,y:30}], strength:0.012, petalIntensity:1.0, confidence:0.875 },
    22: { bridePresent:true,  targets:[{x:82,y:30},{x:33,y:38}], strength:0.018, petalIntensity:1.0, confidence:0.513 },
    23: { bridePresent:false, targets:[], strength:0, petalIntensity:1.0, confidence:1.0 },
    24: { bridePresent:true,  targets:[{x:80,y:35},{x:35,y:40}], strength:0.018, petalIntensity:1.0, confidence:0.788 },
    25: { bridePresent:true,  targets:[{x:73,y:30},{x:14,y:59},{x:72,y:60},{x:31,y:29}], strength:0.012, petalIntensity:1.0, confidence:0.502 },
    26: { bridePresent:true,  targets:[{x:69,y:44}], strength:0.018, petalIntensity:1.0, confidence:0.902 },
    27: { bridePresent:true,  targets:[{x:25,y:57},{x:38,y:33}], strength:0.018, petalIntensity:1.0, confidence:0.589 },
    28: { bridePresent:true,  targets:[{x:33,y:33},{x:70,y:20},{x:78,y:36}], strength:0.018, petalIntensity:1.0, confidence:0.672 },
    29: { bridePresent:false, targets:[], strength:0, petalIntensity:1.0, confidence:1.0 },
    30: { bridePresent:true,  targets:[{x:44,y:34}], strength:0.018, petalIntensity:1.0, confidence:0.990 },
    31: { bridePresent:true,  targets:[{x:77,y:34},{x:25,y:57},{x:82,y:74},{x:35,y:75}], strength:0.012, petalIntensity:1.0, confidence:0.776 },
    32: { bridePresent:true,  targets:[{x:35,y:74},{x:34,y:37},{x:81,y:33}], strength:0.018, petalIntensity:1.0, confidence:0.448 },
    33: { bridePresent:true,  targets:[{x:75,y:38},{x:37,y:76},{x:73,y:38}], strength:0.018, petalIntensity:1.0, confidence:0.475 },
    34: { bridePresent:true,  targets:[{x:64,y:37},{x:8,y:55}], strength:0.018, petalIntensity:1.0, confidence:0.759 },
    35: { bridePresent:true,  targets:[{x:28,y:20},{x:43,y:45},{x:78,y:24},{x:18,y:17}], strength:0.012, petalIntensity:1.0, confidence:0.928 },
    36: { bridePresent:true,  targets:[{x:39,y:32}], strength:0.018, petalIntensity:1.0, confidence:0.963 },
    37: { bridePresent:true,  targets:[{x:72,y:59},{x:41,y:21},{x:22,y:65},{x:47,y:65},{x:85,y:19},{x:21,y:62}], strength:0.012, petalIntensity:1.0, confidence:0.898 },
    38: { bridePresent:true,  targets:[{x:87,y:21},{x:85,y:66},{x:34,y:25},{x:36,y:63}], strength:0.012, petalIntensity:1.0, confidence:0.913 },
    39: { bridePresent:true,  targets:[{x:66,y:22},{x:64,y:59},{x:84,y:58},{x:28,y:21},{x:44,y:58},{x:15,y:57},{x:55,y:60},{x:75,y:22}], strength:0.012, petalIntensity:1.0, confidence:0.714 },
    40: { bridePresent:true,  targets:[{x:33,y:23},{x:82,y:22},{x:75,y:24}], strength:0.018, petalIntensity:1.0, confidence:0.806 },
    41: { bridePresent:true,  targets:[{x:18,y:60}], strength:0.018, petalIntensity:1.0, confidence:0.942 },
    42: { bridePresent:true,  targets:[{x:88,y:22},{x:63,y:38},{x:28,y:21},{x:86,y:75}], strength:0.012, petalIntensity:1.0, confidence:0.730 },
    43: { bridePresent:true,  targets:[{x:36,y:44}], strength:0.018, petalIntensity:1.0, confidence:0.990 },
    44: { bridePresent:true,  targets:[{x:58,y:39},{x:20,y:38}], strength:0.018, petalIntensity:1.0, confidence:0.992 },
  },
};

// ── SPOT PETAL ENGINE ────────────────────────────────────────────
// Multi-magnet physics canvas with pre-spawn timing
// Petals find nearest Sneha and flow toward her
function SpotPetalCanvas({ albumId, currentPage, nextPage, pageStartTime }) {
  // Use refs so animation loop gets fresh values without restarting
  const currentPageRef   = useRef(currentPage);
  const nextPageRef      = useRef(nextPage);
  const pageStartRef     = useRef(pageStartTime);
  const albumIdRef       = useRef(albumId);

  useEffect(() => {
    currentPageRef.current  = currentPage;
    nextPageRef.current     = nextPage;
    pageStartRef.current    = pageStartTime;
    albumIdRef.current      = albumId;
  }, [albumId, currentPage, nextPage, pageStartTime]);

  const canvasRef   = useRef(null);
  const rafRef      = useRef(null);
  const petalsRef   = useRef([]);
  const frameRef    = useRef(0);

  // ── Adaptive particle count based on device ──────────────────
  const getParticleCount = () => {
    if (typeof window === "undefined") return 50;
    const W = window.innerWidth;
    if (W >= 1200) return 80;  // desktop
    if (W >= 768)  return 50;  // tablet
    return 30;                  // mobile
  };

  // ── Create a single petal ────────────────────────────────────
  // Spawns from all 8 directions: N S E W NE NW SE SW
  const createPetal = (W, H, preSpawn = false, targetX = null, targetY = null) => {
    // All 8 spawn directions
    const dir = Math.floor(Math.random() * 8);
    let sx, sy, ivx, ivy;
    const spd = 0.3 + Math.random() * 0.5;

    if (dir === 0) { // North — top
      sx = Math.random() * W; sy = -20;
      ivx = (Math.random()-0.5)*0.6; ivy = spd;
    } else if (dir === 1) { // South — bottom
      sx = Math.random() * W; sy = H + 20;
      ivx = (Math.random()-0.5)*0.6; ivy = -spd;
    } else if (dir === 2) { // East — right
      sx = W + 20; sy = Math.random() * H;
      ivx = -spd; ivy = (Math.random()-0.5)*0.6;
    } else if (dir === 3) { // West — left
      sx = -20; sy = Math.random() * H;
      ivx = spd; ivy = (Math.random()-0.5)*0.6;
    } else if (dir === 4) { // NE — top right
      sx = W * (0.6 + Math.random()*0.4); sy = -20;
      ivx = -spd*0.5; ivy = spd*0.7;
    } else if (dir === 5) { // NW — top left
      sx = W * Math.random()*0.4; sy = -20;
      ivx = spd*0.5; ivy = spd*0.7;
    } else if (dir === 6) { // SE — bottom right
      sx = W + 20; sy = H * (0.5 + Math.random()*0.5);
      ivx = -spd*0.7; ivy = -spd*0.5;
    } else { // SW — bottom left
      sx = -20; sy = H * (0.5 + Math.random()*0.5);
      ivx = spd*0.7; ivy = -spd*0.5;
    }

    return {
      x: sx, y: sy,
      vx: ivx,
      vy: ivy,
      rot:      Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      scale:    0.4 + Math.random() * 0.7,
      opacity:  preSpawn ? 0 : (0.5 + Math.random() * 0.5),
      targetOpacity: 0.6 + Math.random() * 0.4,
      sway:     Math.random() * Math.PI * 2,
      swaySpeed:0.015 + Math.random() * 0.02,
      pink:     Math.random() > 0.25,
      preSpawned: preSpawn,
      visible:  !preSpawn,
    };
  };

  // ── Apply nearest-magnet gravity ─────────────────────────────
  const applyGravity = (p, targets, strength, W, H) => {
    if (!targets || targets.length === 0) return;

    // Find nearest target
    let nearest  = null;
    let minDist  = Infinity;
    targets.forEach(t => {
      const tx   = (t.x / 100) * W;
      const ty   = (t.y / 100) * H;
      const dx   = tx - p.x;
      const dy   = ty - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < minDist) { minDist = dist; nearest = { tx, ty, dist }; }
    });

    if (!nearest) return;

    // Very close — slow down and drift gently, no orbital bounce
    if (nearest.dist < 80) {
      p.vx *= 0.88; // heavy dampen — come to near rest
      p.vy *= 0.88;
      return;
    }

    // Medium distance — very gentle pull
    if (nearest.dist < 200) {
      const pull = strength * 0.15;
      p.vx += (nearest.tx - p.x) * pull;
      p.vy += (nearest.ty - p.y) * pull;
      p.vx *= 0.90;
      p.vy *= 0.90;
      return;
    }

    // Far away — barely perceptible drift toward Sneha
    const pull = strength * 0.08;
    p.vx += (nearest.tx - p.x) * pull;
    p.vy += (nearest.ty - p.y) * pull;
    p.vx *= 0.95;
    p.vy *= 0.95;
  };

  // ── Create petal from specific direction (0-7: N,S,E,W,NE,NW,SE,SW) ──
  const createPetalFromDir = (W, H, dir) => {
    let sx, sy, ivx, ivy;
    const spd = 0.35 + Math.random() * 0.45;

    if (dir === 0) {      // North
      sx = W * (0.1 + Math.random()*0.8); sy = -20;
      ivx = (Math.random()-0.5)*0.4; ivy = spd;
    } else if (dir === 1) { // South
      sx = W * (0.1 + Math.random()*0.8); sy = H + 20;
      ivx = (Math.random()-0.5)*0.4; ivy = -spd;
    } else if (dir === 2) { // East
      sx = W + 20; sy = H * (0.1 + Math.random()*0.8);
      ivx = -spd; ivy = (Math.random()-0.5)*0.4;
    } else if (dir === 3) { // West
      sx = -20; sy = H * (0.1 + Math.random()*0.8);
      ivx = spd; ivy = (Math.random()-0.5)*0.4;
    } else if (dir === 4) { // NE
      sx = W * (0.65 + Math.random()*0.35); sy = -20;
      ivx = -spd*0.6; ivy = spd*0.8;
    } else if (dir === 5) { // NW
      sx = W * (Math.random()*0.35); sy = -20;
      ivx = spd*0.6; ivy = spd*0.8;
    } else if (dir === 6) { // SE
      sx = W + 20; sy = H * (0.55 + Math.random()*0.45);
      ivx = -spd*0.8; ivy = -spd*0.5;
    } else {              // SW
      sx = -20; sy = H * (0.55 + Math.random()*0.45);
      ivx = spd*0.8; ivy = -spd*0.5;
    }

    return {
      x: sx, y: sy,
      vx: ivx, vy: ivy,
      rot:      Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      scale:    0.45 + Math.random() * 0.65,
      opacity:  0.55 + Math.random() * 0.45,
      sway:     Math.random() * Math.PI * 2,
      swaySpeed:0.015 + Math.random() * 0.02,
      pink:     Math.random() > 0.25,
      dying:    false,
    };
  };

  // ── Draw a single rose petal ─────────────────────────────────
  const drawPetal = (ctx, p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(p.scale, p.scale);
    ctx.globalAlpha = p.opacity;

    // Petal body
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-9, -13, -15, -24, 0, -30);
    ctx.bezierCurveTo(15, -24, 9, -13, 0, 0);
    ctx.fillStyle = p.pink
      ? `rgba(255,${90 + Math.floor(Math.random()*60)},${100 + Math.floor(Math.random()*60)},0.88)`
      : `rgba(255,${190 + Math.floor(Math.random()*50)},${190 + Math.floor(Math.random()*50)},0.75)`;
    ctx.fill();

    // Petal highlight
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.bezierCurveTo(-4, -14, -6, -22, 0, -26);
    ctx.bezierCurveTo(6, -22, 4, -14, 0, -5);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fill();

    // Gold dust particles
    if (Math.random() > 0.97) {
      ctx.beginPath();
      ctx.arc((Math.random()-0.5)*8, -15 + Math.random()*10, 0.8, 0, Math.PI*2);
      ctx.fillStyle = "rgba(212,175,55,0.8)";
      ctx.fill();
    }

    ctx.restore();
  };

  // ── Main animation loop ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = getParticleCount();
    petalsRef.current = Array.from({ length: count }, () => {
      const p = createPetal(canvas.width, canvas.height);
      p.y = Math.random() * canvas.height; // scatter on load
      return p;
    });

    const animate = () => {
      frameRef.current++;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Current page telemetry — read from refs so loop never restarts
      const albumTelemetry = BRIDE_TELEMETRY[albumIdRef.current] || {};
      const currData = albumTelemetry[currentPageRef.current] || null;
      const nextData = albumTelemetry[nextPageRef.current]    || null;

      // Time since page started (ms)
      const elapsed      = Date.now() - pageStartRef.current;
      const halfwayPast  = elapsed >= PAGE_DURATION / 2;

      // Spawn from all 8 directions in rotation — every direction represented
      // 25% more flow when bride present (interval 11 vs 28)
      const spawnInterval = currData?.bridePresent ? 11 : 28;
      if (frameRef.current % spawnInterval === 0) {
        // Cycle through all 8 directions in order so all are always represented
        const dirIdx = Math.floor(frameRef.current / spawnInterval) % 8;
        const fresh  = createPetalFromDir(W, H, dirIdx);
        petalsRef.current.push(fresh);
        if (petalsRef.current.length > count + 30) {
          petalsRef.current.shift();
        }
      }

      // Pre-spawn for next page at halfway mark — all directions
      if (halfwayPast && nextData?.bridePresent) {
        if (frameRef.current % 22 === 0) {
          const dirIdx = Math.floor(frameRef.current / 22) % 8;
          const pre    = createPetalFromDir(W, H, dirIdx);
          petalsRef.current.push(pre);
        }
      }

      // Process petals — iterate backwards so splice is safe
      for (let i = petalsRef.current.length - 1; i >= 0; i--) {
        const p = petalsRef.current[i];

        // Check distance to nearest target — kill if within 50px
        if (currData?.bridePresent && currData.targets.length > 0 && !p.dying) {
          let minDist = Infinity;
          currData.targets.forEach(t => {
            const tx   = (t.x / 100) * W;
            const ty   = (t.y / 100) * H;
            const dx   = tx - p.x;
            const dy   = ty - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < minDist) minDist = dist;
          });
          if (minDist < 50) {
            p.dying = true; // start fading out
          }
        }

        // Dying petals fade out and get removed
        if (p.dying) {
          p.opacity -= 0.04; // fade over ~25 frames
          if (p.opacity <= 0) {
            petalsRef.current.splice(i, 1);
            continue;
          }
          drawPetal(ctx, p);
          continue;
        }

        // Apply gravity well if bride present
        if (currData?.bridePresent && currData.targets.length > 0) {
          applyGravity(p, currData.targets, currData.strength || 0.018, W, H);
        }

        // Organic sway
        p.sway += p.swaySpeed;
        p.vx   += Math.sin(p.sway) * 0.12;

        // Gentle downward drift when no magnet
        if (!currData?.bridePresent) {
          p.vy += 0.015;
          p.vx *= 0.995;
        }

        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.rotSpeed;

        // Remove if off screen
        if (p.y > H + 40 || p.x < -80 || p.x > W + 80 || p.y < -80) {
          petalsRef.current.splice(i, 1);
          continue;
        }

        drawPetal(ctx, p);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []); // run once only - gravity updates via ref

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed",
      inset:    0,
      zIndex:   15,  // above everything except nav controls)
      pointerEvents: "none",
      mixBlendMode: "normal",
    }} />
  );
}

// ── MAIN ────────────────────────────────────────────────────────
export default function VaultAlbumNalugu() {
  const params = useParams();
  const router = useRouter();
  const id     = (params?.id || "OJAS-2025-NAL-SNEHA-0001_V1").toUpperCase();
  const client = CLIENTS[id];

  // phases: black → entry → loading → cover → album → closing → endcard
  const [phase,         setPhase]         = useState("black");
  const [entryStep,     setEntryStep]     = useState(0);
  const [loadingDone,   setLoadingDone]   = useState(false);
  const [pageIdx,       setPageIdx]       = useState(0);   // 0-based
  const [isPlaying,     setIsPlaying]     = useState(true);
  const [transition,    setTransition]    = useState(null); // current transition type
  const [transOut,      setTransOut]      = useState(false);
  const [endStep,       setEndStep]       = useState(0);
  const [showPetals,    setShowPetals]    = useState(false);
  const [showstopper,   setShowstopper]   = useState(false); // showstopper active
  const [ssCaption,     setSsCaption]     = useState(0);     // 0=none,1=first,2=second
  const [logoGlow,      setLogoGlow]      = useState(false);
  const [logoPulse,     setLogoPulse]     = useState(false);
  const [isMobile,      setIsMobile]      = useState(false);
  const [isFullscreen,  setIsFullscreen]  = useState(false);
  const [imagesLoaded,  setImagesLoaded]  = useState(0);
  const [pageStartTime, setPageStartTime] = useState(Date.now());

  const timers    = useRef([]);
  const autoTimer = useRef(null);
  const clearAll  = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const after     = (ms, fn) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    const fsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fsChange);
    return () => { window.removeEventListener("resize", check); document.removeEventListener("fullscreenchange", fsChange); };
  }, []);

  // ── Preload first 4 images ──────────────────────────────────
  useEffect(() => {
    if (!client) return;
    let loaded = 0;
    for (let i = 0; i < Math.min(4, client.totalFiles); i++) {
      const img = new Image();
      img.src = `/vault/${id}/${String(i+1).padStart(2,"0")}.webp`;
      img.onload = () => { loaded++; setImagesLoaded(loaded); };
    }
  }, [client, id]);

  // ── Entry sequence ──────────────────────────────────────────
  useEffect(() => {
    if (!client) return;
    setPhase("entry");
    after(400,  () => { setEntryStep(1); setLogoPulse(true); });
    after(1200, () => setLogoGlow(true));
    after(2000, () => setEntryStep(2)); // NS OJAS text
    after(3200, () => setEntryStep(3)); // Srikalahasti
    after(4400, () => setEntryStep(4)); // Presents
    after(5800, () => setEntryStep(5)); // fade out entry
    after(7000, () => {
      setPhase("loading");
      // loading → cover after brief pause
      after(1800, () => {
        setLoadingDone(true);
        after(600, () => {
          setPhase("cover");
        });
      });
    });
    return clearAll;
  }, [client]);

  // ── Fullscreen ──────────────────────────────────────────────
  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("landscape").catch(() => {});
    }
  };

  // ── Start album ─────────────────────────────────────────────
  const startAlbum = () => {
    setPhase("album");
    setPageIdx(0);
    setIsPlaying(true);
  };

  // ── Auto advance ────────────────────────────────────────────
  const goToPage = useCallback((next) => {
    if (!client) return;
    const trans = getTransition(next);
    setTransition(trans);
    setTransOut(true);
    after(TRANS_DURATION, () => {
      setTransOut(false);
      if (next >= client.totalPages) {
        setPhase("closing");
        after(500,  () => setEndStep(1));
        after(1400, () => setEndStep(2));
        after(2600, () => setEndStep(3));
        after(3800, () => setEndStep(4));
        after(5000, () => setEndStep(5));
      } else {
        setPageIdx(next);
        // Check showstopper (0-based: page 19 = index 18)
        if (next === client.showstopper - 1) {
          triggerShowstopper(next);
        }
      }
    });
  }, [client]);

  const triggerShowstopper = useCallback((idx) => {
    setIsPlaying(false);
    setShowstopper(true);
    // Caption 1
    after(1200, () => setSsCaption(1));
    // Pause 3 secs then flip back
    after(4500, () => {
      setSsCaption(0);
      after(600, () => {
        // Flip back to previous page
        setTransOut(true);
        after(TRANS_DURATION, () => {
          setTransOut(false);
          setPageIdx(idx - 1);
          // Petals begin
          after(400, () => {
            setShowPetals(true);
            // Flip forward again — slower, more dramatic
            after(1800, () => {
              setTransOut(true);
              after(TRANS_DURATION * 1.5, () => {
                setTransOut(false);
                setPageIdx(idx);
                // Caption 2
                after(1000, () => setSsCaption(2));
                // Let page 20 show too
                after(2500, () => {
                  setPageIdx(idx + 1);
                });
                // Petals fade after 8 seconds
                after(8000, () => {
                  setShowPetals(false);
                  setSsCaption(0);
                  setShowstopper(false);
                  setIsPlaying(true);
                });
              });
            });
          });
        });
      });
    });
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (phase !== "album" || !isPlaying || showstopper) return;
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      goToPage(pageIdx + 1);
    }, PAGE_DURATION);
    return () => clearTimeout(autoTimer.current);
  }, [phase, pageIdx, isPlaying, showstopper]);

  // Manual navigation
  const prevPage = () => {
    if (pageIdx <= 0 || showstopper) return;
    clearTimeout(autoTimer.current);
    goToPage(pageIdx - 1);
  };
  const nextPage = () => {
    if (showstopper) return;
    clearTimeout(autoTimer.current);
    goToPage(pageIdx + 1);
  };
  const togglePlay = () => setIsPlaying(p => !p);

  // Keyboard
  useEffect(() => {
    const handler = (e) => {
      if (phase !== "album") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextPage();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   prevPage();
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
      if (e.key === "f" || e.key === "F") enterFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, pageIdx, showstopper]);

  // Swipe
  const touchStart = useRef(null);
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) { dx < 0 ? nextPage() : prevPage(); }
    touchStart.current = null;
  };

  if (!client) {
    return (
      <div style={{ background:BLACK, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif" }}>
        <DroneLogoSVG size={120} />
        <div style={{ fontSize:11, letterSpacing:"0.35em", color:GOLD, textTransform:"uppercase", margin:"24px 0 12px" }}>NS OJAS Client Vault</div>
        <div style={{ fontSize:20, color:WHITE, marginBottom:10 }}>Album Not Found</div>
        <button onClick={() => router.push("/#vault-login")}
          style={{ marginTop:28, padding:"14px 32px", background:GOLD, color:"#000", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:700, border:"none", borderRadius:2, cursor:"pointer" }}>
          Return to NS OJAS
        </button>
      </div>
    );
  }

  const { file: currFile, side: currSide } = photoSrc(id, pageIdx);
  const { file: nextFile, side: nextSide } = photoSrc(id, Math.min(pageIdx+1, client.totalPages-1));
  const progress = ((pageIdx + 1) / client.totalPages) * 100;

  return (
    <div style={{ position:"fixed", inset:0, background:BLACK, overflow:"hidden", fontFamily:"Georgia,serif" }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@200;300;400;500;600&family=Caveat:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { overflow:hidden; height:100%; background:#000; }
        * { -webkit-tap-highlight-color:transparent; }

        @keyframes spinCW         { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
        @keyframes spinCCW        { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
        @keyframes fadeIn         { from{opacity:0}                to{opacity:1} }
        @keyframes fadeSlideUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineGrow       { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
        @keyframes logoRise       { from{opacity:0;transform:scale(0.6) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes letterIn       { from{opacity:0;letter-spacing:0.6em} to{opacity:1;letter-spacing:0.35em} }
        @keyframes goldPulse      { 0%,100%{text-shadow:0 0 0 rgba(212,175,55,0)} 50%{text-shadow:0 0 40px rgba(212,175,55,0.6)} }
        @keyframes burstPulse     { from{opacity:0.5} to{opacity:1} }
        @keyframes heartbeat      { 0%,100%{transform:scale(1)} 14%{transform:scale(1.2)} 28%{transform:scale(1)} 42%{transform:scale(1.1)} }
        @keyframes loadingPulse   { 0%,100%{opacity:0.4;transform:scale(0.97)} 50%{opacity:1;transform:scale(1)} }
        @keyframes captionReveal  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        /* Transitions */
        .trans-sweep    { animation: sweepOut    ${TRANS_DURATION}ms ease forwards; }
        .trans-fadezoom { animation: fadeZoomOut ${TRANS_DURATION}ms ease forwards; }
        .trans-curtain  { animation: curtainOut  ${TRANS_DURATION}ms ease forwards; }
        .trans-diagonal { animation: diagonalOut ${TRANS_DURATION}ms ease forwards; }
        .trans-dissolve { animation: dissolveOut ${TRANS_DURATION}ms ease forwards; }

        @keyframes sweepOut    { 0%{opacity:1;clip-path:inset(0 0% 0 0)} 100%{opacity:0.3;clip-path:inset(0 100% 0 0)} }
        @keyframes fadeZoomOut { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.06)} }
        @keyframes curtainOut  { 0%{opacity:1;clip-path:inset(0 0 0 0)} 50%{opacity:1;clip-path:inset(0 50% 0 0)} 100%{opacity:0;clip-path:inset(0 50% 0 50%)} }
        @keyframes diagonalOut { 0%{opacity:1;clip-path:polygon(0 0,100% 0,100% 100%,0 100%)} 100%{opacity:0;clip-path:polygon(100% 0,100% 0,100% 100%,100% 100%)} }
        @keyframes dissolveOut { 0%{opacity:1} 100%{opacity:0} }

        .fade-in    { animation:fadeIn 1.2s ease forwards; }
        .slide-up   { animation:fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .line-grow  { animation:lineGrow 1.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        .logo-rise  { animation:logoRise 1.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .letter-in  { animation:letterIn 1.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .gold-pulse { animation:goldPulse 2.8s ease-in-out infinite; }
        .heartbeat  { animation:heartbeat 2.2s ease-in-out infinite; }

        @media (prefers-reduced-motion:reduce) {
          .heartbeat,.gold-pulse { animation:none !important; }
          [style*="spinCW"],[style*="spinCCW"] { animation:none !important; }
        }
      `}</style>

      {/* ── ROSE PETALS ── */}
      <RosePetalCanvas active={showPetals} intensity={1.4} />

      {/* ══════════════════════════════════════════════════════
          PHASE: ENTRY — NS OJAS Brand Moment
      ══════════════════════════════════════════════════════ */}
      {phase === "entry" && (
        <div style={{
          position:"fixed", inset:0, zIndex:30,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          background:BLACK,
          opacity: entryStep >= 5 ? 0 : 1,
          transition: entryStep >= 5 ? "opacity 1.2s ease" : "none",
        }}>
          {/* Gold particles background */}
          {entryStep >= 1 && (
            <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
              {Array.from({length:30},(_,i) => (
                <div key={i} style={{
                  position:"absolute",
                  left:`${Math.random()*100}%`,
                  top:`${Math.random()*100}%`,
                  width: 1 + Math.random()*2,
                  height:1 + Math.random()*2,
                  borderRadius:"50%",
                  background:GOLD,
                  opacity:0.2 + Math.random()*0.3,
                  animation:`fadeIn ${1+Math.random()*2}s ease forwards ${Math.random()*2}s`,
                }} />
              ))}
            </div>
          )}

          {/* Drone Logo */}
          {entryStep >= 1 && (
            <div className="logo-rise" style={{ marginBottom:32 }}>
              <DroneLogoSVG
                size={isMobile ? 160 : 220}
                glowPulse={logoGlow}
                spin={logoPulse}
              />
            </div>
          )}

          {/* NS OJAS text */}
          {entryStep >= 2 && (
            <div className="letter-in gold-pulse" style={{
              fontFamily:"'Montserrat',sans-serif",
              fontSize:"clamp(22px,4vw,42px)",
              fontWeight:200,
              letterSpacing:"0.35em",
              color:GOLD,
              textTransform:"uppercase",
              marginBottom:8,
              textAlign:"center",
            }}>
              NS OJAS
            </div>
          )}

          {entryStep >= 2 && (
            <div className="fade-in" style={{
              fontFamily:"'Montserrat',sans-serif",
              fontSize:"clamp(9px,1.4vw,12px)",
              fontWeight:300,
              letterSpacing:"0.5em",
              color:"rgba(212,175,55,0.55)",
              textTransform:"uppercase",
              marginBottom:4,
            }}>
              Media Labs
            </div>
          )}

          {entryStep >= 3 && (
            <div className="fade-in" style={{
              fontFamily:"'Montserrat',sans-serif",
              fontSize:"clamp(7px,1.1vw,9px)",
              fontWeight:300,
              letterSpacing:"0.45em",
              color:"rgba(212,175,55,0.3)",
              textTransform:"uppercase",
              marginBottom:48,
            }}>
              Srikalahasti
            </div>
          )}

          {/* Thin gold line */}
          {entryStep >= 2 && (
            <div className="line-grow" style={{
              width:"clamp(60px,12vw,120px)", height:0.5,
              background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,
              marginBottom:40, transformOrigin:"center",
            }} />
          )}

          {/* Presents */}
          {entryStep >= 4 && (
            <div className="slide-up" style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(14px,2.2vw,20px)",
              fontStyle:"italic", fontWeight:300,
              color:"rgba(248,245,239,0.6)",
              letterSpacing:"0.18em",
            }}>
              Presents
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PHASE: LOADING
      ══════════════════════════════════════════════════════ */}
      {phase === "loading" && (
        <div style={{
          position:"fixed", inset:0, zIndex:30,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          background:BLACK,
          opacity: loadingDone ? 0 : 1,
          transition:"opacity 0.6s ease",
        }}>
          <div style={{
            animation:"loadingPulse 1.4s ease-in-out infinite",
          }}>
            <DroneLogoSVG size={isMobile ? 100 : 140} glowPulse />
          </div>
          <div style={{
            marginTop:28,
            fontFamily:"'Montserrat',sans-serif",
            fontSize:9, letterSpacing:"0.4em",
            color:"rgba(212,175,55,0.4)",
            textTransform:"uppercase",
          }}>
            Preparing your memories…
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PHASE: COVER
      ══════════════════════════════════════════════════════ */}
      {phase === "cover" && (
        <div style={{
          position:"fixed", inset:0, zIndex:20,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          background:`radial-gradient(ellipse at center, #1a1208 0%, #000 100%)`,
        }}>
          {/* Gold particles */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
            {Array.from({length:40},(_,i) => (
              <div key={i} style={{
                position:"absolute",
                left:`${Math.random()*100}%`,
                top:`${Math.random()*100}%`,
                width:1+Math.random()*1.5,
                height:1+Math.random()*1.5,
                borderRadius:"50%",
                background:GOLD,
                opacity:0.15+Math.random()*0.25,
              }} />
            ))}
          </div>

          <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"0 40px" }}>
            {/* Top rule */}
            <div className="line-grow" style={{
              width:"clamp(80px,16vw,160px)", height:0.5,
              background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,
              margin:"0 auto 48px", transformOrigin:"center",
            }} />

            {/* Album title */}
            <div className="slide-up" style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(13px,2vw,16px)",
              fontWeight:300, letterSpacing:"0.5em",
              color:"rgba(212,175,55,0.6)",
              textTransform:"uppercase", marginBottom:24,
            }}>
              {client.albumTitle}
            </div>

            {/* Bride name */}
            <div className="slide-up gold-pulse" style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(48px,9vw,96px)",
              fontWeight:300, color:WHITE,
              letterSpacing:"0.06em", lineHeight:1,
              marginBottom:16,
            }}>
              {client.brideName}
            </div>

            {/* & Anil */}
            <div className="slide-up" style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(18px,3vw,28px)",
              fontWeight:300, fontStyle:"italic",
              color:"rgba(212,175,55,0.7)",
              letterSpacing:"0.08em", marginBottom:24,
            }}>
              & {client.groomName}
            </div>

            <div className="heartbeat" style={{ fontSize:16, color:GOLD, margin:"0 0 24px" }}>♡</div>

            {/* Date */}
            <div className="slide-up" style={{
              fontFamily:"'Montserrat',sans-serif",
              fontSize:"clamp(8px,1.4vw,10px)",
              fontWeight:300, letterSpacing:"0.46em",
              color:"rgba(212,175,55,0.45)",
              textTransform:"uppercase", marginBottom:56,
            }}>
              {client.date}
            </div>

            {/* Bottom rule */}
            <div className="line-grow" style={{
              width:"clamp(80px,16vw,160px)", height:0.5,
              background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,
              margin:"0 auto 48px", transformOrigin:"center",
            }} />

            {/* Begin button */}
            <button
              onClick={() => { enterFullscreen(); startAlbum(); }}
              style={{
                padding:"16px 44px",
                background:"transparent",
                border:`1px solid rgba(212,175,55,0.5)`,
                color:GOLD,
                fontFamily:"'Montserrat',sans-serif",
                fontSize:"clamp(9px,1.4vw,11px)",
                letterSpacing:"0.38em",
                textTransform:"uppercase",
                fontWeight:400,
                cursor:"pointer",
                borderRadius:1,
                transition:"all 0.4s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(212,175,55,0.1)"; e.currentTarget.style.borderColor=GOLD; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="rgba(212,175,55,0.5)"; }}
            >
              Begin the Journey →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PHASE: ALBUM
      ══════════════════════════════════════════════════════ */}
      {phase === "album" && (
        <div style={{ position:"fixed", inset:0, zIndex:5 }}>

          {/* Current page */}
          <div className={transOut ? `trans-${transition}` : ""}
            style={{ position:"absolute", inset:0 }}>
            <SplitImage src={currFile} side={currSide} />
          </div>

          {/* Next page (sits underneath) */}
          {transOut && (
            <div style={{ position:"absolute", inset:0, zIndex:-1 }}>
              <SplitImage src={nextFile} side={nextSide} />
            </div>
          )}

          {/* Subtle vignette */}
          <div style={{
            position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
            background:"radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)",
          }} />

          {/* Top gradient */}
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:80, zIndex:2, pointerEvents:"none",
            background:"linear-gradient(rgba(0,0,0,0.4),transparent)",
          }} />

          {/* Bottom gradient */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:120, zIndex:2, pointerEvents:"none",
            background:"linear-gradient(transparent,rgba(0,0,0,0.75))",
          }} />

          {/* ── SHOWSTOPPER CAPTIONS ── */}
          {ssCaption === 1 && (
            <div style={{
              position:"absolute", top:"50%", left:"50%",
              transform:"translate(-50%,-50%)",
              zIndex:10, textAlign:"center",
              animation:"captionReveal 1.2s ease forwards",
              background:"rgba(0,0,0,0.55)",
              padding:"28px 40px", borderRadius:2,
              border:`1px solid rgba(212,175,55,0.2)`,
              backdropFilter:"blur(4px)",
              maxWidth:"clamp(280px,70vw,560px)",
            }}>
              <div style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"clamp(16px,2.5vw,24px)",
                fontStyle:"italic", fontWeight:300,
                color:WHITE, letterSpacing:"0.05em",
                lineHeight:1.7,
              }}>
                "Some blessings are felt long after<br/>
                the hands that gave them are gone…"
              </div>
            </div>
          )}

          {ssCaption === 2 && (
            <div style={{
              position:"absolute", bottom:"clamp(60px,12vh,100px)",
              left:"50%", transform:"translateX(-50%)",
              zIndex:10, textAlign:"center",
              animation:"captionReveal 1.2s ease forwards",
              maxWidth:"clamp(280px,70vw,560px)",
            }}>
              <div style={{
                fontFamily:"'Caveat',cursive",
                fontSize:"clamp(18px,3vw,26px)",
                color:GOLD, letterSpacing:"0.04em",
                textShadow:"0 2px 20px rgba(0,0,0,0.9)",
              }}>
                Look closely. This is where Sneha carried everyone's love forward.
              </div>
            </div>
          )}

          {/* ── NAVIGATION CONTROLS ── */}
          {/* Left arrow */}
          <button onClick={prevPage} style={{
            position:"absolute", left:isMobile?8:20, top:"50%",
            transform:"translateY(-50%)", zIndex:6,
            background:"rgba(0,0,0,0.35)", border:`1px solid rgba(212,175,55,0.25)`,
            color:GOLD, width:isMobile?36:44, height:isMobile?36:44,
            borderRadius:"50%", cursor:"pointer", fontSize:16,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.3s", opacity: pageIdx <= 0 ? 0.2 : 0.7,
          }}
            onMouseEnter={e=>e.currentTarget.style.opacity="1"}
            onMouseLeave={e=>e.currentTarget.style.opacity=pageIdx<=0?"0.2":"0.7"}
          >‹</button>

          {/* Right arrow */}
          <button onClick={nextPage} style={{
            position:"absolute", right:isMobile?8:20, top:"50%",
            transform:"translateY(-50%)", zIndex:6,
            background:"rgba(0,0,0,0.35)", border:`1px solid rgba(212,175,55,0.25)`,
            color:GOLD, width:isMobile?36:44, height:isMobile?36:44,
            borderRadius:"50%", cursor:"pointer", fontSize:16,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.3s", opacity:0.7,
          }}
            onMouseEnter={e=>e.currentTarget.style.opacity="1"}
            onMouseLeave={e=>e.currentTarget.style.opacity="0.7"}
          >›</button>

          {/* Top bar */}
          <div style={{
            position:"absolute", top:0, left:0, right:0, zIndex:6,
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:isMobile?"10px 14px":"14px 22px",
          }}>
            {/* NS OJAS logo small */}
            <div style={{
              fontFamily:"'Montserrat',sans-serif",
              fontSize:7, letterSpacing:"0.28em",
              color:"rgba(212,175,55,0.35)", textTransform:"uppercase",
            }}>
              NS OJAS
            </div>

            {/* Page counter */}
            <div style={{
              fontFamily:"'Montserrat',sans-serif",
              fontSize:8, letterSpacing:"0.3em",
              color:"rgba(212,175,55,0.45)", textTransform:"uppercase",
            }}>
              {String(pageIdx+1).padStart(2,"0")} · {String(client.totalPages).padStart(2,"0")}
            </div>

            {/* Controls */}
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <button onClick={togglePlay} style={{
                background:"none", border:"none", cursor:"pointer",
                color:"rgba(212,175,55,0.5)", fontSize:14, padding:4,
                transition:"color 0.3s",
              }}
                onMouseEnter={e=>e.currentTarget.style.color=GOLD}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(212,175,55,0.5)"}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button onClick={enterFullscreen} style={{
                background:"none", border:"none", cursor:"pointer",
                color:"rgba(212,175,55,0.5)", fontSize:12, padding:4,
                transition:"color 0.3s",
              }}
                onMouseEnter={e=>e.currentTarget.style.color=GOLD}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(212,175,55,0.5)"}
              >⛶</button>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0,
            height:2, zIndex:6,
            background:"rgba(255,255,255,0.06)",
          }}>
            <div style={{
              height:"100%",
              background:`linear-gradient(90deg,${GOLD},rgba(212,175,55,0.4))`,
              width:`${progress}%`,
              transition:`width ${PAGE_DURATION}ms linear`,
            }} />
          </div>

          {/* Album title bottom */}
          <div style={{
            position:"absolute", bottom:14, left:0, right:0,
            textAlign:"center", zIndex:6, pointerEvents:"none",
          }}>
            <span style={{
              fontFamily:"'Montserrat',sans-serif",
              fontSize:7, letterSpacing:"0.3em",
              color:"rgba(212,175,55,0.22)", textTransform:"uppercase",
            }}>
              {client.albumTitle} · NS OJAS · {new Date().getFullYear()}
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PHASE: CLOSING — Grand NS OJAS signature
      ══════════════════════════════════════════════════════ */}
      {phase === "closing" && (
        <div style={{
          position:"fixed", inset:0, zIndex:20,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          background:`radial-gradient(ellipse at center, #100c06 0%, #000 100%)`,
          opacity: endStep >= 1 ? 1 : 0,
          transition:"opacity 1.2s ease",
        }}>
          <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"0 40px" }}>

            {endStep >= 1 && (
              <div className="line-grow" style={{
                width:"clamp(60px,12vw,120px)", height:0.5,
                background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,
                margin:"0 auto 40px", transformOrigin:"center",
              }} />
            )}

            {endStep >= 2 && (
              <div className="slide-up gold-pulse" style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"clamp(32px,6.5vw,64px)",
                fontWeight:300, color:WHITE,
                letterSpacing:"0.07em", lineHeight:1.1, marginBottom:12,
              }}>
                {client.brideName}
                <span style={{ color:GOLD, fontStyle:"italic" }}> & </span>
                {client.groomName}
              </div>
            )}

            {endStep >= 2 && (
              <div className="heartbeat" style={{ fontSize:20, color:GOLD, margin:"16px 0" }}>♡</div>
            )}

            {endStep >= 3 && (
              <div className="slide-up" style={{
                fontFamily:"'Montserrat',sans-serif",
                fontSize:"clamp(8px,1.3vw,10px)",
                letterSpacing:"0.44em", color:"rgba(212,175,55,0.45)",
                textTransform:"uppercase", marginBottom:40,
              }}>
                {client.albumTitle} · {client.date}
              </div>
            )}

            {endStep >= 3 && (
              <div className="line-grow" style={{
                width:"clamp(60px,12vw,120px)", height:0.5,
                background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,
                margin:"0 auto 40px", transformOrigin:"center",
              }} />
            )}

            {/* NS OJAS Logo — painter's signature */}
            {endStep >= 4 && (
              <div className="slide-up" style={{ marginBottom:20 }}>
                <DroneLogoSVG size={isMobile?80:110} glowPulse />
              </div>
            )}

            {endStep >= 4 && (
              <div className="slide-up" style={{
                fontFamily:"'Montserrat',sans-serif",
                fontSize:"clamp(8px,1.3vw,10px)",
                letterSpacing:"0.38em",
                color:"rgba(212,175,55,0.5)",
                textTransform:"uppercase",
                marginBottom:8,
              }}>
                NS OJAS Media Labs
              </div>
            )}

            {endStep >= 4 && (
              <div className="fade-in" style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"clamp(11px,1.6vw,14px)",
                fontStyle:"italic", fontWeight:300,
                color:"rgba(212,175,55,0.3)",
                letterSpacing:"0.1em", marginBottom:44,
              }}>
                Srikalahasti
              </div>
            )}

            {endStep >= 5 && (
              <div className="slide-up" style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:20 }}>
                <a
                  href={`https://wa.me/?text=Sneha%20%26%20Anil's%20Nalugu%20Celebrations%20album%20is%20now%20live%20%F0%9F%8C%9F%20Crafted%20by%20NS%20OJAS%20Media%20Labs%20%E2%9C%A8%20View%20here%3A%20${encodeURIComponent(typeof window!=="undefined"?window.location.href:"")}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"13px 24px", background:"#25D366", color:"#fff",
                    fontFamily:"'Montserrat',sans-serif",
                    fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase",
                    fontWeight:600, textDecoration:"none", borderRadius:2,
                  }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2C6.472 2 2 6.472 2 11.99c0 1.751.459 3.41 1.265 4.861L2 22l5.278-1.24A9.965 9.965 0 0 0 11.99 22C17.508 22 22 17.528 22 12.01 22 6.472 17.508 2 11.99 2z"/></svg>
                  Share This Memory
                </a>
                <a href="https://wa.me/919704551102" target="_blank" rel="noopener noreferrer"
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"13px 24px", background:"transparent", color:GOLD,
                    fontFamily:"'Montserrat',sans-serif",
                    fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase",
                    fontWeight:600, textDecoration:"none", borderRadius:2,
                    border:`1px solid rgba(212,175,55,0.3)`,
                  }}>
                  Contact NS OJAS
                </a>
              </div>
            )}

            {endStep >= 5 && (
              <div className="fade-in" style={{ marginTop:8 }}>
                <button
                  onClick={() => { setPhase("cover"); setPageIdx(0); setEndStep(0); setShowPetals(false); setSsCaption(0); setShowstopper(false); }}
                  style={{
                    background:"none", border:"none", cursor:"pointer",
                    display:"inline-flex", alignItems:"center", gap:8,
                    fontFamily:"'Montserrat',sans-serif",
                    fontSize:9, letterSpacing:"0.3em",
                    color:"rgba(212,175,55,0.35)", textTransform:"uppercase",
                    padding:"10px 16px", transition:"color 0.3s",
                  }}
                  onMouseEnter={e=>e.currentTarget.style.color=GOLD}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(212,175,55,0.35)"}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                  </svg>
                  Relive the Memories
                </button>
              </div>
            )}
          </div>

          {endStep >= 3 && (
            <div className="fade-in" style={{
              position:"absolute", bottom:20,
              fontFamily:"'Montserrat',sans-serif",
              fontSize:7, letterSpacing:"0.35em",
              color:"rgba(212,175,55,0.18)", textTransform:"uppercase",
            }}>
              NS OJAS MEDIA LABS · SRIKALAHASTI · {new Date().getFullYear()}
            </div>
          )}
        </div>
      )}

      {/* ── SPOT PETAL on closing too ── */}
      {phase === "closing" && (
        <SpotPetalCanvas
          albumId={id}
          currentPage={44}
          nextPage={44}
          pageStartTime={pageStartTime}
        />
      )}

      {/* ── SPOT PETAL ENGINE — album phase ── */}
      {phase === "album" && (
        <SpotPetalCanvas
          albumId={id}
          currentPage={pageIdx + 1}
          nextPage={Math.min(pageIdx + 2, client.totalPages)}
          pageStartTime={pageStartTime}
        />
      )}

      {/* ── AUDIO ── */}
      {(phase === "album" || phase === "closing") && client.music && (
        <audio src={`/vault/${id}/music.mp3`} autoPlay loop style={{ display:"none" }} />
      )}
    </div>
  );
}