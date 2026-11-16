import os
import sys
import json
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from main import app
from database.db import get_connection, init_db
from extraction.engine import extract_document, extract_line_items_from_document
from extraction.ocr_engine import run_windows_media_ocr, run_tesseract_ocr
from verification.constraints import verify_constraints

client = TestClient(app)

def test_line_item_table_extraction_clean_invoice():
    """
    Verify conservative table line-item extraction on multi-item invoice.
    Ensures descriptions, quantities, unit prices, and line totals are correctly parsed,
    while vendor addresses, GSTINs, bank details, and totals are excluded.
    """
    clean_pdf_path = BACKEND_DIR / "uploads" / "16926436_NEXUS_sample_clean_invoice.pdf"
    assert clean_pdf_path.exists(), f"Missing clean invoice fixture: {clean_pdf_path}"

    with open(clean_pdf_path, "rb") as f:
        pdf_bytes = f.read()

    doc_data = extract_document("16926436_NEXUS_sample_clean_invoice.pdf", pdf_bytes)
    items = doc_data.get("items", [])
    
    assert len(items) == 3, f"Expected 3 items, got {len(items)}"
    
    # Verify items
    descs = [it["description"].lower() for it in items]
    assert any("wireless keyboard" in d for d in descs), "Failed to extract Wireless Keyboard"
    assert any("optical mouse" in d for d in descs), "Failed to extract Optical Mouse"
    assert any("usb-c hub" in d for d in descs), "Failed to extract USB-C Hub"

    # Verify no address lines or summary rows were misidentified as items
    all_text = " ".join(descs)
    for forbidden in ["lake view road", "madhapur", "telangana", "500081", "subtotal", "grand total", "cgst", "sgst"]:
        assert forbidden not in all_text, f"Forbidden text '{forbidden}' misidentified as line item description"

    # Verify line-item mathematics (Qty * Unit Price == Total)
    for it in items:
        calc_tot = round(it["quantity"] * it["unit_price"], 2)
        assert abs(calc_tot - it["total"]) <= 0.05, f"Line item math mismatch in {it}"
        assert it.get("math_valid") is True

    # Verify sum of items equals declared subtotal
    items_sum = round(sum(it["total"] for it in items), 2)
    assert items_sum == 14500.00, f"Items sum {items_sum} != 14500.00"
    print(f"\n[PASS] Successfully extracted {len(items)} clean invoice table rows with 100% mathematical accuracy.")

def test_line_item_table_extraction_acme_invoice():
    """
    Verify single-line invoice table row extraction.
    """
    acme_path = BACKEND_DIR / "uploads" / "4748ac1a_acme_invoice.pdf"
    assert acme_path.exists(), f"Missing acme invoice fixture: {acme_path}"

    with open(acme_path, "rb") as f:
        pdf_bytes = f.read()

    doc_data = extract_document("4748ac1a_acme_invoice.pdf", pdf_bytes)
    items = doc_data.get("items", [])
    
    assert len(items) >= 1, f"Expected at least 1 item, got {len(items)}"
    item = items[0]
    assert "precision bearings" in item["description"].lower()
    assert item["quantity"] == 10.0
    assert item["unit_price"] == 250.00
    assert item["total"] == 2500.00
    print(f"[PASS] Acme invoice single-line table row extracted correctly: {item['description']} (Qty: {item['quantity']}, Total: ${item['total']})")

def test_line_item_math_anomaly_detection():
    """
    Verify that an intentional line-item mathematical defect (Qty * Unit Price != Total)
    is caught and flagged by the constraint engine.
    """
    defective_doc = {
        "id": "DOC-DEFECTIVE-LINE-MATH",
        "vendor_name": "Apex Semiconductor Fab",
        "invoice_number": "ASF-9921",
        "invoice_date": "2026-05-15",
        "due_date": "2026-06-15",
        "subtotal": 2500.00,
        "tax_amount": 250.00,
        "total_amount": 2750.00,
        "items": [
            # 10 x 200 = 2000, but line total is declared as 2500!
            {"description": "Silicon Wafer Substrate 300mm", "quantity": 10.0, "unit_price": 200.00, "total": 2500.00}
        ]
    }

    res = verify_constraints(defective_doc)
    math_issues = [i for i in res.get("issues", []) if i["code"] == "ERR_LINE_ITEM_MATH"]
    assert len(math_issues) >= 1, "Failed to flag line item math discrepancy"
    assert "10.0 × $200.00 = $2000.00" in math_issues[0]["message"]
    print(f"[PASS] Correctly detected line item arithmetic discrepancy: {math_issues[0]['message']}")

def test_independent_dual_ocr_comparison_endpoint():
    """
    Requirement 4 & 10: Test the independent dual-engine OCR comparison API.
    Verifies that Windows Media OCR and Tesseract OCR run independently on the same invoice image,
    compare extracted fields, identify actual agreements and disagreements, and return honest metrics.
    """
    # Create or retrieve a document with a preview image
    test_img = BACKEND_DIR / "uploads" / "ocr_evidence_test.png"
    assert test_img.exists(), f"Missing test image: {test_img}"

    conn = get_connection()
    cursor = conn.cursor()
    doc_id = "DOC-TEST-DUAL-OCR-CMP"
    cursor.execute("""
        INSERT OR REPLACE INTO documents (
            id, filename, filepath, uploaded_at, status,
            vendor_name, invoice_number, invoice_date, due_date,
            subtotal, tax_amount, total_amount, currency,
            confidence_overall, risk_level,
            perception_data, layout_data, validation_data, items_data,
            human_verified, human_notes, corrected_fields,
            gstin, preview_url, duplicate_data,
            cross_model_status, cross_model_agreement, cross_model_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        doc_id, "ocr_evidence_test.png", "/uploads/ocr_evidence_test.png", "2026-03-01T10:00:00", "processed",
        "Astraea Quantum Labs", "AQ-2026-9921", "2026-03-01", "2026-03-15",
        1420.0, 142.0, 1482.0, "USD",
        0.88, "MEDIUM",
        "{}", "{}", "{}", "[]",
        0, "", "{}", "27AABCA1234FIZ5", "/uploads/ocr_evidence_test.png", "{}",
        "PENDING_SECONDARY_EXTRACTOR", None, "{}"
    ))
    conn.commit()
    conn.close()

    # Call POST /api/documents/{doc_id}/ocr-compare
    resp = client.post(f"/api/documents/{doc_id}/ocr-compare")
    assert resp.status_code == 200, f"Comparison failed: {resp.text}"
    data = resp.json()

    assert data["status"] in ["VERIFIED_DUAL_EXTRACTOR", "PARTIAL_FAILURE"]
    assert "engine_1" in data
    assert "engine_2" in data
    assert "Windows.Media.Ocr" in data["engine_1"]["name"]
    assert "Tesseract" in data["engine_2"]["name"]
    assert data["engine_1"]["success"] is True
    assert data["engine_2"]["success"] is True
    assert isinstance(data["agreement_score"], float)
    assert 0.0 <= data["agreement_score"] <= 1.0

    print(f"\n[PASS] Dual OCR Comparison: Engine 1={data['engine_1']['name']} | Engine 2={data['engine_2']['name']}")
    print(f"      Agreement Score: {data['agreement_score'] * 100:.1f}% across {data['fields_compared']} fields")
    print(f"      Disagreements detected: {len(data['disagreements'])}")

def test_human_verification_line_items_update_and_approval():
    """
    Requirement 11: Ensure human reviewer can correct fields, add/delete line items,
    recalculate constraints, and approve/reject documents with database persistence.
    """
    conn = get_connection()
    cursor = conn.cursor()
    doc_id = "DOC-TEST-HUMAN-ITEMS"
    cursor.execute("""
        INSERT OR REPLACE INTO documents (
            id, filename, filepath, uploaded_at, status,
            vendor_name, invoice_number, invoice_date, due_date,
            subtotal, tax_amount, total_amount, currency,
            confidence_overall, risk_level,
            perception_data, layout_data, validation_data, items_data,
            human_verified, human_notes, corrected_fields,
            gstin, preview_url, duplicate_data,
            cross_model_status, cross_model_agreement, cross_model_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        doc_id, "test.pdf", "", "2026-03-01T10:00:00", "processed",
        "Original Vendor", "INV-OLD-01", "2026-03-01", "2026-03-15",
        100.0, 10.0, 110.0, "USD",
        0.70, "HIGH",
        "{}", "{}", "{}", "[]",
        0, "", "{}", "27AAAAA0000A1Z5", "", "{}",
        "PENDING_SECONDARY_EXTRACTOR", None, "{}"
    ))
    conn.commit()
    conn.close()

    # Submit verification with modified line items and approval
    new_items = [
        {"description": "Item Alpha", "quantity": 2.0, "unit_price": 40.0, "total": 80.0},
        {"description": "Item Beta", "quantity": 1.0, "unit_price": 20.0, "total": 20.0}
    ]
    payload = {
        "vendor_name": "Corrected Vendor Corp",
        "invoice_number": "INV-CORRECTED-02",
        "invoice_date": "2026-03-02",
        "due_date": "2026-03-20",
        "subtotal": 100.0,
        "tax_amount": 10.0,
        "total_amount": 110.0,
        "items": new_items,
        "human_notes": "Added missing line items and approved invoice.",
        "mark_verified": True,
        "status": "approved"
    }

    resp = client.post(f"/api/documents/{doc_id}/verify", json=payload)
    assert resp.status_code == 200, f"Verification failed: {resp.text}"
    v_data = resp.json()
    assert v_data["success"] is True
    assert v_data["status"] == "approved"
    assert v_data["items_count"] == 2
    assert v_data["is_valid"] is True

    # Verify persistence in database
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    row = dict(cursor.fetchone())
    conn.close()

    assert row["human_verified"] == 1
    assert row["status"] == "approved"
    assert row["vendor_name"] == "Corrected Vendor Corp"
    saved_items = json.loads(row["items_data"])
    assert len(saved_items) == 2
    assert saved_items[0]["description"] == "Item Alpha"
    print(f"\n[PASS] Human verification successfully updated line items, persisted approval, and recalculated constraints.")
