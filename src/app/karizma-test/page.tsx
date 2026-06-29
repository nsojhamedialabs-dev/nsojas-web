"use client";

import React, { useState } from "react";

// --- SOTA CONFIGURATION MATRICES ---

const SPREAD_SIZES = [
  { id: "12x36", label: "12x36 (Standard Panoramic)", width: 36, height: 12 },
  { id: "12x30", label: "12x30 (Compact Panoramic)", width: 30, height: 12 },
  { id: "12x24", label: "12x24 (Square Spread)", width: 24, height: 12 },
  { id: "15x30", label: "15x30 (Large Square-ish)", width: 30, height: 15 },
  { id: "17x24", label: "17x24 (Portrait Spread)", width: 24, height: 17 },
];

const THEMES = {
  obsidian: {
    name: "Classic Obsidian",
    container: "bg-gradient-to-br from-gray-900 via-black to-gray-800",
    text: "text-yellow-500",
    border: "border-gray-700",
    crease: "bg-black/80 shadow-[0_0_20px_rgba(0,0,0,0.9)]",
    photoBg: "bg-gray-800/50 border-gray-600",
  },
  haldi: {
    name: "Vibrant Haldi Glow",
    container: "bg-gradient-to-br from-yellow-400 via-orange-300 to-yellow-500",
    text: "text-orange-950",
    border: "border-yellow-600",
    crease: "bg-orange-900/30 shadow-[0_0_20px_rgba(194,65,12,0.4)]",
    photoBg: "bg-yellow-100/40 border-yellow-500",
  },
  kanjeevaram: {
    name: "Royal Kanjeevaram Red",
    container: "bg-gradient-to-br from-red-900 via-red-800 to-red-950",
    text: "text-yellow-400",
    border: "border-red-700",
    crease: "bg-black/50 shadow-[0_0_20px_rgba(0,0,0,0.7)]",
    photoBg: "bg-red-950/50 border-red-600",
  },
};

const TYPOGRAPHY = [
  { id: "font-playfair", label: "Playfair Display (Elegant Serif)" },
  { id: "font-cinzel", label: "Cinzel (Cinematic Classic)" },
  { id: "font-great-vibes", label: "Great Vibes (Romantic Cursive)" },
  { id: "font-montserrat", label: "Montserrat (Modern Clean)" },
];

export default function KarizmaDesignerMVP() {
  // --- STATE MANAGEMENT ---
  const [spreadSizeId, setSpreadSizeId] = useState("12x36");
  const [designThemeId, setDesignThemeId] = useState<keyof typeof THEMES>("obsidian");
  const [typographyProfile, setTypographyProfile] = useState("font-playfair");
  const [coupleNames, setCoupleNames] = useState("Aditya & Priya");
  const [ceremonyName, setCeremonyName] = useState("The Wedding");

  // --- DERIVED STATE ---
  const selectedSize = SPREAD_SIZES.find((s) => s.id === spreadSizeId) || SPREAD_SIZES[0];
  const currentTheme = THEMES[designThemeId];

  // --- STRICT INPUT VALIDATION ---
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const val = e.target.value;
    // Red Team Rule: Block non-English unicode to prevent typography rendering failures.
    if (/^[a-zA-Z0-9\s&'-]*$/.test(val)) {
      setter(val);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
      {/* INJECTING GOOGLE FONTS FOR MVP PORTABILITY */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Great+Vibes&family=Montserrat:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-great-vibes { font-family: 'Great Vibes', cursive; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
      `}} />

      {/* --- LEFT CONTROL PANEL --- */}
      <aside className="w-full md:w-80 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col gap-6 overflow-y-auto shadow-2xl z-20">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-white">
            NS OJAS <span className="text-blue-500">LABS</span>
          </h2>
          <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">V1 Layout Engine</p>
        </div>

        <div className="space-y-4">
          {/* Geometry Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Spread Geometry</label>
            <select
              value={spreadSizeId}
              onChange={(e) => setSpreadSizeId(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {SPREAD_SIZES.map((size) => (
                <option key={size.id} value={size.id}>{size.label}</option>
              ))}
            </select>
          </div>

          {/* Theme Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Aesthetic Theme</label>
            <select
              value={designThemeId}
              onChange={(e) => setDesignThemeId(e.target.value as keyof typeof THEMES)}
              className="bg-neutral-950 border border-neutral-800 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.entries(THEMES).map(([key, theme]) => (
                <option key={key} value={key}>{theme.name}</option>
              ))}
            </select>
          </div>

          {/* Typography Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Typography Profile</label>
            <select
              value={typographyProfile}
              onChange={(e) => setTypographyProfile(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {TYPOGRAPHY.map((font) => (
                <option key={font.id} value={font.id}>{font.label}</option>
              ))}
            </select>
          </div>

          {/* Data Variables */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Couple Names</label>
            <input
              type="text"
              value={coupleNames}
              onChange={(e) => handleTextChange(e, setCoupleNames)}
              placeholder="e.g. Aditya & Priya"
              className="bg-neutral-950 border border-neutral-800 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Ceremony Name</label>
            <input
              type="text"
              value={ceremonyName}
              onChange={(e) => handleTextChange(e, setCeremonyName)}
              placeholder="e.g. The Wedding"
              className="bg-neutral-950 border border-neutral-800 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </aside>

      {/* --- RIGHT PREVIEW AREA --- */}
      <main className="flex-1 bg-neutral-950 p-4 md:p-8 flex items-center justify-center overflow-hidden relative">
        {/* Background Grid Pattern for SOTA aesthetic */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* 
          THE DYNAMIC GEOMETRY ENGINE 
          Notice how we bind the aspect-ratio mathematically. No hardcoded heights.
        */}
        <div
          className={`relative w-full max-w-6xl shadow-2xl transition-all duration-700 ease-in-out ${currentTheme.container} ${currentTheme.border} border-4 rounded-sm overflow-hidden z-10`}
          style={{ aspectRatio: `${selectedSize.width} / ${selectedSize.height}` }}
        >
          {/* The Center Crease (Simulating the physical album fold) */}
          <div className={`absolute left-1/2 top-0 bottom-0 w-1 -ml-[2px] z-20 ${currentTheme.crease}`}></div>

          {/* CSS Grid Layout Engine */}
          <div className="absolute inset-0 grid grid-cols-2">
            
            {/* Left Page: Dynamic Photo Grid */}
            <div className="p-3 md:p-6 lg:p-10 flex flex-col gap-3 md:gap-6">
              <div className={`flex-1 rounded-md border ${currentTheme.photoBg} flex items-center justify-center backdrop-blur-sm transition-colors duration-500`}>
                <span className="opacity-40 text-[10px] md:text-xs tracking-[0.2em] font-mono">IMG_SLOT_01</span>
              </div>
              <div className="flex-1 flex gap-3 md:gap-6">
                <div className={`flex-1 rounded-md border ${currentTheme.photoBg} flex items-center justify-center backdrop-blur-sm transition-colors duration-500`}>
                  <span className="opacity-40 text-[10px] md:text-xs tracking-[0.2em] font-mono">IMG_02</span>
                </div>
                <div className={`flex-1 rounded-md border ${currentTheme.photoBg} flex items-center justify-center backdrop-blur-sm transition-colors duration-500`}>
                  <span className="opacity-40 text-[10px] md:text-xs tracking-[0.2em] font-mono">IMG_03</span>
                </div>
              </div>
            </div>

            {/* Right Page: Typography & Hero */}
            <div className="p-3 md:p-6 lg:p-10 flex flex-col items-center justify-center text-center relative">
              <div className={`absolute inset-3 md:inset-6 lg:inset-10 rounded-md border ${currentTheme.photoBg} opacity-40 transition-colors duration-500`}></div>
              
              <div className="relative z-10 px-4">
                <h1 className={`text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-2 md:mb-6 transition-colors duration-500 ${currentTheme.text} ${typographyProfile}`}>
                  {coupleNames || "Couple Names"}
                </h1>
                
                <div className={`h-px w-16 md:w-32 mx-auto mb-2 md:mb-6 transition-colors duration-500 ${currentTheme.text} opacity-50`}></div>
                
                <h2 className={`text-[10px] sm:text-sm md:text-lg lg:text-2xl tracking-[0.3em] md:tracking-[0.5em] uppercase transition-colors duration-500 ${currentTheme.text} ${typographyProfile}`}>
                  {ceremonyName || "Ceremony"}
                </h2>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}