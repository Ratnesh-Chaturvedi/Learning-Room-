import React, { useState } from 'react';
import {
  footerBooks,
  footerPencil,
  pencilHolder,
  footerPlane,
} from '../../assets/LandingPage';
import { learningRoomLogo } from '../../assets';

/**
 * Footer Component
 * Faithful implementation of the provided footer design:
 * 1. Upper Newsletter:
 *    - Radiating 3-line burst doodle above 'Let's keep'
 *    - Headline: "Let's keep learning together." with editorial serif italic and purple wavy scribble underline
 *    - Subtitle description and curved loop arrow pointing to subscription box
 *    - Hand-drawn pill email input with mail icon and deep purple "Subscribe →" button
 *    - Cursive note: "Be a part of our journey!" with double purple underline
 *    - Pinned tilted sticky note: "Learn / Collaborate / Grow / :)" with sparkle star & sketch marks
 * 2. Middle Brand & Links:
 *    - Brand column with 4-point purple sparkle, "Learning Room.", subtext with cursive 'together.', and 5 social icons
 *    - Categorized links for Product, Company, and Resources separated by subtle vertical dividers
 *    - Decorative right illustration with handwritten cursive "Dream bigger. Learn together.",
 *      stacked books (footer-books.png), pencil holder (pencil-holder.png), and radiating ticks
 * 3. Bottom Signature Line:
 *    - footer-pencil.svg on the bottom-left drawing a continuous hand-drawn wavy pencil path across the page
 *    - Copyright notice: "© 2026 Learning Room. All rights reserved. ♡"
 *    - Hand-drawn paper airplane (footerPlane) with dashed looped flight trail on the bottom-right
 */
export default function Footer({ onStartRoom }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer
      id="footer"
      className="relative z-10 w-full overflow-x-clip bg-[var(--color-background)] pt-8 sm:pt-12 pb-12 transition-colors duration-200"
      aria-label="Footer"
    >
      {/* Distinct Organic Pastel Orbs matching reference design */}
      {/* 1. Left Apricot Wave Orb */}
      <div
        className="absolute top-16 -left-12 w-[340px] h-[180px] bg-gradient-to-r from-orange-200/35 via-amber-200/30 to-transparent dark:from-orange-950/20 dark:to-transparent rounded-[60%_40%_50%_50%/40%_50%_60%_40%] blur-2xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      {/* 2. Upper Lavender Cloud Orb around subscribe & sticky note */}
      <div
        className="absolute top-2 right-[20%] w-[440px] h-[300px] bg-gradient-to-br from-purple-200/35 via-violet-200/25 to-pink-200/20 dark:from-purple-950/25 dark:via-purple-900/15 dark:to-transparent rounded-[50%_50%_40%_60%/40%_60%_50%_50%] blur-2xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      {/* 3. Warm Peach Bean Orb peaking behind sticky note */}
      <div
        className="absolute top-4 right-4 sm:right-10 w-[240px] h-[200px] bg-gradient-to-br from-orange-200/45 via-amber-200/40 to-pink-200/25 dark:from-orange-950/25 dark:to-transparent rounded-[40%_60%_60%_40%/50%_40%_60%_50%] blur-xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      {/* 4. Bottom-Right Soft Apricot/Rose Dome Orb */}
      <div
        className="absolute bottom-0 right-0 w-[420px] h-[260px] bg-gradient-to-tl from-orange-200/35 via-pink-200/25 to-transparent dark:from-orange-950/20 dark:to-transparent rounded-[70%_30%_20%_80%/60%_70%_30%_40%] blur-2xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ===================================================================
            1. UPPER SECTION: NEWSLETTER & PINNED STICKY NOTE
            =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center mb-16 sm:mb-20">
          
          {/* Left Column: Headline, Subtitle & Curved Arrow */}
          <div className="lg:col-span-5 relative">
            
            {/* 3-line radiating burst angled 45° anticlockwise above 'Let's keep' */}
            <span
              className="absolute -top-7 sm:-top-8 -left-2 sm:-left-3 -rotate-45 text-[var(--color-text-primary)] pointer-events-none select-none animate-float-slow"
              aria-hidden="true"
            >
              <svg className="w-7 h-5 sm:w-8 sm:h-6" viewBox="0 0 32 24" fill="none">
                <line x1="8" y1="20" x2="4" y2="4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="16" y1="22" x2="16" y2="2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="24" y1="20" x2="28" y2="4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>

            {/* Headline */}
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.15] mb-3">
              <span>Let's keep </span>
              <br className="hidden sm:inline" />
              <span className="font-editorial italic font-normal text-slate-900 dark:text-slate-100 text-[1.12em] tracking-tight relative inline-block">
                learning together.
                {/* Purple wavy underline under 'learning together.' */}
                <svg
                  className="absolute -bottom-1 left-0 w-full h-2.5 text-[#635BDB] pointer-events-none"
                  viewBox="0 0 160 8"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 5 C 30 2, 60 7, 95 3 C 120 1, 140 6, 158 3"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            {/* Subtitle Description */}
            <p className="text-xs sm:text-[13.5px] text-[var(--color-text-secondary)] leading-relaxed max-w-sm mb-2">
              Get the latest updates, new features, and learning tips
              <br className="hidden sm:inline" />
              straight to your inbox.
            </p>

            {/* Curved Loop Arrow pointing from under subtitle toward newsletter input */}
            <div className="hidden sm:block absolute -bottom-8 right-8 text-[var(--color-text-primary)] pointer-events-none select-none">
              <svg className="w-10 h-9 -rotate-6" viewBox="0 0 40 36" fill="none">
                <path d="M 4 8 C 18 4, 32 10, 26 24 C 22 32, 12 28, 10 20 C 8 12, 20 8, 36 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M 28 10 L 36 14 L 32 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

          </div>

          {/* Center Column: Hand-drawn Pill Newsletter Form & Cursive Note */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            
            <form onSubmit={handleSubscribe} className="w-full max-w-md relative">
              {/* Hand-drawn outline box */}
              <div className="flex items-center rounded-2xl border border-slate-700/80 dark:border-slate-400 bg-white dark:bg-slate-900 py-1.5 pl-3.5 pr-1.5 shadow-xs focus-within:ring-2 focus-within:ring-[#4338CA]/20 transition-all">
                <svg
                  className="w-5 h-5 text-slate-700 dark:text-slate-300 mr-2.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M22 7L12 13L2 7" />
                </svg>
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-[13px] text-[var(--color-text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none pr-2"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white px-5 py-2.5 text-xs sm:text-[13px] font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] shrink-0 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <span>→</span>
                </button>
              </div>

              {/* Success Notification message */}
              {subscribed && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold px-3 py-1 rounded-full shadow-xs animate-bounce">
                  Thanks for subscribing! 🎉
                </div>
              )}

              {/* Handwritten cursive note below input: "Be a part of our journey!" */}
              <div className="mt-3 text-center font-handwriting font-bold text-lg sm:text-xl text-[var(--color-text-primary)] select-none">
                <span>Be a part of </span>
                <span className="relative inline-block">
                  our journey!
                  <svg
                    className="absolute -bottom-1 left-0 w-full h-2 text-[#635BDB] pointer-events-none"
                    viewBox="0 0 90 6"
                    fill="none"
                  >
                    <path d="M2 4 C 24 1, 56 6, 88 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M6 5 C 26 3, 58 5, 82 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
                  </svg>
                </span>
              </div>
            </form>

          </div>

          {/* Right Column: Pinned Sticky Note ("Learn / Collaborate / Grow / :)") */}
          <div className="lg:col-span-3 flex justify-center lg:justify-end relative">
            
            {/* Sketch marks on left of sticky note: '//' */}
            <div className="absolute -top-1 left-4 sm:left-12 lg:left-8 text-slate-800 dark:text-slate-200 pointer-events-none select-none">
              <svg className="w-5 h-6" viewBox="0 0 20 24" fill="none">
                <line x1="8" y1="2" x2="3" y2="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="16" y1="4" x2="11" y2="20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Sparkle star on top-right: '☆' */}
            <div className="absolute -top-5 right-6 sm:right-12 text-slate-800 dark:text-slate-200 pointer-events-none select-none">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>

            {/* Tilted Sticky Note with Paper Texture & Drop Shadow */}
            <div className="relative w-48 sm:w-52 bg-[#FFFDF7] dark:bg-[#1f201d] rounded-xl border border-slate-300 dark:border-slate-700 shadow-md p-4 rotate-6 group hover:rotate-3 transition-transform duration-300 select-none">
              
              {/* Pinned staple / push-pin hole at top-left */}
              <div className="absolute top-2 left-2 flex items-center gap-1 opacity-70">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 shadow-inner" />
                <span className="w-2.5 h-0.5 bg-slate-400 dark:bg-slate-600 rounded-full" />
              </div>

              {/* Stacked Handwritten Message */}
              <div className="font-handwriting font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] leading-tight pt-2 pl-2">
                <div>Learn</div>
                <div className="pl-1">Collaborate</div>
                <div className="pl-2">Grow</div>
                {/* Smiley face */}
                <div className="text-right pr-2 text-2xl font-normal leading-none mt-1">
                  ☺
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ===================================================================
            2. MIDDLE SECTION: BRANDING, LINKS & DECORATIVE ILLUSTRATION
            =================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 pt-10 border-t border-slate-200/80 dark:border-slate-800 mb-14">
          
          {/* Column 1: Brand & Socials (Cols 1 to 4) */}
          <div className="lg:col-span-4 lg:pr-6 lg:border-r lg:border-slate-200/80 dark:lg:border-slate-800 relative">
            
            {/* 3-line radiating burst on top-left of star logo */}
            <div className="absolute -top-4 -left-2 text-[var(--color-text-primary)] pointer-events-none select-none">
              <svg className="w-6 h-5 -rotate-12" viewBox="0 0 24 20" fill="none">
                <line x1="6" y1="16" x2="3" y2="4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="12" y1="18" x2="12" y2="2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="18" y1="16" x2="21" y2="4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Logo Brand: Learning Room Logo + 'Learning Room.' */}
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src={learningRoomLogo}
                alt="Learning Room Logo"
                className="w-7 h-7 object-contain shrink-0 drop-shadow-2xs"
              />
              <span className="font-heading font-extrabold text-xl text-[var(--color-text-primary)] tracking-tight">
                Learning Room.
              </span>
            </div>

            {/* Mission Subtext */}
            <p className="text-xs sm:text-[13px] text-[var(--color-text-secondary)] leading-relaxed max-w-xs mb-6">
              A space where curious minds come together to learn, share, and grow —{' '}
              <span className="font-cursive italic font-bold text-[#635BDB] dark:text-[#a5b4fc] text-base relative inline-block">
                together.
                {/* Purple wavy underline */}
                <svg
                  className="absolute -bottom-1 left-0 w-full h-1.5 text-[#635BDB]/80"
                  viewBox="0 0 60 5"
                  fill="none"
                >
                  <path d="M1 3C15 1 35 4 58 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </p>

            {/* Social Icons Row (5 Circular Buttons: Logo color = Create Room in light, white in dark) */}
            <div className="flex items-center gap-2.5">
              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:border-slate-700/80 text-[#39318F] dark:text-white flex items-center justify-center hover:scale-110 transition-all duration-150 shadow-2xs"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:border-slate-700/80 text-[#39318F] dark:text-white flex items-center justify-center hover:scale-110 transition-all duration-150 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:border-slate-700/80 text-[#39318F] dark:text-white flex items-center justify-center hover:scale-110 transition-all duration-150 shadow-2xs"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Discord */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:border-slate-700/80 text-[#39318F] dark:text-white flex items-center justify-center hover:scale-110 transition-all duration-150 shadow-2xs"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:border-slate-700/80 text-[#39318F] dark:text-white flex items-center justify-center hover:scale-110 transition-all duration-150 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>

          </div>

          {/* Column 2: Product (Cols 5 to 6) */}
          <div className="lg:col-span-2 lg:px-4 lg:border-r lg:border-slate-200/80 dark:lg:border-slate-800">
            <h3 className="font-heading font-bold text-sm text-[var(--color-text-primary)] mb-3">
              Product
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-[var(--color-text-secondary)]">
              <li>
                <a href="#features" className="hover:text-[var(--color-brand)] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#explore" className="hover:text-[var(--color-brand)] transition-colors">
                  Explore
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onStartRoom}
                  className="hover:text-[var(--color-brand)] transition-colors cursor-pointer text-left"
                >
                  Create Room
                </button>
              </li>
              <li>
                <a href="#integrations" className="hover:text-[var(--color-brand)] transition-colors">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[var(--color-brand)] transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company (Cols 7 to 8) */}
          <div className="lg:col-span-2 lg:px-4 lg:border-r lg:border-slate-200/80 dark:lg:border-slate-800">
            <h3 className="font-heading font-bold text-sm text-[var(--color-text-primary)] mb-3">
              Company
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-[var(--color-text-secondary)]">
              <li>
                <a href="#about" className="hover:text-[var(--color-brand)] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#our-mission-cards" className="hover:text-[var(--color-brand)] transition-colors">
                  Our Mission
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-[var(--color-brand)] transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-[var(--color-brand)] transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[var(--color-brand)] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources (Cols 9 to 10) */}
          <div className="lg:col-span-2 lg:px-4 lg:border-r lg:border-slate-200/80 dark:lg:border-slate-800">
            <h3 className="font-heading font-bold text-sm text-[var(--color-text-primary)] mb-3">
              Resources
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-[var(--color-text-secondary)]">
              <li>
                <a href="#help" className="hover:text-[var(--color-brand)] transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#guides" className="hover:text-[var(--color-brand)] transition-colors">
                  Guides
                </a>
              </li>
              <li>
                <a href="#tutorials" className="hover:text-[var(--color-brand)] transition-colors">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-[var(--color-brand)] transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-[var(--color-brand)] transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Right Decorative Area with Books & Pen Holder (Cols 11 to 12) */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-end relative pt-2">
            
            {/* Sparkle star ☆ top right */}
            <div className="absolute top-0 right-2 text-slate-700 dark:text-slate-300 pointer-events-none select-none">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>

            {/* Handwritten cursive note: "Dream bigger. Learn together." with floating animation */}
            <div className="font-handwriting font-bold text-lg sm:text-xl md:text-2xl text-[var(--color-text-primary)] -rotate-3 text-right leading-tight mb-3.5 select-none animate-float-slow">
              <span>Dream bigger.</span>
              <br />
              <span className="relative inline-block">
                Learn together.
                <svg className="absolute -bottom-1 left-0 w-full h-2 text-slate-700 dark:text-slate-300" viewBox="0 0 80 5" fill="none">
                  <path d="M2 3C25 1 55 4 78 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </div>

            {/* Illustrated Books & Pencil Holder Scene (Reduced Books, Enlarged Overlapping Cup) */}
            <div className="relative flex items-end select-none">
              {/* Soft peach puddle ground beneath books & cup matching reference */}
              <div
                className="absolute -bottom-1 -left-3 -right-2 h-7 bg-gradient-to-r from-amber-200/45 via-orange-200/40 to-amber-100/35 dark:from-amber-950/25 dark:via-orange-950/20 dark:to-transparent rounded-full blur-sm -z-10 pointer-events-none"
                aria-hidden="true"
              />

              {/* Stacked Books (reduced size) */}
              <div className="shrink-0 hover:scale-105 transition-transform duration-200">
                <img
                  src={footerBooks}
                  alt="Stacked books"
                  className="w-16 sm:w-18 md:w-20 h-auto object-contain block"
                />
              </div>

              {/* Pencil Holder Cup with radiating marks (enlarged size, overlapping in front) */}
              <div className="relative z-10 shrink-0 -ml-3 sm:-ml-4 hover:scale-105 transition-transform duration-200">
                <img
                  src={pencilHolder}
                  alt="Pencil holder cup"
                  className="w-14 sm:w-16 md:w-18 h-auto object-contain block"
                />
                {/* Radiating 3-tick marks on the right side of the cup */}
                <div className="absolute top-1 -right-3 text-slate-700 dark:text-slate-300 pointer-events-none">
                  <svg className="w-3.5 h-4" viewBox="0 0 16 16" fill="none">
                    <line x1="2" y1="4" x2="10" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="2" y1="12" x2="10" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ===================================================================
            3. BOTTOM SECTION: PENCIL DRAWING WAVY LINE, COPYRIGHT & AIRPLANE
            =================================================================== */}
        <div className="relative w-full pt-8 pb-4">
          
          {/* Continuous Drawing Scene: Pencil -> Line starting directly at nib -> Plane */}
          <div className="w-full flex items-end relative">
            
            {/* Left Purple Pencil (footerPencil) */}
            <div className="relative shrink-0 select-none pointer-events-none pl-0 sm:pl-2">
              <img
                src={footerPencil}
                alt="Hand-drawn purple pencil"
                className="w-28 sm:w-36 md:w-44 h-auto object-contain filter drop-shadow-xs"
              />
              {/* Motion sketch marks '//' right above the pencil nib */}
              <div className="absolute right-0 top-1/2 -translate-y-2 text-slate-700 dark:text-slate-300">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 18 18" fill="none">
                  <line x1="3" y1="15" x2="8" y2="3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="9" y1="17" x2="14" y2="5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Continuous Hand-Drawn Wavy Line - starts from x=0 (the exact pencil nib!) */}
            <div className="flex-1 h-14 -ml-0.5 sm:-ml-1 relative pointer-events-none -z-10 text-slate-700/80 dark:text-slate-300/80">
              <svg className="w-full h-full" viewBox="0 0 1000 48" fill="none" preserveAspectRatio="none">
                <path
                  d="M 0 40 C 150 48, 320 8, 500 8 C 680 8, 850 44, 1000 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Right Paper Airplane using footerPlane asset - inverted in dark mode for light appearance */}
            <div className="relative shrink-0 select-none pointer-events-none pr-1 sm:pr-4 -ml-4 sm:-ml-8 -mt-2">
              <img
                src={footerPlane}
                alt="Paper airplane with flight loop"
                className="w-16 sm:w-20 md:w-24 h-auto object-contain filter drop-shadow-xs dark:invert dark:brightness-110 transition-all duration-200"
              />
            </div>

          </div>

          {/* Center Copyright Label - sits cleanly beneath the wave arch */}
          <div className="w-full pt-3 flex items-center justify-center gap-1.5 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 font-medium tracking-tight select-none">
            <span>© 2026 Learning Room. All rights reserved.</span>
            <span className="text-[#635BDB] dark:text-[#a5b4fc] text-sm">♡</span>
          </div>

        </div>

      </div>

    </footer>
  );
}
