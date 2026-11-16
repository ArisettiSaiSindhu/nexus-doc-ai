import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Layout,
  Grid,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  ArrowRight,
  Layers,
  Crosshair,
  Move
} from 'lucide-react';
import DocumentViewer from '../components/DocumentViewer';

export default function LayoutVerificationPage() {
  const { document, loading } = useOutletContext();
  const [selectedBox, setSelectedBox] = useState(null);

  if (loading || !document) return null;

  const layout = document.layout_data || {};
  const boxes = layout.bounding_boxes || [];
  const anomalies = layout.layout_anomalies || [];
  const table = layout.table_structure || {};
  const score = Math.round((layout.layout_score || 0.88) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layout className="w-4 h-4 text-[#ff3b2f]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#ff3b2f] font-semibold">
              Dimension 2 &bull; Spatial Geometry & Field Alignment
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-white">
            Layout-Based Checking
          </h2>
          <p className="text-xs text-[#a1a1aa]">
            Examines field positions, label-to-value geometric proximity, and prevents field confusion (Total vs Tax).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#18181b] border border-[rgba(255,59,47,0.3)] text-right">
            <span className="text-[10px] font-mono uppercase text-[#a1a1aa] block">Layout Score</span>
            <span className="text-lg font-bold font-mono text-[#ff3b2f]">{score}%</span>
          </div>

          <Link
            to={`/validation/${document.id}`}
            className="btn-primary text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center gap-1.5"
          >
            <span>Proceed to Constraint Check</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Flagged Layout Anomalies Banner */}
      {anomalies.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-2 mb-1 text-amber-400 font-heading font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Layout Anomalies Detected ({anomalies.length})</span>
          </div>
          <p className="text-xs text-zinc-300 mb-3">
            Ideate Phase Warning: The spatial arrangement indicates a potential field misidentification
            or table column coordinate baseline drift.
          </p>

          <div className="space-y-2">
            {anomalies.map((anom, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#09090b] border border-amber-500/30 text-xs font-mono text-zinc-200">
                <span className="text-[#ff5147] font-bold block mb-1">[{anom.code}]</span>
                <span>{anom.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Interactive Canvas + Bounding Box Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Canvas (7 Cols) */}
        <div className="lg:col-span-7 h-[600px]">
          <DocumentViewer
            document={document}
            activeHighlight={selectedBox}
            onSelectField={(f) => setSelectedBox(f)}
          />
        </div>

        {/* Bounding Box Coordinate Geometry Table (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="nexus-card p-4">
            <h3 className="text-sm font-bold font-heading text-white mb-1">
              Tabular Structure Integrity
            </h3>
            <p className="text-xs text-[#a1a1aa] mb-4">
              Columns detected: {table.columns_detected?.join(', ') || 'N/A'}
            </p>

            <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-lg bg-[#09090b] border border-[rgba(255,255,255,0.06)]">
              <span className="text-[#a1a1aa]">Grid Alignment:</span>
              <span className="font-bold text-emerald-400">{table.header_alignment || 'CONSISTENT'}</span>
            </div>
          </div>

          <div className="nexus-card p-0 overflow-hidden">
            <div className="p-3.5 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <span className="text-xs font-bold font-heading text-white">
                Extracted Bounding Box Coords
              </span>
              <span className="text-[10px] font-mono text-[#a1a1aa]">{boxes.length} Anchors</span>
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-[rgba(255,255,255,0.04)]">
              {boxes.map((box) => (
                <div
                  key={box.id}
                  onClick={() => setSelectedBox(box.field)}
                  className={`p-3 text-xs font-mono cursor-pointer transition-colors ${
                    selectedBox === box.field ? 'bg-[#ff3b2f]/10 border-l-2 border-[#ff3b2f]' : 'hover:bg-[#1f1f23]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{box.label}</span>
                    <span className="text-[10px] text-[#ff3b2f] bg-[#ff3b2f]/10 px-1.5 py-0.5 rounded">
                      {box.type}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#a1a1aa] flex justify-between">
                    <span>Coords: [{box.bbox?.join(', ')}]</span>
                    <span className="text-emerald-400 font-bold">{Math.round(box.confidence * 100)}%</span>
                  </div>

                  <p className="text-[10px] text-zinc-400 mt-1 italic">
                    {box.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
