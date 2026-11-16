import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

export default function RiskAssessmentPage() {
  const { document, loading } = useOutletContext();

  if (loading || !document) return null;

  const risk = document.risk_assessment || {};
  const breakdown = risk.dimension_breakdown || {};
  const flags = risk.flags_summary || {};
  const level = risk.risk_level || document.risk_level || 'LOW';

  const riskDescriptions = {
    CRITICAL: 'Immediate Human Action Required: Severe mathematical discrepancy or missing key financial fields. Ledger ingestion blocked.',
    HIGH: 'High Priority Review: Moderate discrepancy, date chronology violation, or significant OCR confusion on monetary fields.',
    MEDIUM: 'Standard Review: Minor optical ambiguity or minor table misalignment. Verification recommended.',
    LOW: 'Automated Eligible: All three dimensions (Perception, Layout, and Constraints) validated with high confidence.'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-[#ff3b2f]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#ff3b2f] font-semibold">
              Ideate Phase &bull; Reliability Matrix & Priority Assessment
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-white">
            Confidence & Risk Assessment
          </h2>
          <p className="text-xs text-[#a1a1aa]">
            Weighted synthesis of Perception, Layout, and Constraint validation to prioritize review resources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RiskBadge level={level} size="lg" />

          <Link
            to={`/human-review/${document.id}`}
            className="btn-primary text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center gap-1.5"
          >
            <span>Proceed to Human Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary Risk Classification Hero Card */}
      <div className={`p-6 rounded-2xl border ${
        level === 'CRITICAL'
          ? 'bg-[#18181b] border-[#ff3b2f]/50 shadow-[0_0_35px_rgba(255,59,47,0.25)]'
          : level === 'HIGH'
          ? 'bg-[#18181b] border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
          : 'bg-[#18181b] border-emerald-500/30'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block">
              Assigned Review Queue Priority
            </span>
            <h3 className="text-2xl font-bold font-heading text-white mt-1">
              {risk.review_priority?.replace(/_/g, ' ') || 'STANDARD REVIEW'}
            </h3>
            <p className="text-xs text-[#a1a1aa] mt-1 max-w-xl">
              {riskDescriptions[level] || riskDescriptions.LOW}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center min-w-[150px]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] block">Overall Confidence</span>
            <span className="text-3xl font-extrabold font-mono text-white">
              {Math.round((risk.overall_confidence || document.confidence_overall || 0.9) * 100)}%
            </span>
          </div>
        </div>

        {/* Flag counts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] block">Critical Errors</span>
            <span className="text-xl font-bold font-mono text-[#ff3b2f]">{flags.critical_errors || 0}</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] block">High Warnings</span>
            <span className="text-xl font-bold font-mono text-amber-400">{flags.high_warnings || 0}</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] block">Layout Anomalies</span>
            <span className="text-xl font-bold font-mono text-[#0ea5e9]">{flags.layout_anomalies || 0}</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] block">OCR Ambiguities</span>
            <span className="text-xl font-bold font-mono text-amber-400">{flags.ocr_ambiguities || 0}</span>
          </div>
        </div>
      </div>

      {/* 3-Dimensional Contribution Formula Breakdown */}
      <div className="nexus-card">
        <h3 className="text-base font-bold font-heading text-white mb-2">
          Multi-Factor Harmonic Weighting Breakdown
        </h3>
        <p className="text-xs text-[#a1a1aa] mb-6">
          Ideate Phase specification: Mathematical constraints are weighted at 50% because numeric
          errors directly corrupt general ledgers; Perception and Layout each carry 25%.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Constraints Pillar */}
          <div className="p-5 rounded-2xl bg-[#09090b] border border-[rgba(255,59,47,0.3)] hover:border-[#ff3b2f] hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_25px_rgba(255,59,47,0.25)] transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-heading text-white group-hover:text-[#ff3b2f] transition-colors">Constraints (Math)</span>
              <span className="text-[10px] font-mono text-[#ff3b2f] bg-[#ff3b2f]/10 px-2 py-0.5 rounded-full font-bold">50% Weight</span>
            </div>
            <p className="text-3xl font-bold font-mono text-white group-hover:text-[#ff3b2f] transition-colors mb-2">
              {Math.round((breakdown.constraints?.score || 0.95) * 100)}%
            </p>
            <div className="flex justify-between text-xs font-mono text-[#a1a1aa] pt-3 border-t border-[rgba(255,255,255,0.06)] group-hover:border-[rgba(255,59,47,0.2)]">
              <span>Contribution:</span>
              <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">+{Math.round((breakdown.constraints?.contribution || 0.475) * 100)} pts</span>
            </div>
          </div>

          {/* Perception Pillar */}
          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[#ff3b2f] hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(255,59,47,0.2)] transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-heading text-white group-hover:text-[#ff3b2f] transition-colors">Perception (Readability)</span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-full font-bold">25% Weight</span>
            </div>
            <p className="text-3xl font-bold font-mono text-white group-hover:text-[#ff3b2f] transition-colors mb-2">
              {Math.round((breakdown.perception?.score || 0.92) * 100)}%
            </p>
            <div className="flex justify-between text-xs font-mono text-[#a1a1aa] pt-3 border-t border-[rgba(255,255,255,0.06)] group-hover:border-[rgba(255,59,47,0.2)]">
              <span>Contribution:</span>
              <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">+{Math.round((breakdown.perception?.contribution || 0.23) * 100)} pts</span>
            </div>
          </div>

          {/* Layout Pillar */}
          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[#ff3b2f] hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(255,59,47,0.2)] transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-heading text-white group-hover:text-[#ff3b2f] transition-colors">Layout (Geometry)</span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-full font-bold">25% Weight</span>
            </div>
            <p className="text-3xl font-bold font-mono text-white group-hover:text-[#ff3b2f] transition-colors mb-2">
              {Math.round((breakdown.layout?.score || 0.88) * 100)}%
            </p>
            <div className="flex justify-between text-xs font-mono text-[#a1a1aa] pt-3 border-t border-[rgba(255,255,255,0.06)] group-hover:border-[rgba(255,59,47,0.2)]">
              <span>Contribution:</span>
              <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">+{Math.round((breakdown.layout?.contribution || 0.22) * 100)} pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
