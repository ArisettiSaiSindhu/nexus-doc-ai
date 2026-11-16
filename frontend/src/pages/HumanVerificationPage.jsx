import React, { useState } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Save,
  RotateCcw,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  DollarSign,
  Plus,
  Trash2,
  Calculator,
  XCircle
} from 'lucide-react';
import { submitHumanVerification } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function HumanVerificationPage() {
  const { document, reloadDoc, loading } = useOutletContext();
  const navigate = useNavigate();

  const [vendorName, setVendorName] = useState(document?.vendor_name || '');
  const [gstin, setGstin] = useState(document?.gstin || '');
  const [invoiceNumber, setInvoiceNumber] = useState(document?.invoice_number || '');
  const [invoiceDate, setInvoiceDate] = useState(document?.invoice_date || '');
  const [dueDate, setDueDate] = useState(document?.due_date || '');
  const [subtotal, setSubtotal] = useState(document?.subtotal || 0);
  const [taxAmount, setTaxAmount] = useState(document?.tax_amount || 0);
  const [totalAmount, setTotalAmount] = useState(document?.total_amount || 0);
  const [notes, setNotes] = useState(document?.human_notes || '');
  const [items, setItems] = useState(document?.items_data || []);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [actionType, setActionType] = useState('approved');

  // Sync state if document loads after initial render
  React.useEffect(() => {
    if (document) {
      setVendorName(document.vendor_name || '');
      setGstin(document.gstin || '');
      setInvoiceNumber(document.invoice_number || '');
      setInvoiceDate(document.invoice_date || '');
      setDueDate(document.due_date || '');
      setSubtotal(document.subtotal || 0);
      setTaxAmount(document.tax_amount || 0);
      setTotalAmount(document.total_amount || 0);
      setNotes(document.human_notes || '');
      setItems(document.items_data || []);
    }
  }, [document?.id]);

  if (loading || !document) return null;

  // Real-time recalculation check
  const numSub = parseFloat(subtotal) || 0;
  const numTax = parseFloat(taxAmount) || 0;
  const numTotal = parseFloat(totalAmount) || 0;
  const expectedTotal = Number((numSub + numTax).toFixed(2));
  const discrepancy = Number(Math.abs(expectedTotal - numTotal).toFixed(2));
  const isMathValid = discrepancy < 0.02;

  // Line item handlers
  const handleAddItem = () => {
    const newItem = {
      description: `Item #${items.length + 1}`,
      quantity: 1,
      unit_price: 0,
      total: 0,
      math_valid: true
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index, field, val) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    
    // Auto-update total when qty or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      const q = parseFloat(field === 'quantity' ? val : updated[index].quantity) || 0;
      const p = parseFloat(field === 'unit_price' ? val : updated[index].unit_price) || 0;
      updated[index].total = Number((q * p).toFixed(2));
      updated[index].math_valid = true;
    }
    setItems(updated);
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleRecalculateFromItems = () => {
    const itemsTotal = items.reduce((sum, it) => sum + (parseFloat(it.total) || 0), 0);
    const roundedSubtotal = Number(itemsTotal.toFixed(2));
    setSubtotal(roundedSubtotal);
    setTotalAmount(Number((roundedSubtotal + numTax).toFixed(2)));
  };

  const handleSubmit = async (e, approve = true) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setSaving(true);
      const targetStatus = approve ? 'approved' : 'rejected';
      setActionType(targetStatus);

      await submitHumanVerification(document.id, {
        vendor_name: vendorName,
        gstin: gstin,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        subtotal: numSub,
        tax_amount: numTax,
        total_amount: numTotal,
        items: items,
        human_notes: notes,
        mark_verified: approve,
        status: targetStatus
      });

      setSaveSuccess(true);
      if (approve) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      await reloadDoc();
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err) {
      alert('Failed to submit verification: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAutofixTotal = () => {
    setTotalAmount(expectedTotal);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border-subtle)] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-[#ff3b2f]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#ff3b2f] font-semibold">
              Ideate Phase &bull; Human-in-the-Loop Review
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-[var(--text-primary)]">
            Human Verification & Field Correction
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Review flagged fields, adjust line items, correct OCR misreads, and officially sign off on this document.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
            document.human_verified
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
          }`}>
            {document.human_verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>Status: {document.status ? document.status.toUpperCase() : (document.human_verified ? 'APPROVED' : 'PENDING')}</span>
          </div>

          <Link
            to={`/report/${document.id}`}
            className="btn-secondary text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5 text-[#ff3b2f]" />
            <span>View Final Report</span>
          </Link>
        </div>
      </div>

      {saveSuccess && (
        <div className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between shadow-lg ${
          actionType === 'approved'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            : 'bg-red-500/15 border-red-500/40 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>
              {actionType === 'approved'
                ? 'Human verification saved! Document officially APPROVED and signed off for financial export.'
                : 'Document marked as REJECTED. Financial export remains prohibited (HTTP 403).'}
            </span>
          </div>
          <Link
            to={`/report/${document.id}`}
            className="text-white hover:underline font-bold"
          >
            View Verification Report &rarr;
          </Link>
        </div>
      )}

      {/* Real-time Math Recalculation Alert */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        isMathValid
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-[#ff3b2f]/10 border-[#ff3b2f]/40 text-[#ff5147]'
      }`}>
        <div className="flex items-center gap-3">
          {isMathValid ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          <div className="text-xs font-mono">
            <strong>Real-time Constraint Validation: </strong>
            <span>
              Subtotal (${numSub.toFixed(2)}) + Tax (${numTax.toFixed(2)}) = Expected ${expectedTotal.toFixed(2)}.
              Current Total: ${numTotal.toFixed(2)} (Delta: ${discrepancy.toFixed(2)}).
            </span>
          </div>
        </div>

        {!isMathValid && (
          <button
            type="button"
            onClick={handleAutofixTotal}
            className="btn-primary text-xs py-1.5 px-3 self-start md:self-auto flex items-center gap-1 shadow-none"
          >
            <span>Auto-fill Correct Total (${expectedTotal.toFixed(2)})</span>
          </button>
        )}
      </div>

      {/* Main Correction Form */}
      <form onSubmit={(e) => handleSubmit(e, true)} className="nexus-card space-y-6">
        <h3 className="text-base font-bold font-heading text-white pb-3 border-b border-[rgba(255,255,255,0.06)]">
          Document Fields Editor
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Vendor Name */}
          <div>
            <label className="nexus-label">Vendor Organization Name</label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="nexus-input"
              required
            />
          </div>

          {/* Supplier GSTIN */}
          <div>
            <label className="nexus-label">Supplier GSTIN (15 Alphanumeric)</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="e.g. 27AABCA1234F1Z5"
              className="nexus-input font-mono"
            />
          </div>

          {/* Invoice Number */}
          <div>
            <label className="nexus-label">Invoice Number / Identifier</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="nexus-input font-mono"
              required
            />
          </div>

          {/* Invoice Date */}
          <div>
            <label className="nexus-label">Invoice Issue Date (YYYY-MM-DD)</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="nexus-input font-mono"
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="nexus-label">Payment Due Date (YYYY-MM-DD)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`nexus-input font-mono ${dueDate && invoiceDate && dueDate < invoiceDate ? 'nexus-input-error' : ''}`}
              required
            />
            {dueDate && invoiceDate && dueDate < invoiceDate && (
              <span className="text-[10px] font-mono text-[#ff5147] mt-1 block">
                Warning: Due date precedes invoice date.
              </span>
            )}
          </div>

          {/* Subtotal */}
          <div>
            <label className="nexus-label">Subtotal Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value)}
              className="nexus-input font-mono"
              required
            />
          </div>

          {/* Tax Amount */}
          <div>
            <label className="nexus-label">Tax Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              className="nexus-input font-mono"
              required
            />
          </div>

          {/* Total Amount */}
          <div>
            <label className="nexus-label">Total Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className={`nexus-input font-mono font-bold text-base ${!isMathValid ? 'nexus-input-error' : ''}`}
              required
            />
            {!isMathValid && (
              <span className="text-[10px] font-mono text-[#ff5147] mt-1 block">
                Discrepancy: Mathematical constraint requires Subtotal + Tax == Total.
              </span>
            )}
          </div>
        </div>

        {/* Line Items Table Editor */}
        <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold font-heading text-white">
                Invoice Line Items ({items.length})
              </h4>
              <p className="text-[11px] text-[#a1a1aa]">
                Edit description, quantity, and unit price. Individual items recalculate totals dynamically.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRecalculateFromItems}
                className="btn-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5 text-[#ff3b2f]" />
                <span>Sum to Subtotal</span>
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 border-dashed border-[#ff3b2f]/50 hover:border-[#ff3b2f]"
              >
                <Plus className="w-3.5 h-3.5 text-[#ff3b2f]" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#09090b]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[#111113] text-[#a1a1aa] font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 w-24 text-center">Qty</th>
                  <th className="py-2.5 px-3 w-32 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 w-32 text-right">Line Total</th>
                  <th className="py-2.5 px-3 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)] font-mono">
                {items.length > 0 ? (
                  items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-2">
                        <input
                          type="text"
                          value={it.description || ''}
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          className="w-full bg-[#18181b] border border-[rgba(255,255,255,0.1)] rounded px-2 py-1 text-white text-xs font-sans focus:outline-none focus:border-[#ff3b2f]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="1"
                          value={it.quantity ?? 1}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                          className="w-full bg-[#18181b] border border-[rgba(255,255,255,0.1)] rounded px-2 py-1 text-white text-xs text-center focus:outline-none focus:border-[#ff3b2f]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={it.unit_price ?? 0}
                          onChange={(e) => handleUpdateItem(idx, 'unit_price', e.target.value)}
                          className="w-full bg-[#18181b] border border-[rgba(255,255,255,0.1)] rounded px-2 py-1 text-white text-xs text-right focus:outline-none focus:border-[#ff3b2f]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={it.total ?? 0}
                          onChange={(e) => handleUpdateItem(idx, 'total', e.target.value)}
                          className="w-full bg-[#18181b] border border-[rgba(255,255,255,0.1)] rounded px-2 py-1 text-emerald-400 font-bold text-xs text-right focus:outline-none focus:border-[#ff3b2f]"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(idx)}
                          className="p-1 rounded text-[#a1a1aa] hover:text-[#ff3b2f] hover:bg-[#ff3b2f]/10"
                          title="Remove Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-[#71717a] font-sans">
                      No line items currently configured. Click "Add Item" above to add items manually.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Human Reviewer Notes */}
        <div>
          <label className="nexus-label">Human Reviewer Audit Notes & Justification</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Corrected character 'B' misread as numeral '8'. Verified against original physical scan."
            className="nexus-textarea"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-mono text-[#a1a1aa]">
            Current Verification: {document.human_verified ? 'Signed-off & Approved' : 'Pending Verification'}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, false)}
              className="py-2.5 px-4 rounded-xl text-xs uppercase font-mono font-bold tracking-wider border border-red-500/40 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>{saving ? 'Processing...' : 'Reject Document'}</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(255,59,47,0.3)]"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Verifying & Persisting...' : 'Approve & Sign-Off Verification'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
