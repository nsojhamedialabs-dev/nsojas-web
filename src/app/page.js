"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Camera, Video, Layers, Globe, ChevronDown, Mail, Phone, Star, Play,
  Aperture, Sparkles, Award, ArrowRight, BookImage, Shirt,
  Coffee, Image, RotateCcw, MessageCircle, Quote, ChevronLeft, ChevronRight,
  Tv2, Zap, Package
} from "lucide-react";

// ── DESIGN TOKENS ──────────────────────────────────────────────
const GOLD      = "#D4AF37";
const GOLD_DIM  = "#8B6E1A";
const SILVER    = "#C0C0C0";
const OBSIDIAN  = "#0A0A0C";
const CHARCOAL  = "#111114";
const SURFACE   = "#16161A";
const SURFACE2  = "#1E1E24";
const WHITE     = "#F5F5F0";
const MUTED     = "#888890";

// ── UTILITY ────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

function GoldLine() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 24px" }}>
      <div style={{ height: 1, width: 48, background: GOLD_DIM }} />
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD }} />
      <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${GOLD_DIM}, transparent)` }} />
    </div>
  );
}

// ── NAVBAR ─────────────────────────────────────────────────────
function Navbar({ scrolled }) {
  const [open, setOpen] = useState(false);
  const links = ["Services", "Aerial", "Portfolio", "Presentation", "Vault", "Contact"];
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 24px",
        background: scrolled ? "rgba(10,10,12,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid rgba(212,175,55,0.15)` : "none",
        transition: "all 0.4s ease",
      }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo.png" alt="NS OJAS Logo" style={{ height: 48, objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="desktop-nav">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              style={{ fontSize: 11, letterSpacing: "0.15em", color: MUTED, textDecoration: "none", textTransform: "uppercase", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = GOLD}
              onMouseLeave={e => e.target.style.color = MUTED}>{l}</a>
          ))}
          <a href="#contact" style={{
            fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600,
            color: OBSIDIAN, background: GOLD, padding: "10px 20px", borderRadius: 2, textDecoration: "none",
          }}>Book Now</a>
        </div>
        <button onClick={() => setOpen(!open)} className="mobile-menu-btn"
          style={{ background: "none", border: "none", cursor: "pointer", color: WHITE, padding: 8 }}>
          <div style={{ width: 24, height: 2, background: open ? GOLD : WHITE, marginBottom: 5, transition: "all 0.3s", transform: open ? "rotate(45deg) translate(5px,5px)" : "none" }} />
          <div style={{ width: 24, height: 2, background: open ? "transparent" : WHITE, transition: "all 0.3s" }} />
          <div style={{ width: 24, height: 2, background: open ? GOLD : WHITE, marginTop: 5, transition: "all 0.3s", transform: open ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ overflow: "hidden", background: CHARCOAL, borderTop: `1px solid rgba(212,175,55,0.2)` }}>
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}
                style={{ display: "block", padding: "16px 24px", color: MUTED, textDecoration: "none", fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                {l}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ── HERO ───────────────────────────────────────────────────────
function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 180]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  return (
    <section id="hero" style={{ position: "relative", height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: OBSIDIAN }}>
      <motion.div style={{ position: "absolute", inset: 0, y }}>
        <video autoPlay muted loop playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }}
          src="/intro.mp4" />
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke={GOLD} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" }} />
        <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)" }} />
      </motion.div>
      <motion.div style={{ position: "relative", textAlign: "center", padding: "0 24px", opacity }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ height: 1, width: 32, background: GOLD_DIM }} />
          <span style={{ fontSize: 11, letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase", fontWeight: 500 }}>
            Srikalahasti · Andhra Pradesh · Serving Globally
          </span>
          <div style={{ height: 1, width: 32, background: GOLD_DIM }} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(42px, 9vw, 96px)", fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.02em", color: WHITE, margin: 0 }}>
            NS <span style={{ color: GOLD, display: "inline-block" }}>OJAS</span>
            <br />
            <span style={{ fontSize: "clamp(18px, 4vw, 40px)", fontWeight: 400, letterSpacing: "0.5em", color: SILVER, display: "block", marginTop: 12, fontFamily: "system-ui, sans-serif", textTransform: "uppercase" }}>Media Labs</span>
          </h1>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.7 }}
          style={{ fontSize: "clamp(13px, 2.5vw, 18px)", letterSpacing: "0.25em", textTransform: "uppercase", color: MUTED, marginTop: 28, marginBottom: 52, fontWeight: 300 }}>
          Command the Sky.&nbsp;&nbsp;Engineer Perfection.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.95 }}
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <motion.a href="#contact" whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(212,175,55,0.4)" }} whileTap={{ scale: 0.97 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", background: GOLD, color: OBSIDIAN, fontWeight: 700, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none", borderRadius: 2 }}>
            Book for 2026 <ArrowRight size={15} />
          </motion.a>
          <motion.a href="#services" whileHover={{ borderColor: GOLD, color: GOLD }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", background: "transparent", color: SILVER, fontWeight: 500, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none", borderRadius: 2, border: "1px solid rgba(192,192,192,0.3)", transition: "all 0.3s" }}>
            <Play size={13} /> View Work
          </motion.a>
        </motion.div>
      </motion.div>
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
        style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", cursor: "pointer" }}>
        <ChevronDown size={24} color={GOLD_DIM} />
      </motion.div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: `linear-gradient(transparent, ${OBSIDIAN})` }} />
    </section>
  );
}

// ── TRUST STRIP ────────────────────────────────────────────────
function TrustStrip() {
  const orgs = ["IIT Tirupati", "IISER Tirupati", "Corporate Brands", "Luxury Weddings", "Real Estate Groups", "Cultural Institutions"];
  return (
    <div style={{ background: SURFACE, borderTop: `1px solid rgba(212,175,55,0.1)`, borderBottom: `1px solid rgba(212,175,55,0.1)`, padding: "28px 24px", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 56, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
        {orgs.map((o, i) => (
          <span key={i} style={{ fontSize: 11, letterSpacing: "0.25em", color: MUTED, textTransform: "uppercase", whiteSpace: "nowrap" }}>{o}</span>
        ))}
      </div>
    </div>
  );
}

// ── STATS STRIP ────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { num: "500+", label: "Events Covered" },
    { num: "12+",  label: "Cities Served" },
    { num: "5+",   label: "Years of Mastery" },
    { num: "1M+",  label: "Frames Delivered" },
  ];
  return (
    <section id="about" style={{ background: CHARCOAL, padding: "72px 24px", borderTop: `1px solid rgba(212,175,55,0.08)`, borderBottom: `1px solid rgba(212,175,55,0.08)` }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 40, textAlign: "center" }}>
        {stats.map((s, i) => (
          <FadeUp key={i} delay={i * 0.1}>
            <div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, color: GOLD, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: MUTED, textTransform: "uppercase", marginTop: 10 }}>{s.label}</div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

// ── AERIAL USP ─────────────────────────────────────────────────
function AerialSection() {
  return (
    <section id="aerial" style={{ background: OBSIDIAN, padding: "100px 24px", overflow: "hidden" }}>
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1.0) translate(0px, 0px); }
          25%  { transform: scale(1.06) translate(-12px, -6px); }
          50%  { transform: scale(1.10) translate(-6px, -12px); }
          75%  { transform: scale(1.06) translate(8px, -4px); }
          100% { transform: scale(1.0) translate(0px, 0px); }
        }
        .ken-burns-img {
          width: 100%; height: 100%;
          object-fit: cover;
          animation: kenBurns 20s ease-in-out infinite;
          transform-origin: center center;
          display: block;
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <FadeUp>
          <div style={{ position: "relative" }}>
            {/* Real aerial photo with Ken Burns effect */}
            <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: 4, overflow: "hidden", position: "relative", border: `1px solid rgba(212,175,55,0.22)` }}>
              <img
                src="/aerial.jpg"
                alt="Aerial drone view — cinematic campus golden hour"
                className="ken-burns-img"
              />
              {/* Gold vignette overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,10,12,0.55) 100%)",
                pointerEvents: "none",
              }} />
              {/* HUD corner brackets */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {/* Top-left */}
                <div style={{ position: "absolute", top: 12, left: 12, width: 20, height: 20, borderTop: `1.5px solid rgba(212,175,55,0.6)`, borderLeft: `1.5px solid rgba(212,175,55,0.6)` }} />
                {/* Top-right */}
                <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, borderTop: `1.5px solid rgba(212,175,55,0.6)`, borderRight: `1.5px solid rgba(212,175,55,0.6)` }} />
                {/* Bottom-left */}
                <div style={{ position: "absolute", bottom: 44, left: 12, width: 20, height: 20, borderBottom: `1.5px solid rgba(212,175,55,0.6)`, borderLeft: `1.5px solid rgba(212,175,55,0.6)` }} />
                {/* Bottom-right */}
                <div style={{ position: "absolute", bottom: 44, right: 12, width: 20, height: 20, borderBottom: `1.5px solid rgba(212,175,55,0.6)`, borderRight: `1.5px solid rgba(212,175,55,0.6)` }} />
              </div>
              {/* Bottom bar */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 16px", background: "rgba(10,10,12,0.85)", borderTop: `1px solid rgba(212,175,55,0.2)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase" }}>● Aerial View · 4K/8K</span>
                <span style={{ fontSize: 10, letterSpacing: "0.15em", color: MUTED, fontFamily: "monospace" }}>GPS LOCK · REC ●</span>
              </div>
            </div>
            {/* Gold badge */}
            <div style={{ position: "absolute", top: -20, right: -20, background: GOLD, padding: "12px 20px", borderRadius: 2 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: OBSIDIAN, lineHeight: 1 }}>5+</div>
              <div style={{ fontSize: 10, letterSpacing: "0.1em", color: OBSIDIAN, textTransform: "uppercase" }}>Years Aerial</div>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase", marginBottom: 16 }}>Flagship Capability</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: WHITE, lineHeight: 1.1, margin: "0 0 24px" }}>
              Aerial Cinematography<br /><span style={{ color: GOLD }}>&amp; Spatial Vision</span>
            </h2>
            <GoldLine />
            <p style={{ fontSize: 16, lineHeight: 1.8, color: MUTED, marginBottom: 32 }}>
              We don't just capture moments — we command the sky. Sweeping cinematic reveals, God-eye perspectives, and high-altitude institutional mapping that transforms how your audience perceives space, scale, and story.
            </p>
            {["4K/8K Drone Cinematography", "Institutional Campus Aerial Mapping", "Event Overheads & Crowd Reveals", "Real Estate & Architecture Perspectives"].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }} viewport={{ once: true }}
                style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, background: GOLD, borderRadius: "50%", flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: SILVER }}>{item}</span>
              </motion.div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── THREE CORE PILLARS ──────────────────────────────────────────
const corePillars = [
  {
    icon: <Award size={32} color={GOLD} strokeWidth={1.5} />,
    label: "Pillar I",
    title: "Institutional Media & Corporate Branding",
    desc: "Cinematic fests, corporate identity films, and stage design for IIT/IISER-grade institutions. We craft the visual legacy your brand deserves.",
    items: ["Cultural Fest Coverage", "Corporate Identity Films", "Stage & Event Design", "Brand Story Reels"],
  },
  {
    icon: <Sparkles size={32} color={GOLD} strokeWidth={1.5} />,
    label: "Pillar II",
    title: "Luxury Wedding & Event Cinematography",
    desc: "Premium coverage built for legacy. Every emotion, every detail, preserved in a timeless cinematic language — with 24-hour Reel delivery and bespoke digital albums.",
    items: ["Cinematic Wedding Films", "24-Hour Instagram Reel Delivery", "Pre-wedding Lifestyle Shoots", "Bespoke Digital Web Albums"],
  },
  {
    icon: <Layers size={32} color={GOLD} strokeWidth={1.5} />,
    label: "Pillar III",
    title: "Advanced Post-Production & Digital Mastery",
    desc: "From raw frames to finished art. Flawless retouching, AI-driven 4K/8K upscaling, legacy photo restoration, and custom luxury print design.",
    items: ["AI 4K/8K Upscaling", "AI Legacy Photo Restoration", "Color Grading & Finishing", "Luxury Print & Album Design"],
  },
];

function PillarCard({ s, i }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeUp delay={i * 0.15}>
      <motion.div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        animate={{ borderColor: hovered ? GOLD_DIM : "rgba(255,255,255,0.06)" }}
        style={{ background: hovered ? SURFACE2 : SURFACE, border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 4, padding: "40px 36px", transition: "background 0.4s", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 24 }}>{s.icon}</div>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", color: GOLD_DIM, textTransform: "uppercase", marginBottom: 12 }}>{s.label}</div>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: WHITE, fontWeight: 600, lineHeight: 1.2, marginBottom: 16 }}>{s.title}</h3>
        <GoldLine />
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, flex: 1, marginBottom: 28 }}>{s.desc}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {s.items.map((item, j) => (
            <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 4, height: 4, background: GOLD_DIM, borderRadius: "50%", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: SILVER }}>{item}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </FadeUp>
  );
}

function CorePillarsSection() {
  return (
    <section id="services" style={{ background: CHARCOAL, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase", marginBottom: 16 }}>Our Craft</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 700, color: WHITE, margin: "0 0 20px", lineHeight: 1.1 }}>
              Three Pillars of <span style={{ color: GOLD }}>Excellence</span>
            </h2>
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              From sky to screen to print — we engineer every pixel of your visual story with surgical precision and cinematic soul.
            </p>
          </div>
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {corePillars.map((s, i) => <PillarCard key={i} s={s} i={i} />)}
        </div>
      </div>
    </section>
  );
}

// ── OJAS DIGITAL VAULT ─────────────────────────────────────────
const vaultFeatures = [
  {
    icon: <BookImage size={28} color={GOLD} strokeWidth={1.5} />,
    title: "Bespoke Digital Web Albums",
    desc: "Custom-designed, swipe-friendly digital albums hosted at a permanent personal URL. Every relative, everywhere, can open and relive the day on any device — forever.",
    tag: "e.g. nsojas.com/vault/arjun-weds-riya",
  },
  {
    icon: <Zap size={28} color={GOLD} strokeWidth={1.5} />,
    title: "24-Hour Reel Delivery",
    desc: "The #1 trend in 2026. A guaranteed 60-second, color-graded vertical Reel delivered the next morning — so clients post from the wedding night and tag you to thousands.",
    tag: "Instagram · YouTube Shorts · WhatsApp",
  },
  {
    icon: <Tv2 size={28} color={GOLD} strokeWidth={1.5} />,
    title: "360° Virtual Campus Tours",
    desc: "We fly the drone, capture 360° panoramas, and build an interactive map on your institution's website where students can virtually walk through the campus.",
    tag: "For IITs, IISERs & Universities",
  },
  {
    icon: <Image size={28} color={GOLD} strokeWidth={1.5} />,
    title: "AI Legacy Photo Restoration",
    desc: "Transform torn, 50-year-old black-and-white family photographs into vibrant, colorized, museum-quality prints. Emotional. Premium. High-margin.",
    tag: "Restoration · Colorization · Canvas Print",
  },
];

function VaultSection() {
  return (
    <section id="vault" style={{ background: OBSIDIAN, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase", marginBottom: 16 }}>Extended Services</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 700, color: WHITE, margin: "0 0 20px", lineHeight: 1.1 }}>
              The Ojas <span style={{ color: GOLD }}>Digital Vault</span>
            </h2>
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
              We don't hand you a USB drive. We build living digital experiences — permanent, shareable, breathtaking — that clients return to for decades.
            </p>
          </div>
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {vaultFeatures.map((f, i) => (
            <FadeUp key={i} delay={i * 0.12}>
              <motion.div whileHover={{ borderColor: GOLD_DIM, background: SURFACE2 }}
                style={{ background: SURFACE, border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 4, padding: "36px 32px", height: "100%", display: "flex", flexDirection: "column", transition: "all 0.3s" }}>
                <div style={{ marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, color: WHITE, fontWeight: 600, lineHeight: 1.2, marginBottom: 14 }}>{f.title}</h3>
                <GoldLine />
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, flex: 1, marginBottom: 20 }}>{f.desc}</p>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", color: GOLD_DIM, textTransform: "uppercase", padding: "8px 12px", border: `1px solid rgba(212,175,55,0.15)`, borderRadius: 2, display: "inline-block" }}>{f.tag}</div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── MERCH & PRINT STUDIO ───────────────────────────────────────
const merchItems = [
  { icon: <Shirt size={24} color={GOLD} strokeWidth={1.5} />,   title: "Premium Fest Apparel",       desc: "High-GSM custom t-shirts and hoodies for IIT/IISER cultural fests, corporate retreats, and organizing committees. Your design. Their pride." },
  { icon: <Coffee size={24} color={GOLD} strokeWidth={1.5} />,  title: "Bespoke Event Memorabilia",  desc: "Custom coffee mugs, premium metal keychains, and VIP delegate lanyards/ID cards — designed to match the visual identity of your event." },
  { icon: <Package size={24} color={GOLD} strokeWidth={1.5} />, title: "Large-Format Stage Branding", desc: "We don't just photograph the stage — we design it. Massive LED flex backdrops, standees, welcome arches, and complete event signage systems." },
  { icon: <RotateCcw size={24} color={GOLD} strokeWidth={1.5} />, title: "Complete Visual Identity Bundle", desc: "Book us for your fest and we handle everything: photography, drone, digital album, t-shirt design, and stage branding — one vendor, zero chaos." },
];

function MerchSection() {
  return (
    <section id="merch" style={{ background: CHARCOAL, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase", marginBottom: 16 }}>Event Merchandise & Print Studio</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 700, color: WHITE, margin: "0 0 20px", lineHeight: 1.1 }}>
              From the Sky to the <span style={{ color: GOLD }}>Shelf</span>
            </h2>
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 620, margin: "0 auto", lineHeight: 1.7 }}>
              If we're already shooting your fest or event, why let another vendor own the merchandise? We capture the full creative budget — photography to print, under one roof.
            </p>
          </div>
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 60 }}>
          {merchItems.map((m, i) => (
            <FadeUp key={i} delay={i * 0.12}>
              <motion.div whileHover={{ borderColor: GOLD_DIM, background: SURFACE }}
                style={{ background: SURFACE2, border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 4, padding: "32px 28px", height: "100%", transition: "all 0.3s" }}>
                <div style={{ marginBottom: 18, width: 52, height: 52, borderRadius: "50%", background: "rgba(212,175,55,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>{m.icon}</div>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 19, color: WHITE, fontWeight: 600, lineHeight: 1.2, marginBottom: 12 }}>{m.title}</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8 }}>{m.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
        {/* Merch CTA banner */}
        <FadeUp delay={0.3}>
          <div style={{ background: `linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.04) 100%)`, border: `1px solid rgba(212,175,55,0.25)`, borderRadius: 4, padding: "40px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase", marginBottom: 10 }}>Exclusive Bundle Offer</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(20px, 3vw, 28px)", color: WHITE, fontWeight: 600 }}>Book Photography + Get Merch Design at 30% Off</div>
            </div>
            <motion.a href="#contact" whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(212,175,55,0.3)" }} whileTap={{ scale: 0.97 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 36px", background: GOLD, color: OBSIDIAN, fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", borderRadius: 2, whiteSpace: "nowrap" }}>
              Enquire Now <ArrowRight size={14} />
            </motion.a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── OUR WORK: KEN BURNS SLIDESHOW + BEFORE/AFTER ──────────────

const showcaseSlides = [
  {
    src: "/institutional-media.jpg",
    label: "Institutional Media",
    caption: "IIT & IISER Cultural Fests · Corporate Events",
    tag: "Pillar I",
  },
  {
    src: "/premium-apparel-sota.jpg",
    label: "Premium Fest Apparel",
    caption: "Custom Hoodies & T-Shirts · Gold-Print Merchandise",
    tag: "Merch Studio",
  },
  {
    src: "/bespoke-mugs-sota.jpg",
    label: "Bespoke Event Memorabilia",
    caption: "Custom Mugs · Keychains · Personalised Print",
    tag: "Merch Studio",
  },
];

function KenBurnsSlideshow() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);

  const goTo = (idx) => {
    if (transitioning || idx === current) return;
    setPrev(current);
    setTransitioning(true);
    setCurrent(idx);
    setTimeout(() => { setPrev(null); setTransitioning(false); }, 1200);
  };

  const goNext = () => goTo((current + 1) % showcaseSlides.length);
  const goPrev = () => goTo((current - 1 + showcaseSlides.length) % showcaseSlides.length);

  useEffect(() => {
    timerRef.current = setInterval(goNext, 5000);
    return () => clearInterval(timerRef.current);
  }, [current, transitioning]);

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 4, overflow: "hidden", border: `1px solid rgba(212,175,55,0.2)`, background: OBSIDIAN }}>
      <style>{`
        @keyframes kbMain {
          0%   { transform: scale(1.0) translate(0px,0px); }
          100% { transform: scale(1.10) translate(-16px,-8px); }
        }
        @keyframes kbFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes kbFadeOut { from { opacity: 1; } to { opacity: 0; } }
        .kb-slide-in  { animation: kbFadeIn  1.2s ease forwards; }
        .kb-slide-out { animation: kbFadeOut 1.2s ease forwards; }
        .kb-zoom { animation: kbMain 6s ease-in-out forwards; }
      `}</style>

      {/* Previous slide fading out */}
      {prev !== null && (
        <div className="kb-slide-out" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <img src={showcaseSlides[prev].src} alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}

      {/* Current slide fading in with Ken Burns zoom */}
      <div className="kb-slide-in" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <img
          key={current}
          src={showcaseSlides[current].src}
          alt={showcaseSlides[current].label}
          className="kb-zoom"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transformOrigin: "center center" }}
        />
      </div>

      {/* Dark cinematic overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,12,0.85) 0%, rgba(10,10,12,0.15) 50%, rgba(10,10,12,0.3) 100%)", pointerEvents: "none" }} />

      {/* HUD corners */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 14, left: 14, width: 22, height: 22, borderTop: `1.5px solid rgba(212,175,55,0.55)`, borderLeft: `1.5px solid rgba(212,175,55,0.55)` }} />
        <div style={{ position: "absolute", top: 14, right: 14, width: 22, height: 22, borderTop: `1.5px solid rgba(212,175,55,0.55)`, borderRight: `1.5px solid rgba(212,175,55,0.55)` }} />
        <div style={{ position: "absolute", bottom: 56, left: 14, width: 22, height: 22, borderBottom: `1.5px solid rgba(212,175,55,0.55)`, borderLeft: `1.5px solid rgba(212,175,55,0.55)` }} />
        <div style={{ position: "absolute", bottom: 56, right: 14, width: 22, height: 22, borderBottom: `1.5px solid rgba(212,175,55,0.55)`, borderRight: `1.5px solid rgba(212,175,55,0.55)` }} />
      </div>

      {/* Tag pill top-left */}
      <div style={{ position: "absolute", top: 20, left: 20 }}>
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: 10, letterSpacing: "0.25em", color: OBSIDIAN, background: GOLD, padding: "5px 12px", borderRadius: 2, textTransform: "uppercase", fontWeight: 600 }}>
            {showcaseSlides[current].tag}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6, delay: 0.3 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(16px, 2.5vw, 22px)", color: WHITE, fontWeight: 600, marginBottom: 4 }}>
              {showcaseSlides[current].label}
            </div>
            <div style={{ fontSize: 12, letterSpacing: "0.15em", color: "rgba(212,175,55,0.8)", textTransform: "uppercase" }}>
              {showcaseSlides[current].caption}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next */}
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button onClick={goPrev} whileHover={{ background: "rgba(212,175,55,0.2)" }} whileTap={{ scale: 0.9 }}
            style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid rgba(212,175,55,0.4)`, background: "rgba(10,10,12,0.5)", color: GOLD, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button onClick={goNext} whileHover={{ background: "rgba(212,175,55,0.2)" }} whileTap={{ scale: 0.9 }}
            style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid rgba(212,175,55,0.4)`, background: "rgba(10,10,12,0.5)", color: GOLD, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {showcaseSlides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 3, background: i === current ? GOLD : "rgba(255,255,255,0.25)", border: "none", cursor: "pointer", transition: "all 0.35s", padding: 0 }} />
        ))}
      </div>
    </div>
  );
}

// ── BEFORE / AFTER RESTORATION SLIDER ─────────────────────────
function BeforeAfterSlider() {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const updatePos = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    setPos(x);
  };

  const onMouseMove = (e) => { if (dragging) updatePos(e.clientX); };
  const onTouchMove = (e) => { e.preventDefault(); updatePos(e.touches[0].clientX); };

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 4, overflow: "hidden", border: `1px solid rgba(212,175,55,0.2)`, cursor: "ew-resize", userSelect: "none" }}
      ref={containerRef}
      onMouseDown={() => setDragging(true)}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onMouseMove={onMouseMove}
      onTouchStart={() => setDragging(true)}
      onTouchEnd={() => setDragging(false)}
      onTouchMove={onTouchMove}>

      {/* AFTER (full width, behind) */}
      <img src="/ai-restoration-sota.jpg" alt="After AI Restoration"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "right center" }} />

      {/* BEFORE (clipped to left of handle) */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", width: `${pos}%` }}>
        <img src="/ai-restoration-sota.jpg" alt="Before Restoration"
          style={{ position: "absolute", top: 0, left: 0, width: `${10000 / pos}%`, height: "100%", objectFit: "cover", objectPosition: "left center", maxWidth: "none" }} />
        {/* Sepia overlay on before side */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(60,40,10,0.35)", mixBlendMode: "multiply" }} />
      </div>

      {/* Dark overlays bottom */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,12,0.7) 0%, transparent 40%)", pointerEvents: "none" }} />

      {/* Divider line */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 2, background: GOLD, transform: "translateX(-50%)", pointerEvents: "none" }}>
        {/* Handle circle */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 44, height: 44, borderRadius: "50%",
          background: GOLD,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 20px rgba(212,175,55,0.6)",
        }}>
          <div style={{ display: "flex", gap: 3 }}>
            <ChevronLeft size={14} color={OBSIDIAN} strokeWidth={3} />
            <ChevronRight size={14} color={OBSIDIAN} strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* BEFORE label */}
      <div style={{ position: "absolute", top: 16, left: 16, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: WHITE, background: "rgba(10,10,12,0.7)", padding: "5px 12px", borderRadius: 2, border: `1px solid rgba(255,255,255,0.15)` }}>
        Before
      </div>
      {/* AFTER label */}
      <div style={{ position: "absolute", top: 16, right: 16, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: OBSIDIAN, background: GOLD, padding: "5px 12px", borderRadius: 2, fontWeight: 600 }}>
        After · AI Restored
      </div>

      {/* Bottom caption */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 20px" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(14px, 2vw, 18px)", color: WHITE, fontWeight: 600, marginBottom: 4 }}>AI Legacy Photo Restoration</div>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "rgba(212,175,55,0.8)", textTransform: "uppercase" }}>Drag the slider · See the transformation</div>
      </div>
    </div>
  );
}

// ── OUR WORK SECTION ───────────────────────────────────────────
function OurWorkSection() {
  return (
    <section id="portfolio" style={{ background: OBSIDIAN, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase", marginBottom: 16 }}>Portfolio</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 700, color: WHITE, margin: "0 0 20px", lineHeight: 1.1 }}>
              Our <span style={{ color: GOLD }}>Work</span> Speaks
            </h2>
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              Every frame a statement. Every project a legacy. Scroll through a glimpse of what NS OJAS Media Labs delivers.
            </p>
          </div>
        </FadeUp>

        {/* Two column layout: Slideshow left, Before/After right */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 28 }}>
          <FadeUp delay={0.1}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: GOLD_DIM, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, height: 1, background: GOLD_DIM }} /> Showcase Reel
              </div>
              <KenBurnsSlideshow />
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: GOLD_DIM, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, height: 1, background: GOLD_DIM }} /> AI Restoration · Drag to Reveal
              </div>
              <BeforeAfterSlider />
            </div>
          </FadeUp>
        </div>

        {/* Bottom CTA strip */}
        <FadeUp delay={0.3}>
          <div style={{ textAlign: "center", padding: "40px 0 0" }}>
            <p style={{ fontSize: 14, color: MUTED, marginBottom: 24, letterSpacing: "0.05em" }}>
              This is just a glimpse. Every project we take on is a custom visual masterpiece.
            </p>
            <motion.a href="#contact"
              whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(212,175,55,0.35)" }} whileTap={{ scale: 0.97 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", background: "transparent", color: GOLD, fontSize: 12, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none", borderRadius: 2, border: `1px solid rgba(212,175,55,0.4)`, transition: "all 0.3s" }}>
              Start Your Project <ArrowRight size={14} />
            </motion.a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}



// ── NS OJAS VIDEO PRESENTATION ─────────────────────────────────
const REEL_VIDEOS = [
  { src: "/logo.mp4",                label: "NS OJAS Media Labs",        tag: "Brand Identity"      },
  { src: "/ai-restoration-sota.mp4", label: "AI Legacy Restoration",     tag: "The Showstopper"     },
  { src: "/premium-apparel-sota.mp4",label: "Premium Fest Apparel",      tag: "Merch Studio"        },
  { src: "/institutional-media.mp4", label: "Institutional Media",       tag: "Pillar I"            },
];

function NSojasPresentation() {
  // stage: "card" | "flash" | "playing"
  const [stage,       setStage]       = useState("card");
  const [vidIdx,      setVidIdx]      = useState(0);
  const [flash,       setFlash]       = useState(false);
  const [cardPhase,   setCardPhase]   = useState("fadein"); // fadein | hold | fadeout
  const [progress,    setProgress]    = useState(0);
  const [captionVis,  setCaptionVis]  = useState(false);
  const videoRef  = useRef(null);
  const rafRef    = useRef(null);
  const sectionRef = useRef(null);
  const inView    = useInView(sectionRef, { once: true, margin: "-100px" });

  // ── Cinematic opening card sequence ──
  useEffect(() => {
    if (!inView) return;
    // fade in 800ms → hold 2500ms → fade out 800ms → gold flash → first video
    const t1 = setTimeout(() => setCardPhase("hold"),    800);
    const t2 = setTimeout(() => setCardPhase("fadeout"), 3300);
    const t3 = setTimeout(() => {
      setFlash(true);
      setTimeout(() => { setFlash(false); setStage("playing"); }, 320);
    }, 4100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [inView]);

  // ── Progress bar ticker ──
  useEffect(() => {
    if (stage !== "playing") return;
    const tick = () => {
      const v = videoRef.current;
      if (v && v.duration) setProgress(v.currentTime / v.duration);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stage, vidIdx]);

  // ── Show caption 600ms after video starts ──
  useEffect(() => {
    if (stage !== "playing") return;
    setCaptionVis(false);
    const t = setTimeout(() => setCaptionVis(true), 600);
    return () => clearTimeout(t);
  }, [stage, vidIdx]);

  // ── On video end → gold flash → next video ──
  const handleVideoEnd = () => {
    setCaptionVis(false);
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      setVidIdx(i => (i + 1) % REEL_VIDEOS.length);
      setProgress(0);
    }, 320);
  };

  // ── Manual dot navigation ──
  const jumpTo = (idx) => {
    if (idx === vidIdx && stage === "playing") return;
    setCaptionVis(false);
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      setVidIdx(idx);
      setProgress(0);
    }, 320);
  };

  const cur = REEL_VIDEOS[vidIdx];

  return (
    <section ref={sectionRef} id="presentation"
      style={{ background: "#000", padding: "100px 24px 80px", position: "relative" }}>


      {/* flash moved inside theatre frame below */}

      {/* ── Section heading ── */}
      <FadeUp>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase", marginBottom: 16 }}>
            Exclusive Screening
          </div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(26px, 4.5vw, 48px)", fontWeight: 700, color: WHITE, margin: "0 0 12px", lineHeight: 1.1 }}>
            The NS OJAS <span style={{ color: GOLD }}>Presentation</span>
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginTop: 16 }}>
            <div style={{ height: 1, width: 48, background: GOLD_DIM }} />
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD }} />
            <div style={{ height: 1, width: 48, background: GOLD_DIM }} />
          </div>
        </div>
      </FadeUp>

      {/* ── Theatre frame ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
        <div style={{
          position: "relative", width: "100%", aspectRatio: "16/9",
          background: "#000", borderRadius: 4, overflow: "hidden",
          border: `1px solid ${flash ? GOLD : "rgba(212,175,55,0.2)"}`,
          boxShadow: flash
            ? "0 0 80px rgba(0,0,0,0.8), 0 0 60px rgba(212,175,55,0.9), 0 0 1px rgba(212,175,55,0.8)"
            : "0 0 80px rgba(0,0,0,0.8), 0 0 1px rgba(212,175,55,0.3)",
          isolation: "isolate",
          transition: "box-shadow 0.1s ease, border-color 0.1s ease",
        }}>

          {/* ── CONTAINED FLASH OVERLAY — shutter inside frame, isolation:isolate contains it ── */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 50,
            background: GOLD,
            opacity: flash ? 1 : 0,
            pointerEvents: "none",
            transition: flash ? "opacity 0.04s linear" : "opacity 0.26s ease",
            willChange: "opacity",
          }} />

          {/* ── CINEMATIC OPENING CARD ── */}
          <AnimatePresence>
            {stage === "card" && inView && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: cardPhase === "fadeout" ? 0 : 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{
                  position: "absolute", inset: 0, zIndex: 10,
                  background: "#000",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                }}>
                {/* Outer ring */}
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: cardPhase === "fadeout" ? 0 : 0.3 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.3)" }} />
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: cardPhase === "fadeout" ? 0 : 0.5 }}
                  transition={{ duration: 1.4, ease: "easeOut", delay: 0.1 }}
                  style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.4)" }} />

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: cardPhase === "fadeout" ? 0 : 1, y: cardPhase === "fadeout" ? -8 : 0 }}
                  transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
                  style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
                  <div style={{ fontSize: "clamp(10px, 1.5vw, 13px)", letterSpacing: "0.45em", color: "rgba(212,175,55,0.6)", textTransform: "uppercase", marginBottom: 20, fontFamily: "system-ui, sans-serif" }}>
                    ✦ &nbsp; A Motion Picture By &nbsp; ✦
                  </div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(18px, 3.5vw, 38px)", fontWeight: 700, color: WHITE, lineHeight: 1.15, marginBottom: 14, letterSpacing: "0.04em" }}>
                    From the Lens of
                  </div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(22px, 4.5vw, 52px)", fontWeight: 700, color: GOLD, lineHeight: 1, letterSpacing: "0.02em" }}>
                    NS OJAS
                  </div>
                  <div style={{ fontSize: "clamp(10px, 1.8vw, 16px)", letterSpacing: "0.55em", color: SILVER, textTransform: "uppercase", marginTop: 8, fontFamily: "system-ui, sans-serif", fontWeight: 300 }}>
                    MEDIA &nbsp; LABS
                  </div>
                </motion.div>

                {/* Bottom line */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: cardPhase === "fadeout" ? 0 : 0.5, scaleX: cardPhase === "fadeout" ? 0 : 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  style={{ position: "absolute", bottom: "14%", left: "20%", right: "20%", height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── VIDEO PLAYER ── */}
          {stage === "playing" && (
            <video
              ref={videoRef}
              key={vidIdx}
              src={cur.src}
              autoPlay muted playsInline
              onEnded={handleVideoEnd}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}

          {/* Dark vignette over video */}
          {stage === "playing" && (
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.2) 100%)", pointerEvents: "none" }} />
          )}

          {/* ── HUD CORNERS ── */}
          {stage === "playing" && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: 14, left: 14, width: 22, height: 22, borderTop: "1.5px solid rgba(212,175,55,0.5)", borderLeft: "1.5px solid rgba(212,175,55,0.5)" }} />
              <div style={{ position: "absolute", top: 14, right: 14, width: 22, height: 22, borderTop: "1.5px solid rgba(212,175,55,0.5)", borderRight: "1.5px solid rgba(212,175,55,0.5)" }} />
              <div style={{ position: "absolute", bottom: 52, left: 14, width: 22, height: 22, borderBottom: "1.5px solid rgba(212,175,55,0.5)", borderLeft: "1.5px solid rgba(212,175,55,0.5)" }} />
              <div style={{ position: "absolute", bottom: 52, right: 14, width: 22, height: 22, borderBottom: "1.5px solid rgba(212,175,55,0.5)", borderRight: "1.5px solid rgba(212,175,55,0.5)" }} />
              {/* REC indicator */}
              <div style={{ position: "absolute", top: 18, right: 48, display: "flex", alignItems: "center", gap: 5 }}>
                <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff3333" }} />
                <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>REC</span>
              </div>
            </div>
          )}

          {/* ── CAPTION ── */}
          <AnimatePresence>
            {stage === "playing" && captionVis && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.6 }}
                style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 24px 20px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.25em", color: GOLD, textTransform: "uppercase", marginBottom: 5, fontFamily: "monospace" }}>
                    {String(vidIdx + 1).padStart(2,"0")} / {String(REEL_VIDEOS.length).padStart(2,"0")} · {cur.tag}
                  </div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(14px, 2.2vw, 20px)", color: WHITE, fontWeight: 600 }}>
                    {cur.label}
                  </div>
                </div>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(212,175,55,0.5)", textTransform: "uppercase", fontFamily: "monospace" }}>
                  NS OJAS · {new Date().getFullYear()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── PROGRESS BAR ── */}
          {stage === "playing" && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.08)" }}>
              <motion.div
                style={{ height: "100%", background: `linear-gradient(90deg, ${GOLD_DIM}, ${GOLD})`, width: `${progress * 100}%`, transformOrigin: "left" }}
                transition={{ duration: 0.1 }} />
            </div>
          )}
        </div>

        {/* ── DOT NAVIGATION ── */}
        {stage === "playing" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 28 }}>
            {REEL_VIDEOS.map((v, i) => (
              <button key={i} onClick={() => jumpTo(i)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", padding: 0, opacity: i === vidIdx ? 1 : 0.4, transition: "opacity 0.3s" }}>
                <div style={{ width: i === vidIdx ? 28 : 8, height: 8, borderRadius: 4, background: i === vidIdx ? GOLD : "rgba(255,255,255,0.3)", transition: "all 0.35s" }} />
                <span style={{ fontSize: 9, letterSpacing: "0.2em", color: i === vidIdx ? GOLD : MUTED, textTransform: "uppercase", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                  {String(i + 1).padStart(2,"0")}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── FILM STRIP DECORATION ── */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 20, opacity: 0.2 }}>
          {[...Array(18)].map((_, i) => (
            <div key={i} style={{ width: 10, height: 14, borderRadius: 1, border: "1px solid rgba(212,175,55,0.6)", background: i % 5 === 0 ? "rgba(212,175,55,0.15)" : "transparent" }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CLIENT VAULT ───────────────────────────────────────────────
function ClientVault() {
  const [vaultId, setVaultId]     = useState("");
  const [stage, setStage]         = useState("idle");
  const [modalOpen, setModalOpen] = useState(false);
  const inputRef = useRef(null);

  const handleEnter = () => {
    if (!vaultId.trim()) { if (inputRef.current) inputRef.current.focus(); return; }
    setStage("loading");
    setModalOpen(true);
    setTimeout(() => {
      const upper = vaultId.trim().toUpperCase();
      if (upper.startsWith("OJAS-")) { setStage("preparing"); }
      else { setStage("notfound"); }
    }, 2200);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => { setStage("idle"); setVaultId(""); }, 400);
  };

  return (
    <section id="vault-login" style={{ background: CHARCOAL, padding: "100px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <svg style={{ width: "100%", height: "100%", opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="vgrid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke={GOLD} strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#vgrid)" />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)" }} />
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", position: "relative", textAlign: "center" }}>
        <FadeUp>
          <motion.div
            animate={{ boxShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 40px rgba(212,175,55,0.3)", "0 0 0px rgba(212,175,55,0)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill={GOLD}/>
            </svg>
          </motion.div>

          <div style={{ fontSize: 11, letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase", marginBottom: 16 }}>Exclusive Client Access</div>

          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, color: WHITE, margin: "0 0 16px", lineHeight: 1.1 }}>
            The NS OJAS <span style={{ color: GOLD }}>Client Vault</span>
          </h2>

          <GoldLine />

          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.8, marginBottom: 48, maxWidth: 520, margin: "0 auto 48px" }}>
            Your photographs. Your memories. Your private universe. Every NS OJAS client receives an exclusive Vault ID — your personal key to a world built only for you.
          </p>

          <div style={{ maxWidth: 480, margin: "0 auto 20px" }}>
            <div style={{ display: "flex" }}>
              <div style={{ padding: "0 16px", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", borderRight: "none", borderRadius: "2px 0 0 2px", display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 12, letterSpacing: "0.15em", color: GOLD, fontFamily: "monospace", fontWeight: 600 }}>OJAS</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={vaultId}
                onChange={e => setVaultId(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === "Enter") handleEnter(); }}
                placeholder="— 2026 — WED — 0001"
                maxLength={24}
                style={{ flex: 1, padding: "18px 20px", background: SURFACE, border: "1px solid rgba(212,175,55,0.25)", borderRadius: "0 2px 2px 0", color: GOLD, fontSize: 15, letterSpacing: "0.2em", fontFamily: "monospace", outline: "none" }}
                onFocus={e => { e.target.style.borderColor = GOLD; }}
                onBlur={e => { e.target.style.borderColor = "rgba(212,175,55,0.25)"; }}
              />
            </div>
          </div>

          <motion.button
            onClick={handleEnter}
            whileHover={{ boxShadow: "0 0 40px rgba(212,175,55,0.45)", scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{ padding: "18px 56px", background: GOLD, color: OBSIDIAN, fontSize: 12, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", border: "none", borderRadius: 2, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={OBSIDIAN} strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Enter Vault
          </motion.button>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, maxWidth: 480, margin: "0 auto", padding: "20px 24px", background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 2, textAlign: "left" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" style={{ marginTop: 2, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: 0 }}>
              Don't have a Vault ID yet?{" "}
              <a href="#contact" style={{ color: GOLD, textDecoration: "none", fontWeight: 500 }}>Book a session</a>
              {" "}and receive your exclusive NS OJAS Client ID within 24 hours of your event.
            </p>
          </div>
        </FadeUp>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, backdropFilter: "blur(8px)" }} />

            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 301, width: "min(520px, 92vw)", background: SURFACE, border: "1px solid rgba(212,175,55,0.3)", borderRadius: 4, padding: "52px 48px", textAlign: "center" }}>

              <div style={{ position: "absolute", top: 12, left: 12, width: 16, height: 16, borderTop: "1.5px solid rgba(212,175,55,0.5)", borderLeft: "1.5px solid rgba(212,175,55,0.5)" }} />
              <div style={{ position: "absolute", top: 12, right: 12, width: 16, height: 16, borderTop: "1.5px solid rgba(212,175,55,0.5)", borderRight: "1.5px solid rgba(212,175,55,0.5)" }} />
              <div style={{ position: "absolute", bottom: 12, left: 12, width: 16, height: 16, borderBottom: "1.5px solid rgba(212,175,55,0.5)", borderLeft: "1.5px solid rgba(212,175,55,0.5)" }} />
              <div style={{ position: "absolute", bottom: 12, right: 12, width: 16, height: 16, borderBottom: "1.5px solid rgba(212,175,55,0.5)", borderRight: "1.5px solid rgba(212,175,55,0.5)" }} />

              {stage === "loading" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid rgba(212,175,55,0.15)", borderTop: "2px solid " + GOLD, margin: "0 auto 28px" }} />
                  <div style={{ fontSize: 11, letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase", marginBottom: 12 }}>Accessing Vault</div>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>Authenticating your exclusive Client ID...<br />Please wait.</p>
                </motion.div>
              )}

              {stage === "preparing" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div style={{ fontSize: 11, letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase", marginBottom: 12 }}>Vault Recognised</div>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: WHITE, marginBottom: 16, fontWeight: 600 }}>Your Vault is Being Prepared</h3>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, marginBottom: 12 }}>
                    We've located your Client ID. Your private gallery is currently being curated with the care and precision your memories deserve.
                  </p>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, marginBottom: 32 }}>
                    Simha will personally notify you the moment your Vault is ready. Expect an exclusive access link via WhatsApp within{" "}
                    <span style={{ color: GOLD }}>24 hours</span>.
                  </p>
                  <motion.button onClick={closeModal}
                    whileHover={{ boxShadow: "0 0 24px rgba(212,175,55,0.3)" }}
                    style={{ padding: "14px 36px", background: GOLD, color: OBSIDIAN, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", border: "none", borderRadius: 2, cursor: "pointer", fontFamily: "inherit" }}>
                    Close
                  </motion.button>
                </motion.div>
              )}

              {stage === "notfound" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(139,110,26,0.1)", border: "1px solid rgba(139,110,26,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD_DIM} strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <div style={{ fontSize: 11, letterSpacing: "0.3em", color: GOLD_DIM, textTransform: "uppercase", marginBottom: 12 }}>ID Not Recognised</div>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: WHITE, marginBottom: 16, fontWeight: 600 }}>Vault Not Found</h3>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, marginBottom: 8 }}>
                    This Vault ID doesn't match our records. Please check your ID or contact Simha directly on WhatsApp.
                  </p>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, marginBottom: 32 }}>
                    NS OJAS Client IDs follow the format:<br />
                    <span style={{ fontFamily: "monospace", color: GOLD, fontSize: 13, letterSpacing: "0.15em" }}>OJAS-2026-WED-0001</span>
                  </p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <motion.button onClick={closeModal}
                      whileHover={{ borderColor: GOLD, color: GOLD }}
                      style={{ padding: "14px 28px", background: "transparent", color: MUTED, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 2, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                      Try Again
                    </motion.button>
                    <motion.a href="https://wa.me/919704551102" target="_blank" rel="noopener noreferrer"
                      whileHover={{ boxShadow: "0 0 20px rgba(37,211,102,0.3)" }}
                      style={{ padding: "14px 28px", background: "#25D366", color: WHITE, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", borderRadius: 2, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <MessageCircle size={14} fill="white" /> WhatsApp Simha
                    </motion.a>
                  </div>
                </motion.div>
              )}

              {stage !== "loading" && (
                <button onClick={closeModal}
                  style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

// ── TESTIMONIALS ───────────────────────────────────────────────
const testimonials = [
  {
    quote: "Simha and his team shot our entire IIT cultural fest — from the opening drone reveal to the closing ceremony. The aerial footage on the LED screen left the crowd speechless. We've booked them for the next three years.",
    name: "Arjun Reddy",
    role: "Cultural Secretary, IIT Tirupati",
    stars: 5,
  },
  {
    quote: "We received our wedding reel the very next morning. By afternoon it had 12,000 views on Instagram. The 4K film they delivered two weeks later is simply the most beautiful thing I have ever watched. NS OJAS is in a different league.",
    name: "Priya & Karthik Sharma",
    role: "Luxury Wedding, Hyderabad",
    stars: 5,
  },
  {
    quote: "They didn't just photograph our product launch — they designed our stage, produced our brand reel, and delivered custom merchandise for 200 delegates. One vendor. Zero stress. Absolute perfection.",
    name: "Venkat Narasimhan",
    role: "Director of Marketing, TechCorp India",
    stars: 5,
  },
  {
    quote: "I gave Simha a torn, faded photo of my grandparents from 1962. What he returned to me — restored, colorized, printed on premium canvas — made my entire family cry. This is not photography. This is legacy.",
    name: "Sunitha Devi",
    role: "Legacy Restoration Client, Srikalahasti",
    stars: 5,
  },
  {
    quote: "The 360° virtual campus tour they built for our institute has been live for three months and prospective students keep mentioning it. Our admissions team calls it our most powerful recruitment tool. Extraordinary work.",
    name: "Dr. Ramesh Kumar",
    role: "Dean of Admissions, IISER Tirupati",
    stars: 5,
  },
];

function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const prev = () => setActive(a => (a - 1 + testimonials.length) % testimonials.length);
  const next = () => setActive(a => (a + 1) % testimonials.length);
  const t = testimonials[active];

  return (
    <section style={{ background: OBSIDIAN, padding: "100px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 400, fontFamily: "Georgia, serif", color: "rgba(212,175,55,0.025)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>❝</div>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase", marginBottom: 16 }}>Client Stories</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: WHITE }}>
              Voices of <span style={{ color: GOLD }}>Trust</span>
            </h2>
          </div>
        </FadeUp>
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 32 }}>
              {[...Array(t.stars)].map((_, i) => <Star key={i} size={16} color={GOLD} fill={GOLD} />)}
            </div>
            <blockquote style={{ fontFamily: "Georgia, serif", fontSize: "clamp(17px, 2.5vw, 24px)", fontStyle: "italic", color: WHITE, lineHeight: 1.65, marginBottom: 40 }}>
              "{t.quote}"
            </blockquote>
            <div style={{ fontSize: 13, fontWeight: 600, color: WHITE, letterSpacing: "0.05em", marginBottom: 6 }}>{t.name}</div>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase" }}>{t.role}</div>
          </motion.div>
        </AnimatePresence>
        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 52 }}>
          <motion.button onClick={prev} whileHover={{ borderColor: GOLD, color: GOLD }} whileTap={{ scale: 0.9 }}
            style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid rgba(255,255,255,0.15)`, background: "transparent", color: MUTED, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
            <ChevronLeft size={18} />
          </motion.button>
          <div style={{ display: "flex", gap: 8 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                style={{ width: i === active ? 24 : 8, height: 8, borderRadius: 4, background: i === active ? GOLD : "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
            ))}
          </div>
          <motion.button onClick={next} whileHover={{ borderColor: GOLD, color: GOLD }} whileTap={{ scale: 0.9 }}
            style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid rgba(255,255,255,0.15)`, background: "transparent", color: MUTED, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}

// ── FOUNDER QUOTE ──────────────────────────────────────────────
function FounderQuote() {
  return (
    <section style={{ background: CHARCOAL, padding: "100px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 400, fontFamily: "Georgia, serif", color: "rgba(212,175,55,0.03)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>❝</div>
      <FadeUp>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <Star size={20} color={GOLD} style={{ marginBottom: 32 }} />
          <blockquote style={{ fontFamily: "Georgia, serif", fontSize: "clamp(20px, 3.5vw, 34px)", fontWeight: 400, fontStyle: "italic", color: WHITE, lineHeight: 1.5, margin: "0 0 40px" }}>
            "We don't take photographs. We build visual monuments that outlive the moment."
          </blockquote>
          <div style={{ fontSize: 12, letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase" }}>
            Narasimha (Simha) · Founder & Creative Director
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

// ── CONTACT / FOOTER ───────────────────────────────────────────
function ContactFooter() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [sent, setSent] = useState(false);

  const inputStyle = {
    width: "100%", padding: "14px 16px",
    background: SURFACE, border: `1px solid rgba(255,255,255,0.08)`,
    borderRadius: 2, color: WHITE, fontSize: 14,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <section id="contact" style={{ background: OBSIDIAN, padding: "100px 24px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase", marginBottom: 16 }}>Begin Your Project</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(30px, 5vw, 52px)", color: WHITE, fontWeight: 700, margin: 0 }}>
              Command Your <span style={{ color: GOLD }}>Vision</span>
            </h2>
          </div>
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "start", marginBottom: 100 }}>
          {/* Left */}
          <FadeUp>
            <div>
              <div style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: GOLD_DIM, textTransform: "uppercase", marginBottom: 24 }}>Studio Information</div>
                {[
                  { icon: <Globe size={16} />, label: "HQ", val: "Srikalahasti, Andhra Pradesh — Serving Globally" },
                  { icon: <Phone size={16} />, label: "Direct / WhatsApp", val: "+91 9704551102" },
                  { icon: <Mail size={16} />, label: "Email", val: "nsojasmedialabs@gmail.com" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, marginBottom: 28, alignItems: "flex-start" }}>
                    <div style={{ color: GOLD, marginTop: 2, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: "0.2em", color: MUTED, textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 15, color: WHITE }}>{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: GOLD_DIM, textTransform: "uppercase", marginBottom: 20 }}>Follow the Work</div>
                <div style={{ display: "flex", gap: 16 }}>
                  {[{ icon: <Camera size={20} />, label: "Instagram" }, { icon: <Mail size={20} />, label: "Email" }].map(({ icon, label }) => (
                    <motion.a key={label} href="#" whileHover={{ borderColor: GOLD, color: GOLD }}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 2, color: MUTED, textDecoration: "none", fontSize: 12, letterSpacing: "0.1em", transition: "all 0.3s" }}>
                      {icon} {label}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
          {/* Right: Form */}
          <FadeUp delay={0.2}>
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "60px 40px", border: `1px solid rgba(212,175,55,0.3)`, borderRadius: 4 }}>
                <Sparkles size={40} color={GOLD} style={{ marginBottom: 24 }} />
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: WHITE, marginBottom: 12 }}>Message Received</h3>
                <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>Simha will personally reach out within 24 hours. Welcome to the NS OJAS family.</p>
              </motion.div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { field: "name", label: "Full Name", type: "text", placeholder: "Your name" },
                  { field: "email", label: "Email", type: "email", placeholder: "your@email.com" },
                  { field: "phone", label: "Phone / WhatsApp", type: "tel", placeholder: "+91 " },
                ].map(({ field, label, type, placeholder }) => (
                  <div key={field}>
                    <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", color: GOLD_DIM, textTransform: "uppercase", marginBottom: 8 }}>{label}</label>
                    <input type={type} placeholder={placeholder} value={form[field]}
                      onChange={e => setForm({ ...form, [field]: e.target.value })}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = GOLD_DIM}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", color: GOLD_DIM, textTransform: "uppercase", marginBottom: 8 }}>Service Interest</label>
                  <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}
                    style={{ ...inputStyle, color: form.service ? WHITE : MUTED }}>
                    <option value="">Select a service</option>
                    <option>Institutional / Corporate Media</option>
                    <option>Luxury Wedding & Event Cinematography</option>
                    <option>Aerial Drone Cinematography</option>
                    <option>Digital Web Album</option>
                    <option>24-Hour Reel Delivery</option>
                    <option>360° Virtual Campus Tour</option>
                    <option>AI Legacy Photo Restoration</option>
                    <option>Event Merchandise & Print</option>
                    <option>Stage Branding & Large Format Print</option>
                    <option>Post-Production & Editing</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", color: GOLD_DIM, textTransform: "uppercase", marginBottom: 8 }}>Message</label>
                  <textarea placeholder="Tell us about your project, event date, vision..." value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })} rows={4}
                    style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={e => e.target.style.borderColor = GOLD_DIM}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                </div>
                <motion.button onClick={() => setSent(true)}
                  whileHover={{ boxShadow: "0 0 32px rgba(212,175,55,0.35)" }} whileTap={{ scale: 0.97 }}
                  style={{ padding: "18px 40px", background: GOLD, color: OBSIDIAN, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, border: "none", borderRadius: 2, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontFamily: "inherit" }}>
                  Send Inquiry <ArrowRight size={14} />
                </motion.button>
              </div>
            )}
          </FadeUp>
        </div>
        {/* Footer bar */}
        <div style={{ borderTop: `1px solid rgba(212,175,55,0.12)`, padding: "32px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Aperture size={18} color={GOLD} />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 15, color: WHITE, fontWeight: 700, letterSpacing: "0.1em" }}>
              NS <span style={{ color: GOLD }}>OJAS</span> Media Labs
            </span>
          </div>
          <div style={{ fontSize: 12, color: MUTED }}>
            Founder: Narasimha (Simha) &nbsp;·&nbsp; © 2026 NS OJAS Media Labs &nbsp;·&nbsp; All rights reserved
          </div>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", color: GOLD_DIM, textTransform: "uppercase" }}>Srikalahasti, A.P.</div>
        </div>
      </div>
    </section>
  );
}

// ── WHATSAPP FLOAT ─────────────────────────────────────────────
function WhatsAppFloat() {
  return (
    <motion.a
      href="https://wa.me/919704551102?text=Hi%20Simha%2C%20I%20found%20NS%20OJAS%20Media%20Labs%20online%20and%20would%20like%20to%20discuss%20a%20project."
      target="_blank" rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1, boxShadow: "0 8px 40px rgba(37,211,102,0.5)" }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 200,
        width: 60, height: 60, borderRadius: "50%",
        background: "#25D366",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 24px rgba(37,211,102,0.35)",
        textDecoration: "none",
      }}>
      <MessageCircle size={26} color="#fff" fill="#fff" />
    </motion.a>
  );
}

// ── ROOT ───────────────────────────────────────────────────────
export default function NSojas() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background: OBSIDIAN, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: WHITE }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(212,175,55,0.3); }
        input::placeholder, textarea::placeholder { color: #555560; }
        select option { background: #16161A; color: #F5F5F0; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1fr 1fr"],
          section > div > div[style*="grid-template-columns: 1fr 1fr"],
          section > div[style*="grid-template-columns: 1fr 1.2fr"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
      <Navbar scrolled={scrolled} />
      <Hero />
      <TrustStrip />
      <StatsStrip />
      <AerialSection />
      <CorePillarsSection />
      <VaultSection />
      <MerchSection />
      <OurWorkSection />
      <NSojasPresentation />
      <ClientVault />
      <TestimonialsSection />
      <FounderQuote />
      <ContactFooter />
      <WhatsAppFloat />
    </div>
  );
}