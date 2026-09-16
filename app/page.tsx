"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent-500/8 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-600/5 blur-[160px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
          AI-Powered 3D Generation
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="text-gradient">AI 3D</span>{" "}
          <span className="text-text-primary">Studio</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto mb-12 leading-relaxed">
          Describe your vision in natural language. Upload references. Generate
          stunning 3D models — all through conversation.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="group relative px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="relative z-10">Get Started</span>
            <div
              className={`absolute inset-0 rounded-xl bg-gradient-to-r from-brand-400 to-accent-500 opacity-0 transition-opacity duration-300 ${
                isHovered ? "opacity-100" : ""
              }`}
            />
          </Link>

          <Link
            href="/login"
            className="px-8 py-3.5 rounded-xl glass hover:bg-surface-700/60 text-text-primary font-medium transition-all duration-300 active:scale-[0.98]"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-16">
          {[
            "Text to 3D",
            "Image References",
            "GLB Export",
            "Real-time Preview",
            "Version History",
          ].map((feature) => (
            <span
              key={feature}
              className="px-3 py-1 rounded-lg bg-surface-800/40 border border-surface-700/30 text-sm text-text-tertiary"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
