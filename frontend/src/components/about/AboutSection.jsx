import React from 'react';
import {
  rocketIcon,
  eyeIcon,
  heartIcon,
  aboutUsCollab,
  aboutUsAvatars,
  burstLines,
} from '../../assets/LandingPage';

export default function AboutSection({ onStartRoom }) {
  const handleScrollToMission = (e) => {
    e.preventDefault();
    const missionElem = document.getElementById('our-mission-cards');
    if (missionElem) {
      missionElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section
      id="about"
      className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-8 sm:pb-10 max-w-[1240px] mx-auto scroll-mt-16 overflow-x-clip"
      aria-label="About Learning Room"
    >
      {/* Ambient Pastel Aura Glow in Top-Right Background */}
      <div
        className="absolute top-4 right-10 w-[460px] h-[460px] bg-gradient-to-br from-purple-300/25 via-pink-200/20 to-amber-200/25 dark:from-purple-900/15 dark:via-pink-900/10 dark:to-amber-900/10 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* ===================================================================
          1. HERO HEADER & COLLABORATION ILLUSTRATION
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16 sm:mb-20">
        
        {/* Left Column: Heading, Subhead, Description & CTA */}
        <div className="lg:col-span-6 relative">
          
          {/* Main Headline: "About Learning Room" */}
          <div className="relative inline-block mb-3.5">
            {/* 3-line radiating burst angled 45° anticlockwise directly above 'About' */}
            <span
              className="absolute -top-[18px] sm:-top-5 -left-[19px] sm:-left-[22px] -rotate-45 pointer-events-none select-none animate-float-slow"
              aria-hidden="true"
            >
              <img
                src={burstLines}
                alt=""
                className="w-7 h-5 sm:w-8 sm:h-6 object-contain dark:invert"
              />
            </span>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.12]">
              <span>About </span>
              <span className="font-editorial italic font-normal text-slate-900 dark:text-slate-100 pl-1.5 text-[1.12em] tracking-tight">
                Learning Room
              </span>
            </h1>
          </div>

          {/* Sub-headline on 2 balanced lines with cursive 'together.' and hand-drawn wavy purple underline */}
          <h2 className="font-heading text-lg sm:text-xl md:text-[22px] font-bold text-[var(--color-text-primary)] leading-snug mb-4 max-w-xl">
            <span>A space where curious minds come together</span>
            <br className="hidden sm:inline" />
            <span>to learn, share, and grow — </span>
            <span className="relative inline-block font-cursive font-bold text-2xl sm:text-3xl text-[#635BDB] dark:text-[#a5b4fc] italic ml-1">
              together.
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-2 text-[#635BDB]/80 dark:text-[#a5b4fc]/80 pointer-events-none"
                viewBox="0 0 100 8"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 5C25 2 50 6 98 4"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          {/* Paragraph Description */}
          <p className="text-sm sm:text-[15px] text-[var(--color-text-secondary)] leading-relaxed max-w-lg mb-7">
            We're building more than just a platform.
            <br className="hidden sm:inline" />
            We're creating a collaborative learning space for everyone — from students to dreamers, learners to creators.
          </p>

          {/* CTA Action & Whimsical Floating Handwritten Doodle */}
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="#our-mission-cards"
              onClick={handleScrollToMission}
              className="inline-flex items-center gap-2 rounded-full bg-[#39318F] hover:bg-[#4D44B5] text-white px-6 py-2.5 text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Our Mission</span>
              <span>→</span>
            </a>

            {/* Hand-drawn curved arrow & Handwritten Note: "Let's build a brighter learning future!" */}
            <div
              className="flex items-center gap-2 font-handwriting font-bold text-lg sm:text-xl text-[var(--color-text-primary)] select-none pointer-events-none"
              aria-hidden="true"
            >
              <svg className="w-9 h-7 text-[var(--color-text-primary)] -rotate-6" viewBox="0 0 36 24" fill="none">
                <path d="M 32 6 C 20 18, 12 18, 4 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M 10 7 L 4 12 L 10 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="leading-tight drop-shadow-2xs">
                Let's build<br />a brighter learning future!
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Free Collaboration Window Frame with Pastel Gradient */}
        <div className="lg:col-span-6 relative pt-10 pb-6 px-2 sm:px-4">
          
          {/* Ambient Warm Peach & Lavender Dreamy Aura Glow */}
          <div
            className="absolute -top-6 -right-6 w-[520px] h-[460px] bg-gradient-to-br from-orange-200/50 via-pink-200/40 to-purple-300/45 dark:from-orange-950/20 dark:via-pink-950/20 dark:to-purple-900/30 rounded-full blur-3xl pointer-events-none -z-10"
            aria-hidden="true"
          />

          {/* Top-Right Floating Doodles: "Learn. Collaborate. Grow." & Curved Arrow */}
          <div
            className="flex flex-col absolute -top-8 sm:-top-10 right-3 sm:right-6 items-center z-30 text-center font-handwriting font-bold text-base sm:text-xl text-[var(--color-text-primary)] select-none pointer-events-none animate-float-medium"
            aria-hidden="true"
          >
            <div className="rotate-2 leading-tight drop-shadow-2xs">
              <span>Learn.</span>
              <br />
              <span>Collaborate.</span>
              <br />
              <span>Grow.</span>
            </div>
            <svg className="w-6 h-8 sm:w-7 sm:h-9 text-[var(--color-text-primary)] translate-x-1 mt-0.5" viewBox="0 0 30 38" fill="none">
              <path d="M 22 2 C 14 14, 12 24, 6 34" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 14 26 L 5 34 L 5 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Sparkles on top and side */}
          <span className="block absolute -top-1 left-1/4 text-lg text-[#635BDB] font-bold animate-float-slow pointer-events-none z-20">
            ✦
          </span>
          <span className="block absolute top-1/4 -left-3 sm:-left-5 text-sm text-slate-700 dark:text-slate-300 font-bold animate-float-gentle pointer-events-none z-20">
            ✦
            <span className="text-[10px] ml-0.5 text-slate-500">✦</span>
          </span>
          <span className="block absolute -right-2 top-1/3 text-xs text-slate-500 pointer-events-none z-20">
            ☆
          </span>

          {/* Window Container with Soft Outline Border, Pastel Gradient, and UNCLIPPED elements */}
          <div className="relative w-full rounded-2xl border border-slate-400/60 dark:border-slate-600 bg-gradient-to-br from-[#FFEBDC]/85 via-[#FFF0E8]/75 to-[#F0E6FF]/85 dark:from-[#2a1d24]/60 dark:via-[#1e1a29]/60 dark:to-[#17182e]/60 shadow-xs">
            
            {/* Top-Right macOS window control dots */}
            <div className="absolute top-3.5 right-4 z-20 flex items-center gap-1.5 pointer-events-none">
              <span className="w-2.5 h-2.5 rounded-full border border-slate-500/80 dark:border-slate-400 bg-transparent" />
              <span className="w-2.5 h-2.5 rounded-full border border-slate-500/80 dark:border-slate-400 bg-transparent" />
              <span className="w-2.5 h-2.5 rounded-full border border-slate-500/80 dark:border-slate-400 bg-transparent" />
            </div>

            {/* Illustration of Students Collaborating: Flush to the bottom of the window */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] flex items-end justify-center rounded-2xl overflow-hidden">
              <img
                src={aboutUsCollab}
                alt="Students collaborating around a laptop"
                className="w-full h-auto max-h-full object-contain object-bottom group-hover:scale-102 transition-transform duration-300 drop-shadow-sm"
              />
            </div>

            {/* Top-Left Pinned Card: Illustrated Purple Graduation Cap 🎓 (Fully visible, not clipped) */}
            <div
              className="absolute -top-5 -left-4 sm:-top-6 sm:-left-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-300/90 dark:border-slate-700 shadow-md p-2.5 sm:p-3 -rotate-8 z-30 flex items-center justify-center animate-float-slow select-none pointer-events-none"
              aria-hidden="true"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-center shadow-2xs">
                {/* Vector Illustrated Graduation Cap */}
                <svg className="w-8 h-8 text-[#635BDB]" viewBox="0 0 40 40" fill="none">
                  <path d="M 20 6 L 36 14 L 20 22 L 4 14 Z" fill="#635BDB" />
                  <path d="M 10 18 L 10 26 C 10 30, 30 30, 30 26 L 30 18" fill="#4338CA" />
                  {/* Gold Tassel */}
                  <path d="M 20 14 L 33 17 L 34 26" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="34" cy="27" r="2" fill="#D97706" />
                </svg>
              </div>
            </div>

            {/* Bottom-Right Pinned Sticky Note: Sketched Radiant Lightbulb 💡 (Fully visible, not clipped) */}
            <div
              className="absolute -bottom-5 -right-3 sm:-bottom-6 sm:-right-4 bg-[#FEF3C7] dark:bg-[#713F12] text-amber-950 dark:text-amber-100 rounded-xl border border-[#FDE68A] dark:border-[#854D0E] shadow-md p-2.5 sm:p-3 rotate-6 z-30 flex flex-col items-center justify-center animate-float-gentle select-none pointer-events-none"
              aria-hidden="true"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white/80 dark:bg-amber-950/50 flex items-center justify-center shadow-2xs border border-amber-300/50">
                {/* Vector Sketched Lightbulb with Radiant Rays */}
                <svg className="w-7 h-7 text-amber-500" viewBox="0 0 32 32" fill="none">
                  <path d="M 16 6 C 11 6, 8 10, 8 14 C 8 18, 12 20, 12 23 L 20 23 C 20 20, 24 18, 24 14 C 24 10, 21 6, 16 6 Z" fill="#FDE047" stroke="#18181B" strokeWidth="1.8" />
                  <line x1="13" y1="25" x2="19" y2="25" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="14" y1="27" x2="18" y2="27" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 14 15 L 16 12 L 18 15" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="16" y1="2" x2="16" y2="4" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="8" y2="8" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="26" y1="6" x2="24" y2="8" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ===================================================================
          2. THREE PASTEL CARDS ROW (Mission, Vision, Values)
          =================================================================== */}
      <div id="our-mission-cards" className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-20 sm:mb-24 scroll-mt-24">
        
        {/* CARD 1: Our Mission (Soft Warm Peach) */}
        <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF5ED] dark:bg-[#2A1D15] dark:border-[#7C2D12]/40 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          {/* Top-Right Doodled Arch */}
          <div className="absolute top-3.5 right-4 text-[var(--color-text-muted)] pointer-events-none" aria-hidden="true">
            <svg className="w-5 h-4" viewBox="0 0 24 20" fill="none">
              <path d="M 4 16 C 6 6, 18 6, 20 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-4">
            {/* Illustrated Rocket Launching Icon from LandingPage */}
            <div className="w-12 h-12 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <img
                src={rocketIcon}
                alt="Our Mission Rocket"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--color-text-primary)] mb-1">
                Our Mission
              </h3>
              <p className="text-xs sm:text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                To make learning more collaborative, accessible, and enjoyable for everyone.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: Our Vision (Soft Lavender) */}
        <div className="rounded-2xl border border-[#E9D5FF] bg-[#F6EEFD] dark:bg-[#26173B] dark:border-[#581C87]/40 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          {/* Top-Right Sparkle */}
          <div className="absolute top-3.5 right-4 text-[#635BDB] dark:text-[#a5b4fc] pointer-events-none" aria-hidden="true">
            <span className="text-sm">✦</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Illustrated Eye Icon from LandingPage */}
            <div className="w-12 h-12 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <img
                src={eyeIcon}
                alt="Our Vision Eye"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Title & Description with hand-drawn scribble under 'struggle.' */}
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--color-text-primary)] mb-1">
                Our Vision
              </h3>
              <p className="text-xs sm:text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                <span>A world where learning is a shared journey, not a solo </span>
                <span className="relative inline-block font-medium text-[var(--color-text-primary)]">
                  struggle.
                  <svg
                    className="absolute -bottom-1 left-0 w-full h-2 text-[#635BDB]/80 pointer-events-none"
                    viewBox="0 0 50 8"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 4 C 12 1, 26 6, 48 3"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4 6 C 14 3, 28 7, 44 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                  </svg>
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* CARD 3: Our Values (Soft Mint) */}
        <div className="rounded-2xl border border-[#BBF7D0] bg-[#EFFDF5] dark:bg-[#12281D] dark:border-[#14532D]/40 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          {/* Top-Right 3-line Tick Marks */}
          <div className="absolute top-3.5 right-4 text-[var(--color-text-muted)] pointer-events-none" aria-hidden="true">
            <svg className="w-4 h-3.5" viewBox="0 0 16 16" fill="none">
              <line x1="4" y1="12" x2="2" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="10" y1="12" x2="10" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="16" y1="12" x2="18" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-4">
            {/* Illustrated Heart Icon from LandingPage */}
            <div className="w-12 h-12 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <img
                src={heartIcon}
                alt="Our Values Heart"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--color-text-primary)] mb-1">
                Our Values
              </h3>
              <p className="text-xs sm:text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                Curiosity. Collaboration. Creativity. Always.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ===================================================================
          3. TEAM & IMPACT METRICS (Lower Showcase Section)
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* Left: Heading & Story (Cols 1 to 4) */}
        <div className="lg:col-span-4 relative">
          {/* Sparkles Doodle */}
          <div className="flex items-center gap-1 text-slate-500 mb-2 pointer-events-none" aria-hidden="true">
            <span className="text-base text-[#635BDB]">✦</span>
            <span className="text-[10px] -mt-1 text-amber-500">✦</span>
          </div>

          {/* Heading with cursive 'better' */}
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] leading-tight mb-3">
            <span>Built by a team that believes in </span>
            <span className="font-cursive font-bold text-3xl sm:text-4xl text-[#635BDB] dark:text-[#a5b4fc] italic">
              better
            </span>
            <br />
            <span>learning</span>
          </h2>

          <p className="text-xs sm:text-[13.5px] text-[var(--color-text-secondary)] leading-relaxed">
            We're a passionate team of developers, designers, and dreamers, on a mission to make learning more social, creative, and fun.
          </p>
        </div>

        {/* Center: Overlapping 5-Avatar Anime Cluster (Cols 5 to 7) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative py-4">
          
          {/* 3-line burst tick marks on top-left of cluster */}
          <div className="absolute top-0 left-4 sm:left-10 text-[var(--color-text-muted)] pointer-events-none" aria-hidden="true">
            <svg className="w-5 h-4 -rotate-12" viewBox="0 0 16 16" fill="none">
              <line x1="4" y1="12" x2="2" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="10" y1="12" x2="10" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="16" y1="12" x2="18" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          {/* Avatar Composition matching reference image */}
          <div className="relative w-72 h-64 flex items-center justify-center">
            <img
              src={aboutUsAvatars}
              alt="Team avatars"
              className="w-full h-full object-contain filter drop-shadow-md hover:scale-105 transition-transform duration-300"
            />
          </div>

        </div>

        {/* Right: Impact Metrics & Cursive Signoff (Cols 8 to 12) */}
        <div className="lg:col-span-4 flex flex-col justify-center">
          
          {/* Horizontal Stats Row with Subtle Vertical Dividers */}
          <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] py-3">
            
            {/* Stat 1: 100K+ */}
            <div className="flex flex-col items-center text-center px-2">
              <span className="font-heading font-black text-2xl sm:text-3xl text-[var(--color-text-primary)] tracking-tight">
                100K+
              </span>
              <span className="text-[11.5px] text-[var(--color-text-secondary)] font-medium mt-0.5">
                Active Learners
              </span>
              {/* Hand-drawn purple curve underline doodle */}
              <svg className="w-12 h-2 text-[#635BDB] mt-1 pointer-events-none" viewBox="0 0 50 6" fill="none">
                <path d="M2 4C15 2 30 5 48 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Stat 2: 50K+ */}
            <div className="flex flex-col items-center text-center px-2">
              <span className="font-heading font-black text-2xl sm:text-3xl text-[var(--color-text-primary)] tracking-tight">
                50K+
              </span>
              <span className="text-[11.5px] text-[var(--color-text-secondary)] font-medium mt-0.5">
                Rooms Created
              </span>
              {/* Hand-drawn gray scribble underline doodle */}
              <svg className="w-12 h-2 text-slate-400 mt-1 pointer-events-none" viewBox="0 0 50 6" fill="none">
                <path d="M2 3C15 5 30 2 48 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Stat 3: ∞ */}
            <div className="flex flex-col items-center text-center px-2">
              <span className="font-heading font-black text-2xl sm:text-3xl text-[var(--color-text-primary)] tracking-tight">
                ∞
              </span>
              <span className="text-[11.5px] text-[var(--color-text-secondary)] font-medium mt-0.5">
                Ideas Shared
              </span>
            </div>

          </div>

          {/* Bottom-Right Cursive Signoff & Arrow: "Together, we learn better." */}
          <div className="mt-8 flex items-center justify-end gap-3 font-cursive font-bold text-2xl sm:text-[28px] text-[var(--color-text-primary)] select-none pointer-events-none">
            <span className="drop-shadow-2xs relative inline-block">
              Together, we learn{' '}
              <span className="text-[#635BDB] dark:text-[#a5b4fc] italic">
                better.
              </span>
              {/* Purple hand-drawn brush underline spanning across */}
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-2.5 text-[#635BDB]/80 dark:text-[#a5b4fc]/80"
                viewBox="0 0 160 8"
                fill="none"
              >
                <path d="M2 5C45 2 110 6 158 3" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            </span>

            {/* Curved Arrow pointing up and to the right */}
            <svg className="w-9 h-8 text-[var(--color-text-primary)]" viewBox="0 0 36 30" fill="none">
              <path d="M 4 22 C 14 26, 24 24, 30 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 22 10 L 30 10 L 30 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

        </div>

      </div>

    </section>
  );
}
