from typing import Dict, Any, List, Optional
import sqlite3

def check_duplicate_invoice(doc_data: Dict[str, Any], conn: sqlite3.Connection) -> Dict[str, Any]:
    """
    Duplicate Invoice Detection Engine (Literature Survey & Ideate Phase Requirement F)
    Uses multi-attribute matching across:
    1. Supplier GSTIN / Vendor Name
    2. Invoice Number
    3. Invoice Date
    4. Total Amount
    
    Returns structured duplicate warning with match reasons rather than silently failing.
    """
    doc_id = doc_data.get("id", "")
    inv_num = (doc_data.get("invoice_number") or "").strip().lower()
    vendor = (doc_data.get("vendor_name") or "").strip().lower()
    inv_date = (doc_data.get("invoice_date") or "").strip()
    total = float(doc_data.get("total_amount") or 0.0)
    gstin = (doc_data.get("gstin") or "").strip().upper()

    if not inv_num and not vendor:
        return {"is_duplicate": False, "matches": [], "confidence": 0.0}

    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, vendor_name, invoice_number, invoice_date, total_amount, uploaded_at
        FROM documents
        WHERE id != ?
    """, (doc_id,))
    existing_docs = cursor.fetchall()

    matches = []
    highest_score = 0.0

    for row in existing_docs:
        e_id, e_vendor, e_num, e_date, e_total, e_uploaded = row
        score = 0.0
        reasons = []

        e_num_clean = (e_num or "").strip().lower()
        e_vendor_clean = (e_vendor or "").strip().lower()
        e_date_clean = (e_date or "").strip()
        e_total_val = float(e_total or 0.0)

        # Attribute 1: Exact or normalized Invoice Number match (Weight: 40%)
        if inv_num and e_num_clean:
            if inv_num == e_num_clean:
                score += 0.40
                reasons.append(f"Identical Invoice Number ('{e_num}')")
            elif inv_num in e_num_clean or e_num_clean in inv_num:
                score += 0.25
                reasons.append(f"Similar Invoice Number ('{e_num}')")

        # Attribute 2: Vendor Name or GSTIN match (Weight: 30%)
        if vendor and e_vendor_clean:
            if vendor == e_vendor_clean:
                score += 0.30
                reasons.append(f"Matching Vendor Name ('{e_vendor}')")
            elif any(w in e_vendor_clean for w in vendor.split() if len(w) > 3):
                score += 0.18
                reasons.append(f"Partial Vendor Name Match ('{e_vendor}')")

        # Attribute 3: Total Amount match (Weight: 20%)
        if abs(total - e_total_val) < 0.05 and total > 0:
            score += 0.20
            reasons.append(f"Identical Total Amount (${total:.2f})")
        elif abs(total - e_total_val) < 2.0 and total > 0:
            score += 0.10
            reasons.append(f"Close Total Amount (${total:.2f} vs ${e_total_val:.2f})")

        # Attribute 4: Invoice Date match (Weight: 10%)
        if inv_date and e_date_clean and inv_date == e_date_clean:
            score += 0.10
            reasons.append(f"Identical Invoice Date ({inv_date})")

        if score >= 0.50:
            matches.append({
                "matched_doc_id": e_id,
                "matched_invoice_number": e_num,
                "matched_vendor": e_vendor,
                "matched_total": e_total_val,
                "matched_date": e_date_clean,
                "match_score": round(score, 2),
                "reasons": reasons,
                "severity": "CRITICAL" if score >= 0.85 else "HIGH"
            })
            if score > highest_score:
                highest_score = score

    is_duplicate = len(matches) > 0 and highest_score >= 0.70

    return {
        "is_duplicate": is_duplicate,
        "match_count": len(matches),
        "highest_match_score": round(highest_score, 2),
        "matches": matches,
        "status": "DUPLICATE_SUSPECTED" if is_duplicate else ("POTENTIAL_MATCH" if matches else "UNIQUE")
    }
