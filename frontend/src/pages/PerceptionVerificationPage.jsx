import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Eye,
  Scan,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Sparkles
} from 'lucide-react';

export default function PerceptionVerificationPage() {
  const { document, loading } = useOutletContext();

  if (loading || !document) return null;

  const perception = document.perception_data || {};
  const global = perception.global_metrics || {};
  const fields = perception.fields || [];
  const uncertainties = perception.uncertainties || [];
  const score = Math.round((perception.perception_score || 0.9) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-[#ff3b2f]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#ff3b2f] font-semibold">
              Dimension 1 &bull; Optical Readability & Clarity
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-white">
            Perception-Based Checking
          </h2>
          <p className="text-xs text-[#a1a1aa]">
            Examines scan quality, contrast, blur, and identifies ambiguous OCR characters (8 vs B, 0 vs O).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#18181b] border border-[rgba(255,59,47,0.3)] text-right">
            <span className="text-[10px] font-mono uppercase text-[#a1a1aa] block">Perception Score</span>
            <span className="text-lg font-bold font-mono text-[#ff3b2f]">{score}%</span>
          </div>

          <Link
            to={`/layout/${document.id}`}
            className="btn-primary text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center gap-1.5"
          >
            <span>Proceed to Layout Check</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Global Image Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="nexus-card p-4">
          <span className="text-[11px] font-mono uppercase text-[#a1a1aa] block mb-1">Sharpness Index</span>
          <p className="text-xl font-bold font-mono text-white">{global.sharpness_score || 88.5}%</p>
          <span className="text-[10px] font-mono text-emerald-400 mt-1 block">Edge Clarity High</span>
        </div>

        <div className="nexus-card p-4">
          <span className="text-[11px] font-mono uppercase text-[#a1a1aa] block mb-1">Contrast Ratio</span>
          <p className="text-xl font-bold font-mono text-white">{global.contrast_ratio || 85.0}%</p>
          <span className="text-[10px] font-mono text-emerald-400 mt-1 block">Dynamic Range Good</span>
        </div>

        <div className="nexus-card p-4">
          <span className="text-[11px] font-mono uppercase text-[#a1a1aa] block mb-1">Optical DPI</span>
          <p className="text-xl font-bold font-mono text-white">{global.dpi || 300} DPI</p>
          <span className="text-[10px] font-mono text-[#a1a1aa] mt-1 block">Scan Resolution Standard</span>
        </div>

        <div className="nexus-card p-4">
          <span className="text-[11px] font-mono uppercase text-[#a1a1aa] block mb-1">Skew Angle</span>
          <p className="text-xl font-bold font-mono text-white">{global.skew_degrees || 0.4}&deg;</p>
          <span className="text-[10px] font-mono text-emerald-400 mt-1 block">Deskew Corrected</span>
        </div>
      </div>

      {/* Flagged Character Ambiguities Alert (Ideate Phase requirement) */}
      {uncertainties.length > 0 && (
        <div className="p-4 rounded-xl bg-[#ff3b2f]/10 border border-[#ff3b2f]/40 shadow-[0_0_20px_rgba(255,59,47,0.15)]">
          <div className="flex items-center gap-2 mb-2 text-[#ff5147] font-heading font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Character Ambiguity & Unclear Text Flagged ({uncertainties.length})</span>
          </div>
          <p className="text-xs text-zinc-300 mb-3">
            The Ideate Phase specifies flagging blurred characters or ambiguous glyphs (such as '8' confused with 'B' or '0' with 'O')
            where an automated OCR engine might falsely report high confidence.
          </p>

          <div className="space-y-2">
            {uncertainties.map((u, i) => (
              <div key={i} className="p-3 rounded-lg bg-[#09090b] border border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white font-mono">{u.label}: </span>
                  <span className="text-xs font-mono text-[#ff3b2f] bg-[#ff3b2f]/10 px-2 py-0.5 rounded font-bold">"{u.value}"</span>
                  <p className="text-[11px] text-[#a1a1aa] mt-1 font-mono">
                    {u.issues.join(' &bull; ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">
                    Confidence: {Math.round(u.confidence * 100)}%
                  </span>
                  <Link
                    to={`/human-review/${document.id}`}
                    className="text-[10px] font-mono text-[#ff3b2f] hover:underline"
                  >
                    Correct in Human Review &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed OCR Field Confidence Table */}
      <div className="nexus-card p-0 overflow-hidden">
        <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <h3 className="text-sm font-bold font-heading text-white">
            Field-by-Field OCR Reliability Breakdown
          </h3>
          <span className="text-[11px] font-mono text-[#a1a1aa]">Perception Verification Audit</span>
        </div>

        <div className="nexus-table-wrapper border-none rounded-none">
          <table className="nexus-table">
            <thead>
              <tr>
                <th>Document Field</th>
                <th>Extracted Value</th>
                <th>OCR Confidence</th>
                <th>Blur Level</th>
                <th>Noise Index</th>
                <th>Perception Status</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f, idx) => (
                <tr key={idx}>
                  <td className="font-heading font-semibold text-xs text-white">
                    {f.label}
                  </td>
                  <td className="font-mono text-xs font-bold text-zinc-200">
                    {f.value || 'N/A'}
                  </td>
                  <td className="w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#27272a] overflow-hidden">
                        <div
                          className={`h-full ${
                            f.confidence >= 0.95
                              ? 'bg-emerald-400'
                              : f.confidence >= 0.88
                              ? 'bg-amber-400'
                              : 'bg-[#ff3b2f]'
                          }`}
                          style={{ width: `${Math.round(f.confidence * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">
                        {Math.round(f.confidence * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-zinc-400">
                    {f.blur_level}
                  </td>
                  <td className="font-mono text-xs text-zinc-400">
                    {f.noise_level}
                  </td>
                  <td>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      f.status === 'EXCELLENT'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : f.status === 'ACCEPTABLE'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-[#ff3b2f]/15 text-[#ff5147] border-[#ff3b2f]/40'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
