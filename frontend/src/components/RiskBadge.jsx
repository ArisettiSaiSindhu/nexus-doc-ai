import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ level, showIcon = true, size = 'md' }) {
  const normLevel = (level || 'LOW').toUpperCase();

  const configs = {
    CRITICAL: {
      label: 'Critical Risk',
      color: 'bg-[#ff3b2f]/15 text-[#ff5147] border-[#ff3b2f]/40 shadow-[0_0_12px_rgba(255,59,47,0.35)]',
      icon: ShieldAlert,
      dotColor: 'bg-[#ff3b2f]'
    },
    HIGH: {
      label: 'High Risk',
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      icon: AlertTriangle,
      dotColor: 'bg-amber-400'
    },
    MEDIUM: {
      label: 'Medium Risk',
      color: 'bg-blue-500/15 text-blue-400 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.25)]',
      icon: AlertCircle,
      dotColor: 'bg-blue-400'
    },
    LOW: {
      label: 'Low Risk',
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      icon: ShieldCheck,
      dotColor: 'bg-emerald-400'
    }
  };

  const current = configs[normLevel] || configs.LOW;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-heading font-semibold uppercase tracking-wider border ${current.color} ${sizeClasses[size] || sizeClasses.md}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dotColor} animate-pulse`}></span>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{current.label}</span>
    </span>
  );
}
