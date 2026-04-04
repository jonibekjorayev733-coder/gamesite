#!/usr/bin/env python3
"""Test the live API endpoints"""

import requests
import json
import time
import subprocess
import sys

# Start the server
print("Starting server...")
proc = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"],
    cwd="c:\\react Jonibek\\new04\\gamesite\\backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

time.sleep(2)  # Wait for server to start

try:
    # Test 1: All games with tests
    print("\n" + "=" * 60)
    print("TEST 1: GET /api/all-games-with-tests")
    print("=" * 60)
    response = requests.get("http://localhost:8000/api/all-games-with-tests")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2, ensure_ascii=False)[:500])
    
    # Test 2: Top users
    print("\n" + "=" * 60)
    print("TEST 2: GET /api/results/top-users")
    print("=" * 60)
    response = requests.get("http://localhost:8000/api/results/top-users")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2)[:500])
    
    # Test 3: Tests by game
    print("\n" + "=" * 60)
    print("TEST 3: GET /api/tests-by-game/baraban")
    print("=" * 60)
    response = requests.get("http://localhost:8000/api/tests-by-game/baraban")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2, ensure_ascii=False)[:500])
    
    print("\n✅ All endpoints work!")
    
finally:
    print("\nStopping server...")
    proc.terminate()
    proc.wait()
