import json
import pandas as pd
import os
import argparse

# --- Main analysis workflow for local reports ---
def analyze_local_report(report_file_path):
    """
    Loads a vulnerability report from a local JSON file and calculates severity counts.
    Assumes the report structure is similar to Trivy JSON output for simplicity.
    """
    try:
        with open(report_file_path, 'r') as f:
            vulnerability_data = json.load(f)
    except FileNotFoundError:
        return {"error": f"Report file not found: {report_file_path}"}
    except json.JSONDecodeError:
        return {"error": f"Invalid JSON in report file: {report_file_path}"}

    critical_count = 0
    high_count = 0
    medium_count = 0
    low_count = 0

    # This part assumes a Trivy-like JSON structure for simplicity
    # {"SchemaVersion": "...", "Results": [{"Target": "...", "Vulnerabilities": [{"Severity": "HIGH", ...}]}]}
    if isinstance(vulnerability_data, dict) and "Results" in vulnerability_data:
        for result in vulnerability_data.get("Results", []):
            for vuln in result.get("Vulnerabilities", []):
                severity = vuln.get("Severity", "").upper()
                if severity == "CRITICAL":
                    critical_count += 1
                elif severity == "HIGH":
                    high_count += 1
                elif severity == "MEDIUM":
                    medium_count += 1
                elif severity == "LOW":
                    low_count += 1
    # Add other parsing logic if your actual local scanner has a different format

    return {
        "critical": critical_count,
        "high": high_count,
        "medium": medium_count,
        "low": low_count
    }

def main():
    parser = argparse.ArgumentParser(description="Perform security analysis based on a local vulnerability report.")
    parser.add_argument("--report_file", type=str, required=True, help="Path to the local vulnerability report JSON file.")
    args = parser.parse_args()

    vulnerability_summary = analyze_local_report(args.report_file)
    print(json.dumps(vulnerability_summary))

if __name__ == "__main__":
    main() 