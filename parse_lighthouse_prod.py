import json
import sys

try:
    with open('lighthouse-report-prod.json', 'r') as f:
        data = json.load(f)

    categories = data.get('categories', {})
    
    print("LIGHTHOUSE SCORES (PRODUCTION):")
    for key, value in categories.items():
        score = value.get('score')
        if score is not None:
            print(f"{value.get('title')}: {int(score * 100)}")
            
    print("\nKEY METRICS (PRODUCTION):")
    audits = data.get('audits', {})
    metrics = [
        'first-contentful-paint',
        'largest-contentful-paint',
        'total-blocking-time',
        'cumulative-layout-shift',
        'speed-index'
    ]
    
    for metric in metrics:
        audit = audits.get(metric, {})
        display_value = audit.get('displayValue')
        print(f"{audit.get('title')}: {display_value}")

except Exception as e:
    print(f"Error parsing report: {e}")
