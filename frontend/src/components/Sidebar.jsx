import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  Layers,
  FileSpreadsheet,
  Eye,
  LayoutGrid,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
  FileCheck,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ document }) {
  const { id } = useParams();
  const docId = id || document?.id || 'DOC-ASTR-8841';

  const navItems = [
    {
      name: 'AI Workspace Overview',
      path: `/workspace/${docId}`,
      icon: Layers,
      badge: 'Active'
    },
    {
      name: 'Extraction Results',
      path: `/results/${docId}`,
      icon: FileSpreadsheet,
      badge: 'Fields'
    },
    {
      name: '1. Perception Verification',
      path: `/perception/${docId}`,
      icon: Eye,
      badge: document?.perception_data ? `${Math.round((document.perception_data.perception_score || 0.9) * 100)}%` : '95%'
    },
    {
      name: '2. Layout Verification',
      path: `/layout/${docId}`,
      icon: LayoutGrid,
      badge: document?.layout_data?.layout_anomalies?.length ? `${document.layout_data.layout_anomalies.length} Flag` : 'Aligned'
    },
    {
      name: '3. Constraint Validation',
      path: `/validation/${docId}`,
      icon: CheckCircle2,
      badge: document?.validation_data?.is_valid === false ? 'Defect' : 'Passed',
      badgeColor: document?.validation_data?.is_valid === false ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
    },
    {
      name: 'Confidence & Risk',
      path: `/risk-assessment/${docId}`,
      icon: ShieldAlert,
      badge: document?.risk_level || 'High',
      badgeColor: document?.risk_level === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
    },
    {
      name: 'Human Verification',
      path: `/human-review/${docId}`,
      icon: UserCheck,
      badge: document?.human_verified ? 'Verified' : 'Pending',
      badgeColor: document?.human_verified ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
    },
    {
      name: 'Final Audit Report',
      path: `/report/${docId}`,
      icon: FileCheck,
      badge: 'PDF'
    }
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-xl transition-all duration-300">
      <div>
        <div className="px-3 py-2 mb-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] block">
              Verification Engine
            </span>
            <span className="text-xs font-heading font-semibold text-[var(--text-primary)]">
              Inspection Matrix
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#ff3b2f] animate-pulse"></span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-heading font-medium transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[#ff3b2f] shadow-sm translate-x-1'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:translate-x-1'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-[#ff3b2f]' : 'text-[var(--text-secondary)] group-hover:text-[#ff3b2f]'
                      }`} />
                      <span className="truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border border-[var(--border-subtle)] transition-all duration-200 group-hover:scale-105 ${
                          item.badgeColor || 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 transition-all duration-200 ${
                        isActive ? 'text-[#ff3b2f] translate-x-0.5' : 'text-transparent group-hover:text-[#ff3b2f] group-hover:translate-x-1'
                      }`} />
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Persistent Document Status Card neatly docked */}
      {document && (
        <div className="mt-5 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[#ff3b2f] transition-all duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">Active Ingestion</span>
            <span className="w-2 h-2 rounded-full bg-[#ff3b2f] animate-ping"></span>
          </div>
          <p className="text-xs font-bold text-[var(--text-primary)] font-mono truncate">{document.invoice_number || 'INV-000'}</p>
          <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">{document.vendor_name || 'Vendor'}</p>
          <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[var(--text-secondary)]">Confidence:</span>
            <span className="font-bold text-[var(--text-primary)]">{Math.round((document.confidence_overall || 0.9) * 100)}%</span>
          </div>
        </div>
      )}
    </aside>
  );
}
