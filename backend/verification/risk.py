from typing import Dict, Any

def evaluate_risk(perception: Dict[str, Any], layout: Dict[str, Any], constraints: Dict[str, Any]) -> Dict[str, Any]:
    """
    Combines Perception, Layout, and Constraint Validation dimensions
    to derive a weighted confidence index, overall risk assessment,
    and prioritize results for human verification.
    """
    p_score = perception.get("perception_score", 0.9)
    l_score = layout.get("layout_score", 0.9)
    c_score = constraints.get("constraint_score", 1.0)
    
    # Ideate Phase: Constraints hold the highest weight because mathematical errors
    # directly corrupt accounting ledgers.
    # Weights: Constraints 50%, Perception 25%, Layout 25%
    composite_confidence = round((c_score * 0.50) + (p_score * 0.25) + (l_score * 0.25), 3)

    critical_issues = [i for i in constraints.get("issues", []) if i.get("severity") == "CRITICAL"]
    high_issues = [i for i in constraints.get("issues", []) if i.get("severity") == "HIGH"]
    layout_anomalies = layout.get("layout_anomalies", [])
    perception_uncertainties = perception.get("uncertainties", [])

    # Risk Classification Logic
    if critical_issues or len(high_issues) >= 2 or any(a.get("severity") == "CRITICAL" for a in layout_anomalies):
        risk_level = "CRITICAL"
        review_priority = "IMMEDIATE_ACTION"
        recommended_action = "Manual Human Override Required before Ledger Ingestion"
    elif high_issues or any(a.get("severity") == "HIGH" for a in layout_anomalies) or c_score < 0.8:
        risk_level = "HIGH"
        review_priority = "HIGH_PRIORITY"
        recommended_action = "Review flagged mathematical/date discrepancy with original scan"
    elif perception_uncertainties or layout_anomalies or composite_confidence < 0.90:
        risk_level = "MEDIUM"
        review_priority = "STANDARD_REVIEW"
        recommended_action = "Confirm ambiguous OCR characters and table cell boundaries"
    else:
        risk_level = "LOW"
        review_priority = "LOW_RISK"
        recommended_action = "Automated processing eligible; all 3 dimensions validated"

    return {
        "overall_confidence": composite_confidence,
        "risk_level": risk_level,
        "review_priority": review_priority,
        "recommended_action": recommended_action,
        "dimension_breakdown": {
            "perception": {
                "score": p_score,
                "weight": 0.25,
                "contribution": round(p_score * 0.25, 3),
                "status": "PASS" if p_score >= 0.90 else "REVIEW"
            },
            "layout": {
                "score": l_score,
                "weight": 0.25,
                "contribution": round(l_score * 0.25, 3),
                "status": "PASS" if l_score >= 0.90 else "REVIEW"
            },
            "constraints": {
                "score": c_score,
                "weight": 0.50,
                "contribution": round(c_score * 0.50, 3),
                "status": "PASS" if c_score >= 0.99 else "FAIL"
            }
        },
        "flags_summary": {
            "critical_errors": len(critical_issues),
            "high_warnings": len(high_issues),
            "layout_anomalies": len(layout_anomalies),
            "ocr_ambiguities": len(perception_uncertainties)
        }
    }
