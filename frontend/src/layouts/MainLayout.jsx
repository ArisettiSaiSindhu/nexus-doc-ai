import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Shield, Sparkles, Terminal } from 'lucide-react';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f5f5f5] bg-cinematic-main selection:bg-[#ff3b2f] selection:text-white">
      {/* Cinematic Vignette */}
      <div className="fixed inset-0 pointer-events-none bg-cinematic-vignette z-0"></div>

      {/* Main Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Futuristic Hollywood / Agency Footer */}
      <footer className="relative z-10 border-t border-[rgba(255,255,255,0.06)] bg-[#09090b]/90 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[rgba(255,59,47,0.3)] flex items-center justify-center text-[#ff3b2f] font-heading font-bold text-sm">
              N
            </div>
            <div>
              <p className="text-sm font-heading font-bold text-white tracking-wide">
                NEXUS DOC AI
              </p>
              <p className="text-xs text-[#a1a1aa]">
                Constraint-Aware Error Detection Architecture for Document Extraction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-[#a1a1aa]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Deterministic Math Engine
            </span>
            <span>&bull;</span>
            <span>Perception &bull; Layout &bull; Constraints</span>
            <span>&bull;</span>
            <span className="text-[#ff3b2f]">v1.0.0 Production Prototype</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
