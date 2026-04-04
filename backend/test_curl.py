#!/usr/bin/env python3
"""Simple test of API endpoint using subprocess"""

import subprocess
import json

try:
    result = subprocess.run(
        ["curl", "-s", "http://localhost:8000/api/all-games-with-tests"],
        capture_output=True,
        text=True,
        timeout=5
    )
    
    if result.returncode == 0:
        data = json.loads(result.stdout)
        print(f"✓ Status: Success")
        print(f"✓ Games: {len(data.get('games', []))}")
        print(json.dumps(data, indent=2)[:500])
    else:
        print(f"❌ Error: {result.stderr}")
        
except Exception as e:
    print(f"❌ Exception: {e}")
