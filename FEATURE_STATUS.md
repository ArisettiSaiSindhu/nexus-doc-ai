# NEXUS DOC AI — FEATURE STATUS CATALOG

This document lists the operational status of every feature, algorithm, verification module, and API endpoint in NEXUS DOC AI based on empirical test execution.

**Status Legend:**
- **PASS** — Implemented and verified with empirical test evidence
- **PARTIAL** — Implemented but carries known deployment or external constraints
- **FAIL** — Tested and failed
- **NOT IMPLEMENTED** — Functionality does not exist in codebase

---

## 1. Document Ingestion & Optical Character Recognition

| Feature | Status | Description & Implementation Evidence |
|---|---|---|
| PDF Multi-Page Parsing | **PASS** | PyMuPDF (`fitz`) parses text streams across pages; retains page index, per-page dimensions, preview thumbnails, and coordinates. |
| Scanned PDF Processing | **PASS** | Rasterizes pages at 150 DPI and invokes OCR fallback if embedded text length < 15 characters. |
| JPG / PNG Image Ingestion | **PASS** | Handles image uploads, writes to disk, performs CV2 perception analysis, and executes OCR. |
| Windows.Media.Ocr Native Engine | **PASS** | Hardware-accelerated WinRT OCR via PowerShell bridge (`win_ocr.ps1`). Returns word-level bounding boxes and full text. |
| Tesseract OCR Cross-Platform Fallback | **PASS** | Tesseract 5.4.0 integration with float confidence extraction from `pytesseract.image_to_data()`. Filters `-1` invalid confidences. |
| Independent Dual-Engine Comparison | **PASS** | Runs Windows.Media.Ocr (Engine 1) and Tesseract OCR (Engine 2) independently on document image via `POST /api/documents/{id}/ocr-compare`. Real agreement score and disagreement reporting. |
| Honest Disclosure of OCR Status | **PASS** | Keeps `cross_model_status = "PENDING_SECONDARY_EXTRACTOR"` until dual engines execute. Never fabricates consensus scores. |

---

## 2. Perception & Image Quality Analysis

| Feature | Status | Description & Implementation Evidence |
|---|---|---|
| Image Sharpness Measurement | **PASS** | OpenCV Laplacian variance (`cv2.Laplacian().var()`). Differentiates sharp vs blurred scans. |
| Blur Detection Guard | **PASS** | Flags scans with sharpness variance < 45.0 with warning penalty on perception score. |
| Contrast Ratio Analysis | **PASS** | Grayscale standard deviation measurement (`gray.std()`) normalized to 15.0–100.0 scale. |
| Text Skew Angle Detection | **PASS** | Otsu inverse thresholding + text contour `cv2.minAreaRect()`. Accurately detects angles from -45° to +45°. |
| Affine Deskew Normalization | **PASS** | Center-rotation affine warp (`cv2.getRotationMatrix2D` + `cv2.warpAffine`) with expanded bounding canvas. Verified on 0°, ±5°, ±12° with residual skew < 0.20°. |
| Character Optical Ambiguity Detection | **PASS** | Detects character confusion in numeric/date contexts: 'B' vs '8', 'O' vs '0', 'I'/'l' vs '1', 'S' vs '5'. |

---

## 3. Layout Verification & Spatial Geometry

| Feature | Status | Description & Implementation Evidence |
|---|---|---|
| Bounding Box Coordinate Anchoring | **PASS** | Normalized percentage coordinates `[x0, y0, x1, y1]` anchored to page width and height for all extracted fields and line items. |
| Header Quadrant Geometry Check | **PASS** | Verifies vendor name and invoice metadata appear in upper header region (`y0 < 0.22 * page_height`). |
| Tax-vs-Total Swap Detection | **PASS** | Flags critical anomaly if extracted Tax Amount >= Total Amount. |
| Total Summary Baseline Check | **PASS** | Flags spatial anomalies if Total summary baseline intersects remittance or tear-off regions. |
| Missing Coordinate Flagging | **PASS** | Raises `WARN_MISSING_BBOX` if an extracted required field lacks a spatial coordinate anchor. |

---

## 4. Deterministic Constraint Validation Engine

| Feature | Status | Description & Implementation Evidence |
|---|---|---|
| Total Balance Reconciliation | **PASS** | Enforces `Subtotal - Discount + Tax + Cess == Total Amount`. Supports exact match and rounding tolerance (±$1.00). |
| Line Item Row Math Check | **PASS** | Enforces `Quantity × Unit Price == Line Total` for each line item row. Flags arithmetic defects. |
| Line Item Accumulation Check | **PASS** | Enforces `Sum(Line Items) == Subtotal`. Flags subtotal mismatch if discrepancy > $0.10. |
| Chronological Date Validity | **PASS** | Enforces `Payment Due Date >= Invoice Date`. Flags inverted chronological dates. |
| Mandatory Field Completeness | **PASS** | Enforces presence of Vendor Name, Invoice Number, Invoice Date, and Gross Total. |
| Indian GSTIN Syntax Verification | **PASS** | Validates 15-character structural syntax (2-digit state code + 10-char PAN + 1 entity + 'Z' + 1 checksum). |
| GST State Code Jurisdiction | **PASS** | Validates Indian state codes 01 to 37 (e.g. 36 Telangana, 27 Maharashtra). |
| Intra-State GST Parity Check | **PASS** | Enforces `CGST == SGST` for intra-state tax components. |
| Inter-State IGST Alignment Check | **PASS** | Enforces `IGST == Total Tax` for interstate supply invoices. |
| Live GSTN Portal Online Verification | **PARTIAL** | Basic structural/state code validation is complete. Live GSTN API authentication is simulated via disclaimer because live GSTN APIs require paid GSP credentials. |

---

## 5. Duplicate Invoice Detection

| Feature | Status | Description & Implementation Evidence |
|---|---|---|
| Multi-Attribute Weighted Scoring | **PASS** | Computes match score: Invoice Number (40%), Vendor Name (30%), Total Amount (20%), Invoice Date (10%). |
| Exact Duplicate Flagging | **PASS** | Flags `DUPLICATE_SUSPECTED` when composite match score >= 0.70. |
| Potential Duplicate Flagging | **PASS** | Flags `POTENTIAL_MATCH` for partial similarities (score 0.50–0.69). |

---

## 6. Confidence Scoring & Risk Assessment

| Feature | Status | Description & Implementation Evidence |
|---|---|---|
| Composite Confidence Index | **PASS** | Weighted calculation: Constraints (50%), Perception (25%), Layout (25%). |
| Four-Tier Risk Categorization | **PASS** | Deterministic assignment to `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`. |
| Actionable Review Recommendation | **PASS** | Dynamically advises ledger ingestion clearance, document re-scan, or manual human review. |

---

## 7. Human-in-the-Loop Verification & Approval

| Feature | Status | Description & Implementation Evidence |
|---|---|---|
| Source Document & Bounding Box Viewer | **PASS** | Interactive document preview with overlay bounding boxes for vendor, invoice#, dates, totals, and line items. |
| Field Value Correction | **PASS** | Allows human reviewer to edit any header or financial field. Corrected values tracked in `corrected_fields`. |
| Interactive Line Items Editor | **PASS** | Add new line items, modify description/qty/price, delete items, and auto-sum to Subtotal. |
| Real-time Arithmetic Feedback | **PASS** | Dynamic calculation indicator shows discrepancy and one-click auto-fill correct total. |
| Document Approval & Rejection | **PASS** | User can officially approve (`status = "approved"`, `human_verified = 1`) or reject (`status = "rejected"`). |
| Immutable Audit Trail | **PASS** | Every automated evaluation and human intervention is timestamped and recorded in `audit_logs`. |

---

## 8. Export Gateway & Integration

| Feature | Status | Description & Implementation Evidence |
|---|---|---|
| Export Authorization Security Guard | **PASS** | Strict backend guard (`check_document_approved_for_export`) returns HTTP 403 Forbidden on unapproved documents across all export routes. |
| CSV Export | **PASS** | Streams verified header and line items as RFC 4180 CSV attachment. |
| Excel (`.xlsx`) Dossier Export | **PASS** | OpenPyXL formatted spreadsheet with dark headers, auto-adjusted column widths, and verified audit badges. |
| PDF Verification Audit Dossier | **PASS** | ReportLab styled PDF report with executive summary table, dimensional breakdown, flagged issues, and audit history. |
| Tally Prime XML Voucher Export | **PASS** | Standard Tally XML schema `<ENVELOPE><BODY><IMPORTDATA><REQUESTDATA><VOUCHER>` with Purchase voucher type, Party credit ledger, Purchase debit ledger, Tax debit ledger, and inventory items. |
| Tally Prime TSV Import Wizard Export | **PASS** | Tab-separated values file with standard voucher header and inventory item columns. |

---

## 9. Dynamic Evaluation Framework

| Feature | Status | Description & Implementation Evidence |
|---|---|---|
| Ground-Truth Labeled Dataset | **PASS** | 16 annotated benchmark cases covering clean invoices, arithmetic errors, date inversions, blurred scans, GSTIN format issues, and duplicates. |
| Empirical Confusion Matrix | **PASS** | Dynamically calculates True Positives, True Negatives, False Positives, and False Negatives from actual verification execution. |
| Performance Metrics Calculation | **PASS** | Calculates Precision, Recall, F1-Score, and False Positive Rate on the fly via `GET /api/evaluation/benchmark`. |
