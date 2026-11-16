import os
from pathlib import Path
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

REPORTS_DIR = Path(__file__).resolve().parent.parent / "uploads" / "reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_pdf_report(doc_data: dict, perception: dict, layout: dict, constraints: dict, risk: dict) -> str:
    """
    Generates a genuine audit report PDF for an invoice verification session.
    Dynamically displays calculated variance, perception ambiguities, GST checks, and audit history.
    """
    doc_id = doc_data.get("id", "DOC")
    inv_num = doc_data.get("invoice_number", "INV")
    report_filename = f"nexus_audit_{doc_id}_{int(datetime.now().timestamp())}.pdf"
    report_path = REPORTS_DIR / report_filename

    pdf = SimpleDocTemplate(
        str(report_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    brand_red = colors.HexColor("#ff3b2f")

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=colors.HexColor("#111113"),
        leading=22
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor("#555555"),
        leading=13
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=brand_red,
        leading=15,
        spaceBefore=10,
        spaceAfter=5
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        fontName='Helvetica',
        fontSize=8.5,
        textColor=colors.HexColor("#222222"),
        leading=12
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("<b>NEXUS DOC AI</b> | Constraint-Aware Verification Audit Dossier", title_style))
    elements.append(Paragraph(f"Autonomous Error Detection Report &bull; Document ID: {doc_id} &bull; Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}", subtitle_style))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=brand_red, spaceAfter=12))

    # Executive Summary Table
    gstin_val = doc_data.get("gstin") or "Not Specified"
    overview_data = [
        [
            Paragraph("<b>Document ID:</b>", body_style), Paragraph(str(doc_id), body_style),
            Paragraph("<b>Risk Rating:</b>", body_style), Paragraph(f"<b>{risk.get('risk_level', 'UNKNOWN')}</b>", body_style)
        ],
        [
            Paragraph("<b>Vendor Name:</b>", body_style), Paragraph(str(doc_data.get("vendor_name")), body_style),
            Paragraph("<b>Composite Reliability:</b>", body_style), Paragraph(f"<b>{round(risk.get('overall_confidence', 0)*100, 1)}%</b>", body_style)
        ],
        [
            Paragraph("<b>Invoice Number:</b>", body_style), Paragraph(str(inv_num), body_style),
            Paragraph("<b>Supplier GSTIN:</b>", body_style), Paragraph(str(gstin_val), body_style)
        ],
        [
            Paragraph("<b>Invoice Date:</b>", body_style), Paragraph(str(doc_data.get("invoice_date")), body_style),
            Paragraph("<b>Due Date:</b>", body_style), Paragraph(str(doc_data.get("due_date")), body_style)
        ]
    ]

    t_overview = Table(overview_data, colWidths=[105, 165, 125, 145])
    t_overview.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8f8fa")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e2e8")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_overview)
    elements.append(Spacer(1, 10))

    # 3-Dimension Verification Architecture
    elements.append(Paragraph("3-DIMENSIONAL VERIFICATION INSPECTION MATRIX", h2_style))
    dim_data = [
        ["Dimension", "Technical Vector", "Index", "Status"],
        [
            "1. Perception Checking",
            "Readability, Laplacian blur variance, contrast, character confusion (8/B, 0/O)",
            f"{round(perception.get('perception_score', 0)*100, 1)}%",
            "OPTIMAL" if perception.get('perception_score', 0) >= 0.90 else "UNCERTAIN"
        ],
        [
            "2. Layout Checking",
            "Spatial field coordinates, label-to-value geometric alignment, field swaps",
            f"{round(layout.get('layout_score', 0)*100, 1)}%",
            "ALIGNED" if not layout.get('layout_anomalies') else "ANOMALY FLAGGED"
        ],
        [
            "3. Constraint-Based Validation",
            "Subtotal + Tax == Total, Line items multiplication, Date chronology, GST rules",
            f"{round(constraints.get('constraint_score', 0)*100, 1)}%",
            "PASSED" if constraints.get('is_valid') else "DEFECT FLAGGED"
        ]
    ]
    t_dim = Table(dim_data, colWidths=[130, 245, 65, 100])
    t_dim.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e1e24")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#dcdce2")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f9f9fb")]),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    elements.append(t_dim)
    elements.append(Spacer(1, 10))

    # Mathematical & Logic Constraints Table
    elements.append(Paragraph("MATHEMATICAL & LOGICAL CONSTRAINT EXECUTION", h2_style))
    rules_table_data = [["Rule ID", "Rule Name", "Expected Value", "Actual Extracted", "Variance", "Outcome"]]
    for r in constraints.get("rules", []):
        rules_table_data.append([
            r.get("id"),
            r.get("name"),
            r.get("expected"),
            r.get("actual"),
            r.get("discrepancy", "None"),
            r.get("status")
        ])
    t_rules = Table(rules_table_data, colWidths=[100, 130, 85, 85, 75, 65])
    t_rules.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2a2a32")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#dcdce2")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f9f9fb")]),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 7),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    elements.append(t_rules)
    elements.append(Spacer(1, 10))

    # Financial Reconciliation Block
    sub = float(doc_data.get('subtotal', 0) or 0)
    tax = float(doc_data.get('tax_amount', 0) or 0)
    tot = float(doc_data.get('total_amount', 0) or 0)
    calc = round(sub + tax, 2)
    diff = round(abs(calc - tot), 2)

    elements.append(Paragraph("FINANCIAL RECONCILIATION SUMMARY", h2_style))
    fin_data = [
        ["Subtotal (Declared)", f"${sub:.2f}"],
        ["Tax Amount (Declared)", f"${tax:.2f}"],
        ["Reconciled Expected Total (Subtotal + Tax)", f"${calc:.2f}"],
        ["Extracted Invoice Total", f"${tot:.2f}"],
        ["Mathematical Discrepancy", f"${diff:.2f} ({'EXACT MATCH' if diff <= 0.02 else 'MISMATCH DETECTED'})"]
    ]
    t_fin = Table(fin_data, colWidths=[240, 300])
    t_fin.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e2e8")),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f4f4f7")),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    elements.append(t_fin)
    elements.append(Spacer(1, 10))

    # Human Verification & Audit Trail
    elements.append(Paragraph("HUMAN VERIFICATION AUDIT TRAIL", h2_style))
    is_verified = bool(doc_data.get("human_verified"))
    notes = doc_data.get("human_notes") or "No manual reviewer notes logged."
    audit_text = f"<b>Accounting Sign-Off:</b> {'APPROVED AND SIGNED OFF' if is_verified else 'PENDING HUMAN REVIEW'}<br/><b>Auditor Notes:</b> {notes}"
    elements.append(Paragraph(audit_text, body_style))

    pdf.build(elements)
    return str(report_path)
