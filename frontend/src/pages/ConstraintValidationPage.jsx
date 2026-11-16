import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Calculator,
  ShieldAlert,
  HelpCircle,
  Zap,
  TrendingDown
} from 'lucide-react';

export default function ConstraintValidationPage() {
  const { document, loading } = useOutletContext();

  if (loading || !document) return null;

  const validation = document.validation_data || {};
  const rules = validation.rules || [];
  const issues = validation.issues || [];
  const isValid = validation.is_valid !== false;
  const score = Math.round((validation.constraint_score || 0.95) * 100);

  const subtotal = Number(document.subtotal || 0);
  const tax = Number(document.tax_amount || 0);
  const expectedTotal = Number((subtotal + tax).toFixed(2));
  const actualTotal = Number(document.total_amount || 0);
  const discrepancy = Number(Math.abs(expectedTotal - actualTotal).toFixed(2));
  const hasMathMismatch = discrepancy >= 0.02;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-4 h-4 text-[#ff3b2f]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#ff3b2f] font-semibold">
              Dimension 3 &bull; Deterministic Mathematical & Logical Constraints
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-white">
            Constraint-Based Validation
          </h2>
          <p className="text-xs text-[#a1a1aa]">
            Ideate Phase Core: Mathematical laws cannot be bent by OCR hallucinations.
            Verifies Subtotal + Tax = Total, Line items, and Date Chronology.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#18181b] border border-[rgba(255,59,47,0.3)] text-right">
            <span className="text-[10px] font-mono uppercase text-[#a1a1aa] block">Constraint Score</span>
            <span className={`text-lg font-bold font-mono ${isValid ? 'text-emerald-400' : 'text-[#ff3b2f]'}`}>
              {score}%
            </span>
          </div>

          <Link
            to={`/risk-assessment/${document.id}`}
            className="btn-primary text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center gap-1.5"
          >
            <span>Proceed to Risk Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Visual Mathematical Equation Box */}
      <div className={`p-6 rounded-2xl border transition-all ${
        hasMathMismatch
          ? 'bg-[#18181b] border-[#ff3b2f]/50 shadow-[0_0_30px_rgba(255,59,47,0.2)]'
          : 'bg-[#18181b] border-emerald-500/30'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className={`w-5 h-5 ${hasMathMismatch ? 'text-[#ff3b2f]' : 'text-emerald-400'}`} />
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-white">
              Primary Financial Equation Verification
            </span>
          </div>

          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
            hasMathMismatch
              ? 'bg-[#ff3b2f]/15 text-[#ff5147] border-[#ff3b2f]/40'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
          }`}>
            {hasMathMismatch ? 'MATHEMATICAL DISCREPANCY DETECTED' : 'ARITHMETIC BALANCE VERIFIED'}
          </span>
        </div>

        {/* Dynamic Formula Display with Reactive Equation Hover Boxes */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 py-6 font-mono text-center">
          <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[#ff3b2f] hover:-translate-y-1.5 hover:shadow-[0_8px_20px_rgba(255,59,47,0.2)] transition-all duration-200 min-w-[125px] cursor-pointer group">
            <span className="text-[10px] text-[#a1a1aa] uppercase block group-hover:text-white transition-colors">Subtotal</span>
            <span className="text-xl font-bold text-white group-hover:text-[#ff3b2f] transition-colors">${subtotal.toFixed(2)}</span>
          </div>

          <span className="text-2xl font-bold text-[#ff3b2f] hover:scale-125 transition-transform cursor-default">+</span>

          <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[#ff3b2f] hover:-translate-y-1.5 hover:shadow-[0_8px_20px_rgba(255,59,47,0.2)] transition-all duration-200 min-w-[125px] cursor-pointer group">
            <span className="text-[10px] text-[#a1a1aa] uppercase block group-hover:text-white transition-colors">Tax Amount</span>
            <span className="text-xl font-bold text-white group-hover:text-[#ff3b2f] transition-colors">${tax.toFixed(2)}</span>
          </div>

          <span className="text-2xl font-bold text-white hover:scale-125 transition-transform cursor-default">=</span>

          <div className="p-3.5 rounded-xl bg-[#09090b] border border-[rgba(255,59,47,0.25)] hover:border-[#ff3b2f] hover:-translate-y-1.5 hover:shadow-[0_8px_20px_rgba(255,59,47,0.2)] transition-all duration-200 min-w-[135px] cursor-pointer group">
            <span className="text-[10px] text-[#ff5147] uppercase block group-hover:text-[#ff3b2f] transition-colors">Expected Total</span>
            <span className="text-xl font-bold text-[#ff3b2f] group-hover:scale-105 inline-block transition-transform">${expectedTotal.toFixed(2)}</span>
          </div>

          <span className={`text-2xl font-bold hover:scale-125 transition-transform cursor-default ${hasMathMismatch ? 'text-[#ff3b2f]' : 'text-emerald-400'}`}>
            {hasMathMismatch ? '≠' : '='}
          </span>

          <div className={`p-3.5 rounded-xl bg-[#09090b] min-w-[135px] border hover:-translate-y-1.5 transition-all duration-200 cursor-pointer group ${
            hasMathMismatch ? 'border-[#ff3b2f] shadow-[0_0_15px_rgba(255,59,47,0.3)] hover:shadow-[0_10px_25px_rgba(255,59,47,0.5)]' : 'border-emerald-500/40 hover:shadow-[0_10px_25px_rgba(16,185,129,0.3)]'
          }`}>
            <span className={`text-[10px] uppercase block ${hasMathMismatch ? 'text-[#ff5147]' : 'text-emerald-400'}`}>
              Extracted Total
            </span>
            <span className={`text-xl font-bold group-hover:scale-105 inline-block transition-transform ${hasMathMismatch ? 'text-[#ff3b2f]' : 'text-emerald-400'}`}>
              ${actualTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {hasMathMismatch && (
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-[#ff5147] gap-2">
            <div>
              <strong>Calculated Variance: </strong>
              <span>${discrepancy.toFixed(2)} discrepancy between expected and extracted sum.</span>
            </div>
            <Link
              to={`/human-review/${document.id}`}
              className="text-white hover:text-[#ff3b2f] underline font-bold"
            >
              Correct Total in Human Review &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Constraints Evaluation Rules Grid */}
      <div className="nexus-card p-0 overflow-hidden">
        <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <h3 className="text-sm font-bold font-heading text-white">
            Predefined Constraint Rule Specifications
          </h3>
          <span className="text-[11px] font-mono text-[#a1a1aa]">
            {validation.passed_rules || 0} / {validation.total_rules || 0} Rules Satisfied
          </span>
        </div>

        <div className="nexus-table-wrapper border-none rounded-none">
          <table className="nexus-table">
            <thead>
              <tr>
                <th>Rule ID & Name</th>
                <th>Validation Formula</th>
                <th>Expected Value</th>
                <th>Extracted Actual</th>
                <th>Discrepancy</th>
                <th>Verification Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const isPassed = rule.status === 'PASSED';
                return (
                  <tr key={rule.id}>
                    <td>
                      <span className="font-heading font-bold text-xs text-white block">
                        {rule.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#a1a1aa]">
                        {rule.id}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-zinc-300">
                      {rule.formula}
                    </td>
                    <td className="font-mono text-xs text-zinc-300">
                      {rule.expected}
                    </td>
                    <td className="font-mono text-xs font-bold text-white">
                      {rule.actual}
                    </td>
                    <td className="font-mono text-xs">
                      {rule.discrepancy !== 'None' && rule.discrepancy !== 'Negligible' ? (
                        <span className="text-[#ff5147] font-bold">{rule.discrepancy}</span>
                      ) : (
                        <span className="text-zinc-500">None</span>
                      )}
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isPassed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-[#ff3b2f]/15 text-[#ff5147] border-[#ff3b2f]/40 shadow-[0_0_10px_rgba(255,59,47,0.2)]'
                      }`}>
                        {isPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{rule.status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
