import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Layout, CheckCircle2, ShieldAlert } from 'lucide-react';

/* 1. Animated Red Orbital Loader */
export function NexusOrbitalLoader({ size = 64, label = 'ANALYZING CONSTRAINTS...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="nexus-orbital-spinner" style={{ width: size, height: size }}>
        <div className="nexus-orbital-ring nexus-orbital-ring-1" />
        <div className="nexus-orbital-ring nexus-orbital-ring-2" />
        <div className="nexus-orbital-ring nexus-orbital-ring-3" />
        <div className="nexus-orbital-core" />
      </div>
      {label && (
        <span className="font-mono text-xs tracking-widest text-[#a1a1aa] uppercase animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}

/* 2. Document Radar Scanner HUD */
export function NexusRadarScanner({ label = 'SCANNING OPTICAL BOUNDING BOXES...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <div className="nexus-radar-grid">
        <div className="nexus-radar-sweep" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b2f] animate-ping" />
        </div>
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-red-500/20" />
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-red-500/20" />
      </div>
      <span className="font-mono text-[11px] text-[#ff5147] tracking-wider uppercase">
        {label}
      </span>
    </div>
  );
}

/* 3. Multi-Stage Verification Pipeline Loader */
export function NexusPipelineLoader({ activeStage = 1 }) {
  const stages = [
    { name: 'Perception Filter', icon: Eye, desc: 'OCR clarity & ambiguity scan' },
    { name: 'Spatial Layout', icon: Layout, desc: 'Bounding box alignment' },
    { name: 'Arithmetic Core', icon: CheckCircle2, desc: 'Subtotal + Tax == Total' }
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-3 p-4 rounded-xl bg-[#111113] border border-[rgba(255,255,255,0.08)]">
      {stages.map((stg, idx) => {
        const isDone = activeStage > idx + 1;
        const isCurrent = activeStage === idx + 1;
        const Icon = stg.icon;

        return (
          <div
            key={stg.name}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
              isCurrent
                ? 'bg-[#18181b] border-[#ff3b2f] shadow-[0_0_15px_rgba(255,59,47,0.2)]'
                : isDone
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-transparent border-transparent opacity-40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isCurrent
                    ? 'bg-[#ff3b2f] text-white animate-pulse'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-heading font-semibold text-white block">
                  {stg.name}
                </span>
                <span className="text-[10px] font-mono text-[#a1a1aa]">
                  {stg.desc}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono uppercase font-bold">
              {isDone ? (
                <span className="text-emerald-400">PASSED</span>
              ) : isCurrent ? (
                <span className="text-[#ff5147] animate-pulse">CHECKING...</span>
              ) : (
                <span className="text-zinc-600">QUEUED</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* 4. Skeleton Loader */
export function NexusSkeleton({ className = 'h-6 w-full' }) {
  return (
    <div
      className={`relative overflow-hidden bg-[#18181b] rounded-lg ${className}`}
    >
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
      />
    </div>
  );
}
