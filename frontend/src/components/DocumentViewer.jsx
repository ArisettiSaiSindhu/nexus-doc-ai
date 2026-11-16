import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Crosshair, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DocumentViewer({ document, activeHighlight = null, onSelectField = null }) {
  const [zoom, setZoom] = useState(1);
  const [showBoxes, setShowBoxes] = useState(true);
  const [hoveredField, setHoveredField] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // Find the bounding box corresponding to the selected field
const normalizeField = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
const selectedBox = document?.layout_data?.bounding_boxes?.find(
  (box) =>
    normalizeField(box.field || box.field_name || box.label) ===
    normalizeField(activeHighlight)
);

useEffect(() => {
  if (selectedBox?.page) {
    setCurrentPage(Number(selectedBox.page));
  }
}, [activeHighlight, selectedBox?.page]);

  if (!document) return null;

  const vendor = document.vendor_name || 'Vendor Corporation';
  const gstin = document.gstin || '27AABCA1234F1Z5';
  const invNumber = document.invoice_number || 'INV-0000';
  const invDate = document.invoice_date || '2026-03-10';
  const dueDate = document.due_date || '2026-04-10';
  const subtotal = Number(document.subtotal || 0).toFixed(2);
  const tax = Number(document.tax_amount || 0).toFixed(2);
  const total = Number(document.total_amount || 0).toFixed(2);
  const items = document.items_data || [];
  const pageCount = document.page_count || 1;
  const previewUrl = document.preview_url;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.7));
  const handleResetZoom = () => setZoom(1);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, pageCount));

  // Field box styling helper: clean, consistent, unobtrusive
  const getFieldBoxStyle = (fieldName) => {
    const isTarget = activeHighlight === fieldName;
    const isHovered = hoveredField === fieldName;
    const hasDefect = fieldName === 'total_amount' || fieldName === 'subtotal';
    
    if (isTarget) {
      return 'border-2 border-[#ff3b2f] bg-red-500/15 shadow-[0_0_12px_rgba(255,59,47,0.35)] ring-2 ring-red-400/30 rounded-md scale-[1.01]';
    }
    if (isHovered) {
      return 'border border-[#ff3b2f] bg-red-500/10 shadow-sm rounded-md scale-[1.005]';
    }
    if (hasDefect && showBoxes) {
      return 'border border-dashed border-red-500/70 bg-red-500/5 rounded-md';
    }
    return showBoxes
      ? 'border border-[var(--border-subtle)] hover:border-[#ff3b2f]/60 hover:bg-red-500/5 rounded-md cursor-pointer transition-all'
      : 'border border-transparent hover:border-[var(--border-subtle)] rounded-md transition-all';
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden shadow-xl transition-all duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] gap-2">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-[#ff3b2f]" />
          <span className="text-xs font-heading font-semibold text-[var(--text-primary)] tracking-wide">
            SCAN INSPECTION CANVAS
          </span>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-card)] px-2 py-0.5 rounded border border-[var(--border-subtle)] max-w-[140px] truncate">
            {document.filename || 'invoice.pdf'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Multi-Page Navigation Controls if > 1 page */}
          {pageCount > 1 && (
            <div className="flex items-center bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] p-0.5 text-xs font-mono">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 text-[var(--text-secondary)] hover:text-[#ff3b2f] disabled:opacity-40 disabled:hover:text-[var(--text-secondary)] cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[10px] font-bold text-[var(--text-primary)]">
                {currentPage} / {pageCount}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= pageCount}
                className="p-1 text-[var(--text-secondary)] hover:text-[#ff3b2f] disabled:opacity-40 disabled:hover:text-[var(--text-secondary)] cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Layer toggles */}
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              showBoxes
                ? 'bg-[#ff3b2f]/15 text-[#ff3b2f] border border-[#ff3b2f]/40 shadow-sm'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>BBoxes {showBoxes ? 'ON' : 'OFF'}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[#ff3b2f] rounded transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-2 text-[var(--text-secondary)] font-semibold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[#ff3b2f] rounded transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[#ff3b2f] rounded transition-all border-l border-[var(--border-subtle)] pl-2 cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start bg-[var(--bg-secondary)] relative min-h-[580px]">
        {previewUrl ? (
          /* Rendered Real Image from OCR / PyMuPDF */
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            className="relative shadow-2xl rounded-lg overflow-hidden border border-[var(--border-subtle)] transition-transform duration-200"
          >
            <img
              src={pageCount > 1 ? `/api/preview/${document.id}?page=${currentPage - 1}` : previewUrl}
              alt={`Uploaded Invoice Scan Page ${currentPage}`}
              className="max-w-[580px] w-full h-auto block select-none pointer-events-none"
            />
            {/* SVG Bounding Boxes Overlay */}
            {showBoxes && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {document.layout_data?.bounding_boxes
                  ?.filter((b) => !b.page || Number(b.page) === currentPage)
                  ?.map((b, index) => {
                    const [x0, y0, x1, y1] = b.bbox || [0, 0, 0, 0];
                    const boxField = b.field || b.field_name || b.label;
                    const isTarget =
                    Boolean(activeHighlight) &&
                    normalizeField(activeHighlight) === normalizeField(boxField);
                    return (
                      <rect
                        key={`${b.id || b.field || 'bbox'}-${b.page || currentPage}-${index}`}
                        x={`${x0}%`}
                        y={`${y0}%`}
                        width={`${x1 - x0}%`}
                        height={`${y1 - y0}%`}
                        fill={isTarget ? 'rgba(255, 59, 47, 0.28)' : 'rgba(255, 59, 47, 0.08)'}
                        stroke={isTarget ? '#ff3b2f' : 'rgba(255, 59, 47, 0.6)'}
                        strokeWidth={isTarget ? "2.5" : "1.5"}
                        strokeDasharray={b.alignment_check === 'VALID' ? 'none' : '4,3'}
                        className="pointer-events-auto cursor-pointer transition-all"
                        onClick={() => onSelectField && onSelectField(b.field)}
                      />
                    );
                  })}
              </svg>
            )}
          </div>
        ) : (
          /* High-Resolution Document Inspection Sheet */
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            className="w-full max-w-[560px] min-h-[720px] bg-white text-[#111113] p-6 sm:p-8 rounded-xl shadow-lg relative transition-transform duration-200 select-none text-[12px] font-sans border border-gray-200 mx-auto"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-repeat opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

            {/* Header Row */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-5 mb-5">
              <div>
                <div
                  onClick={() => onSelectField && onSelectField('vendor_name')}
                  onMouseEnter={() => setHoveredField('vendor_name')}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`p-2 rounded-lg transition-all duration-200 ${getFieldBoxStyle('vendor_name')}`}
                >
                  <h1 className="text-xl font-bold tracking-tight text-gray-950 font-heading">{vendor}</h1>
                  <p className="text-gray-500 text-[11px] mt-0.5">Enterprise Infrastructure Division</p>
                  <p className="text-gray-500 text-[10px] font-mono font-medium">GSTIN: {gstin}</p>
                </div>
              </div>

              <div className="text-right space-y-1.5">
                <div
                  onClick={() => onSelectField && onSelectField('invoice_number')}
                  onMouseEnter={() => setHoveredField('invoice_number')}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`p-2 rounded-lg transition-all duration-200 ${getFieldBoxStyle('invoice_number')}`}
                >
                  <span className="text-[10px] uppercase font-mono text-gray-400 font-bold block">Invoice No.</span>
                  <span className="text-sm font-mono font-bold text-gray-900">{invNumber}</span>
                </div>

                <div
                  onClick={() => onSelectField && onSelectField('invoice_date')}
                  onMouseEnter={() => setHoveredField('invoice_date')}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`p-2 rounded-lg transition-all duration-200 ${getFieldBoxStyle('invoice_date')}`}
                >
                  <span className="text-[10px] text-gray-400 block font-mono">Invoice Date:</span>
                  <span className="font-mono text-gray-800 font-semibold">{invDate}</span>
                </div>

                <div
                  onClick={() => onSelectField && onSelectField('due_date')}
                  onMouseEnter={() => setHoveredField('due_date')}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`p-2 rounded-lg transition-all duration-200 ${getFieldBoxStyle('due_date')}`}
                >
                  <span className="text-[10px] text-gray-400 block font-mono">Due Date:</span>
                  <span className="font-mono text-gray-800 font-semibold">{dueDate}</span>
                </div>
              </div>
            </div>

            {/* Billing Recipient */}
            <div className="mb-5 p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Billed To:</span>
                <p className="font-semibold text-gray-900 text-xs">Aether Cloud Systems GmbH</p>
                <p className="text-gray-500 text-[11px]">880 Silicon Blvd, Suite 400</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Currency:</span>
                <p className="font-mono font-semibold text-gray-800">USD ($)</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-5">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 text-[10px] uppercase font-mono text-gray-500 text-left">
                    <th className="py-2">Item & Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[11px]">
                  {items && items.length > 0 ? (
                    items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-red-50/30 transition-all duration-150">
                        <td className="py-2 font-medium text-gray-900">{it.description}</td>
                        <td className="py-2 text-center font-mono text-gray-600">{it.quantity}</td>
                        <td className="py-2 text-right font-mono text-gray-600">${Number(it.unit_price).toFixed(2)}</td>
                        <td className="py-2 text-right font-mono font-bold text-gray-900">${Number(it.total).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-2 text-gray-800 font-medium">Standard Computing Services</td>
                      <td className="py-2 text-center font-mono">1</td>
                      <td className="py-2 text-right font-mono">${subtotal}</td>
                      <td className="py-2 text-right font-mono font-bold">${subtotal}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Block */}
            <div className="border-t border-gray-200 pt-3 flex justify-end">
              <div className="w-64 space-y-1.5">
                <div
                  onClick={() => onSelectField && onSelectField('subtotal')}
                  onMouseEnter={() => setHoveredField('subtotal')}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`flex justify-between items-center p-2 rounded-lg transition-all duration-200 ${getFieldBoxStyle('subtotal')}`}
                >
                  <span className="text-gray-500 font-medium">Subtotal:</span>
                  <span className="font-mono font-semibold text-gray-900">${subtotal}</span>
                </div>

                <div
                  onClick={() => onSelectField && onSelectField('tax_amount')}
                  onMouseEnter={() => setHoveredField('tax_amount')}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`flex justify-between items-center p-2 rounded-lg transition-all duration-200 ${getFieldBoxStyle('tax_amount')}`}
                >
                  <span className="text-gray-500 font-medium">Tax Amount (10%):</span>
                  <span className="font-mono font-semibold text-gray-900">${tax}</span>
                </div>

                <div
                  onClick={() => onSelectField && onSelectField('total_amount')}
                  onMouseEnter={() => setHoveredField('total_amount')}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`flex justify-between items-center p-2.5 rounded-lg bg-gray-50 border border-gray-200 transition-all duration-200 ${getFieldBoxStyle('total_amount')}`}
                >
                  <span className="text-xs font-bold font-heading text-gray-950 uppercase">Total Amount:</span>
                  <span className="text-sm font-mono font-extrabold text-[#ff3b2f]">${total}</span>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="absolute bottom-5 left-8 right-8 border-t border-gray-100 pt-3 text-[9px] text-gray-400 flex justify-between font-mono">
              <span>Remittance Wire: 021000021 &bull; IBAN: US6430000001</span>
              <span>Electronic Bill Generated by Nexus System</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
