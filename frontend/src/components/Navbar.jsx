import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, UploadCloud, LayoutDashboard, Sun, Moon, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Invoice', path: '/upload', icon: UploadCloud },
    { name: 'Verification Engine', path: '/workspace/DOC-ASTR-8841', icon: Cpu },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-glass-elevated)] backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[rgba(255,59,47,0.35)] shadow-[0_0_15px_rgba(255,59,47,0.2)] group-hover:border-[#ff3b2f] transition-all duration-300">
            <span className="text-xl font-bold font-heading text-[#ff3b2f]">N</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ff3b2f] animate-ping opacity-75"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ff3b2f]"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-lg tracking-wider text-[var(--text-primary)]">NEXUS</span>
              <span className="font-heading font-bold text-lg text-[#ff3b2f]">DOC AI</span>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-secondary)]">
              Constraint Verification
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <motion.div
                key={link.name}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  to={link.path}
                  className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 group ${
                    active
                      ? isLight
                        ? 'text-[#ff3b2f] bg-[rgba(255,59,47,0.06)] border border-[rgba(255,59,47,0.25)] shadow-sm'
                        : 'text-white bg-[#18181b] border border-[rgba(255,59,47,0.4)] shadow-[0_0_15px_rgba(255,59,47,0.2)]'
                      : isLight
                        ? 'text-slate-600 hover:text-[#ff3b2f] hover:bg-slate-100/80 hover:border hover:border-slate-200'
                        : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]/70 hover:border hover:border-[rgba(255,255,255,0.1)]'
                  }`}
                >
                  {Icon && (
                    <Icon className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${
                      active 
                        ? (isLight ? 'text-[#ff3b2f]' : 'text-[#ff3b2f]') 
                        : (isLight ? 'text-slate-500 group-hover:text-[#ff3b2f]' : 'text-[#a1a1aa] group-hover:text-[#ff3b2f]')
                    }`} />
                  )}
                  <span>{link.name}</span>
                  {active && (
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] ${
                      isLight ? 'bg-[#ff3b2f] shadow-[0_0_8px_rgba(255,59,47,0.5)]' : 'bg-[#ff3b2f] shadow-[0_0_8px_#ff3b2f]'
                    }`}></span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Right Status, Theme Toggle & Action */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-200 cursor-pointer shadow-sm group ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-[rgba(255,59,47,0.4)] hover:shadow-[0_0_12px_rgba(255,59,47,0.15)]'
                : 'bg-[#18181b] hover:bg-[#1f1f23] border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,59,47,0.4)] text-[#f5f5f5] hover:shadow-[0_0_12px_rgba(255,59,47,0.2)]'
            }`}
            title={`Switch to ${isLight ? 'Cinematic Dark' : 'Light'} Mode`}
          >
            {isLight ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-45 transition-transform duration-300" />
                <span className="font-semibold text-slate-800">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#ff3b2f] group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-semibold text-zinc-300">Dark</span>
              </>
            )}
          </motion.button>

          {/* Engine Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[var(--text-secondary)] font-medium">Models Active</span>
          </div>

          {/* Direct CTA */}
          <Link
            to="/workspace/DOC-ASTR-8841"
            className="btn-primary text-xs uppercase tracking-wider py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Process Invoice</span>
            <span className="sm:hidden">Engine</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
