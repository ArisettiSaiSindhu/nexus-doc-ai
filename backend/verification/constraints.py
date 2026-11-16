import re
from datetime import datetime
from typing import Dict, List, Any

# Indian GST State Codes (01 to 37)
VALID_GST_STATE_CODES = {
    f"{i:02d}": name for i, name in [
        (1, "Jammu & Kashmir"), (2, "Himachal Pradesh"), (3, "Punjab"), (4, "Chandigarh"),
        (5, "Uttarakhand"), (6, "Haryana"), (7, "Delhi"), (8, "Rajasthan"),
        (9, "Uttar Pradesh"), (10, "Bihar"), (11, "Sikkim"), (12, "Arunachal Pradesh"),
        (13, "Nagaland"), (14, "Manipur"), (15, "Mizoram"), (16, "Tripura"),
        (17, "Meghalaya"), (18, "Assam"), (19, "West Bengal"), (20, "Jharkhand"),
        (21, "Odisha"), (22, "Chhattisgarh"), (23, "Madhya Pradesh"), (24, "Gujarat"),
        (26, "Dadra & Nagar Haveli and Daman & Diu"), (27, "Maharashtra"), (29, "Karnataka"),
        (30, "Goa"), (31, "Lakshadweep"), (32, "Kerala"), (33, "Tamil Nadu"),
        (34, "Puducherry"), (35, "Andaman & Nicobar Islands"), (36, "Telangana"), (37, "Andhra Pradesh")
    ]
}

GSTIN_REGEX = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")

def verify_constraints(doc_data: Dict[str, Any], rounding_tolerance: float = 1.00) -> Dict[str, Any]:
    """
    Constraint-Aware Validation Engine (Literature Survey & Ideate Phase Modules D & E)
    Enforces deterministic mathematical laws, logical date sequences, and Indian GST rules.
    """
    subtotal = float(doc_data.get("subtotal") or 0.0)
    tax_amount = float(doc_data.get("tax_amount") or 0.0)
    total_amount = float(doc_data.get("total_amount") or 0.0)
    discount = float(doc_data.get("discount") or 0.0)
    cess = float(doc_data.get("cess") or 0.0)
    cgst = float(doc_data.get("cgst") or 0.0)
    sgst = float(doc_data.get("sgst") or 0.0)
    igst = float(doc_data.get("igst") or 0.0)
    gstin = str(doc_data.get("gstin") or doc_data.get("vendor_gstin") or "").strip().upper()

    invoice_date_str = str(doc_data.get("invoice_date") or "").strip()
    due_date_str = str(doc_data.get("due_date") or "").strip()
    items = doc_data.get("items") or []

    rules_results = []
    issues = []
    
    # -------------------------------------------------------------------------
    # 1. Total Balance Arithmetic Constraint: Subtotal - Discount + Tax + Cess == Total
    # -------------------------------------------------------------------------
    calculated_total = round(subtotal - discount + tax_amount + cess, 2)
    reported_total = round(total_amount, 2)
    discrepancy = round(abs(calculated_total - reported_total), 2)
    
    # Check if discrepancy is within acceptable rounding tolerance
    math_rule_passed = discrepancy <= 0.02 or (discrepancy <= rounding_tolerance and discrepancy > 0)
    is_exact = discrepancy <= 0.02
    
    if is_exact:
        severity = "NONE"
        status = "PASSED"
        desc = "Deterministic balance verified: Subtotal + Tax matches Total Amount exactly."
    elif discrepancy <= rounding_tolerance:
        severity = "LOW"
        status = "PASSED_WITH_ROUNDING"
        desc = f"Minor rounding variance of ${discrepancy:.2f} detected (within ±${rounding_tolerance:.2f} tolerance)."
    else:
        severity = "CRITICAL" if discrepancy > 10.0 else "HIGH"
        status = "FAILED"
        desc = f"Mathematical mismatch: Expected ${calculated_total:.2f}, but extracted Total is ${reported_total:.2f}."
        issues.append({
            "code": "ERR_MATH_MISMATCH",
            "field": "total_amount",
            "message": f"Mathematical discrepancy detected: Subtotal (${subtotal:.2f}) + Tax (${tax_amount:.2f}) = ${calculated_total:.2f}, but extracted Total is ${reported_total:.2f}. Discrepancy is ${discrepancy:.2f}.",
            "severity": severity,
            "expected": calculated_total,
            "actual": reported_total,
            "discrepancy": discrepancy
        })

    rules_results.append({
        "id": "MATH_TOTAL_BALANCE",
        "name": "Invoice Balance Reconciliation",
        "formula": "Subtotal - Discount + Tax + Cess == Total",
        "expected": f"${calculated_total:.2f}",
        "actual": f"${reported_total:.2f}",
        "discrepancy": f"${discrepancy:.2f}",
        "status": status,
        "severity": severity,
        "description": desc
    })

    # -------------------------------------------------------------------------
    # 2. Line Item Multiplications & Accumulation Constraint
    # -------------------------------------------------------------------------
    items_sum = 0.0
    item_math_errors = 0
    
    for idx, item in enumerate(items):
        qty = float(item.get("quantity") or 0.0)
        unit_price = float(item.get("unit_price") or 0.0)
        line_total = float(item.get("total") or 0.0)
        expected_line_total = round(qty * unit_price, 2)
        
        line_discrepancy = round(abs(expected_line_total - line_total), 2)
        if line_discrepancy > 0.05 and qty > 0 and unit_price > 0:
            item_math_errors += 1
            issues.append({
                "code": "ERR_LINE_ITEM_MATH",
                "field": f"items[{idx}]",
                "message": f"Line item '{item.get('description', f'Item {idx+1}')}': {qty} × ${unit_price:.2f} = ${expected_line_total:.2f}, but extracted line total is ${line_total:.2f} (delta ${line_discrepancy:.2f}).",
                "severity": "HIGH",
                "line_index": idx
            })
        items_sum += line_total

    items_sum = round(items_sum, 2)
    items_subtotal_diff = round(abs(items_sum - subtotal), 2) if subtotal > 0 else 0.0
    items_sum_passed = (items_subtotal_diff <= 0.10) if items and subtotal > 0 else True
    
    rules_results.append({
        "id": "MATH_LINE_ITEMS_SUM",
        "name": "Line Item Accumulation Constraint",
        "formula": "Sum(Qty × Unit Price) == Subtotal",
        "expected": f"${subtotal:.2f}",
        "actual": f"${items_sum:.2f}",
        "discrepancy": f"${items_subtotal_diff:.2f}",
        "status": "PASSED" if items_sum_passed else "FAILED",
        "severity": "HIGH" if not items_sum_passed else "NONE",
        "description": "Verifies that all line item totals sum up to the declared invoice subtotal."
    })
    
    if not items_sum_passed and items and subtotal > 0:
        issues.append({
            "code": "ERR_ITEMS_SUBTOTAL_MISMATCH",
            "field": "subtotal",
            "message": f"Sum of line items (${items_sum:.2f}) does not equal extracted Subtotal (${subtotal:.2f}). Discrepancy is ${items_subtotal_diff:.2f}.",
            "severity": "HIGH"
        })

    # -------------------------------------------------------------------------
    # 3. Logical Chronological Dates: Due Date >= Invoice Date
    # -------------------------------------------------------------------------
    date_rule_passed = True
    date_message = "Due Date is chronological and follows Invoice Date."
    if invoice_date_str and due_date_str:
        try:
            # Normalize common date formats
            inv_date = None
            due_date = None
            for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d", "%b %d, %Y"):
                try:
                    if not inv_date:
                        inv_date = datetime.strptime(invoice_date_str, fmt)
                except ValueError:
                    pass
                try:
                    if not due_date:
                        due_date = datetime.strptime(due_date_str, fmt)
                except ValueError:
                    pass

            if inv_date and due_date:
                if due_date < inv_date:
                    date_rule_passed = False
                    days_inverted = (inv_date - due_date).days
                    date_message = f"Inverted chronological dates: Due Date ({due_date_str}) precedes Invoice Date ({invoice_date_str}) by {days_inverted} days."
                    issues.append({
                        "code": "ERR_CHRONOLOGICAL_DATE",
                        "field": "due_date",
                        "message": date_message,
                        "severity": "HIGH"
                    })
        except Exception:
            pass
    
    rules_results.append({
        "id": "LOGIC_DATES_CHRONOLOGY",
        "name": "Chronological Date Validity",
        "formula": "Due Date >= Invoice Date",
        "expected": "Due Date >= Invoice Date",
        "actual": f"{invoice_date_str or 'N/A'} -> {due_date_str or 'N/A'}",
        "discrepancy": "None" if date_rule_passed else "Negative delta (-days)",
        "status": "PASSED" if date_rule_passed else "FAILED",
        "severity": "HIGH" if not date_rule_passed else "NONE",
        "description": "Ensures payment due date occurs on or after invoice issuance date."
    })

    # -------------------------------------------------------------------------
    # 4. Mandatory Field Completeness Check
    # -------------------------------------------------------------------------
    required_fields = ["vendor_name", "invoice_number", "invoice_date", "total_amount"]
    missing_fields = [f for f in required_fields if not doc_data.get(f)]
    required_passed = len(missing_fields) == 0
    rules_results.append({
        "id": "STRUCT_REQUIRED_FIELDS",
        "name": "Mandatory Fields Completeness",
        "formula": "All mandatory tax and billing fields populated",
        "expected": "4/4 key fields present",
        "actual": f"{4 - len(missing_fields)}/4 present",
        "discrepancy": f"Missing: {', '.join(missing_fields)}" if missing_fields else "None",
        "status": "PASSED" if required_passed else "FAILED",
        "severity": "CRITICAL" if not required_passed else "NONE",
        "description": "Checks presence of vendor identity, invoice number, issue date, and gross total."
    })
    for mf in missing_fields:
        issues.append({
            "code": "ERR_MISSING_REQUIRED_FIELD",
            "field": mf,
            "message": f"Mandatory field '{mf}' was not identified or is empty in the extracted document.",
            "severity": "CRITICAL"
        })

    # -------------------------------------------------------------------------
    # 5. GSTIN Format & GST Tax Structure Validation (Requirement E)
    # -------------------------------------------------------------------------
    if gstin:
        gst_format_valid = bool(GSTIN_REGEX.match(gstin))
        state_code = gstin[:2]
        state_name = VALID_GST_STATE_CODES.get(state_code)
        
        if not gst_format_valid:
            issues.append({
                "code": "ERR_GSTIN_INVALID_FORMAT",
                "field": "gstin",
                "message": f"GSTIN '{gstin}' does not match standard 15-character Indian format (2-digit state code + 10-char PAN + 1 entity + 'Z' + 1 checksum).",
                "severity": "HIGH"
            })
            gstin_status = "FAILED"
        elif not state_name:
            issues.append({
                "code": "ERR_GSTIN_STATE_CODE",
                "field": "gstin",
                "message": f"GSTIN '{gstin}' starts with invalid state code '{state_code}'. Valid range is 01-37.",
                "severity": "HIGH"
            })
            gstin_status = "FAILED"
        else:
            gstin_status = "PASSED"

        rules_results.append({
            "id": "GSTIN_FORMAT_CHECK",
            "name": "GSTIN Structure & State Code",
            "formula": "Standard 15-char Indian GSTIN (State 01-37 + PAN + Entity + Z + Checksum)",
            "expected": "Valid Indian GSTIN with state code 01-37",
            "actual": f"{gstin} ({state_name or 'Invalid State'})",
            "discrepancy": "None" if gstin_status == "PASSED" else "Format/State Code Mismatch",
            "status": gstin_status,
            "severity": "HIGH" if gstin_status != "PASSED" else "NONE",
            "description": f"Verified Indian GSTIN structural syntax and jurisdiction ({state_name or 'Unknown'}). NOTE: Syntactic format validity does NOT constitute proof of active legal registration or authenticity with GSTN portal."
        })

        # Tax Consistency Check: Intra-state vs Inter-state
        if cgst > 0 or sgst > 0:
            # Intra-state: CGST and SGST should normally be equal
            cgst_sgst_diff = abs(cgst - sgst)
            if cgst_sgst_diff > 0.05:
                issues.append({
                    "code": "ERR_CGST_SGST_MISMATCH",
                    "field": "tax_amount",
                    "message": f"Intra-state GST discrepancy: CGST (${cgst:.2f}) and SGST (${sgst:.2f}) must be equal. Delta: ${cgst_sgst_diff:.2f}.",
                    "severity": "HIGH"
                })
                tax_structure_status = "FAILED"
            else:
                tax_structure_status = "PASSED"

            rules_results.append({
                "id": "GST_TAX_STRUCTURE_INTRA",
                "name": "Intra-State GST Parity",
                "formula": "CGST == SGST",
                "expected": f"CGST (${cgst:.2f}) == SGST (${cgst:.2f})",
                "actual": f"CGST: ${cgst:.2f}, SGST: ${sgst:.2f}",
                "discrepancy": f"${cgst_sgst_diff:.2f}" if cgst_sgst_diff > 0.05 else "None",
                "status": tax_structure_status,
                "severity": "HIGH" if tax_structure_status != "PASSED" else "NONE",
                "description": "Verifies that Central GST and State GST components are balanced."
            })
        elif igst > 0:
            rules_results.append({
                "id": "GST_TAX_STRUCTURE_INTER",
                "name": "Inter-State IGST Alignment",
                "formula": "IGST == Total Tax",
                "expected": f"${tax_amount:.2f}",
                "actual": f"${igst:.2f}",
                "discrepancy": f"${abs(igst - tax_amount):.2f}",
                "status": "PASSED" if abs(igst - tax_amount) <= 0.05 else "FAILED",
                "severity": "HIGH" if abs(igst - tax_amount) > 0.05 else "NONE",
                "description": "Validates single integrated GST on interstate supply."
            })

    # -------------------------------------------------------------------------
    # 6. Cross-Model Consensus Check (Requirement 3: Genuine outputs or PENDING)
    # -------------------------------------------------------------------------
    cross_model_raw = doc_data.get("cross_model_agreement")
    cross_model_status = doc_data.get("cross_model_status", "PENDING_SECONDARY_EXTRACTOR")

    if cross_model_raw is not None:
        cross_model_score = float(cross_model_raw)
        cross_model_passed = cross_model_score >= 0.85
        rule_status = "PASSED" if cross_model_passed else "WARNING"
        rule_severity = "MEDIUM" if not cross_model_passed else "NONE"
        rule_actual = f"{cross_model_score * 100:.1f}% Agreement"
        rule_disc = f"{(1.0 - cross_model_score) * 100:.1f}% divergence" if not cross_model_passed else "None"
        rule_desc = "Genuine consensus evaluation between dual extraction engines."
        if not cross_model_passed:
            issues.append({
                "code": "WARN_CROSS_MODEL_DISAGREEMENT",
                "field": "cross_model",
                "message": f"Dual extractor agreement is {cross_model_score * 100:.1f}%. Discrepancies detected between text stream and optical parser.",
                "severity": "MEDIUM"
            })
    else:
        # Honest disclosure: Second extractor is pending or single primary model active
        rule_status = "PENDING"
        rule_severity = "NONE"
        rule_actual = "Single Primary Extractor Active"
        rule_disc = "N/A (Secondary Model Pending)"
        rule_desc = "Secondary Extractor Model: PENDING. No fabricated scores generated."

    rules_results.append({
        "id": "CROSS_MODEL_CONSENSUS",
        "name": "Cross-Model Consensus",
        "formula": "Agreement(Primary OCR, Secondary Extractor) >= 85%",
        "expected": ">= 85.0% (when dual models active)",
        "actual": rule_actual,
        "discrepancy": rule_disc,
        "status": rule_status,
        "severity": rule_severity,
        "description": rule_desc
    })

    # Compute overall constraint reliability score (exclude PENDING rules from penalty)
    evaluable_rules = [r for r in rules_results if r["status"] != "PENDING"]
    passed_count = sum(1 for r in evaluable_rules if r["status"] in ["PASSED", "PASSED_WITH_ROUNDING"])
    total_rules = len(evaluable_rules)
    constraint_score = round(passed_count / total_rules, 3) if total_rules > 0 else 1.0

    return {
        "constraint_score": constraint_score,
        "rules": rules_results,
        "issues": issues,
        "passed_rules": passed_count,
        "total_rules": total_rules,
        "is_valid": len([i for i in issues if i.get("severity") in ["CRITICAL", "HIGH"]]) == 0,
        "tolerance_applied": rounding_tolerance
    }
